import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createTeamSchema, updateTeamSchema, slugify } from "../schemas";
import type { z } from "zod";

const include = {
  department: { select: { id: true, name: true } },
  members: {
    include: {
      agent: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  },
  _count: { select: { tickets: true, agents: true } },
} satisfies Prisma.TeamInclude;

export async function listTeams(where?: Prisma.TeamWhereInput) {
  return prisma.team.findMany({
    where,
    include,
    orderBy: { name: "asc" },
  });
}

export async function getTeam(id: string) {
  return prisma.team.findUnique({ where: { id }, include });
}

export async function getTeamMetrics(teamId: string) {
  const [open, resolved, members] = await Promise.all([
    prisma.ticket.count({
      where: {
        teamId,
        status: { in: ["OPEN", "IN_PROGRESS", "PENDING", "REOPENED"] },
      },
    }),
    prisma.ticket.count({
      where: { teamId, status: { in: ["RESOLVED", "CLOSED"] } },
    }),
    prisma.teamMember.count({ where: { teamId } }),
  ]);

  return { openTickets: open, resolvedTickets: resolved, memberCount: members };
}

export async function createTeam(input: z.infer<typeof createTeamSchema>) {
  const data = createTeamSchema.parse(input);
  const slug = data.slug ?? slugify(data.name);

  return prisma.$transaction(async (tx) => {
    const team = await tx.team.create({
      data: {
        name: data.name,
        slug,
        departmentId: data.departmentId,
        isActive: data.isActive,
      },
    });

    const memberIds = data.memberAgentIds ?? [];
    if (data.leaderAgentId && !memberIds.includes(data.leaderAgentId)) {
      memberIds.push(data.leaderAgentId);
    }

    for (const agentId of memberIds) {
      await tx.teamMember.upsert({
        where: { teamId_agentId: { teamId: team.id, agentId } },
        create: {
          teamId: team.id,
          agentId,
          isLead: agentId === data.leaderAgentId,
        },
        update: { isLead: agentId === data.leaderAgentId },
      });
    }

    return tx.team.findUnique({ where: { id: team.id }, include });
  });
}

export async function updateTeam(
  id: string,
  input: z.infer<typeof updateTeamSchema>
) {
  const data = updateTeamSchema.parse(input);

  return prisma.$transaction(async (tx) => {
    await tx.team.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug ?? (data.name ? slugify(data.name) : undefined),
        departmentId: data.departmentId,
        isActive: data.isActive,
      },
    });

    if (data.memberAgentIds || data.leaderAgentId) {
      await tx.teamMember.deleteMany({ where: { teamId: id } });
      const memberIds = data.memberAgentIds ?? [];
      if (data.leaderAgentId) memberIds.push(data.leaderAgentId);

      for (const agentId of [...new Set(memberIds)]) {
        await tx.teamMember.create({
          data: {
            teamId: id,
            agentId,
            isLead: agentId === data.leaderAgentId,
          },
        });
      }
    }

    return tx.team.findUnique({ where: { id }, include });
  });
}

export async function deleteTeam(id: string) {
  return prisma.team.update({
    where: { id },
    data: { isActive: false },
  });
}
