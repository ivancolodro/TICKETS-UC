import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { requireAdminContext } from "@/lib/api/admin-context";
import { createAgent, listAgents } from "@/modules/users/services/agent.service";

export async function GET() {
  try {
    const ctx = await requireAdminContext();
    if (!ctx.canManageAllAgents && !ctx.canManageDeptAgents) {
      throw new Error("FORBIDDEN");
    }

    const agents = await listAgents(
      ctx.departmentIds
        ? {
            OR: [
              { departmentId: { in: ctx.departmentIds } },
              {
                departments: {
                  some: { departmentId: { in: ctx.departmentIds } },
                },
              },
            ],
          }
        : undefined
    );

    return NextResponse.json(agents);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireAdminContext();
    if (!ctx.canManageAllAgents && !ctx.canManageDeptAgents) {
      throw new Error("FORBIDDEN");
    }

    const body = await request.json();

    if (ctx.departmentIds && body.departmentIds) {
      const allowed = body.departmentIds.every((id: string) =>
        ctx.departmentIds!.includes(id)
      );
      if (!allowed) throw new Error("FORBIDDEN");
    }

    const agent = await createAgent(body);
    return NextResponse.json(agent, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
