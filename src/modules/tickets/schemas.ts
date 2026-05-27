import { z } from "zod";

const priorityEnum = z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]);
const statusEnum = z.enum([
  "OPEN",
  "IN_PROGRESS",
  "PENDING",
  "RESOLVED",
  "CLOSED",
  "REOPENED",
  "CANCELLED",
]);
const channelEnum = z.enum([
  "WEB",
  "EMAIL",
  "API",
  "PHONE",
  "CHAT",
  "PORTAL",
  "MANUAL",
]);
const assignmentStrategyEnum = z.enum([
  "MANUAL",
  "ROUND_ROBIN",
  "LOAD_BALANCE",
]);

export const createTicketSchema = z.object({
  subject: z.string().min(3).max(255),
  description: z.string().min(1),
  priority: priorityEnum.default("NORMAL"),
  departmentId: z.string().cuid().optional().nullable(),
  helpTopicId: z.string().cuid().optional().nullable(),
  teamId: z.string().cuid().optional().nullable(),
  assigneeId: z.string().cuid().optional().nullable(),
  assignmentStrategy: assignmentStrategyEnum.default("MANUAL"),
  customerName: z.string().min(1).max(200),
  customerEmail: z.string().email(),
  customerPhone: z.string().max(30).optional().nullable(),
  organizationId: z.string().cuid().optional().nullable(),
  channel: channelEnum.default("PORTAL"),
  tagIds: z.array(z.string().cuid()).optional(),
  parentId: z.string().cuid().optional().nullable(),
  customFieldValues: z
    .array(z.object({ customFieldId: z.string().cuid(), value: z.string() }))
    .optional(),
});

export const updateTicketSchema = z.object({
  subject: z.string().min(3).max(255).optional(),
  description: z.string().min(1).optional(),
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
  departmentId: z.string().cuid().optional().nullable(),
  helpTopicId: z.string().cuid().optional().nullable(),
  teamId: z.string().cuid().optional().nullable(),
  assigneeId: z.string().cuid().optional().nullable(),
  assignmentStrategy: assignmentStrategyEnum.optional(),
  parentId: z.string().cuid().optional().nullable(),
  tagIds: z.array(z.string().cuid()).optional(),
});

export const listTicketsSchema = z.object({
  view: z
    .enum(["global", "mine", "department", "favorites", "archived"])
    .default("global"),
  status: z.union([statusEnum, z.array(statusEnum)]).optional(),
  priority: z.union([priorityEnum, z.array(priorityEnum)]).optional(),
  departmentId: z.string().cuid().optional(),
  assigneeId: z.string().cuid().optional(),
  teamId: z.string().cuid().optional(),
  tagId: z.string().cuid().optional(),
  search: z.string().max(200).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  sortBy: z
    .enum(["createdAt", "updatedAt", "priority", "slaDueAt"])
    .default("updatedAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const createThreadSchema = z.object({
  body: z.string().min(1),
  isInternal: z.boolean().default(false),
});

export const createNoteSchema = z.object({
  body: z.string().min(1),
});

export const mergeTicketsSchema = z.object({
  primaryTicketId: z.string().cuid(),
  mergedTicketIds: z.array(z.string().cuid()).min(1),
});

export const linkTicketSchema = z.object({
  parentId: z.string().cuid().nullable(),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type ListTicketsInput = z.infer<typeof listTicketsSchema>;
