import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { requireAgentContext } from "@/lib/api/agent-context";
import { hasPermission } from "@/lib/rbac/check";
import { Permission } from "@/lib/rbac/permissions";
import { updateTicketSchema } from "@/modules/tickets/schemas";
import {
  getTicketById,
  softDeleteTicket,
  updateTicket,
} from "@/modules/tickets/services/ticket.service";

type Params = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const ctx = await requireAgentContext();
    if (!hasPermission(ctx.session.user.role, Permission.VER_TODOS_TICKETS) &&
        !hasPermission(ctx.session.user.role, Permission.VER_TICKETS_DEPARTAMENTO)) {
      throw new Error("FORBIDDEN");
    }

    const ticket = await getTicketById(params.id, true);
    if (!ticket) throw new Error("TICKET_NOT_FOUND");

    return NextResponse.json(ticket);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const ctx = await requireAgentContext();
    if (!hasPermission(ctx.session.user.role, Permission.TICKET_UPDATE)) {
      throw new Error("FORBIDDEN");
    }

    const body = await request.json();
    const input = updateTicketSchema.parse(body);
    const ticket = await updateTicket(params.id, input, ctx.userId);

    return NextResponse.json(ticket);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const ctx = await requireAgentContext();
    if (!hasPermission(ctx.session.user.role, Permission.TICKET_DELETE)) {
      throw new Error("FORBIDDEN");
    }

    await softDeleteTicket(params.id, ctx.userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
