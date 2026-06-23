import ExcelJS from "exceljs";
import type { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { adminProductWhere } from "@/lib/admin-data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function queryValue(request: NextRequest, key: string) {
  const value = request.nextUrl.searchParams.get(key);
  return value?.trim() || undefined;
}

function text(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (user?.role !== "ADMIN") {
    return new Response("Acesso administrativo necessario.", { status: 403 });
  }

  const products = await prisma.produto.findMany({
    where: adminProductWhere({
      status: queryValue(request, "status"),
      issue: queryValue(request, "issue"),
      codigo: queryValue(request, "codigo"),
      categoriaId: queryValue(request, "categoriaId"),
    }),
    include: {
      categoria: true,
      marca: true,
      aplicacoes: { include: { aplicacao: true } },
    },
    orderBy: [{ categoria: { nome: "asc" } }, { ordem: "asc" }, { nome: "asc" }],
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Briland Catalogo";
  workbook.created = new Date();
  const worksheet = workbook.addWorksheet("Produtos");

  worksheet.columns = [
    { header: "Codigo Interno", key: "codigoInterno", width: 22 },
    { header: "Nome", key: "nome", width: 40 },
    { header: "Categoria", key: "categoria", width: 26 },
    { header: "Marca", key: "marca", width: 22 },
    { header: "EAN", key: "ean", width: 20 },
    { header: "NCM", key: "ncm", width: 16 },
    { header: "Caixa Master", key: "caixaMaster", width: 18 },
    { header: "Descricao Curta", key: "descricaoCurta", width: 44 },
    { header: "Descricao Completa", key: "descricaoCompleta", width: 56 },
    { header: "Aplicacoes", key: "aplicacoes", width: 34 },
    { header: "Preco", key: "preco", width: 14 },
    { header: "Estoque", key: "estoque", width: 12 },
    { header: "Condicao Comercial", key: "condicaoComercial", width: 30 },
    { header: "Prazo de Entrega", key: "prazoEntrega", width: 22 },
    { header: "Ficha Tecnica", key: "fichaTecnica", width: 36 },
    { header: "Manual PDF", key: "manualPdf", width: 36 },
    { header: "Observacao Comercial", key: "observacaoComercial", width: 34 },
    { header: "Margem", key: "margem", width: 14 },
    { header: "Ativo", key: "ativo", width: 10 },
    { header: "Destaque", key: "destaque", width: 12 },
    { header: "Ordem", key: "ordem", width: 10 },
    { header: "Imagem Principal", key: "imagemPrincipal", width: 48 },
    { header: "Fotos Extras", key: "imagensExtras", width: 56 },
    { header: "Observacao Interna", key: "observacaoInterna", width: 34 },
    { header: "Criado em", key: "createdAt", width: 22 },
    { header: "Atualizado em", key: "updatedAt", width: 22 },
  ];

  worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF021126" },
  };

  for (const product of products) {
    worksheet.addRow({
      codigoInterno: product.codigoInterno,
      nome: product.nome,
      categoria: product.categoria.nome,
      marca: product.marca.nome,
      ean: text(product.ean),
      ncm: text(product.ncm),
      caixaMaster: text(product.caixaMaster),
      descricaoCurta: text(product.descricaoCurta),
      descricaoCompleta: text(product.descricaoCompleta),
      aplicacoes: product.aplicacoes.map((item) => item.aplicacao.nome).join(", ") || "-",
      preco: text(product.preco?.toString()),
      estoque: text(product.estoque),
      condicaoComercial: text(product.condicaoComercial),
      prazoEntrega: text(product.prazoEntrega),
      fichaTecnica: text(product.fichaTecnica),
      manualPdf: text(product.manualPdf),
      observacaoComercial: text(product.observacaoComercial),
      margem: text(product.margem?.toString()),
      ativo: product.ativo ? "Sim" : "Nao",
      destaque: product.destaque ? "Sim" : "Nao",
      ordem: product.ordem,
      imagemPrincipal: text(product.imagemPrincipal),
      imagensExtras: product.imagensExtras.join(", ") || "-",
      observacaoInterna: text(product.observacaoInterna),
      createdAt: product.createdAt.toLocaleString("pt-BR"),
      updatedAt: product.updatedAt.toLocaleString("pt-BR"),
    });
  }

  worksheet.views = [{ state: "frozen", ySplit: 1 }];
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: Math.max(products.length + 1, 1), column: worksheet.columns.length },
  };

  const buffer = await workbook.xlsx.writeBuffer();
  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="briland-produtos.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
