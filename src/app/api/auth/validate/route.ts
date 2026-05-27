import { NextRequest, NextResponse } from "next/server";
import { authenticateCredentials } from "@/modules/users/services/auth-login";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ??
    request.headers.get("x-real-ip") ??
    undefined;

  const result = await authenticateCredentials(
    body.email,
    body.password,
    body.totp,
    { ipAddress: ip, userAgent: request.headers.get("user-agent") ?? undefined }
  );

  return NextResponse.json(result);
}
