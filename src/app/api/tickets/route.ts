import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const tickets = await prisma.ticket.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(tickets);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { titulo, descripcion, solicitante, email, categoria, prioridad } =
      body;

    if (!titulo?.trim() || !descripcion?.trim() || !solicitante?.trim()) {
      return NextResponse.json(
        { error: "Título, descripción y solicitante son obligatorios." },
        { status: 400 }
      );
    }

    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Ingresa un correo electrónico válido." },
        { status: 400 }
      );
    }

    const ticket = await prisma.ticket.create({
      data: {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        solicitante: solicitante.trim(),
        email: email.trim().toLowerCase(),
        categoria: categoria?.trim() || "general",
        prioridad: prioridad || "media",
      },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "No se pudo guardar el ticket." },
      { status: 500 }
    );
  }
}
