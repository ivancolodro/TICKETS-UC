import type { TicketStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS } from "@/modules/tickets/constants";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Partial<Record<TicketStatus, string>> = {
  OPEN: "bg-blue-50 text-blue-800 border-blue-200",
  IN_PROGRESS: "bg-indigo-50 text-indigo-800 border-indigo-200",
  PENDING: "bg-amber-50 text-amber-900 border-amber-200",
  RESOLVED: "bg-emerald-50 text-emerald-800 border-emerald-200",
  CLOSED: "bg-slate-100 text-slate-700 border-slate-200",
  REOPENED: "bg-purple-50 text-purple-800 border-purple-200",
  CANCELLED: "bg-gray-100 text-gray-600 border-gray-200",
  MERGED: "bg-gray-100 text-gray-500 border-gray-200",
};

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", STATUS_STYLES[status])}
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}
