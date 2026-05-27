import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { canAccessAgentPanel } from "@/lib/rbac/check";

export async function requireAgentContext() {
  const session = await requireSession();
  const role = session.user.role;

  if (!canAccessAgentPanel(role)) {
    throw new Error("FORBIDDEN");
  }

  const agent = await prisma.agent.findUnique({
    where: { userId: session.user.id },
    select: { id: true, departmentId: true, teamId: true },
  });

  return {
    session,
    userId: session.user.id,
    agentId: agent?.id,
    departmentId: agent?.departmentId,
  };
}
