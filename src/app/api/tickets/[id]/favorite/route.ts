import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { requireAgentContext } from "@/lib/api/agent-context";
import { toggleFavorite } from "@/modules/tickets/services/ticket.service";

type Params = { params: { id: string } };

export async function POST(_request: Request, { params }: Params) {
  try {
    const ctx = await requireAgentContext();
    if (!ctx.agentId) throw new Error("FORBIDDEN");

    const result = await toggleFavorite(params.id, ctx.agentId);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
