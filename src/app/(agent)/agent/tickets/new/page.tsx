import { prisma } from "@/lib/prisma";
import { CreateTicketForm } from "@/components/tickets/create-ticket-form";

export default async function NewTicketPage() {
  const [departments, helpTopics] = await Promise.all([
    prisma.department.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
    }),
    prisma.helpTopic.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Crear ticket manual</h1>
      <CreateTicketForm meta={{ departments, helpTopics }} />
    </div>
  );
}
