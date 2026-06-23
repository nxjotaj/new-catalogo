import Image from "next/image";
import Link from "next/link";
import { Download, FileSpreadsheet, ImageOff, Pencil, Plus, SlidersHorizontal } from "lucide-react";
import { deactivateProduct } from "@/app/actions";
import { AdminFeedback } from "@/components/AdminFeedback";
import { getAdminOptions, getAdminProducts, type AdminProductFilters } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    success?: string;
    error?: string;
    status?: string;
    issue?: string;
    codigo?: string;
    categoriaId?: string;
  }>;
}) {
  const feedback = await searchParams;
  const filters: AdminProductFilters = {
    status: feedback.status,
    issue: feedback.issue,
    codigo: feedback.codigo,
    categoriaId: feedback.categoriaId,
  };
  const [{ categories }, products] = await Promise.all([
    getAdminOptions(),
    getAdminProducts(filters),
  ]);
  const exportParams = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) exportParams.set(key, value);
  }
  const exportHref = `/api/admin/products/export${exportParams.size ? `?${exportParams.toString()}` : ""}`;

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#d9aa2b]">Produtos</p>
          <h1 className="mt-2 text-3xl font-black text-[#021126]">Catalogo</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/produtos/importar"
            className="inline-flex items-center gap-2 rounded-full border border-[#d8e0e8] bg-white px-4 py-3 text-sm font-black text-[#021126] transition hover:-translate-y-0.5"
          >
            <FileSpreadsheet className="h-4 w-4 text-[#d9aa2b]" />
            Importar XLSX
          </Link>
          <Link
            href={exportHref}
            className="inline-flex items-center gap-2 rounded-full border border-[#d8e0e8] bg-white px-4 py-3 text-sm font-black text-[#021126] transition hover:-translate-y-0.5"
          >
            <Download className="h-4 w-4 text-[#d9aa2b]" />
            Exportar XLSX
          </Link>
          <Link
            href="/admin/produtos/novo"
            className="inline-flex items-center gap-2 rounded-full bg-[#021126] px-4 py-3 text-sm font-black text-white transition hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            Novo produto
          </Link>
        </div>
      </div>

      <AdminFeedback success={feedback.success} error={feedback.error} />

      <form className="mb-6 rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-[#021126]">
          <SlidersHorizontal className="h-4 w-4 text-[#d9aa2b]" />
          Filtros do cadastro
        </div>
        <div className="grid gap-4 lg:grid-cols-5">
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#536476]">Status</span>
            <select
              name="status"
              defaultValue={filters.status || ""}
              className="h-12 w-full rounded-md border border-[#d8e0e8] bg-white px-3 text-sm font-semibold text-[#12263a] outline-none transition focus:border-[#021126] focus:ring-4 focus:ring-[#021126]/10"
            >
              <option value="">Todos</option>
              <option value="ativos">Ativos</option>
              <option value="inativos">Inativos</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#536476]">Pendencias</span>
            <select
              name="issue"
              defaultValue={filters.issue || ""}
              className="h-12 w-full rounded-md border border-[#d8e0e8] bg-white px-3 text-sm font-semibold text-[#12263a] outline-none transition focus:border-[#021126] focus:ring-4 focus:ring-[#021126]/10"
            >
              <option value="">Todos</option>
              <option value="sem-foto">Sem foto</option>
              <option value="incompletos">Faltando informacao relevante</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#536476]">Codigo</span>
            <input
              name="codigo"
              defaultValue={filters.codigo || ""}
              placeholder="Buscar codigo"
              className="h-12 w-full rounded-md border border-[#d8e0e8] bg-white px-3 text-sm font-semibold text-[#12263a] outline-none transition focus:border-[#021126] focus:ring-4 focus:ring-[#021126]/10"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#536476]">Categoria</span>
            <select
              name="categoriaId"
              defaultValue={filters.categoriaId || ""}
              className="h-12 w-full rounded-md border border-[#d8e0e8] bg-white px-3 text-sm font-semibold text-[#12263a] outline-none transition focus:border-[#021126] focus:ring-4 focus:ring-[#021126]/10"
            >
              <option value="">Todas</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.nome}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end gap-2">
            <button className="h-12 rounded-md bg-[#021126] px-5 text-sm font-black text-white transition hover:bg-[#061b3a]">
              Aplicar
            </button>
            <Link
              href="/admin/produtos"
              className="inline-flex h-12 items-center rounded-md border border-[#d8e0e8] px-5 text-sm font-bold text-[#536476] transition hover:bg-[#f8fafc]"
            >
              Limpar
            </Link>
          </div>
        </div>
      </form>

      <div className="overflow-x-auto rounded-lg border border-[#e2e8f0] bg-white shadow-sm">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-wide text-[#536476]">
            <tr>
              <th className="px-4 py-3">Foto</th>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Codigo</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Marca</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-[#e2e8f0]">
                <td className="px-4 py-3">
                  <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-[#e2e8f0] bg-[#f8fafc]">
                    {product.imagemPrincipal ? (
                      <Image
                        src={product.imagemPrincipal}
                        alt={product.nome}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <ImageOff className="h-5 w-5 text-[#8c9aa8]" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-black text-[#021126]">{product.nome}</td>
                <td className="px-4 py-3">{product.codigoInterno}</td>
                <td className="px-4 py-3">{product.categoria.nome}</td>
                <td className="px-4 py-3">{product.marca.nome}</td>
                <td className="px-4 py-3">{product.ativo ? "Ativo" : "Inativo"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/produtos/${product.id}`} className="rounded-md border border-[#d8e0e8] p-2 text-[#021126]">
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <form action={deactivateProduct}>
                      <input type="hidden" name="id" value={product.id} />
                      <button
                        disabled={!product.ativo}
                        className="rounded-md border border-amber-200 px-3 py-2 text-xs font-black text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        Desativar
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
