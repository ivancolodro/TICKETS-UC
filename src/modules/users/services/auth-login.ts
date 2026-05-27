import { compare, hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getPasswordPolicy, isPasswordExpired } from "./password-policy";
import { logAuthSession } from "./session-log";
import { verifyTotpToken } from "./totp";

export type LoginContext = {
  ipAddress?: string;
  userAgent?: string;
};

export async function authenticateCredentials(
  email: string,
  password: string,
  totpCode?: string,
  ctx?: LoginContext
) {
  const normalizedEmail = email.toLowerCase();
  const policy = await getPasswordPolicy();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    await logAuthSession({
      email: normalizedEmail,
      event: "LOGIN_FAILED",
      ipAddress: ctx?.ipAddress,
      userAgent: ctx?.userAgent,
      metadata: { reason: "user_not_found" },
    });
    return { ok: false as const, error: "Credenciales incorrectas" };
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    await logAuthSession({
      userId: user.id,
      email: normalizedEmail,
      event: "LOGIN_FAILED",
      ipAddress: ctx?.ipAddress,
      userAgent: ctx?.userAgent,
      metadata: { reason: "account_locked" },
    });
    return {
      ok: false as const,
      error: "Cuenta bloqueada temporalmente. Intente más tarde.",
    };
  }

  if (user.status !== "ACTIVE") {
    return { ok: false as const, error: "Cuenta no activa" };
  }

  if (!user.passwordHash) {
    return {
      ok: false as const,
      error: "Use el inicio de sesión con Google para esta cuenta",
    };
  }

  const validPassword = await compare(password, user.passwordHash);

  if (!validPassword) {
    const attempts = user.failedLoginAttempts + 1;
    const shouldLock = attempts >= policy.maxFailedAttempts;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: attempts,
        lockedUntil: shouldLock
          ? new Date(Date.now() + policy.lockoutMinutes * 60 * 1000)
          : undefined,
      },
    });

    await logAuthSession({
      userId: user.id,
      email: normalizedEmail,
      event: "LOGIN_FAILED",
      ipAddress: ctx?.ipAddress,
      userAgent: ctx?.userAgent,
      metadata: { attempts, locked: shouldLock },
    });

    return { ok: false as const, error: "Credenciales incorrectas" };
  }

  if (
    isPasswordExpired(user.passwordChangedAt, policy.expirationDays)
  ) {
    return {
      ok: false as const,
      error: "PASSWORD_EXPIRED",
      userId: user.id,
    };
  }

  if (user.twoFactorEnabled && user.twoFactorSecret) {
    if (!totpCode) {
      await logAuthSession({
        userId: user.id,
        email: normalizedEmail,
        event: "TWO_FACTOR_REQUIRED",
        ipAddress: ctx?.ipAddress,
        userAgent: ctx?.userAgent,
      });
      return { ok: false as const, error: "2FA_REQUIRED", userId: user.id };
    }

    if (!verifyTotpToken(user.twoFactorSecret, totpCode)) {
      await logAuthSession({
        userId: user.id,
        email: normalizedEmail,
        event: "TWO_FACTOR_FAILED",
        ipAddress: ctx?.ipAddress,
        userAgent: ctx?.userAgent,
      });
      return { ok: false as const, error: "Código 2FA inválido" };
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    },
  });

  await logAuthSession({
    userId: user.id,
    email: normalizedEmail,
    event: "LOGIN",
    ipAddress: ctx?.ipAddress,
    userAgent: ctx?.userAgent,
  });

  return {
    ok: true as const,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
    },
  };
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}
