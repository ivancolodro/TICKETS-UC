import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { totpVerifySchema } from "@/modules/users/schemas";
import { verifyTotpToken } from "@/modules/users/services/totp";
import { handleApiError } from "@/lib/api/errors";

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const { token } = totpVerifySchema.parse(await request.json());

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user?.twoFactorSecret) {
      throw new Error("2FA no configurado");
    }

    if (!verifyTotpToken(user.twoFactorSecret, token)) {
      return NextResponse.json({ error: "Código inválido" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: true },
    });

    return NextResponse.json({ enabled: true });
  } catch (error) {
    return handleApiError(error);
  }
}
