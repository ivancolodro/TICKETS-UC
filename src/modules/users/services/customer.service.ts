import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { updateCustomerSchema } from "../schemas";
import type { z } from "zod";

const customerInclude = {
  organization: { select: { id: true, name: true, slug: true } },
  user: { select: { id: true, name: true, email: true } },
  _count: { select: { tickets: true } },
} satisfies Prisma.CustomerInclude;

export async function listCustomers(where?: Prisma.CustomerWhereInput) {
  return prisma.customer.findMany({
    where,
    include: customerInclude,
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

export async function getCustomer(id: string) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      ...customerInclude,
      tickets: {
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          ticketNumberDisplay: true,
          subject: true,
          status: true,
          priority: true,
          createdAt: true,
        },
      },
    },
  });
  return customer;
}

export async function updateCustomer(
  id: string,
  input: z.infer<typeof updateCustomerSchema>
) {
  const data = updateCustomerSchema.parse(input);
  return prisma.customer.update({
    where: { id },
    data,
    include: customerInclude,
  });
}

export async function listOrganizations() {
  return prisma.organization.findMany({
    include: {
      _count: { select: { customers: true, tickets: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function updateOrganization(
  id: string,
  data: {
    name?: string;
    crossTicketVisibility?: boolean;
    isActive?: boolean;
  }
) {
  return prisma.organization.update({ where: { id }, data });
}
