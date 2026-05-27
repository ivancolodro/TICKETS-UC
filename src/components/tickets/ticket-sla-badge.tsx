import {
  formatSlaCountdown,
  getSlaLevel,
  SLA_LEVEL_STYLES,
} from "@/modules/tickets/utils/sla";
import { cn } from "@/lib/utils";

export function TicketSlaBadge({
  slaDueAt,
}: {
  slaDueAt: Date | string | null | undefined;
}) {
  const level = getSlaLevel(slaDueAt);

  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium tabular-nums",
        SLA_LEVEL_STYLES[level]
      )}
    >
      {formatSlaCountdown(slaDueAt)}
    </span>
  );
}
