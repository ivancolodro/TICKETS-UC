/**
 * Rutas públicas (sin autenticación) y prefijos por área funcional.
 */
export const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/portal",
  "/api/auth",
  "/api/health",
  "/api/webhooks",
  "/api/v1/tickets",
  "/api/portal",
  "/api/tickets/public",
  "/api/auth/validate",
] as const;

export const authRoutes = ["/login", "/register", "/forgot-password"] as const;

export const adminPrefix = "/admin";
export const agentPrefix = "/agent";
export const portalPrefix = "/portal";
export const apiPrefix = "/api";

export const defaultLoginRedirect = "/agent/tickets";
export const defaultCustomerRedirect = "/portal/tickets";
