import { prisma } from "@/lib/prisma";

export type AssignmentStrategy = "MANUAL" | "ROUND_ROBIN" | "LOAD_BALANCE";

export async function resolveAssignee(params: {
  strategy: AssignmentStrategy;
  departmentId?: string | null;
  teamId?: string | null;
  explicitAssigneeId?: string | null;
}): Promise<string | null> {
  if (params.explicitAssigneeId) {
    return params.explicitAssigneeId;
  }

  if (params.strategy === "MANUAL") {
    return null;
  }

  const where = {
    availability: "AVAILABLE" as const,
    ...(params.departmentId ? { departmentId: params.departmentId } : {}),
    ...(params.teamId ? { teamId: params.teamId } : {}),
  };

  const agents = await prisma.agent.findMany({
    where,
    include: {
      _count: {
        select: {
          assignedTickets: {
            where: {
              deletedAt: null,
              status: { in: ["OPEN", "IN_PROGRESS", "PENDING", "REOPENED"] },
            },
          },
        },
      },
    },
  });

  if (agents.length === 0) return null;

  if (params.strategy === "LOAD_BALANCE") {
    const sorted = [...agents].sort(
      (a, b) => a._count.assignedTickets - b._count.assignedTickets
    );
    return sorted[0].id;
  }

  // ROUND_ROBIN — usa metadata del departamento o orden por id
  const sorted = [...agents].sort((a, b) => a.id.localeCompare(b.id));
  const lastAssigned = await prisma.auditLog.findFirst({
    where: {
      entityType: "Ticket",
      action: "ASSIGN",
      changes: { path: ["departmentId"], equals: params.departmentId ?? undefined },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!lastAssigned?.changes || typeof lastAssigned.changes !== "object") {
    return sorted[0].id;
  }

  const lastAssigneeId = (lastAssigned.changes as { assigneeId?: string })
    .assigneeId;
  const idx = sorted.findIndex((a) => a.id === lastAssigneeId);
  return sorted[(idx + 1) % sorted.length].id;
}
