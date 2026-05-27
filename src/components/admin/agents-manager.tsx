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
import { Badge } from "@/components/ui/badge";

type Agent = {
  id: string;
  jobTitle: string | null;
  availability: string;
  user: {
    name: string | null;
    email: string;
    role: string;
    status: string;
  };
  department: { name: string } | null;
  departments: { department: { id: string; name: string } }[];
  _count: { assignedTickets: number };
};

type Department = { id: string; name: string };

const AVAILABILITY_LABELS: Record<string, string> = {
  AVAILABLE: "Disponible",
  BUSY: "Ocupado",
  AWAY: "Fuera de oficina",
};

export function AgentsManager({
  departments,
}: {
  departments: Department[];
}) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "AGENT",
    jobTitle: "",
    departmentIds: [] as string[],
    availability: "AVAILABLE",
    timezone: "America/Santiago",
    locale: "es-CL",
  });

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/agents");
    if (res.ok) setAgents(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        departmentIds:
          form.departmentIds.length > 0
            ? form.departmentIds
            : departments[0]
              ? [departments[0].id]
              : [],
      }),
    });
    if (res.ok) {
      setShowForm(false);
      load();
    }
  }

  function toggleDept(id: string) {
    setForm((f) => ({
      ...f,
      departmentIds: f.departmentIds.includes(id)
        ? f.departmentIds.filter((d) => d !== id)
        : [...f.departmentIds, id],
    }));
  }

  if (loading) return <p className="text-muted-foreground">Cargando...</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-semibold">Agentes</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancelar" : "Nuevo agente"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Crear agente</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Contraseña</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Cargo</Label>
                <Input
                  value={form.jobTitle}
                  onChange={(e) =>
                    setForm({ ...form, jobTitle: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Rol</Label>
                <Select
                  value={form.role}
                  onValueChange={(role) => setForm({ ...form, role })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AGENT">Agente</SelectItem>
                    <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                    <SelectItem value="AGENT_READONLY">Solo lectura</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Disponibilidad</Label>
                <Select
                  value={form.availability}
                  onValueChange={(availability) =>
                    setForm({ ...form, availability })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">Disponible</SelectItem>
                    <SelectItem value="BUSY">Ocupado</SelectItem>
                    <SelectItem value="AWAY">Fuera de oficina</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-full space-y-2">
                <Label>Departamentos</Label>
                <div className="flex flex-wrap gap-2">
                  {departments.map((d) => (
                    <Button
                      key={d.id}
                      type="button"
                      size="sm"
                      variant={
                        form.departmentIds.includes(d.id)
                          ? "default"
                          : "outline"
                      }
                      onClick={() => toggleDept(d.id)}
                    >
                      {d.name}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="col-span-full">
                <Button type="submit">Guardar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Tickets</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((a) => (
              <tr key={a.id} className="border-b">
                <td className="px-4 py-3">
                  {a.user.name}
                  {a.jobTitle && (
                    <span className="block text-xs text-muted-foreground">
                      {a.jobTitle}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">{a.user.email}</td>
                <td className="px-4 py-3">{a.user.role}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline">
                    {AVAILABILITY_LABELS[a.availability]}
                  </Badge>
                </td>
                <td className="px-4 py-3">{a._count.assignedTickets}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
