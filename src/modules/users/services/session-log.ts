import type { AuthSessionEvent, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function logAuthSession(params: {
  userId?: string;
  email?: string;
  event: AuthSessionEvent;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  return prisma.authSessionLog.create({
    data: {
      userId: params.userId,
      email: params.email?.toLowerCase(),
      event: params.event,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      metadata: params.metadata,
    },
  });
}
