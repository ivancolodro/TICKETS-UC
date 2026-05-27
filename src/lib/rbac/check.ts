import type { UserRole } from "@prisma/client";
import {
  Permission,
  ROLE_PERMISSIONS,
  DEPARTMENT_SCOPED_PERMISSIONS,
  type Permission as PermissionType,
} from "./permissions";

export function hasPermission(
  role: UserRole,
  permission: PermissionType
): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(
  role: UserRole,
  permissions: PermissionType[]
): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function canViewAllTickets(role: UserRole): boolean {
  return hasPermission(role, Permission.VER_TODOS_TICKETS);
}

export function canViewDepartmentTickets(role: UserRole): boolean {
  return (
    canViewAllTickets(role) ||
    hasPermission(role, Permission.VER_TICKETS_DEPARTAMENTO)
  );
}

export function isDepartmentScopedPermission(permission: PermissionType): boolean {
  return DEPARTMENT_SCOPED_PERMISSIONS.includes(permission);
}

export function canManageAgents(role: UserRole): boolean {
  return (
    hasPermission(role, Permission.GESTIONAR_AGENTES) ||
    hasPermission(role, Permission.GESTIONAR_AGENTES_DEPARTAMENTO)
  );
}

export function canAccessSystemConfig(role: UserRole): boolean {
  return hasPermission(role, Permission.CONFIG_SISTEMA);
}

export function isStaffRole(role: UserRole): boolean {
  return role !== "CUSTOMER";
}

export function canAccessAgentPanel(role: UserRole): boolean {
  return (
    role === "ADMIN" ||
    role === "SUPERVISOR" ||
    role === "AGENT" ||
    role === "AGENT_READONLY"
  );
}

export function canAccessAdminPanel(role: UserRole): boolean {
  return (
    role === "ADMIN" ||
    role === "SUPERVISOR"
  );
}

export { Permission };
