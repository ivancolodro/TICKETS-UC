import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { requireAdminContext } from "@/lib/api/admin-context";
import { listCustomers } from "@/modules/users/services/customer.service";

export async function GET() {
  try {
    await requireAdminContext();
    const customers = await listCustomers();
    return NextResponse.json(customers);
  } catch (error) {
    return handleApiError(error);
  }
}
