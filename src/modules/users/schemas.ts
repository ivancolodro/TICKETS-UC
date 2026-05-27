import { z } from "zod";

const availabilityEnum = z.enum(["AVAILABLE", "BUSY", "AWAY"]);
const roleEnum = z.enum([
  "ADMIN",
  "SUPERVISOR",
  "AGENT",
  "AGENT_READONLY",
]);

export const createAgentSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8).optional(),
  role: roleEnum.default("AGENT"),
  jobTitle: z.string().max(120).optional(),
  employeeId: z.string().max(50).optional(),
  departmentIds: z.array(z.string().cuid()).min(1),
  teamId: z.string().cuid().optional().nullable(),
  availability: availabilityEnum.default("AVAILABLE"),
  signature: z.string().max(2000).optional(),
  locale: z.string().default("es-CL"),
  timezone: z.string().default("America/Santiago"),
  maxConcurrentTickets: z.number().int().min(1).max(100).default(20),
});

export const updateAgentSchema = createAgentSchema
  .partial()
  .omit({ email: true, password: true })
  .extend({
    password: z.string().min(8).optional(),
    status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional(),
  });

export const createDepartmentSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).optional(),
  description: z.string().optional(),
  email: z.string().email().optional().nullable(),
  organizationId: z.string().cuid().optional().nullable(),
  parentId: z.string().cuid().optional().nullable(),
  managerId: z.string().cuid().optional().nullable(),
  isPublic: z.boolean().default(true),
  isActive: z.boolean().default(true),
  defaultSlaPolicyId: z.string().cuid().optional().nullable(),
  defaultCustomFormId: z.string().cuid().optional().nullable(),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();

export const createTeamSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).optional(),
  departmentId: z.string().cuid(),
  leaderAgentId: z.string().cuid().optional().nullable(),
  memberAgentIds: z.array(z.string().cuid()).optional(),
  isActive: z.boolean().default(true),
});

export const updateTeamSchema = createTeamSchema.partial();

export const createOrganizationSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).optional(),
  domain: z.string().optional().nullable(),
  crossTicketVisibility: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

export const updateOrganizationSchema = createOrganizationSchema.partial();

export const updateCustomerSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional().nullable(),
  organizationId: z.string().cuid().optional().nullable(),
});

export const passwordPolicySchema = z.object({
  minLength: z.number().int().min(6).max(128),
  requireUppercase: z.boolean(),
  requireLowercase: z.boolean(),
  requireNumber: z.boolean(),
  requireSpecial: z.boolean(),
  expirationDays: z.number().int().min(1).nullable().optional(),
  maxFailedAttempts: z.number().int().min(1).max(20),
  lockoutMinutes: z.number().int().min(1).max(1440),
});

export const totpVerifySchema = z.object({
  token: z.string().length(6).regex(/^\d+$/),
});

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export { slugify };
