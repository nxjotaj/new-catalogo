import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { CatalogHeader } from "@/components/CatalogHeader";
import { ProductCard } from "@/components/ProductCard";
import { ProductImageFallback } from "@/components/ProductImageFallback";
import { QuoteForm } from "@/components/QuoteForm";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { getSessionUser } from "@/lib/auth";
import { getProductPageData } from "@/lib/catalog";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const user = await getSessionUser();
  const role = user?.role || "VISITANTE";
  const data = await getProductPageData(slug, role);
  if (!data) notFound();

  const { product, related } = data;
  const name = product.nome || "Produto restrito";
  const gallery = product.permissions.imagensExtras
    ? [product.imagemPrincipal, ...(product.imagensExtras ?? [])].filter((image): image is string => Boolean(image))
    : [];
  const specs = [
    product.permissions.ean ? { label: "EAN", value: product.ean } : null,
    product.permissions.ncm ? { label: "NCM", value: product.ncm } : null,
    product.permissions.caixaMaster ? { label: "Caixa master", value: product.caixaMaster } : null,
    product.permissions.aplicacoes ? { label: "Aplicacoes", value: product.aplicacoes?.join(", ") } : null,
    product.permissions.preco ? { label: "Preco", value: product.preco ? `R$ ${product.preco}` : null } : null,
    product.permissions.estoque ? { label: "Estoque", value: product.estoque?.toString() } : null,
    product.permissions.condicaoComercial ? { label: "Condicao comercial", value: product.condicaoComercial } : null,
    product.permissions.prazoEntrega ? { label: "Prazo de entrega", value: product.prazoEntrega } : null,
    product.permissions.fichaTecnica ? { label: "Ficha tecnica", value: product.fichaTecnica } : null,
    product.permissions.observacaoComercial ? { label: "Observacao comercial", value: product.observacaoComercial } : null,
    product.permissions.margem ? { label: "Margem", value: product.margem ? `${product.margem}%` : null } : null,
  ].filter((spec): spec is { label: string; value: string | null | undefined } => Boolean(spec));

  return (
    <main className="premium-shell min-h-screen">
      <CatalogHeader user={user} />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <Link href="/catalogo" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#021126]">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao catalogo
        </Link>

        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            {product.permissions.imagemPrincipal && (
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-[#e2e8f0] bg-[#f3f6f9] shadow-sm">
                {product.imagemPrincipal ? (
                  <Image src={product.imagemPrincipal} alt={name} fill priority className="object-cover" />
                ) : (
                  <ProductImageFallback />
                )}
              </div>
            )}
            {gallery.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3 md:grid-cols-6">
                {gallery.map((image) => (
                  <div key={image} className="relative aspect-square overflow-hidden rounded-md border border-[#e2e8f0] bg-white">
                    <Image src={image} alt={name} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            {product.categoria && (
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#d9aa2b]">{product.categoria.nome}</p>
            )}
            <h1 className="mt-3 text-4xl font-black leading-tight text-[#021126]">{name}</h1>
            {product.codigoInterno && (
              <p className="mt-3 text-sm font-bold text-[#536476]">Codigo interno: {product.codigoInterno}</p>
            )}
            {product.descricaoCompleta || product.descricaoCurta ? (
              <p className="mt-6 text-base leading-8 text-[#36485a]">
                {product.descricaoCompleta || product.descricaoCurta}
              </p>
            ) : null}

            {specs.length > 0 && (
              <dl className="mt-8 grid grid-cols-2 gap-3">
                {specs.map((spec) => (
                  <Spec key={spec.label} label={spec.label} value={spec.value} />
                ))}
              </dl>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {product.permissions.whatsappButton && <WhatsAppButton productName={product.nome} />}
              {product.permissions.quoteButton && (
                <Link
                  href="#orcamento"
                  className="inline-flex items-center justify-center rounded-md bg-[#021126] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#061b3a]"
                >
                  Solicitar orcamento
                </Link>
              )}
              {product.permissions.manualPdf && product.manualPdf && (
                <a
                  href={product.manualPdf}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-[#d8e0e8] px-4 py-3 text-sm font-bold text-[#021126]"
                >
                  <Download className="h-4 w-4" />
                  Manual PDF
                </a>
              )}
            </div>
          </div>
        </div>

        {product.permissions.quoteButton && (
          <section id="orcamento" className="mt-12">
            <QuoteForm productId={product.id} productName={product.nome} />
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-5 text-2xl font-black text-[#021126]">Produtos relacionados</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

function Spec({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-md border border-[#e2e8f0] bg-white p-4">
      <dt className="text-xs font-black uppercase tracking-wide text-[#6c7b89]">{label}</dt>
      <dd className="mt-1 text-sm font-bold text-[#021126]">{value || "Nao informado"}</dd>
    </div>
  );
}
