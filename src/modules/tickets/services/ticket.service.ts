import type { Prisma, TicketStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  CreateTicketInput,
  ListTicketsInput,
  UpdateTicketInput,
} from "../schemas";
import { logTicketAudit } from "./audit";
import { resolveAssignee } from "./assignment";
import { generateTicketNumberDisplay } from "./numbering";
import { assertTransition, statusTimestamps } from "./status";
import { ticketDetailInclude, ticketListInclude } from "./ticket.include";

function computeSlaDueAt(
  createdAt: Date,
  resolutionMinutes?: number | null
): Date | null {
  if (!resolutionMinutes) return null;
  return new Date(createdAt.getTime() + resolutionMinutes * 60 * 1000);
}

async function upsertCustomer(input: CreateTicketInput) {
  const email = input.customerEmail.toLowerCase();
  const organizationId = input.organizationId ?? null;

  const existing = await prisma.customer.findFirst({
    where: { email, organizationId },
  });

  if (existing) {
    return prisma.customer.update({
      where: { id: existing.id },
      data: {
        name: input.customerName,
        phone: input.customerPhone ?? undefined,
      },
    });
  }

  return prisma.customer.create({
    data: {
      email,
      name: input.customerName,
      phone: input.customerPhone,
      organizationId,
    },
  });
}

export async function createTicket(
  input: CreateTicketInput,
  actorId?: string
) {
  const customer = await upsertCustomer(input);
  const ticketNumberDisplay = await generateTicketNumberDisplay();
  const assigneeId = await resolveAssignee({
    strategy: input.assignmentStrategy,
    departmentId: input.departmentId,
    teamId: input.teamId,
    explicitAssigneeId: input.assigneeId,
  });

  let slaPolicy = null;
  if (input.departmentId) {
    slaPolicy = await prisma.sLAPolicy.findFirst({
      where: {
        isActive: true,
        departmentId: input.departmentId,
        OR: [{ priority: input.priority }, { priority: null }],
      },
      orderBy: { priority: "desc" },
    });
  }

  const now = new Date();
  const slaDueAt = computeSlaDueAt(now, slaPolicy?.resolutionMinutes);

  const ticket = await prisma.$transaction(async (tx) => {
    const created = await tx.ticket.create({
      data: {
        ticketNumberDisplay,
        subject: input.subject,
        description: input.description,
        priority: input.priority,
        channel: input.channel,
        customerId: customer.id,
        organizationId: input.organizationId,
        departmentId: input.departmentId,
        teamId: input.teamId,
        helpTopicId: input.helpTopicId,
        assigneeId,
        parentId: input.parentId,
        slaPolicyId: slaPolicy?.id,
        slaDueAt,
        slaStatus: slaPolicy ? "ACTIVE" : undefined,
        threads: {
          create: {
            authorType: actorId ? "AGENT" : "CUSTOMER",
            authorId: actorId,
            body: input.description,
            isInternal: false,
          },
        },
        ...(input.tagIds?.length
          ? {
              tags: {
                create: input.tagIds.map((tagId) => ({ tagId })),
              },
            }
          : {}),
        ...(input.customFieldValues?.length
          ? {
              fieldValues: {
                create: input.customFieldValues.map((fv) => ({
                  customFieldId: fv.customFieldId,
                  value: fv.value,
                })),
              },
            }
          : {}),
      },
      include: ticketDetailInclude,
    });

    await logTicketAudit({
      actorId,
      action: "CREATE",
      ticketId: created.id,
      changes: { input: { subject: input.subject, channel: input.channel } },
    });

    if (assigneeId) {
      await logTicketAudit({
        actorId,
        action: "ASSIGN",
        ticketId: created.id,
        changes: { assigneeId, departmentId: input.departmentId },
      });
    }

    return created;
  });

  return ticket;
}

export async function listTickets(
  input: ListTicketsInput,
  context: { agentId?: string; departmentId?: string }
) {
  const skip = (input.page - 1) * input.pageSize;
  const statuses = input.status
    ? Array.isArray(input.status)
      ? input.status
      : [input.status]
    : undefined;
  const priorities = input.priority
    ? Array.isArray(input.priority)
      ? input.priority
      : [input.priority]
    : undefined;

  const where: Prisma.TicketWhereInput = {
    deletedAt: null,
    ...(input.view === "archived" ? { archivedAt: { not: null } } : { archivedAt: null }),
    ...(input.view === "mine" && context.agentId
      ? { assigneeId: context.agentId }
      : {}),
    ...(input.view === "department" && context.departmentId
      ? { departmentId: context.departmentId }
      : {}),
    ...(input.view === "favorites" && context.agentId
      ? { favorites: { some: { agentId: context.agentId } } }
      : {}),
    ...(statuses ? { status: { in: statuses } } : {}),
    ...(priorities ? { priority: { in: priorities } } : {}),
    ...(input.departmentId ? { departmentId: input.departmentId } : {}),
    ...(input.assigneeId ? { assigneeId: input.assigneeId } : {}),
    ...(input.teamId ? { teamId: input.teamId } : {}),
    ...(input.tagId ? { tags: { some: { tagId: input.tagId } } } : {}),
    ...(input.dateFrom || input.dateTo
      ? {
          createdAt: {
            ...(input.dateFrom ? { gte: new Date(input.dateFrom) } : {}),
            ...(input.dateTo ? { lte: new Date(input.dateTo) } : {}),
          },
        }
      : {}),
    ...(input.search
      ? {
          OR: [
            { subject: { contains: input.search, mode: "insensitive" } },
            { description: { contains: input.search, mode: "insensitive" } },
            { ticketNumberDisplay: { contains: input.search, mode: "insensitive" } },
            {
              notes: {
                some: {
                  body: { contains: input.search, mode: "insensitive" },
                },
              },
            },
            {
              threads: {
                some: {
                  body: { contains: input.search, mode: "insensitive" },
                  isInternal: false,
                },
              },
            },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.TicketOrderByWithRelationInput = {
    [input.sortBy]: input.sortOrder,
  };

  const [items, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      include: ticketListInclude,
      orderBy,
      skip,
      take: input.pageSize,
    }),
    prisma.ticket.count({ where }),
  ]);

  return {
    items,
    total,
    page: input.page,
    pageSize: input.pageSize,
    totalPages: Math.ceil(total / input.pageSize),
  };
}

export async function getTicketById(id: string, includeInternal = true) {
  const ticket = await prisma.ticket.findFirst({
    where: { id, deletedAt: null },
    include: {
      ...ticketDetailInclude,
      threads: {
        where: includeInternal ? {} : { isInternal: false },
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { id: true, name: true, email: true, image: true } },
          attachments: true,
        },
      },
      notes: includeInternal
        ? ticketDetailInclude.notes
        : false,
    },
  });

  return ticket;
}

export async function getTicketByPublicToken(token: string) {
  const row = await prisma.ticket.findFirst({
    where: { publicToken: token, deletedAt: null },
    select: { id: true },
  });
  if (!row) return null;
  return getTicketById(row.id, false);
}

export async function updateTicket(
  id: string,
  input: UpdateTicketInput,
  actorId?: string
) {
  const existing = await prisma.ticket.findFirst({
    where: { id, deletedAt: null },
    include: { tags: true },
  });

  if (!existing) throw new Error("TICKET_NOT_FOUND");

  const data: Prisma.TicketUpdateInput = {};
  const changes: Record<string, unknown> = {};

  if (input.subject !== undefined) {
    data.subject = input.subject;
    changes.subject = { from: existing.subject, to: input.subject };
  }

  if (input.description !== undefined) {
    data.description = input.description;
    changes.description = true;
  }

  if (input.priority !== undefined && input.priority !== existing.priority) {
    data.priority = input.priority;
    changes.priority = { from: existing.priority, to: input.priority };
  }

  if (input.status !== undefined && input.status !== existing.status) {
    assertTransition(existing.status, input.status);
    data.status = input.status;
    Object.assign(data, statusTimestamps(input.status));
    changes.status = { from: existing.status, to: input.status };
  }

  if (input.departmentId !== undefined) {
    data.department = input.departmentId
      ? { connect: { id: input.departmentId } }
      : { disconnect: true };
    changes.departmentId = input.departmentId;
  }

  if (input.helpTopicId !== undefined) {
    data.helpTopic = input.helpTopicId
      ? { connect: { id: input.helpTopicId } }
      : { disconnect: true };
  }

  if (input.teamId !== undefined) {
    data.team = input.teamId
      ? { connect: { id: input.teamId } }
      : { disconnect: true };
  }

  if (input.parentId !== undefined) {
    data.parent = input.parentId
      ? { connect: { id: input.parentId } }
      : { disconnect: true };
    changes.parentId = input.parentId;
  }

  let assigneeId = input.assigneeId;
  if (input.assignmentStrategy) {
    assigneeId =
      (await resolveAssignee({
        strategy: input.assignmentStrategy,
        departmentId: input.departmentId ?? existing.departmentId,
        teamId: input.teamId ?? existing.teamId,
        explicitAssigneeId: input.assigneeId,
      })) ?? undefined;
  }

  if (assigneeId !== undefined && assigneeId !== existing.assigneeId) {
    data.assignee = assigneeId
      ? { connect: { id: assigneeId } }
      : { disconnect: true };
    changes.assigneeId = { from: existing.assigneeId, to: assigneeId };
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (input.tagIds) {
      await tx.ticketTag.deleteMany({ where: { ticketId: id } });
      if (input.tagIds.length > 0) {
        await tx.ticketTag.createMany({
          data: input.tagIds.map((tagId) => ({ ticketId: id, tagId })),
        });
      }
      changes.tagIds = input.tagIds;
    }

    return tx.ticket.update({
      where: { id },
      data,
      include: ticketDetailInclude,
    });
  });

  if (Object.keys(changes).length > 0) {
    await logTicketAudit({
      actorId,
      action: changes.status ? "UPDATE" : "UPDATE",
      ticketId: id,
      changes: changes as Prisma.InputJsonValue,
    });

    if (changes.assigneeId) {
      await logTicketAudit({
        actorId,
        action: "ASSIGN",
        ticketId: id,
        changes: { assigneeId: changes.assigneeId } as Prisma.InputJsonValue,
      });
    }
  }

  return updated;
}

export async function softDeleteTicket(id: string, actorId?: string) {
  const ticket = await prisma.ticket.update({
    where: { id },
    data: { deletedAt: new Date(), archivedAt: new Date() },
  });

  await logTicketAudit({
    actorId,
    action: "DELETE",
    ticketId: id,
    changes: { softDelete: true },
  });

  return ticket;
}

export async function archiveTicket(id: string, actorId?: string) {
  const ticket = await prisma.ticket.update({
    where: { id },
    data: { archivedAt: new Date() },
  });

  await logTicketAudit({
    actorId,
    action: "UPDATE",
    ticketId: id,
    changes: { archived: true },
  });

  return ticket;
}

export async function addThread(
  ticketId: string,
  body: string,
  opts: {
    authorId?: string;
    authorType: "AGENT" | "CUSTOMER" | "SYSTEM";
    isInternal?: boolean;
  }
) {
  const thread = await prisma.ticketThread.create({
    data: {
      ticketId,
      body,
      authorId: opts.authorId,
      authorType: opts.authorType,
      isInternal: opts.isInternal ?? false,
    },
    include: {
      author: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  const updateData: Prisma.TicketUpdateInput = { updatedAt: new Date() };
  if (!opts.isInternal && opts.authorType !== "CUSTOMER") {
    updateData.firstResponseAt = new Date();
  }

  await prisma.ticket.update({ where: { id: ticketId }, data: updateData });

  await logTicketAudit({
    actorId: opts.authorId,
    action: "CREATE",
    ticketId,
    entityType: "TicketThread",
    entityId: thread.id,
    changes: { isInternal: opts.isInternal },
  });

  return thread;
}

export async function addNote(
  ticketId: string,
  body: string,
  authorId: string
) {
  const note = await prisma.ticketNote.create({
    data: { ticketId, body, authorId },
    include: {
      author: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { updatedAt: new Date() },
  });

  await logTicketAudit({
    actorId: authorId,
    action: "CREATE",
    ticketId,
    entityType: "TicketNote",
    entityId: note.id,
  });

  return note;
}

export async function mergeTickets(
  primaryTicketId: string,
  mergedTicketIds: string[],
  actorId?: string
) {
  const primary = await prisma.ticket.findUnique({
    where: { id: primaryTicketId },
    include: { threads: true, notes: true },
  });

  if (!primary) throw new Error("PRIMARY_NOT_FOUND");

  return prisma.$transaction(async (tx) => {
    for (const mergedId of mergedTicketIds) {
      if (mergedId === primaryTicketId) continue;

      const merged = await tx.ticket.findUnique({
        where: { id: mergedId },
        include: { threads: true, notes: true, tags: true },
      });

      if (!merged) continue;

      await tx.ticketThread.updateMany({
        where: { ticketId: mergedId },
        data: { ticketId: primaryTicketId },
      });

      await tx.ticketNote.updateMany({
        where: { ticketId: mergedId },
        data: { ticketId: primaryTicketId },
      });

      await tx.ticketAttachment.updateMany({
        where: { ticketId: mergedId },
        data: { ticketId: primaryTicketId },
      });

      for (const tag of merged.tags) {
        await tx.ticketTag.upsert({
          where: {
            ticketId_tagId: {
              ticketId: primaryTicketId,
              tagId: tag.tagId,
            },
          },
          create: { ticketId: primaryTicketId, tagId: tag.tagId },
          update: {},
        });
      }

      await tx.ticketMerge.create({
        data: {
          primaryTicketId,
          mergedTicketId: mergedId,
          mergedById: actorId,
          snapshot: {
            subject: merged.subject,
            status: merged.status,
            ticketNumberDisplay: merged.ticketNumberDisplay,
          },
        },
      });

      await tx.ticket.update({
        where: { id: mergedId },
        data: {
          status: "MERGED" satisfies TicketStatus,
          mergedIntoId: primaryTicketId,
          deletedAt: new Date(),
        },
      });

      await tx.ticketThread.create({
        data: {
          ticketId: primaryTicketId,
          authorType: "SYSTEM",
          body: `<p>Ticket fusionado: <strong>${merged.ticketNumberDisplay}</strong> — ${merged.subject}</p>`,
          isInternal: true,
        },
      });
    }

    await logTicketAudit({
      actorId,
      action: "UPDATE",
      ticketId: primaryTicketId,
      changes: { mergedTicketIds },
    });

    return tx.ticket.findUnique({
      where: { id: primaryTicketId },
      include: ticketDetailInclude,
    });
  });
}

export async function toggleFavorite(
  ticketId: string,
  agentId: string
) {
  const existing = await prisma.ticketFavorite.findUnique({
    where: { agentId_ticketId: { agentId, ticketId } },
  });

  if (existing) {
    await prisma.ticketFavorite.delete({
      where: { agentId_ticketId: { agentId, ticketId } },
    });
    return { favorited: false };
  }

  await prisma.ticketFavorite.create({ data: { agentId, ticketId } });
  return { favorited: true };
}
