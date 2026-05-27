import { PrismaClient, UserRole } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("Admin123!", 12);

  await prisma.passwordPolicy.upsert({
    where: { id: "default" },
    create: { id: "default" },
    update: {},
  });

  const org = await prisma.organization.upsert({
    where: { slug: "uc-christus" },
    create: {
      name: "UC CHRISTUS",
      slug: "uc-christus",
    },
    update: {},
  });

  const dept = await prisma.department.upsert({
    where: {
      organizationId_slug: {
        organizationId: org.id,
        slug: "soporte-ti",
      },
    },
    create: {
      name: "Soporte TI",
      slug: "soporte-ti",
      organizationId: org.id,
    },
    update: {},
  });

  const team = await prisma.team.upsert({
    where: {
      departmentId_slug: { departmentId: dept.id, slug: "mesa-ayuda" },
    },
    create: {
      name: "Mesa de ayuda",
      slug: "mesa-ayuda",
      departmentId: dept.id,
    },
    update: {},
  });

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@ucchristus.cl" },
    create: {
      email: "admin@ucchristus.cl",
      name: "Administrador",
      role: UserRole.ADMIN,
      status: "ACTIVE",
      passwordHash,
      organizationId: org.id,
    },
    update: { passwordHash, status: "ACTIVE" },
  });

  const agentUser = await prisma.user.upsert({
    where: { email: "agente@ucchristus.cl" },
    create: {
      email: "agente@ucchristus.cl",
      name: "Agente Demo",
      role: UserRole.AGENT,
      status: "ACTIVE",
      passwordHash,
      organizationId: org.id,
    },
    update: { passwordHash, status: "ACTIVE" },
  });

  await prisma.agent.upsert({
    where: { userId: adminUser.id },
    create: {
      userId: adminUser.id,
      departmentId: dept.id,
      teamId: team.id,
    },
    update: { departmentId: dept.id, teamId: team.id },
  });

  await prisma.agent.upsert({
    where: { userId: agentUser.id },
    create: {
      userId: agentUser.id,
      departmentId: dept.id,
      teamId: team.id,
    },
    update: {},
  });

  const topics = [
    { name: "Acceso y permisos", slug: "acceso" },
    { name: "Hardware", slug: "hardware" },
    { name: "Software", slug: "software" },
    { name: "Red e infraestructura", slug: "red" },
  ];

  for (const t of topics) {
    await prisma.helpTopic.upsert({
      where: { slug: t.slug },
      create: {
        ...t,
        departmentId: dept.id,
        isPublic: true,
      },
      update: {},
    });
  }

  const tags = ["urgente", "vip", "escalado", "externo"];
  for (const name of tags) {
    await prisma.tag.upsert({
      where: { name },
      create: { name },
      update: {},
    });
  }

  let slaPlan = await prisma.sLAPlan.findFirst({ where: { isDefault: true } });
  if (!slaPlan) {
    slaPlan = await prisma.sLAPlan.create({
      data: { name: "SLA Estándar", isDefault: true },
    });
  }

  const existingPolicy = await prisma.sLAPolicy.findFirst({
    where: { slaPlanId: slaPlan.id, departmentId: dept.id, priority: "NORMAL" },
  });
  if (!existingPolicy) {
    await prisma.sLAPolicy.create({
      data: {
        slaPlanId: slaPlan.id,
        name: "Normal — 8h respuesta / 48h resolución",
        priority: "NORMAL",
        departmentId: dept.id,
        firstResponseMinutes: 480,
        resolutionMinutes: 2880,
      },
    });
  }

  console.log("Seed OK");
  console.log("  admin@ucchristus.cl / Admin123!");
  console.log("  agente@ucchristus.cl / Admin123!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
