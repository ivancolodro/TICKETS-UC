import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { createTicketSchema } from "@/modules/tickets/schemas";
import { createTicket } from "@/modules/tickets/services/ticket.service";

/** Formulario web — portal cliente (sin login). */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = createTicketSchema.parse({
      ...body,
      channel: "PORTAL",
      assignmentStrategy: "ROUND_ROBIN",
    });

    const ticket = await createTicket(input);

    return NextResponse.json(
      {
        id: ticket.id,
        ticketNumber: ticket.ticketNumberDisplay,
        publicToken: ticket.publicToken,
        publicUrl: `/portal/tickets/${ticket.publicToken}`,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
