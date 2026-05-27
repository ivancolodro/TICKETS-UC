import type { TicketStatus } from "@prisma/client";
import { STATUS_TRANSITIONS } from "../constants";

export function canTransition(
  from: TicketStatus,
  to: TicketStatus
): boolean {
  if (from === to) return true;
  return STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertTransition(from: TicketStatus, to: TicketStatus) {
  if (!canTransition(from, to)) {
    throw new Error(
      `Transición de estado no permitida: ${from} → ${to}`
    );
  }
}

export function statusTimestamps(
  to: TicketStatus,
  now = new Date()
): {
  resolvedAt?: Date | null;
  closedAt?: Date | null;
  firstResponseAt?: Date;
} {
  switch (to) {
    case "RESOLVED":
      return { resolvedAt: now };
    case "CLOSED":
      return { closedAt: now, resolvedAt: now };
    case "REOPENED":
      return { resolvedAt: null, closedAt: null };
    default:
      return {};
  }
}
