import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { requireAgentContext } from "@/lib/api/agent-context";
import { hasPermission } from "@/lib/rbac/check";
import { Permission } from "@/lib/rbac/permissions";
import { mergeTicketsSchema } from "@/modules/tickets/schemas";
import { mergeTickets } from "@/modules/tickets/services/ticket.service";

type Params = { params: { id: string } };

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const ctx = await requireAgentContext();
    if (!hasPermission(ctx.session.user.role, Permission.TICKET_MERGE)) {
      throw new Error("FORBIDDEN");
    }

    const body = await request.json();
    const input = mergeTicketsSchema.parse({
      primaryTicketId: params.id,
      ...body,
    });

    const ticket = await mergeTickets(
      input.primaryTicketId,
      input.mergedTicketIds,
      ctx.userId
    );

    return NextResponse.json(ticket);
  } catch (error) {
    return handleApiError(error);
  }
}
