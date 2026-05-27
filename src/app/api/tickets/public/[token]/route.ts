import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { getTicketByPublicToken } from "@/modules/tickets/services/ticket.service";

type Params = { params: { token: string } };

export async function GET(_request: Request, { params }: Params) {
  try {
    const ticket = await getTicketByPublicToken(params.token);
    if (!ticket) throw new Error("TICKET_NOT_FOUND");

    return NextResponse.json({
      id: ticket.id,
      ticketNumber: ticket.ticketNumberDisplay,
      subject: ticket.subject,
      status: ticket.status,
      priority: ticket.priority,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      threads: ticket.threads?.filter((t) => !t.isInternal),
      customer: ticket.customer,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
