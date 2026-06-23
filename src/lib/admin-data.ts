import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export type AdminProductFilters = {
  status?: string;
  issue?: string;
  codigo?: string;
  categoriaId?: string;
};

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

export function adminProductWhere(filters: AdminProductFilters = {}): Prisma.ProdutoWhereInput {
  const trimmedCode = filters.codigo?.trim();
  const missingValue = <T extends string>(field: T) => ({
    OR: [
      { [field]: null },
      { [field]: "" },
    ] as Prisma.ProdutoWhereInput[],
  });
  const issueFilters: Prisma.ProdutoWhereInput[] =
    filters.issue === "sem-foto"
      ? [missingValue("imagemPrincipal")]
      : filters.issue === "incompletos"
        ? [
            {
              OR: [
                missingValue("imagemPrincipal"),
                missingValue("descricaoCurta"),
                missingValue("ean"),
                missingValue("ncm"),
                missingValue("caixaMaster"),
              ],
            },
          ]
        : [];

  return {
    ...(filters.status === "ativos" ? { ativo: true } : {}),
    ...(filters.status === "inativos" ? { ativo: false } : {}),
    ...(trimmedCode
      ? { codigoInterno: { contains: trimmedCode, mode: "insensitive" } }
      : {}),
    ...(filters.categoriaId ? { categoriaId: filters.categoriaId } : {}),
    ...(issueFilters.length > 0 ? { AND: issueFilters } : {}),
  };
}

export async function getAdminProducts(filters: AdminProductFilters = {}) {
  return prisma.produto.findMany({
    where: adminProductWhere(filters),
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
