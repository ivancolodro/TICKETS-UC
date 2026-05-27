import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import type { UserRole } from "@prisma/client";
import { hasPermission, type Permission } from "@/lib/rbac/check";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireSession() {
  const session = await getSession();
  if (!session?.user) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function requirePermission(permission: Permission) {
  const session = await requireSession();
  const role = session.user.role as UserRole;

  if (!hasPermission(role, permission)) {
    throw new Error("FORBIDDEN");
  }

  return session;
}
