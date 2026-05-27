import Link from "next/link";
import { notFound } from "next/navigation";
import { getTicketById } from "@/modules/tickets/services/ticket.service";
import { TicketDetailPanel } from "@/components/tickets/ticket-detail-panel";
import { Button } from "@/components/ui/button";

type Props = { params: { id: string } };

export default async function TicketDetailPage({ params }: Props) {
  const ticket = await getTicketById(params.id, true);
  if (!ticket) notFound();

  const serialized = JSON.parse(JSON.stringify(ticket));

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/agent/tickets">← Volver a la lista</Link>
      </Button>
      <TicketDetailPanel ticket={serialized} />
    </div>
  );
}
