import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { requireAgentContext } from "@/lib/api/agent-context";
import { hasPermission } from "@/lib/rbac/check";
import { Permission } from "@/lib/rbac/permissions";
import { createNoteSchema } from "@/modules/tickets/schemas";
import { addNote } from "@/modules/tickets/services/ticket.service";

type Params = { params: { id: string } };

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const ctx = await requireAgentContext();
    if (!hasPermission(ctx.session.user.role, Permission.NOTAS_INTERNAS)) {
      throw new Error("FORBIDDEN");
    }

    const body = await request.json();
    const input = createNoteSchema.parse(body);
    const note = await addNote(params.id, input.body, ctx.userId);

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
