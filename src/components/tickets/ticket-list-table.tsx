import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { TicketPriority, TicketStatus } from "@prisma/client";
import { TicketStatusBadge } from "./ticket-status-badge";
import { TicketPriorityBadge } from "./ticket-priority-badge";
import { TicketSlaBadge } from "./ticket-sla-badge";

export type TicketListItem = {
  id: string;
  ticketNumberDisplay: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  slaDueAt: Date | string | null;
  updatedAt: Date | string;
  customer: { name: string | null; email: string };
  assignee: {
    user: { name: string | null; email: string };
  } | null;
  department: { name: string } | null;
};

export function TicketListTable({ tickets }: { tickets: TicketListItem[] }) {
  if (tickets.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No hay tickets con estos filtros.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50 text-left text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">#</th>
            <th className="px-4 py-3 font-medium">Asunto</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            <th className="px-4 py-3 font-medium">Prioridad</th>
            <th className="px-4 py-3 font-medium">Asignado</th>
            <th className="px-4 py-3 font-medium">SLA</th>
            <th className="px-4 py-3 font-medium">Actualización</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => (
            <tr key={t.id} className="border-b hover:bg-muted/30">
              <td className="px-4 py-3 font-mono text-xs">
                <Link
                  href={`/agent/tickets/${t.id}`}
                  className="text-primary hover:underline"
                >
                  {t.ticketNumberDisplay}
                </Link>
              </td>
              <td className="max-w-md truncate px-4 py-3">
                <Link href={`/agent/tickets/${t.id}`} className="hover:underline">
                  {t.subject}
                </Link>
                <p className="truncate text-xs text-muted-foreground">
                  {t.customer.name ?? t.customer.email}
                </p>
              </td>
              <td className="px-4 py-3">
                <TicketStatusBadge status={t.status} />
              </td>
              <td className="px-4 py-3">
                <TicketPriorityBadge priority={t.priority} />
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {t.assignee?.user.name ?? t.assignee?.user.email ?? "—"}
              </td>
              <td className="px-4 py-3">
                <TicketSlaBadge slaDueAt={t.slaDueAt} />
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {formatDistanceToNow(new Date(t.updatedAt), {
                  addSuffix: true,
                  locale: es,
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
