"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TicketListView } from "@/modules/tickets/constants";

type FilterMeta = {
  departments: { id: string; name: string }[];
  tags: { id: string; name: string }[];
};

const STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "PENDING",
  "RESOLVED",
  "CLOSED",
  "REOPENED",
] as const;

const PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"] as const;

export function TicketFilters({ meta }: { meta: FilterMeta }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/agent/tickets?${params.toString()}`);
  }

  const view = (searchParams.get("view") ?? "global") as TicketListView;

  return (
    <div className="space-y-4">
      <Tabs
        value={view}
        onValueChange={(v) => setParam("view", v)}
      >
        <TabsList>
          <TabsTrigger value="global">Cola global</TabsTrigger>
          <TabsTrigger value="mine">Mis tickets</TabsTrigger>
          <TabsTrigger value="department">Mi departamento</TabsTrigger>
          <TabsTrigger value="favorites">Favoritos</TabsTrigger>
          <TabsTrigger value="archived">Archivados</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Buscar asunto, descripción, notas..."
          className="max-w-xs"
          defaultValue={searchParams.get("search") ?? ""}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setParam("search", (e.target as HTMLInputElement).value || null);
            }
          }}
        />

        <Select
          value={searchParams.get("status") ?? "all"}
          onValueChange={(v) => setParam("status", v === "all" ? null : v)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("priority") ?? "all"}
          onValueChange={(v) => setParam("priority", v === "all" ? null : v)}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Prioridad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("departmentId") ?? "all"}
          onValueChange={(v) =>
            setParam("departmentId", v === "all" ? null : v)
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {meta.departments.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("tagId") ?? "all"}
          onValueChange={(v) => setParam("tagId", v === "all" ? null : v)}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Etiqueta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {meta.tags.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
