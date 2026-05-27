import type { TicketPriority } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { PRIORITY_COLORS, PRIORITY_LABELS } from "@/modules/tickets/constants";
import { cn } from "@/lib/utils";

export function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <Badge variant="outline" className={cn("border-0", PRIORITY_COLORS[priority])}>
      {PRIORITY_LABELS[priority]}
    </Badge>
  );
}
