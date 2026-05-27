import { prisma } from "@/lib/prisma";
import { TICKET_NUMBER_PREFIX } from "../constants";

export async function generateTicketNumberDisplay(): Promise<string> {
  const year = new Date().getFullYear();

  const sequence = await prisma.$transaction(async (tx) => {
    const existing = await tx.ticketNumberSequence.findUnique({
      where: { year },
    });

    if (existing) {
      return tx.ticketNumberSequence.update({
        where: { year },
        data: { lastNumber: { increment: 1 } },
      });
    }

    return tx.ticketNumberSequence.create({
      data: { year, lastNumber: 1 },
    });
  });

  const padded = String(sequence.lastNumber).padStart(6, "0");
  return `${TICKET_NUMBER_PREFIX}-${year}-${padded}`;
}
