import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { createTicketSchema } from "@/modules/tickets/schemas";
import { createTicket } from "@/modules/tickets/services/ticket.service";

/**
 * Canal API REST público — autenticación por ApiKey en módulo Integraciones.
 * Por ahora acepta POST sin clave (añadir validación en producción).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = createTicketSchema.parse({
      ...body,
      channel: "API",
    });

    const ticket = await createTicket(input);
    return NextResponse.json(
      {
        id: ticket.id,
        ticketNumber: ticket.ticketNumberDisplay,
        publicToken: ticket.publicToken,
        status: ticket.status,
        createdAt: ticket.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
