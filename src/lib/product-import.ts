import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { createUniqueProductSlug } from "@/lib/product-slug";
import { makeSlug } from "@/lib/slug";
import {
  emptyProductImportResult,
  type ProductImportResult,
} from "@/lib/product-import-types";

const REQUIRED_COLUMNS = [
  "codigoInterno",
  "categoria",
  "marca",
  "nome",
  "ean",
  "ncm",
  "caixaMaster",
] as const;

const maxImportSize = 8 * 1024 * 1024;
const maxImportRows = 5000;

const HEADER_ALIASES: Record<string, string> = {
  "codigo interno": "codigoInterno",
  categoria: "categoria",
  "categoria conforme catalogo": "categoria",
  marca: "marca",
  nome: "nome",
  "nome descricao do produto": "nome",
  ean: "ean",
  ncm: "ncm",
  "ncm com os pontos": "ncm",
  "caixa master": "caixaMaster",
  preco: "preco",
  estoque: "estoque",
  "descricao curta": "descricaoCurta",
  ca: "ca",
  "condicao comercial": "condicaoComercial",
  "observacao comercial": "observacaoComercial",
  aplicacoes: "aplicacoes",
};

function normalizeHeader(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[()]/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function cellText(cell: ExcelJS.Cell) {
  return cell.text.trim();
}

function parseNumber(value: string) {
  const compact = value.replace(/\s/g, "");
  const normalized =
    compact.includes(",") && compact.includes(".")
      ? compact.replace(/\./g, "").replace(",", ".")
      : compact.replace(",", ".");
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

function parseInteger(value: string) {
  const number = parseNumber(value);
  return number === null ? null : Math.trunc(number);
}

function normalizedName(value: string) {
  return makeSlug(value);
}

export async function importProductsFromXlsx(file: File): Promise<ProductImportResult> {
  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    return { ...emptyProductImportResult, message: "Envie um arquivo no formato XLSX." };
  }
  if (file.size > maxImportSize) {
    return { ...emptyProductImportResult, message: "A planilha excede o limite de 8 MB." };
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());
  const worksheet = workbook.worksheets[0];

  if (!worksheet || worksheet.rowCount < 2) {
    return {
      ...emptyProductImportResult,
      message: "A planilha precisa ter o cabecalho e pelo menos uma linha de produto.",
    };
  }
  if (worksheet.rowCount > maxImportRows + 1) {
    return {
      ...emptyProductImportResult,
      message: `A planilha possui linhas demais. Envie no maximo ${maxImportRows} produtos por importacao.`,
    };
  }

  const headerMap = new Map<string, number>();
  worksheet.getRow(1).eachCell((cell, columnNumber) => {
    const mapped = HEADER_ALIASES[normalizeHeader(cellText(cell))];
    if (mapped) headerMap.set(mapped, columnNumber);
  });

  const missingColumns = REQUIRED_COLUMNS.filter((column) => !headerMap.has(column));
  if (missingColumns.length > 0) {
    return {
      ...emptyProductImportResult,
      message: `Colunas obrigatorias ausentes: ${missingColumns.join(", ")}.`,
    };
  }

  const [categories, brands, applications] = await Promise.all([
    prisma.categoria.findMany({ where: { ativo: true } }),
    prisma.marca.findMany({ where: { ativo: true } }),
    prisma.aplicacao.findMany({ where: { ativo: true } }),
  ]);
  const categoryMap = new Map(categories.map((item) => [normalizedName(item.nome), item]));
  const brandMap = new Map(brands.map((item) => [normalizedName(item.nome), item]));
  const applicationMap = new Map(applications.map((item) => [normalizedName(item.nome), item]));

  let created = 0;
  let updated = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    const value = (key: string) => {
      const column = headerMap.get(key);
      return column ? cellText(row.getCell(column)) : "";
    };

    const codigoInterno = value("codigoInterno");
    const categoriaNome = value("categoria");
    const marcaNome = value("marca");
    const nome = value("nome");
    const ean = value("ean");
    const ncm = value("ncm");
    const caixaMaster = value("caixaMaster");

    if (![codigoInterno, categoriaNome, marcaNome, nome, ean, ncm, caixaMaster].some(Boolean)) {
      continue;
    }

    const missing = [
      ["Codigo Interno", codigoInterno],
      ["Categoria", categoriaNome],
      ["Marca", marcaNome],
      ["Nome", nome],
      ["EAN", ean],
      ["NCM", ncm],
      ["Caixa Master", caixaMaster],
    ]
      .filter(([, fieldValue]) => !fieldValue)
      .map(([label]) => label);

    if (missing.length > 0) {
      failed += 1;
      errors.push(`Linha ${rowNumber}: campos obrigatorios vazios: ${missing.join(", ")}.`);
      continue;
    }

    const category = categoryMap.get(normalizedName(categoriaNome));
    const brand = brandMap.get(normalizedName(marcaNome));
    if (!category || !brand) {
      failed += 1;
      errors.push(
        `Linha ${rowNumber}: ${!category ? `categoria "${categoriaNome}"` : ""}${
          !category && !brand ? " e " : ""
        }${!brand ? `marca "${marcaNome}"` : ""} nao encontrada no cadastro.`,
      );
      continue;
    }

    const applicationNames = value("aplicacoes")
      .split(/[;,|]/)
      .map((item) => item.trim())
      .filter(Boolean);
    const applicationIds = applicationNames
      .map((item) => applicationMap.get(normalizedName(item))?.id)
      .filter((id): id is string => Boolean(id));
    const unknownApplications = applicationNames.filter(
      (item) => !applicationMap.has(normalizedName(item)),
    );
    if (unknownApplications.length > 0) {
      errors.push(
        `Linha ${rowNumber}: aplicacoes ignoradas por nao existirem no cadastro: ${unknownApplications.join(", ")}.`,
      );
    }

    const existing = await prisma.produto.findUnique({ where: { codigoInterno } });
    const uniqueSlug = await createUniqueProductSlug({
      name: nome,
      internalCode: codigoInterno,
      requestedSlug: existing?.slug,
      excludeProductId: existing?.id,
    });
    const precoText = value("preco");
    const estoqueText = value("estoque");
    const data = {
      nome,
      slug: uniqueSlug,
      codigoInterno,
      categoriaId: category.id,
      marcaId: brand.id,
      ean,
      ncm,
      caixaMaster,
      descricaoCurta: value("descricaoCurta") || null,
      ca: value("ca") || null,
      preco: precoText ? parseNumber(precoText) : null,
      estoque: estoqueText ? parseInteger(estoqueText) : null,
      condicaoComercial: value("condicaoComercial") || null,
      observacaoComercial: value("observacaoComercial") || null,
      ativo: true,
    };

    try {
      await prisma.$transaction(async (transaction) => {
        const product = existing
          ? await transaction.produto.update({ where: { id: existing.id }, data })
          : await transaction.produto.create({ data });

        await transaction.produtoAplicacao.deleteMany({
          where: { produtoId: product.id },
        });
        if (applicationIds.length > 0) {
          await transaction.produtoAplicacao.createMany({
            data: applicationIds.map((aplicacaoId) => ({
              produtoId: product.id,
              aplicacaoId,
            })),
            skipDuplicates: true,
          });
        }
      });

      if (existing) updated += 1;
      else created += 1;
    } catch (error) {
      failed += 1;
      const reason =
        error instanceof Error && error.message.includes("Unique constraint")
          ? "codigo interno ou endereco da pagina ja esta em uso"
          : "erro ao gravar no banco";
      errors.push(
        `Linha ${rowNumber}: nao foi possivel salvar o produto ${codigoInterno} (${reason}).`,
      );
    }
  }

  return {
    success: created + updated > 0,
    created,
    updated,
    failed,
    errors: errors.slice(0, 100),
    message: `Importacao concluida: ${created} criados, ${updated} atualizados e ${failed} com erro.`,
  };
}
