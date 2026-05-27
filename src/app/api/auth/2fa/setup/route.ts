import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  generateTotpSecret,
  generateTotpQrDataUrl,
} from "@/modules/users/services/totp";
import { handleApiError } from "@/lib/api/errors";

export async function POST() {
  try {
    const session = await requireSession();
    const secret = generateTotpSecret();
    const qrCode = await generateTotpQrDataUrl(session.user.email!, secret);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { twoFactorSecret: secret, twoFactorEnabled: false },
    });

    return NextResponse.json({ secret, qrCode });
  } catch (error) {
    return handleApiError(error);
  }
}
