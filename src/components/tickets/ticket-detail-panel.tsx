"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TicketPriority, TicketStatus } from "@prisma/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { RichTextEditor } from "./rich-text-editor";
import { TicketStatusBadge } from "./ticket-status-badge";
import { TicketPriorityBadge } from "./ticket-priority-badge";
import { TicketSlaBadge } from "./ticket-sla-badge";
import { STATUS_LABELS, PRIORITY_LABELS, STATUS_TRANSITIONS } from "@/modules/tickets/constants";

type TicketDetail = {
  id: string;
  ticketNumberDisplay: string;
  publicToken: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  slaDueAt: string | Date | null;
  channel: string;
  createdAt: string | Date;
  customer: {
    name: string | null;
    email: string;
    phone: string | null;
    organization: { name: string } | null;
  };
  assignee: { id: string; user: { name: string | null } } | null;
  department: { name: string } | null;
  helpTopic: { name: string } | null;
  threads: {
    id: string;
    body: string;
    isInternal: boolean;
    createdAt: string | Date;
    author: { name: string | null; email: string } | null;
    authorType: string;
  }[];
  notes: {
    id: string;
    body: string;
    createdAt: string | Date;
    author: { name: string | null };
  }[];
  auditLogs: {
    id: string;
    action: string;
    changes: unknown;
    createdAt: string | Date;
    actor: { name: string | null } | null;
  }[];
  tags: { tag: { id: string; name: string; color: string } }[];
  children: { id: string; ticketNumberDisplay: string; subject: string }[];
  parent: { ticketNumberDisplay: string; subject: string } | null;
};

export function TicketDetailPanel({ ticket }: { ticket: TicketDetail }) {
  const router = useRouter();
  const [reply, setReply] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [mergeId, setMergeId] = useState("");

  async function patchTicket(data: Record<string, unknown>) {
    setLoading(true);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error al actualizar");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function sendReply(isInternal: boolean) {
    const body = isInternal ? note : reply;
    if (!body || body === "<p></p>") return;
    setLoading(true);
    try {
      if (isInternal) {
        await fetch(`/api/tickets/${ticket.id}/notes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body }),
        });
        setNote("");
      } else {
        await fetch(`/api/tickets/${ticket.id}/threads`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body, isInternal: false }),
        });
        setReply("");
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function mergeTicket() {
    if (!mergeId.trim()) return;
    setLoading(true);
    try {
      await fetch(`/api/tickets/${ticket.id}/merge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mergedTicketIds: [mergeId.trim()] }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const allowedStatuses = STATUS_TRANSITIONS[ticket.status] ?? [];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div>
          <p className="font-mono text-sm text-muted-foreground">
            {ticket.ticketNumberDisplay}
          </p>
          <h1 className="text-2xl font-semibold">{ticket.subject}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <TicketStatusBadge status={ticket.status} />
            <TicketPriorityBadge priority={ticket.priority} />
            <TicketSlaBadge slaDueAt={ticket.slaDueAt} />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Descripción</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: ticket.description }}
            />
          </CardContent>
        </Card>

        <Tabs defaultValue="thread">
          <TabsList>
            <TabsTrigger value="thread">Conversación</TabsTrigger>
            <TabsTrigger value="notes">Notas internas</TabsTrigger>
            <TabsTrigger value="audit">Historial</TabsTrigger>
          </TabsList>

          <TabsContent value="thread" className="space-y-4">
            {ticket.threads
              .filter((t) => !t.isInternal)
              .map((thread) => (
                <div key={thread.id} className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground">
                    {thread.author?.name ?? thread.authorType} ·{" "}
                    {format(new Date(thread.createdAt), "PPp", { locale: es })}
                  </p>
                  <div
                    className="prose prose-sm mt-2 max-w-none"
                    dangerouslySetInnerHTML={{ __html: thread.body }}
                  />
                </div>
              ))}

            <RichTextEditor value={reply} onChange={setReply} />
            <Button onClick={() => sendReply(false)} disabled={loading}>
              Enviar respuesta
            </Button>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            {ticket.notes.map((n) => (
              <div key={n.id} className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
                <p className="text-xs text-muted-foreground">
                  {n.author.name} ·{" "}
                  {format(new Date(n.createdAt), "PPp", { locale: es })}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm">{n.body}</p>
              </div>
            ))}
            <RichTextEditor value={note} onChange={setNote} placeholder="Nota interna..." />
            <Button variant="secondary" onClick={() => sendReply(true)} disabled={loading}>
              Añadir nota interna
            </Button>
          </TabsContent>

          <TabsContent value="audit">
            <ul className="space-y-2 text-sm">
              {ticket.auditLogs.map((log) => (
                <li key={log.id} className="rounded border px-3 py-2">
                  <span className="font-medium">{log.action}</span>
                  {" · "}
                  {log.actor?.name ?? "Sistema"} ·{" "}
                  {format(new Date(log.createdAt), "PPp", { locale: es })}
                </li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Acciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Estado</label>
              <Select
                value={ticket.status}
                onValueChange={(status) => patchTicket({ status })}
                disabled={loading || allowedStatuses.length === 0}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[ticket.status, ...allowedStatuses].map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Prioridad</label>
              <Select
                value={ticket.priority}
                onValueChange={(priority) => patchTicket({ priority })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(PRIORITY_LABELS).map((p) => (
                    <SelectItem key={p} value={p}>
                      {PRIORITY_LABELS[p as TicketPriority]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div>
              <label className="text-xs text-muted-foreground">
                Fusionar con ID de ticket
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  className="flex h-9 w-full rounded-md border px-2 text-sm"
                  value={mergeId}
                  onChange={(e) => setMergeId(e.target.value)}
                  placeholder="cuid del ticket"
                />
                <Button size="sm" variant="outline" onClick={mergeTicket} disabled={loading}>
                  Fusionar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>{ticket.customer.name ?? "—"}</p>
            <p className="text-muted-foreground">{ticket.customer.email}</p>
            {ticket.customer.phone && <p>{ticket.customer.phone}</p>}
            {ticket.customer.organization && (
              <p>{ticket.customer.organization.name}</p>
            )}
          </CardContent>
        </Card>

        {ticket.tags.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Etiquetas</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-1">
              {ticket.tags.map(({ tag }) => (
                <span
                  key={tag.id}
                  className="rounded px-2 py-0.5 text-xs"
                  style={{ backgroundColor: `${tag.color}22`, color: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
            </CardContent>
          </Card>
        )}

        <p className="text-xs text-muted-foreground">
          Token público:{" "}
          <code className="break-all">{ticket.publicToken}</code>
        </p>
      </div>
    </div>
  );
}
