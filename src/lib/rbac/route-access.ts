import type { UserRole } from "@prisma/client";
import {
  adminPrefix,
  agentPrefix,
  portalPrefix,
} from "@/config/routes";
import {
  canAccessAdminPanel,
  canAccessAgentPanel,
  canAccessSystemConfig,
} from "./check";

export function canAccessPath(role: UserRole, pathname: string): boolean {
  if (pathname.startsWith(`${adminPrefix}/settings`)) {
    return canAccessSystemConfig(role);
  }

  if (pathname.startsWith(adminPrefix)) {
    return canAccessAdminPanel(role);
  }

  if (pathname.startsWith(agentPrefix)) {
    return canAccessAgentPanel(role);
  }

  if (pathname.startsWith(portalPrefix)) {
    return true;
  }

  return true;
}
