import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import slugify from "slugify";
import { hashPassword } from "../src/lib/password";
import { PRODUCT_FIELDS, defaultPermissionValues } from "../src/lib/permissions";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const categories = [
  "Pneus Double Coin",
  "Palhetas",
  "Lampadas",
  "Amortecedores a gas",
  "Tampa retratil",
  "Acessorios automotivos",
];

async function main() {
  for (const [index, nome] of categories.entries()) {
    await prisma.categoria.upsert({
      where: { slug: slugify(nome, { lower: true, strict: true }) },
      update: { ordem: index + 1, ativo: true },
      create: {
        nome,
        slug: slugify(nome, { lower: true, strict: true }),
        ordem: index + 1,
        ativo: true,
      },
    });
  }

  await prisma.marca.upsert({
    where: { slug: "briland" },
    update: { ativo: true },
    create: { nome: "Briland", slug: "briland", ativo: true },
  });

  const applications = ["Linha leve", "Linha pesada", "Reposicao", "Frota", "Varejo"];
  for (const nome of applications) {
    await prisma.aplicacao.upsert({
      where: { slug: slugify(nome, { lower: true, strict: true }) },
      update: { ativo: true },
      create: {
        nome,
        slug: slugify(nome, { lower: true, strict: true }),
        tipo: "Comercial",
        ativo: true,
      },
    });
  }

  for (const field of PRODUCT_FIELDS) {
    await prisma.productFieldPermission.upsert({
      where: { fieldKey: field.key },
      update: {
        fieldLabel: field.label,
        ...defaultPermissionValues[field.key],
      },
      create: {
        fieldKey: field.key,
        fieldLabel: field.label,
        ...defaultPermissionValues[field.key],
      },
    });
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@briland.com.br";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Briland@123";

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN", status: "ACTIVE" },
    create: {
      name: "Administrador Briland",
      company: "Briland",
      email: adminEmail,
      passwordHash: hashPassword(adminPassword),
      role: "ADMIN",
      status: "ACTIVE",
      notes: "Usuario admin inicial criado pelo seed.",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
