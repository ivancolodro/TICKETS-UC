import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { requireAgentContext } from "@/lib/api/agent-context";
import { linkTicketSchema } from "@/modules/tickets/schemas";
import { updateTicket } from "@/modules/tickets/services/ticket.service";

type Params = { params: { id: string } };

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const ctx = await requireAgentContext();
    const body = await request.json();
    const input = linkTicketSchema.parse(body);

    const ticket = await updateTicket(
      params.id,
      { parentId: input.parentId },
      ctx.userId
    );

    return NextResponse.json(ticket);
  } catch (error) {
    return handleApiError(error);
  }
}
