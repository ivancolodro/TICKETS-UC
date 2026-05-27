import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { requireAdminContext } from "@/lib/api/admin-context";
import { createTeam, listTeams } from "@/modules/users/services/team.service";

export async function GET() {
  try {
    const ctx = await requireAdminContext();
    const teams = await listTeams(
      ctx.departmentIds
        ? { departmentId: { in: ctx.departmentIds } }
        : undefined
    );
    return NextResponse.json(teams);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireAdminContext();
    const body = await request.json();
    if (ctx.departmentIds && !ctx.departmentIds.includes(body.departmentId)) {
      throw new Error("FORBIDDEN");
    }
    const team = await createTeam(body);
    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
