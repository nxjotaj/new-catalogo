import PDFDocument from "pdfkit/js/pdfkit.standalone.js";
import type { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getCatalogData } from "@/lib/catalog";
import { clientIpFromHeaders, enforceRateLimit, RateLimitError } from "@/lib/security";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function queryValue(request: NextRequest, key: string) {
  const value = request.nextUrl.searchParams.get(key);
  return value?.trim() || undefined;
}

function collectPdf(document: PDFKit.PDFDocument) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    document.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.on("error", reject);
  });
}

function valueOrDash(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function ensureSpace(document: PDFKit.PDFDocument, neededHeight: number) {
  if (document.y + neededHeight <= document.page.height - 48) return;
  document.addPage();
}

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  const role = user?.role || "VISITANTE";
  try {
    await enforceRateLimit(
      "catalog-pdf",
      user?.id || clientIpFromHeaders(request.headers),
      user ? 20 : 6,
      60 * 60,
    );
  } catch (error) {
    if (error instanceof RateLimitError) {
      return new Response(error.message, { status: 429 });
    }
    throw error;
  }

  const { products, permissions } = await getCatalogData(
    {
      q: queryValue(request, "q"),
      categoria: queryValue(request, "categoria"),
      marca: queryValue(request, "marca"),
      aplicacao: queryValue(request, "aplicacao"),
    },
    role,
  );

  if (!permissions.downloadCatalogButton) {
    return new Response("Este perfil nao possui permissao para baixar o catalogo.", {
      status: 403,
    });
  }

  const document = new PDFDocument({
    size: "A4",
    margin: 42,
    bufferPages: true,
    info: {
      Title: "Catalogo Briland",
      Author: "Briland",
      Subject: "Catalogo de produtos",
    },
  });
  const pdf = collectPdf(document);
  const pageWidth = document.page.width;
  const contentWidth = pageWidth - 84;
  const darkBlue = "#021126";
  const mustard = "#d9aa2b";
  const softBorder = "#d8e0e8";

  document.rect(0, 0, pageWidth, 92).fill(darkBlue);
  document
    .fillColor("white")
    .font("Helvetica-Bold")
    .fontSize(24)
    .text("BRILAND", 42, 30);
  document
    .fillColor(mustard)
    .fontSize(9)
    .text("CATALOGO PREMIUM", 42, 58, { characterSpacing: 1.5 });
  document
    .fillColor("white")
    .font("Helvetica")
    .fontSize(9)
    .text(new Date().toLocaleDateString("pt-BR"), 420, 34, {
      align: "right",
      width: 130,
    });

  document.y = 124;
  document
    .fillColor(darkBlue)
    .font("Helvetica-Bold")
    .fontSize(18)
    .text("Produtos", 42);
  document
    .moveDown(0.4)
    .fillColor("#536476")
    .font("Helvetica")
    .fontSize(10)
    .text(
      "Catalogo exportado com os produtos ativos e com as informacoes permitidas para o perfil atual.",
      { width: contentWidth },
    );
  document.moveDown(1);

  const grouped = new Map<string, typeof products>();
  for (const product of products) {
    const category = product.categoria?.nome || "Produtos";
    grouped.set(category, [...(grouped.get(category) || []), product]);
  }

  if (products.length === 0) {
    document
      .roundedRect(42, document.y, contentWidth, 64, 8)
      .strokeColor(softBorder)
      .lineWidth(1)
      .stroke();
    document
      .fillColor("#536476")
      .font("Helvetica-Bold")
      .fontSize(11)
      .text("Nenhum produto encontrado para os filtros selecionados.", 58, document.y + 22);
  }

  for (const [category, items] of grouped) {
    ensureSpace(document, 86);
    document.moveDown(0.7);
    document
      .fillColor(mustard)
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(category.toUpperCase(), 42, document.y, { characterSpacing: 0.8 });
    document.moveDown(0.5);

    for (const product of items) {
      const description =
        product.descricaoCurta || product.descricaoCompleta || "Sem descricao cadastrada";
      const cardHeight = 106;
      ensureSpace(document, cardHeight + 12);
      const startY = document.y;

      document
        .roundedRect(42, document.y, contentWidth, cardHeight, 8)
        .fillAndStroke("white", softBorder);
      document
        .fillColor(darkBlue)
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(valueOrDash(product.nome), 58, startY + 14, { width: contentWidth - 32 });
      document
        .fillColor("#536476")
        .font("Helvetica")
        .fontSize(9)
        .text(description, 58, document.y + 5, {
          width: contentWidth - 32,
          height: 26,
          ellipsis: true,
        });

      const detailsY = startY + 70;
      const columnWidth = (contentWidth - 32) / 4;
      const fields = [
        ["Codigo", permissions.codigoInterno ? product.codigoInterno : undefined],
        ["EAN", permissions.ean ? product.ean : undefined],
        ["Descricao", permissions.descricaoCurta || permissions.descricaoCompleta ? description : undefined],
        ["Caixa master", permissions.caixaMaster ? product.caixaMaster : undefined],
      ];

      fields.forEach(([label, value], index) => {
        const x = 58 + index * columnWidth;
        document
          .fillColor("#6c7b89")
          .font("Helvetica-Bold")
          .fontSize(7)
          .text(String(label).toUpperCase(), x, detailsY, { width: columnWidth - 8 });
        document
          .fillColor(darkBlue)
          .font("Helvetica-Bold")
          .fontSize(8)
          .text(valueOrDash(value), x, detailsY + 12, {
            width: columnWidth - 8,
            height: 20,
            ellipsis: true,
          });
      });

      document.y = startY + cardHeight + 10;
    }
  }

  const range = document.bufferedPageRange();
  for (let index = range.start; index < range.start + range.count; index += 1) {
    document.switchToPage(index);
    document
      .fillColor("#8c9aa8")
      .font("Helvetica")
      .fontSize(8)
      .text(`Pagina ${index + 1} de ${range.count}`, 42, 812, {
        width: contentWidth,
        align: "right",
      });
  }

  document.end();
  const buffer = await pdf;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="catalogo-briland.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
