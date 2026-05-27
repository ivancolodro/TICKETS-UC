import { NextRequest, NextResponse } from "next/server";
import {
  deleteDepartment,
  getDepartment,
  updateDepartment,
} from "@/modules/users/services/department.service";
import { handleApiError } from "@/lib/api/errors";
import { requireAdminContext } from "@/lib/api/admin-context";

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await requireAdminContext();
    const dept = await getDepartment(params.id);
    if (!dept) throw new Error("NOT_FOUND");
    return NextResponse.json(dept);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    await requireAdminContext();
    const dept = await updateDepartment(params.id, await request.json());
    return NextResponse.json(dept);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await requireAdminContext();
    await deleteDepartment(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
