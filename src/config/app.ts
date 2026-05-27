export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? "UC CHRISTUS — Soporte",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  locale: "es-CL",
  timezone: "America/Santiago",
} as const;
