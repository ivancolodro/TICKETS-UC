import { NextRequest, NextResponse } from "next/server";
import {
  deleteTeam,
  getTeam,
  getTeamMetrics,
  updateTeam,
} from "@/modules/users/services/team.service";
import { handleApiError } from "@/lib/api/errors";
import { requireAdminContext } from "@/lib/api/admin-context";

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await requireAdminContext();
    const [team, metrics] = await Promise.all([
      getTeam(params.id),
      getTeamMetrics(params.id),
    ]);
    if (!team) throw new Error("NOT_FOUND");
    return NextResponse.json({ ...team, metrics });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    await requireAdminContext();
    const team = await updateTeam(params.id, await request.json());
    return NextResponse.json(team);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await requireAdminContext();
    await deleteTeam(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
