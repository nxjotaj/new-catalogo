import { prisma } from "@/lib/prisma";

export async function getAdminDashboard() {
  const [products, activeProducts, categories, brands, applications, leads, newLeads] =
    await Promise.all([
      prisma.produto.count(),
      prisma.produto.count({ where: { ativo: true } }),
      prisma.categoria.count(),
      prisma.marca.count(),
      prisma.aplicacao.count(),
      prisma.leadOrcamento.count(),
      prisma.leadOrcamento.count({ where: { status: "NOVO" } }),
    ]);

  return { products, activeProducts, categories, brands, applications, leads, newLeads };
}

export async function getAdminOptions() {
  const [categories, brands, applications] = await Promise.all([
    prisma.categoria.findMany({ orderBy: [{ ordem: "asc" }, { nome: "asc" }] }),
    prisma.marca.findMany({ orderBy: { nome: "asc" } }),
    prisma.aplicacao.findMany({ orderBy: { nome: "asc" } }),
  ]);

  return { categories, brands, applications };
}

export async function getAdminProducts() {
  return prisma.produto.findMany({
    include: {
      categoria: true,
      marca: true,
      aplicacoes: { include: { aplicacao: true } },
    },
    orderBy: [{ ordem: "asc" }, { nome: "asc" }],
  });
}

export async function getAdminLeads() {
  return prisma.leadOrcamento.findMany({
    include: { produto: true },
    orderBy: { createdAt: "desc" },
  });
}
