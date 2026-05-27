import type { AuditAction, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function logTicketAudit(params: {
  actorId?: string;
  action: AuditAction;
  ticketId: string;
  entityType?: string;
  entityId?: string;
  changes?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
}) {
  return prisma.auditLog.create({
    data: {
      actorId: params.actorId,
      action: params.action,
      entityType: params.entityType ?? "Ticket",
      entityId: params.entityId ?? params.ticketId,
      ticketId: params.ticketId,
      changes: params.changes,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    },
  });
}
