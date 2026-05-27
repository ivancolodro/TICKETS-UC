import type { Prisma, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createAgentSchema, updateAgentSchema } from "../schemas";
import { validatePasswordForCreate } from "./password";
import { hashPassword } from "./auth-login";
import type { z } from "zod";

type CreateAgentInput = z.infer<typeof createAgentSchema>;
type UpdateAgentInput = z.infer<typeof updateAgentSchema>;

const agentInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      status: true,
      locale: true,
      timezone: true,
      twoFactorEnabled: true,
      lastLoginAt: true,
    },
  },
  department: { select: { id: true, name: true } },
  team: { select: { id: true, name: true } },
  departments: { include: { department: { select: { id: true, name: true } } } },
  _count: { select: { assignedTickets: true } },
} satisfies Prisma.AgentInclude;

export async function listAgents(where?: Prisma.AgentWhereInput) {
  return prisma.agent.findMany({
    where,
    include: agentInclude,
    orderBy: { user: { name: "asc" } },
  });
}

export async function getAgent(id: string) {
  return prisma.agent.findUnique({
    where: { id },
    include: agentInclude,
  });
}

export async function createAgent(input: CreateAgentInput) {
  const data = createAgentSchema.parse(input);
  await validatePasswordForCreate(data.password ?? "Temp1234!");

  const passwordHash = await hashPassword(
    data.password ?? `Temp${Date.now()}!`
  );
  const primaryDept = data.departmentIds[0];

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: data.email.toLowerCase(),
        name: data.name,
        passwordHash,
        passwordChangedAt: new Date(),
        role: data.role as UserRole,
        status: "ACTIVE",
        locale: data.locale,
        timezone: data.timezone,
      },
    });

    const agent = await tx.agent.create({
      data: {
        userId: user.id,
        jobTitle: data.jobTitle,
        employeeId: data.employeeId,
        departmentId: primaryDept,
        teamId: data.teamId,
        availability: data.availability,
        signature: data.signature,
        maxConcurrentTickets: data.maxConcurrentTickets,
        departments: {
          create: data.departmentIds.map((departmentId) => ({
            departmentId,
          })),
        },
      },
      include: agentInclude,
    });

    return agent;
  });
}

export async function updateAgent(id: string, input: UpdateAgentInput) {
  const data = updateAgentSchema.parse(input);
  const agent = await prisma.agent.findUnique({ where: { id } });
  if (!agent) throw new Error("NOT_FOUND");

  return prisma.$transaction(async (tx) => {
    if (data.password) {
      await validatePasswordForCreate(data.password);
      await tx.user.update({
        where: { id: agent.userId },
        data: {
          passwordHash: await hashPassword(data.password),
          passwordChangedAt: new Date(),
        },
      });
    }

    if (data.name || data.role || data.status || data.locale || data.timezone) {
      await tx.user.update({
        where: { id: agent.userId },
        data: {
          name: data.name,
          role: data.role as UserRole | undefined,
          status: data.status,
          locale: data.locale,
          timezone: data.timezone,
        },
      });
    }

    if (data.departmentIds) {
      await tx.agentDepartment.deleteMany({ where: { agentId: id } });
      await tx.agentDepartment.createMany({
        data: data.departmentIds.map((departmentId) => ({
          agentId: id,
          departmentId,
        })),
      });
    }

    return tx.agent.update({
      where: { id },
      data: {
        jobTitle: data.jobTitle,
        employeeId: data.employeeId,
        departmentId: data.departmentIds?.[0],
        teamId: data.teamId,
        availability: data.availability,
        signature: data.signature,
        maxConcurrentTickets: data.maxConcurrentTickets,
      },
      include: agentInclude,
    });
  });
}

export async function deleteAgent(id: string) {
  const agent = await prisma.agent.findUnique({ where: { id } });
  if (!agent) throw new Error("NOT_FOUND");

  await prisma.user.update({
    where: { id: agent.userId },
    data: { status: "INACTIVE" },
  });

  return prisma.agent.delete({ where: { id } });
}
