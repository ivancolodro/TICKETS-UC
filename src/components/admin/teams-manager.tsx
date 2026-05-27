"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Team = {
  id: string;
  name: string;
  department: { name: string };
  members: { isLead: boolean; agent: { user: { name: string | null } } }[];
  _count: { tickets: number; agents: number };
};

type Department = { id: string; name: string };

export function TeamsManager({
  departments,
}: {
  departments: Department[];
}) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    departmentId: departments[0]?.id ?? "",
  });

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/teams");
    if (res.ok) setTeams(await res.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowForm(false);
      load();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-semibold">Equipos</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancelar" : "Nuevo equipo"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Crear equipo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid max-w-md gap-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Departamento</Label>
                <Select
                  value={form.departmentId}
                  onValueChange={(departmentId) =>
                    setForm({ ...form, departmentId })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit">Guardar</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Equipo</th>
              <th className="px-4 py-3">Departamento</th>
              <th className="px-4 py-3">Líder</th>
              <th className="px-4 py-3">Miembros</th>
              <th className="px-4 py-3">Tickets</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((t) => (
              <tr key={t.id} className="border-b">
                <td className="px-4 py-3 font-medium">{t.name}</td>
                <td className="px-4 py-3">{t.department.name}</td>
                <td className="px-4 py-3">
                  {t.members.find((m) => m.isLead)?.agent.user.name ?? "—"}
                </td>
                <td className="px-4 py-3">{t.members.length}</td>
                <td className="px-4 py-3">{t._count.tickets}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
