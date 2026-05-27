import type { TicketPriority, TicketStatus } from "@prisma/client";

export const TICKET_NUMBER_PREFIX = "TKT";

export const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: "Abierto",
  IN_PROGRESS: "En proceso",
  PENDING: "Pendiente",
  RESOLVED: "Resuelto",
  CLOSED: "Cerrado",
  REOPENED: "Reabierto",
  CANCELLED: "Cancelado",
  MERGED: "Fusionado",
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  LOW: "Baja",
  NORMAL: "Normal",
  HIGH: "Alta",
  URGENT: "Urgente",
};

export const PRIORITY_COLORS: Record<TicketPriority, string> = {
  LOW: "bg-slate-100 text-slate-700",
  NORMAL: "bg-blue-100 text-blue-800",
  HIGH: "bg-amber-100 text-amber-900",
  URGENT: "bg-red-100 text-red-800",
};

/** Transiciones válidas de estado */
export const STATUS_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  OPEN: ["IN_PROGRESS", "PENDING", "RESOLVED", "CLOSED", "CANCELLED"],
  IN_PROGRESS: ["PENDING", "RESOLVED", "CLOSED", "OPEN"],
  PENDING: ["IN_PROGRESS", "RESOLVED", "CLOSED", "OPEN"],
  RESOLVED: ["CLOSED", "REOPENED"],
  CLOSED: ["REOPENED"],
  REOPENED: ["IN_PROGRESS", "PENDING", "RESOLVED", "CLOSED"],
  CANCELLED: [],
  MERGED: [],
};

export const CHANNEL_LABELS = {
  WEB: "Web",
  EMAIL: "Email",
  API: "API",
  PHONE: "Teléfono",
  CHAT: "Chat",
  PORTAL: "Portal",
  MANUAL: "Manual",
} as const;

export type TicketListView =
  | "global"
  | "mine"
  | "department"
  | "favorites"
  | "archived";
