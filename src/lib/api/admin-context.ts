import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import {
  canAccessAdminPanel,
  canManageAgents,
  hasPermission,
  Permission,
} from "@/lib/rbac/check";

export async function requireAdminContext() {
  const session = await requireSession();
  const role = session.user.role;

  if (!canAccessAdminPanel(role)) {
    throw new Error("FORBIDDEN");
  }

  const agent = await prisma.agent.findUnique({
    where: { userId: session.user.id },
    include: {
      departments: { select: { departmentId: true } },
    },
  });

  const departmentIds =
    role === "SUPERVISOR"
      ? [
          ...(agent?.departmentId ? [agent.departmentId] : []),
          ...(agent?.departments.map((d) => d.departmentId) ?? []),
        ]
      : null;

  return {
    session,
    userId: session.user.id,
    role,
    agentId: agent?.id,
    departmentIds: departmentIds
      ? [...new Set(departmentIds)]
      : null,
    isAdmin: role === "ADMIN",
    canManageAllAgents: hasPermission(role, Permission.GESTIONAR_AGENTES),
    canManageDeptAgents: hasPermission(
      role,
      Permission.GESTIONAR_AGENTES_DEPARTAMENTO
    ),
  };
}

export function departmentFilter(
  departmentIds: string[] | null,
  field = "departmentId"
) {
  if (!departmentIds) return {};
  return { [field]: { in: departmentIds } };
}
