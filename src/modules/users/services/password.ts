import {
  getPasswordPolicy,
  validatePassword,
} from "./password-policy";
import { hashPassword as hash } from "./auth-login";

export { hash };

export async function validatePasswordForCreate(password: string) {
  const policy = await getPasswordPolicy();
  const result = validatePassword(password, policy);
  if (!result.valid) {
    throw new Error(result.errors.join(". "));
  }
}
