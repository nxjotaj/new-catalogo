import { prisma } from "@/lib/prisma";
import { getPermissionMap, getVisibleProductData, type CatalogRole } from "@/lib/permissions";
import type { Prisma } from "@/generated/prisma/client";

export type CatalogSearchParams = {
  q?: string;
  categoria?: string;
  marca?: string;
  aplicacao?: string;
};

export function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function getCatalogData(filters: CatalogSearchParams, role: CatalogRole) {
  const q = filters.q?.trim();
  const permissions = await getPermissionMap(role);
  const searchableFields: Prisma.ProdutoWhereInput[] = [];
  if (q && permissions.nome) searchableFields.push({ nome: { contains: q, mode: "insensitive" } });
  if (q && permissions.codigoInterno) searchableFields.push({ codigoInterno: { contains: q, mode: "insensitive" } });
  if (q && permissions.ean) searchableFields.push({ ean: { contains: q, mode: "insensitive" } });
  if (q && permissions.ncm) searchableFields.push({ ncm: { contains: q, mode: "insensitive" } });
  if (q && permissions.descricaoCurta) searchableFields.push({ descricaoCurta: { contains: q, mode: "insensitive" } });
  if (q && permissions.descricaoCompleta) searchableFields.push({ descricaoCompleta: { contains: q, mode: "insensitive" } });

  const where: Prisma.ProdutoWhereInput = {
    ativo: true,
    ...(filters.categoria ? { categoria: { slug: filters.categoria } } : {}),
    ...(filters.marca ? { marca: { slug: filters.marca } } : {}),
    ...(filters.aplicacao && permissions.aplicacoes
      ? { aplicacoes: { some: { aplicacao: { slug: filters.aplicacao } } } }
      : {}),
    ...(q && searchableFields.length > 0
      ? { OR: searchableFields }
      : {}),
  };

  const [products, categories, brands, applications] = await Promise.all([
    prisma.produto.findMany({
      where,
      include: {
        categoria: true,
        marca: true,
        aplicacoes: { include: { aplicacao: true } },
      },
      orderBy: [{ destaque: "desc" }, { ordem: "asc" }, { nome: "asc" }],
    }),
    prisma.categoria.findMany({
      where: { ativo: true },
      orderBy: [{ ordem: "asc" }, { nome: "asc" }],
    }),
    prisma.marca.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
    }),
    prisma.aplicacao.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
    }),
  ]);

  return {
    products: await Promise.all(
      products.map((product) => getVisibleProductData(product, role, permissions)),
    ),
    categories,
    brands,
    applications,
    permissions,
  };
}

export async function getProductBySlug(slug: string, role: CatalogRole) {
  const [product, permissions] = await Promise.all([
    prisma.produto.findFirst({
      where: { slug, ativo: true },
      include: {
        categoria: true,
        marca: true,
        aplicacoes: { include: { aplicacao: true } },
      },
    }),
    getPermissionMap(role),
  ]);

  return product ? getVisibleProductData(product, role, permissions) : null;
}

export async function getProductPageData(slug: string, role: CatalogRole) {
  let routeValue = slug;
  try {
    routeValue = decodeURIComponent(slug);
  } catch {
    routeValue = slug;
  }

  const [product, permissions] = await Promise.all([
    prisma.produto.findFirst({
      where: {
        ativo: true,
        OR: [
          { slug: routeValue },
          { codigoInterno: routeValue },
          { id: routeValue },
        ],
      },
      include: {
        categoria: true,
        marca: true,
        aplicacoes: { include: { aplicacao: true } },
      },
    }),
    getPermissionMap(role),
  ]);

  if (!product) return null;

  const related = await getRelatedProducts(product.id, product.categoriaId, role, permissions);
  return {
    product: await getVisibleProductData(product, role, permissions),
    related,
  };
}

export async function getRelatedProducts(
  productId: string,
  categoriaId: string,
  role: CatalogRole,
  permissionMap?: Awaited<ReturnType<typeof getPermissionMap>>,
) {
  const products = await prisma.produto.findMany({
    where: { ativo: true, categoriaId, id: { not: productId } },
    include: { categoria: true, marca: true, aplicacoes: { include: { aplicacao: true } } },
    orderBy: [{ destaque: "desc" }, { ordem: "asc" }],
    take: 5,
  });

  const permissions = permissionMap ?? (await getPermissionMap(role));
  return Promise.all(
    products.map((product) => getVisibleProductData(product, role, permissions)),
  );
}
