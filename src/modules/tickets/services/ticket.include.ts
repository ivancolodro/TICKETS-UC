import type { Prisma } from "@prisma/client";

export const ticketListInclude = {
  customer: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      organization: { select: { id: true, name: true } },
    },
  },
  assignee: {
    select: {
      id: true,
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  },
  department: { select: { id: true, name: true } },
  helpTopic: { select: { id: true, name: true } },
  tags: { include: { tag: true } },
  slaPolicy: {
    select: {
      id: true,
      name: true,
      firstResponseMinutes: true,
      resolutionMinutes: true,
    },
  },
  _count: { select: { threads: true, notes: true, children: true } },
} satisfies Prisma.TicketInclude;

export const ticketDetailInclude = {
  ...ticketListInclude,
  organization: { select: { id: true, name: true } },
  team: { select: { id: true, name: true } },
  parent: {
    select: {
      id: true,
      ticketNumberDisplay: true,
      subject: true,
      status: true,
    },
  },
  children: {
    select: {
      id: true,
      ticketNumberDisplay: true,
      subject: true,
      status: true,
      priority: true,
    },
  },
  mergedTickets: {
    select: {
      id: true,
      ticketNumberDisplay: true,
      subject: true,
      status: true,
    },
  },
  threads: {
    orderBy: { createdAt: "asc" as const },
    include: {
      author: { select: { id: true, name: true, email: true, image: true } },
      attachments: true,
    },
  },
  notes: {
    orderBy: { createdAt: "asc" as const },
    include: {
      author: { select: { id: true, name: true, email: true, image: true } },
    },
  },
  fieldValues: { include: { customField: true } },
  auditLogs: {
    orderBy: { createdAt: "desc" as const },
    take: 50,
    include: {
      actor: { select: { id: true, name: true, email: true } },
    },
  },
  attachments: true,
} satisfies Prisma.TicketInclude;
