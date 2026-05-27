import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { requireAgentContext } from "@/lib/api/agent-context";
import { createThreadSchema } from "@/modules/tickets/schemas";
import { addThread } from "@/modules/tickets/services/ticket.service";

type Params = { params: { id: string } };

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const ctx = await requireAgentContext();
    const body = await request.json();
    const input = createThreadSchema.parse(body);

    const thread = await addThread(params.id, input.body, {
      authorId: ctx.userId,
      authorType: "AGENT",
      isInternal: input.isInternal,
    });

    return NextResponse.json(thread, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
