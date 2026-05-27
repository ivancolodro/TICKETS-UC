import { NextRequest, NextResponse } from "next/server";
import {
  getCustomer,
  updateCustomer,
} from "@/modules/users/services/customer.service";
import { handleApiError } from "@/lib/api/errors";
import { requireAdminContext } from "@/lib/api/admin-context";

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await requireAdminContext();
    const customer = await getCustomer(params.id);
    if (!customer) throw new Error("NOT_FOUND");
    return NextResponse.json(customer);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    await requireAdminContext();
    const customer = await updateCustomer(params.id, await request.json());
    return NextResponse.json(customer);
  } catch (error) {
    return handleApiError(error);
  }
}
