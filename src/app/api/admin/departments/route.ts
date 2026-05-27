import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { requireAdminContext } from "@/lib/api/admin-context";
import {
  createDepartment,
  listDepartments,
} from "@/modules/users/services/department.service";

export async function GET() {
  try {
    const ctx = await requireAdminContext();
    const departments = await listDepartments(
      ctx.departmentIds ? { id: { in: ctx.departmentIds } } : undefined
    );
    return NextResponse.json(departments);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireAdminContext();
    if (!ctx.isAdmin) throw new Error("FORBIDDEN");
    const department = await createDepartment(await request.json());
    return NextResponse.json(department, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
