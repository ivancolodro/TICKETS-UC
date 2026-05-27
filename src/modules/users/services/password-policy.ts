import { prisma } from "@/lib/prisma";

export type PasswordPolicyConfig = {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSpecial: boolean;
  expirationDays: number | null;
  maxFailedAttempts: number;
  lockoutMinutes: number;
};

const DEFAULT_POLICY: PasswordPolicyConfig = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: false,
  expirationDays: null,
  maxFailedAttempts: 5,
  lockoutMinutes: 30,
};

export async function getPasswordPolicy(): Promise<PasswordPolicyConfig> {
  const policy = await prisma.passwordPolicy.findUnique({
    where: { id: "default" },
  });

  if (!policy) {
    await prisma.passwordPolicy.create({ data: { id: "default" } });
    return DEFAULT_POLICY;
  }

  return {
    minLength: policy.minLength,
    requireUppercase: policy.requireUppercase,
    requireLowercase: policy.requireLowercase,
    requireNumber: policy.requireNumber,
    requireSpecial: policy.requireSpecial,
    expirationDays: policy.expirationDays,
    maxFailedAttempts: policy.maxFailedAttempts,
    lockoutMinutes: policy.lockoutMinutes,
  };
}

export function validatePassword(
  password: string,
  policy: PasswordPolicyConfig
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < policy.minLength) {
    errors.push(`Mínimo ${policy.minLength} caracteres`);
  }
  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("Debe incluir una mayúscula");
  }
  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push("Debe incluir una minúscula");
  }
  if (policy.requireNumber && !/[0-9]/.test(password)) {
    errors.push("Debe incluir un número");
  }
  if (policy.requireSpecial && !/[^A-Za-z0-9]/.test(password)) {
    errors.push("Debe incluir un carácter especial");
  }

  return { valid: errors.length === 0, errors };
}

export function isPasswordExpired(
  passwordChangedAt: Date | null,
  expirationDays: number | null
): boolean {
  if (!expirationDays || !passwordChangedAt) return false;
  const expires = new Date(passwordChangedAt);
  expires.setDate(expires.getDate() + expirationDays);
  return new Date() > expires;
}
