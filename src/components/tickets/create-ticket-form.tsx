"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextEditor } from "./rich-text-editor";

type Meta = {
  departments: { id: string; name: string }[];
  helpTopics: { id: string; name: string }[];
};

type Props = {
  meta: Meta;
  apiEndpoint?: string;
};

export function CreateTicketForm({
  meta,
  apiEndpoint = "/api/tickets",
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [form, setForm] = useState({
    subject: "",
    priority: "NORMAL",
    departmentId: "",
    helpTopicId: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    assignmentStrategy: "MANUAL",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          description,
          departmentId: form.departmentId || null,
          helpTopicId: form.helpTopicId || null,
          channel: apiEndpoint.includes("portal") ? "PORTAL" : "MANUAL",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al crear ticket");

      if (data.publicUrl) {
        router.push(data.publicUrl);
      } else if (data.publicToken) {
        router.push(`/portal/tickets/${data.publicToken}`);
      } else {
        router.push(`/agent/tickets/${data.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Nuevo ticket</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="rounded bg-destructive/10 p-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="subject">Asunto</Label>
            <Input
              id="subject"
              required
              maxLength={255}
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Descripción</Label>
            <RichTextEditor value={description} onChange={setDescription} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Prioridad</Label>
              <Select
                value={form.priority}
                onValueChange={(priority) => setForm({ ...form, priority })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Baja</SelectItem>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="HIGH">Alta</SelectItem>
                  <SelectItem value="URGENT">Urgente</SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {meta.departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tipo de solicitud</Label>
            <Select
              value={form.helpTopicId}
              onValueChange={(helpTopicId) => setForm({ ...form, helpTopicId })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {meta.helpTopics.map((h) => (
                  <SelectItem key={h.id} value={h.id}>
                    {h.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <SeparatorFields />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customerName">Nombre cliente</Label>
              <Input
                id="customerName"
                required
                value={form.customerName}
                onChange={(e) =>
                  setForm({ ...form, customerName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email</Label>
              <Input
                id="customerEmail"
                type="email"
                required
                value={form.customerEmail}
                onChange={(e) =>
                  setForm({ ...form, customerEmail: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerPhone">Teléfono</Label>
            <Input
              id="customerPhone"
              value={form.customerPhone}
              onChange={(e) =>
                setForm({ ...form, customerPhone: e.target.value })
              }
            />
          </div>

          {apiEndpoint === "/api/tickets" && (
            <div className="space-y-2">
              <Label>Asignación</Label>
              <Select
                value={form.assignmentStrategy}
                onValueChange={(assignmentStrategy) =>
                  setForm({ ...form, assignmentStrategy })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MANUAL">Manual</SelectItem>
                  <SelectItem value="ROUND_ROBIN">Round-robin</SelectItem>
                  <SelectItem value="LOAD_BALANCE">Por carga</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creando..." : "Crear ticket"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function SeparatorFields() {
  return <hr className="border-border" />;
}
