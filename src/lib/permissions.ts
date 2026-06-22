import type { Produto, UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type CatalogRole = UserRole | "VISITANTE";

export const PRODUCT_FIELDS = [
  { key: "nome", label: "nome" },
  { key: "codigoInterno", label: "referencia/codigo" },
  { key: "categoria", label: "categoria" },
  { key: "descricaoCurta", label: "descricao curta" },
  { key: "descricaoCompleta", label: "descricao completa" },
  { key: "imagemPrincipal", label: "foto principal" },
  { key: "imagensExtras", label: "fotos extras" },
  { key: "ean", label: "EAN" },
  { key: "ncm", label: "NCM" },
  { key: "caixaMaster", label: "caixa master" },
  { key: "aplicacoes", label: "aplicacao" },
  { key: "preco", label: "preco" },
  { key: "estoque", label: "estoque" },
  { key: "condicaoComercial", label: "condicao comercial" },
  { key: "prazoEntrega", label: "prazo de entrega" },
  { key: "fichaTecnica", label: "ficha tecnica" },
  { key: "manualPdf", label: "manual PDF" },
  { key: "observacaoComercial", label: "observacao comercial" },
  { key: "margem", label: "margem" },
  { key: "quoteButton", label: "botao orcamento" },
  { key: "whatsappButton", label: "botao WhatsApp" },
  { key: "downloadCatalogButton", label: "botao baixar catalogo" },
] as const;

export type ProductFieldKey = (typeof PRODUCT_FIELDS)[number]["key"];
export type PermissionMap = Record<ProductFieldKey, boolean>;

export const defaultPermissionValues: Record<
  ProductFieldKey,
  {
    visibleToVisitor: boolean;
    visibleToClient: boolean;
    visibleToRepresentative: boolean;
    visibleToAdmin: boolean;
  }
> = {
  nome: { visibleToVisitor: true, visibleToClient: true, visibleToRepresentative: true, visibleToAdmin: true },
  codigoInterno: { visibleToVisitor: true, visibleToClient: true, visibleToRepresentative: true, visibleToAdmin: true },
  categoria: { visibleToVisitor: true, visibleToClient: true, visibleToRepresentative: true, visibleToAdmin: true },
  descricaoCurta: { visibleToVisitor: true, visibleToClient: true, visibleToRepresentative: true, visibleToAdmin: true },
  descricaoCompleta: { visibleToVisitor: false, visibleToClient: false, visibleToRepresentative: false, visibleToAdmin: true },
  imagemPrincipal: { visibleToVisitor: true, visibleToClient: true, visibleToRepresentative: true, visibleToAdmin: true },
  imagensExtras: { visibleToVisitor: false, visibleToClient: false, visibleToRepresentative: false, visibleToAdmin: true },
  ean: { visibleToVisitor: false, visibleToClient: true, visibleToRepresentative: true, visibleToAdmin: true },
  ncm: { visibleToVisitor: false, visibleToClient: true, visibleToRepresentative: true, visibleToAdmin: true },
  caixaMaster: { visibleToVisitor: false, visibleToClient: true, visibleToRepresentative: true, visibleToAdmin: true },
  aplicacoes: { visibleToVisitor: false, visibleToClient: true, visibleToRepresentative: true, visibleToAdmin: true },
  preco: { visibleToVisitor: false, visibleToClient: false, visibleToRepresentative: true, visibleToAdmin: true },
  estoque: { visibleToVisitor: false, visibleToClient: false, visibleToRepresentative: true, visibleToAdmin: true },
  condicaoComercial: { visibleToVisitor: false, visibleToClient: false, visibleToRepresentative: true, visibleToAdmin: true },
  prazoEntrega: { visibleToVisitor: false, visibleToClient: false, visibleToRepresentative: true, visibleToAdmin: true },
  fichaTecnica: { visibleToVisitor: false, visibleToClient: true, visibleToRepresentative: true, visibleToAdmin: true },
  manualPdf: { visibleToVisitor: false, visibleToClient: false, visibleToRepresentative: false, visibleToAdmin: true },
  observacaoComercial: { visibleToVisitor: false, visibleToClient: false, visibleToRepresentative: true, visibleToAdmin: true },
  margem: { visibleToVisitor: false, visibleToClient: false, visibleToRepresentative: false, visibleToAdmin: true },
  quoteButton: { visibleToVisitor: true, visibleToClient: true, visibleToRepresentative: true, visibleToAdmin: true },
  whatsappButton: { visibleToVisitor: true, visibleToClient: true, visibleToRepresentative: true, visibleToAdmin: true },
  downloadCatalogButton: { visibleToVisitor: false, visibleToClient: false, visibleToRepresentative: false, visibleToAdmin: true },
};

export async function ensureDefaultPermissions() {
  await prisma.productFieldPermission.createMany({
    data: PRODUCT_FIELDS.map((field) => ({
      fieldKey: field.key,
      fieldLabel: field.label,
      ...defaultPermissionValues[field.key],
    })),
    skipDuplicates: true,
  });
}

function defaultVisibility(role: CatalogRole, key: ProductFieldKey) {
  const defaults = defaultPermissionValues[key];
  return role === "VISITANTE"
    ? defaults.visibleToVisitor
    : role === "CLIENTE"
      ? defaults.visibleToClient
      : role === "REPRESENTANTE"
        ? defaults.visibleToRepresentative
        : defaults.visibleToAdmin;
}

export async function getPermissionMap(role: CatalogRole): Promise<PermissionMap> {
  const rows = await prisma.productFieldPermission.findMany();
  const map = Object.fromEntries(
    PRODUCT_FIELDS.map((field) => [field.key, defaultVisibility(role, field.key)]),
  ) as PermissionMap;

  for (const row of rows) {
    if (!PRODUCT_FIELDS.some((field) => field.key === row.fieldKey)) continue;
    map[row.fieldKey as ProductFieldKey] =
      role === "VISITANTE"
        ? row.visibleToVisitor
        : role === "CLIENTE"
          ? row.visibleToClient
          : role === "REPRESENTANTE"
            ? row.visibleToRepresentative
            : row.visibleToAdmin;
  }

  return map;
}

type ProductWithRelations = Produto & {
  categoria: { nome: string };
  marca: { nome: string };
  aplicacoes: { aplicacao: { nome: string } }[];
};

export async function getVisibleProductData(
  product: ProductWithRelations,
  userRole: CatalogRole,
  permissionMap?: PermissionMap,
) {
  const permissions = permissionMap ?? (await getPermissionMap(userRole));
  const visible: Record<string, unknown> = {
    id: product.id,
    slug: product.slug,
    destaque: product.destaque,
    permissions,
  };

  const set = (key: ProductFieldKey, value: unknown) => {
    if (permissions[key]) visible[key] = value;
  };

  set("nome", product.nome);
  set("codigoInterno", product.codigoInterno);
  set("categoria", product.categoria);
  set("descricaoCurta", product.descricaoCurta);
  set("descricaoCompleta", product.descricaoCompleta);
  set("imagemPrincipal", product.imagemPrincipal);
  set("imagensExtras", product.imagensExtras);
  set("ean", product.ean);
  set("ncm", product.ncm);
  set("caixaMaster", product.caixaMaster);
  set("aplicacoes", product.aplicacoes.map((item) => item.aplicacao.nome));
  set("preco", product.preco ? product.preco.toString() : null);
  set("estoque", product.estoque);
  set("condicaoComercial", product.condicaoComercial);
  set("prazoEntrega", product.prazoEntrega);
  set("fichaTecnica", product.fichaTecnica);
  set("manualPdf", product.manualPdf);
  set("observacaoComercial", product.observacaoComercial);
  set("margem", product.margem ? product.margem.toString() : null);

  return visible as VisibleProduct;
}

export type VisibleProduct = {
  id: string;
  slug: string;
  destaque: boolean;
  permissions: PermissionMap;
  nome?: string;
  codigoInterno?: string;
  categoria?: { nome: string };
  descricaoCurta?: string | null;
  descricaoCompleta?: string | null;
  imagemPrincipal?: string | null;
  imagensExtras?: string[];
  ean?: string | null;
  ncm?: string | null;
  caixaMaster?: string | null;
  aplicacoes?: string[];
  preco?: string | null;
  estoque?: number | null;
  condicaoComercial?: string | null;
  prazoEntrega?: string | null;
  fichaTecnica?: string | null;
  manualPdf?: string | null;
  observacaoComercial?: string | null;
  margem?: string | null;
};
