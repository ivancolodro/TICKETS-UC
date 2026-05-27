import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  slugify,
} from "../schemas";
import type { z } from "zod";

const include = {
  parent: { select: { id: true, name: true } },
  manager: { select: { id: true, name: true, email: true } },
  defaultSlaPolicy: { select: { id: true, name: true } },
  defaultCustomForm: { select: { id: true, name: true } },
  _count: { select: { agents: true, teams: true, tickets: true } },
} satisfies Prisma.DepartmentInclude;

export async function listDepartments(where?: Prisma.DepartmentWhereInput) {
  return prisma.department.findMany({
    where,
    include,
    orderBy: { name: "asc" },
  });
}

export async function getDepartment(id: string) {
  return prisma.department.findUnique({ where: { id }, include });
}

export async function createDepartment(
  input: z.infer<typeof createDepartmentSchema>
) {
  const data = createDepartmentSchema.parse(input);
  const slug = data.slug ?? slugify(data.name);

  return prisma.department.create({
    data: { ...data, slug },
    include,
  });
}

export async function updateDepartment(
  id: string,
  input: z.infer<typeof updateDepartmentSchema>
) {
  const data = updateDepartmentSchema.parse(input);
  return prisma.department.update({
    where: { id },
    data: {
      ...data,
      ...(data.name && !data.slug ? { slug: slugify(data.name) } : {}),
    },
    include,
  });
}

export async function deleteDepartment(id: string) {
  return prisma.department.update({
    where: { id },
    data: { isActive: false },
  });
}
