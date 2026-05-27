import { authenticator } from "otplib";
import QRCode from "qrcode";
import { appConfig } from "@/config/app";

authenticator.options = { window: 1 };

export function generateTotpSecret(): string {
  return authenticator.generateSecret();
}

export function verifyTotpToken(secret: string, token: string): boolean {
  return authenticator.verify({ token, secret });
}

export function getTotpUri(email: string, secret: string): string {
  return authenticator.keyuri(email, appConfig.name, secret);
}

export async function generateTotpQrDataUrl(
  email: string,
  secret: string
): Promise<string> {
  return QRCode.toDataURL(getTotpUri(email, secret));
}
