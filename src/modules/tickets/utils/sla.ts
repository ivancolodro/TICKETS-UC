export type SlaLevel = "ok" | "warning" | "breached" | "none";

export function getSlaLevel(
  slaDueAt: Date | string | null | undefined
): SlaLevel {
  if (!slaDueAt) return "none";

  const due = new Date(slaDueAt);
  const now = Date.now();
  const diff = due.getTime() - now;

  if (diff <= 0) return "breached";

  const hoursLeft = diff / (1000 * 60 * 60);
  if (hoursLeft <= 4) return "warning";

  return "ok";
}

export function formatSlaCountdown(
  slaDueAt: Date | string | null | undefined
): string {
  if (!slaDueAt) return "—";

  const due = new Date(slaDueAt);
  const diff = due.getTime() - Date.now();

  if (diff <= 0) {
    const over = Math.abs(diff);
    const h = Math.floor(over / 3600000);
    const m = Math.floor((over % 3600000) / 60000);
    return `Vencido ${h}h ${m}m`;
  }

  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m`;
}

export const SLA_LEVEL_STYLES: Record<SlaLevel, string> = {
  ok: "text-emerald-600 bg-emerald-50",
  warning: "text-amber-700 bg-amber-50",
  breached: "text-red-700 bg-red-50",
  none: "text-muted-foreground bg-muted",
};
