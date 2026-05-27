import { format } from "date-fns";
import { es } from "date-fns/locale";
import { notFound } from "next/navigation";
import { getTicketByPublicToken } from "@/modules/tickets/services/ticket.service";
import { TicketStatusBadge } from "@/components/tickets/ticket-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = { params: { token: string } };

export default async function PublicTicketPage({ params }: Props) {
  const ticket = await getTicketByPublicToken(params.token);
  if (!ticket) notFound();

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-sm text-muted-foreground">
          {ticket.ticketNumberDisplay}
        </p>
        <h1 className="text-xl font-semibold">{ticket.subject}</h1>
        <div className="mt-2">
          <TicketStatusBadge status={ticket.status} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Conversación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {ticket.threads?.map((thread) => (
            <div key={thread.id} className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">
                {format(new Date(thread.createdAt), "PPp", { locale: es })}
              </p>
              <div
                className="prose prose-sm mt-2 max-w-none"
                dangerouslySetInnerHTML={{ __html: thread.body }}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Guarde este enlace para consultar el estado de su solicitud.
      </p>
    </div>
  );
}
