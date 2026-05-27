"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Department = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  email: string | null;
  isPublic: boolean;
  isActive: boolean;
  parent: { name: string } | null;
  manager: { name: string | null } | null;
  _count: { agents: number; teams: number; tickets: number };
};

export function DepartmentsManager() {
  const [items, setItems] = useState<Department[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    email: "",
    isPublic: true,
  });

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/departments");
    if (res.ok) setItems(await res.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/departments", {
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
        <h1 className="text-2xl font-semibold">Departamentos</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancelar" : "Nuevo departamento"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Crear departamento</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid max-w-lg gap-4">
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
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isPublic}
                  onChange={(e) =>
                    setForm({ ...form, isPublic: e.target.checked })
                  }
                />
                Visible en portal público
              </label>
              <Button type="submit">Guardar</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Padre</th>
              <th className="px-4 py-3">Responsable</th>
              <th className="px-4 py-3">Visibilidad</th>
              <th className="px-4 py-3">Agentes / Equipos</th>
            </tr>
          </thead>
          <tbody>
            {items.map((d) => (
              <tr key={d.id} className="border-b">
                <td className="px-4 py-3 font-medium">{d.name}</td>
                <td className="px-4 py-3">{d.parent?.name ?? "—"}</td>
                <td className="px-4 py-3">{d.manager?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <Badge variant={d.isPublic ? "default" : "secondary"}>
                    {d.isPublic ? "Público" : "Privado"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {d._count.agents} / {d._count.teams}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
