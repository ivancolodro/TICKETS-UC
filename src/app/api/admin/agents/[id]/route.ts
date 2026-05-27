import { NextRequest, NextResponse } from "next/server";
import {
  deleteAgent,
  getAgent,
  updateAgent,
} from "@/modules/users/services/agent.service";
import { handleApiError } from "@/lib/api/errors";
import { requireAdminContext } from "@/lib/api/admin-context";

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await requireAdminContext();
    const agent = await getAgent(params.id);
    if (!agent) throw new Error("NOT_FOUND");
    return NextResponse.json(agent);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    await requireAdminContext();
    const agent = await updateAgent(params.id, await request.json());
    return NextResponse.json(agent);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await requireAdminContext();
    await deleteAgent(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
