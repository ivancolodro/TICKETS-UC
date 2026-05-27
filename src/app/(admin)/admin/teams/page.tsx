import { prisma } from "@/lib/prisma";
import { TeamsManager } from "@/components/admin/teams-manager";

export default async function AdminTeamsPage() {
  const departments = await prisma.department.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
  });

  return <TeamsManager departments={departments} />;
}
