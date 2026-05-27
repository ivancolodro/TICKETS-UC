import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { requireAgentContext } from "@/lib/api/agent-context";
import { hasPermission } from "@/lib/rbac/check";
import { Permission } from "@/lib/rbac/permissions";
import {
  createTicketSchema,
  listTicketsSchema,
} from "@/modules/tickets/schemas";
import { createTicket, listTickets } from "@/modules/tickets/services/ticket.service";

export async function GET(request: NextRequest) {
  try {
    const ctx = await requireAgentContext();
    if (!hasPermission(ctx.session.user.role, Permission.VER_TODOS_TICKETS) &&
        !hasPermission(ctx.session.user.role, Permission.VER_TICKETS_DEPARTAMENTO)) {
      throw new Error("FORBIDDEN");
    }

    const params = Object.fromEntries(request.nextUrl.searchParams);
    const input = listTicketsSchema.parse(params);

    const result = await listTickets(input, {
      agentId: ctx.agentId,
      departmentId: ctx.departmentId ?? undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireAgentContext();
    if (!hasPermission(ctx.session.user.role, Permission.CREAR_TICKET)) {
      throw new Error("FORBIDDEN");
    }

    const body = await request.json();
    const input = createTicketSchema.parse({
      ...body,
      channel: body.channel ?? "MANUAL",
    });

    const ticket = await createTicket(input, ctx.userId);
    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
