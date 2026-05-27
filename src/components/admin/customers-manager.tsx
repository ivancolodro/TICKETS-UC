"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Customer = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  organization: { name: string } | null;
  _count: { tickets: number };
};

export function CustomersManager() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/customers");
    if (res.ok) setCustomers(await res.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = customers.filter(
    (c) =>
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Clientes y organizaciones</h1>

      <input
        className="flex h-9 max-w-sm rounded-md border px-3 text-sm"
        placeholder="Buscar por nombre o email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Organización</th>
              <th className="px-4 py-3">Tickets</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b">
                <td className="px-4 py-3">{c.name ?? "—"}</td>
                <td className="px-4 py-3">{c.email}</td>
                <td className="px-4 py-3">{c.organization?.name ?? "—"}</td>
                <td className="px-4 py-3">{c._count.tickets}</td>
                <td className="px-4 py-3">
                  <Button variant="link" size="sm" asChild>
                    <Link href={`/admin/customers/${c.id}`}>Ver historial</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
