import Link from "next/link";
import { Filter, FileDown } from "lucide-react";
import { CatalogHeader } from "@/components/CatalogHeader";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductModal } from "@/components/ProductModal";
import { QuoteForm } from "@/components/QuoteForm";
import { SearchBar } from "@/components/SearchBar";
import { getSessionUser } from "@/lib/auth";
import { firstParam, getCatalogData } from "@/lib/catalog";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CatalogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const user = await getSessionUser();
  const role = user?.role || "VISITANTE";
  const filters = {
    q: firstParam(params.q),
    categoria: firstParam(params.categoria),
    marca: firstParam(params.marca),
    aplicacao: firstParam(params.aplicacao),
  };
  const { products, categories, brands, applications, permissions } = await getCatalogData(filters, role);
  const modalSlug = firstParam(params.produto);
  const quoteProductId = firstParam(params.orcamento);
  const modalProduct = modalSlug ? products.find((product) => product.slug === modalSlug) ?? null : null;
  const quoteProduct = quoteProductId ? products.find((product) => product.id === quoteProductId) : null;
  const exportParams = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) exportParams.set(key, value);
  }
  const pdfHref = `/api/catalogo/pdf${exportParams.size ? `?${exportParams.toString()}` : ""}`;

  return (
    <main className="premium-shell min-h-screen">
      <CatalogHeader user={user} />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#d9aa2b]">Catalogo Briland</p>
            <h1 className="mt-3 text-4xl font-black text-[#021126]">Produtos</h1>
            <p className="mt-2 max-w-2xl text-[#536476]">
              Consulte produtos cadastrados no banco de dados e filtre por categoria, marca ou aplicacao.
            </p>
          </div>
          {permissions.downloadCatalogButton ? (
            <Link
              href={pdfHref}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-[#d8e0e8] px-4 py-3 text-sm font-bold text-[#021126] transition hover:border-[#d9aa2b] hover:bg-[#fff8e2]"
            >
              <FileDown className="h-4 w-4 text-[#d9aa2b]" />
              Exportar PDF
            </Link>
          ) : (
            <button
              disabled
              className="inline-flex items-center justify-center gap-2 rounded-md border border-[#d8e0e8] px-4 py-3 text-sm font-bold text-[#536476] opacity-60"
              title="PDF bloqueado para este perfil"
            >
              <FileDown className="h-4 w-4" />
              PDF bloqueado
            </button>
          )}
        </div>

        <form className="mb-8 rounded-lg border border-[#e2e8f0] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-[#021126]">
            <Filter className="h-4 w-4 text-[#d9aa2b]" />
            Filtros
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <SearchBar defaultValue={filters.q} />
            </div>
            <CategoryFilter label="Categoria" name="categoria" options={categories} value={filters.categoria} />
            <CategoryFilter label="Marca" name="marca" options={brands} value={filters.marca} />
            {permissions.aplicacoes && (
              <CategoryFilter label="Aplicacao" name="aplicacao" options={applications} value={filters.aplicacao} />
            )}
            <div className="flex items-end gap-2">
              <button className="h-12 rounded-md bg-[#021126] px-5 text-sm font-black text-white transition hover:bg-[#061b3a]">
                Aplicar
              </button>
              <Link
                href="/catalogo"
                className="inline-flex h-12 items-center rounded-md border border-[#d8e0e8] px-5 text-sm font-bold text-[#536476] transition hover:bg-[#f8fafc]"
              >
                Limpar
              </Link>
            </div>
          </div>
        </form>

        {firstParam(params.lead) === "enviado" && (
          <div className="mb-6 rounded-md border border-[#d9aa2b]/40 bg-[#fff8e2] px-4 py-3 text-sm font-bold text-[#021126]">
            Solicitacao enviada. A equipe Briland entrara em contato.
          </div>
        )}
        {firstParam(params.lead) === "erro" && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-800">
            Nao foi possivel enviar a solicitacao. Revise os campos e tente novamente.
          </div>
        )}
        {firstParam(params.lead) === "sem-permissao" && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-800">
            Seu perfil nao possui permissao para solicitar orcamento.
          </div>
        )}

        <ProductGrid products={products} />

        <section className="mt-12" id="orcamento">
          {permissions.quoteButton ? (
            <QuoteForm productId={quoteProduct?.id} productName={quoteProduct?.nome} />
          ) : (
            <div className="rounded-lg border border-dashed border-[#c7d2de] bg-white p-6 text-sm font-bold text-[#536476]">
              Orcamentos bloqueados para este perfil.
            </div>
          )}
        </section>
      </section>

      <ProductModal product={modalProduct} />
    </main>
  );
}
