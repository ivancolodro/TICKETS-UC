import type { UserRole } from "@prisma/client";

/**
 * Permisos alineados con matriz UC CHRISTUS.
 * Sufijo :department = alcance limitado al departamento del usuario.
 */
export const Permission = {
  VER_TODOS_TICKETS: "ver_todos_tickets",
  VER_TICKETS_DEPARTAMENTO: "ver_tickets_departamento",
  CREAR_TICKET: "crear_ticket",
  ASIGNAR_TICKET: "asignar_ticket",
  NOTAS_INTERNAS: "notas_internas",
  GESTIONAR_AGENTES: "gestionar_agentes",
  GESTIONAR_AGENTES_DEPARTAMENTO: "gestionar_agentes_departamento",
  VER_REPORTES: "ver_reportes",
  CONFIG_SISTEMA: "config_sistema",

  // Admin CRUD
  DEPARTMENT_MANAGE: "department:manage",
  TEAM_MANAGE: "team:manage",
  CUSTOMER_MANAGE: "customer:manage",
  ORGANIZATION_MANAGE: "organization:manage",

  // Compatibilidad módulo tickets
  TICKET_UPDATE: "ticket:update",
  TICKET_DELETE: "ticket:delete",
  TICKET_MERGE: "ticket:merge",
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  ADMIN: Object.values(Permission),

  SUPERVISOR: [
    Permission.VER_TICKETS_DEPARTAMENTO,
    Permission.CREAR_TICKET,
    Permission.ASIGNAR_TICKET,
    Permission.NOTAS_INTERNAS,
    Permission.GESTIONAR_AGENTES_DEPARTAMENTO,
    Permission.VER_REPORTES,
    Permission.DEPARTMENT_MANAGE,
    Permission.TEAM_MANAGE,
    Permission.CUSTOMER_MANAGE,
    Permission.TICKET_UPDATE,
    Permission.TICKET_MERGE,
  ],

  AGENT: [
    Permission.VER_TICKETS_DEPARTAMENTO,
    Permission.CREAR_TICKET,
    Permission.ASIGNAR_TICKET,
    Permission.NOTAS_INTERNAS,
    Permission.TICKET_UPDATE,
    Permission.TICKET_MERGE,
  ],

  AGENT_READONLY: [
    Permission.VER_TODOS_TICKETS,
    Permission.NOTAS_INTERNAS,
    Permission.VER_REPORTES,
  ],

  CUSTOMER: [Permission.CREAR_TICKET],
};

/** Helper: permiso de lectura de tickets según rol */
export function ticketReadPermission(role: UserRole): Permission | null {
  if (ROLE_PERMISSIONS[role]?.includes(Permission.VER_TODOS_TICKETS)) {
    return Permission.VER_TODOS_TICKETS;
  }
  if (ROLE_PERMISSIONS[role]?.includes(Permission.VER_TICKETS_DEPARTAMENTO)) {
    return Permission.VER_TICKETS_DEPARTAMENTO;
  }
  return null;
}

/** Permisos que requieren alcance por departamento */
export const DEPARTMENT_SCOPED_PERMISSIONS: Permission[] = [
  Permission.VER_TICKETS_DEPARTAMENTO,
  Permission.GESTIONAR_AGENTES_DEPARTAMENTO,
];
