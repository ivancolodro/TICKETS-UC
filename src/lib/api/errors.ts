import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Validación fallida", details: error.flatten() },
      { status: 400 }
    );
  }

  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED") {
      return apiError("No autenticado", 401);
    }
    if (error.message === "FORBIDDEN") {
      return apiError("Sin permiso", 403);
    }
    if (error.message === "TICKET_NOT_FOUND" || error.message === "NOT_FOUND") {
      return apiError("Recurso no encontrado", 404);
    }
    if (error.message.includes("Transición de estado")) {
      return apiError(error.message, 422);
    }
    return apiError(error.message, 500);
  }

  return apiError("Error interno", 500);
}
