import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { requireAgentContext } from "@/lib/api/agent-context";
import { listTicketsSchema } from "@/modules/tickets/schemas";
import { listTickets } from "@/modules/tickets/services/ticket.service";
import { TicketFilters } from "@/components/tickets/ticket-filters";
import { TicketListTable } from "@/components/tickets/ticket-list-table";
import { Button } from "@/components/ui/button";

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function AgentTicketsPage({ searchParams }: Props) {
  let ctx;
  try {
    ctx = await requireAgentContext();
  } catch {
    redirect("/login");
  }

  const params = Object.fromEntries(
    Object.entries(searchParams).map(([k, v]) => [
      k,
      Array.isArray(v) ? v[0] : v,
    ])
  );
  const input = listTicketsSchema.parse(params);
  const data = await listTickets(input, {
    agentId: ctx.agentId,
    departmentId: ctx.departmentId ?? undefined,
  });

  const [departments, tags] = await Promise.all([
    prisma.department.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.tag.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tickets</h1>
        <Button asChild>
          <Link href="/agent/tickets/new">Nuevo ticket</Link>
        </Button>
      </div>

      <Suspense fallback={<div>Cargando filtros...</div>}>
        <TicketFilters meta={{ departments, tags }} />
      </Suspense>

      <TicketListTable tickets={data.items as never} />

      <p className="text-sm text-muted-foreground">
        {data.total} tickets · página {data.page} de {data.totalPages || 1}
      </p>
    </div>
  );
}
