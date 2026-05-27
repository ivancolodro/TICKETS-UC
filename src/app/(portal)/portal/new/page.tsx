import { prisma } from "@/lib/prisma";
import { CreateTicketForm } from "@/components/tickets/create-ticket-form";

export default async function PortalNewTicketPage() {
  const [departments, helpTopics] = await Promise.all([
    prisma.department.findMany({
      where: { isActive: true, },
      select: { id: true, name: true },
    }),
    prisma.helpTopic.findMany({
      where: { isActive: true, isPublic: true },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">Solicitar soporte</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Complete el formulario. Recibirá un enlace para seguir su ticket sin
        necesidad de cuenta.
      </p>
      <CreateTicketForm
        meta={{ departments, helpTopics }}
        apiEndpoint="/api/portal/tickets"
      />
    </div>
  );
}
