import Link from "next/link";
import { notFound } from "next/navigation";
import { getCustomer } from "@/modules/users/services/customer.service";
import { TicketListTable } from "@/components/tickets/ticket-list-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = { params: { id: string } };

export default async function CustomerDetailPage({ params }: Props) {
  const customer = await getCustomer(params.id);
  if (!customer) notFound();

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/admin/customers">← Clientes</Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{customer.name ?? customer.email}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>{customer.email}</p>
          {customer.phone && <p>{customer.phone}</p>}
          {customer.organization && (
            <p>Organización: {customer.organization.name}</p>
          )}
        </CardContent>
      </Card>

      <h2 className="text-lg font-semibold">Historial de tickets</h2>
      <TicketListTable
        tickets={
          customer.tickets.map((t) => ({
            ...t,
            slaDueAt: null,
            updatedAt: t.createdAt,
            customer: {
              name: customer.name,
              email: customer.email,
            },
            assignee: null,
            department: null,
          })) as never
        }
      />
    </div>
  );
}
