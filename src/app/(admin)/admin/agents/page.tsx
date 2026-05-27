import { prisma } from "@/lib/prisma";
import { AgentsManager } from "@/components/admin/agents-manager";

export default async function AdminAgentsPage() {
  const departments = await prisma.department.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return <AgentsManager departments={departments} />;
}
