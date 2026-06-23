import Image from "next/image";
import Link from "next/link";
import { ImageOff, Search, Tags, Trash2 } from "lucide-react";
import { deleteBrand } from "@/app/actions";
import { AdminFeedback } from "@/components/AdminFeedback";
import { AdminEntityForm } from "@/components/AdminEntityForm";
import { getAdminBrands, type AdminEntityFilters } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminBrandsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string; q?: string; status?: string }>;
}) {
  const feedback = await searchParams;
  const filters: AdminEntityFilters = { q: feedback.q, status: feedback.status };
  const brands = await getAdminBrands(filters);

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#d9aa2b]">Portfolio</p>
          <h1 className="mt-2 text-3xl font-black text-[#021126]">Marcas</h1>
        </div>
        <div className="rounded-full border border-[#e2e8f0] bg-white px-4 py-2 text-xs font-black uppercase tracking-wide text-[#536476] shadow-sm">
          {brands.length} registros
        </div>
      </div>
      <AdminFeedback success={feedback.success} error={feedback.error} />

      <form className="mb-6 rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-[#021126]">
          <Search className="h-4 w-4 text-[#d9aa2b]" />
          Filtros
        </div>
        <div className="grid gap-4 md:grid-cols-[1fr_220px_auto]">
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#536476]">Buscar marca</span>
            <input
              name="q"
              defaultValue={filters.q || ""}
              placeholder="Nome ou slug"
              className="h-12 w-full rounded-md border border-[#d8e0e8] bg-white px-3 text-sm font-semibold text-[#12263a] outline-none transition focus:border-[#021126] focus:ring-4 focus:ring-[#021126]/10"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#536476]">Status</span>
            <select
              name="status"
              defaultValue={filters.status || ""}
              className="h-12 w-full rounded-md border border-[#d8e0e8] bg-white px-3 text-sm font-semibold text-[#12263a] outline-none transition focus:border-[#021126] focus:ring-4 focus:ring-[#021126]/10"
            >
              <option value="">Todas</option>
              <option value="ativos">Ativas</option>
              <option value="inativos">Inativas</option>
            </select>
          </label>
          <div className="flex items-end gap-2">
            <button className="h-12 rounded-md bg-[#021126] px-5 text-sm font-black text-white transition hover:bg-[#061b3a]">
              Aplicar
            </button>
            <Link
              href="/admin/marcas"
              className="inline-flex h-12 items-center rounded-md border border-[#d8e0e8] px-5 text-sm font-bold text-[#536476] transition hover:bg-[#f8fafc]"
            >
              Limpar
            </Link>
          </div>
        </div>
      </form>

      <section className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Tags className="h-5 w-5 text-[#d9aa2b]" />
          <h2 className="text-lg font-black text-[#021126]">Nova marca</h2>
        </div>
        <AdminEntityForm type="marca" compact />
      </section>

      <div className="mt-6 space-y-3">
        {brands.map((brand) => (
          <div key={brand.id} className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
            <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
              <div className="flex gap-4">
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#e2e8f0] bg-[#f8fafc]">
                  {brand.logo ? (
                    <Image src={brand.logo} alt={brand.nome} fill className="object-contain p-2" />
                  ) : (
                    <ImageOff className="h-5 w-5 text-[#8c9aa8]" />
                  )}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-black text-[#021126]">{brand.nome}</h2>
                    <StatusBadge active={brand.ativo} />
                  </div>
                  <p className="mt-1 text-sm font-bold text-[#536476]">{brand.slug}</p>
                  <p className="text-xs font-semibold text-[#8c9aa8]">
                    {brand._count.produtos} produtos vinculados
                  </p>
                </div>
              </div>
              <form action={deleteBrand}>
                <input type="hidden" name="id" value={brand.id} />
                <button className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-xs font-black text-red-700 transition hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </button>
              </form>
            </div>
            <AdminEntityForm type="marca" entity={brand} compact />
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ${
        active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
      }`}
    >
      {active ? "Ativa" : "Inativa"}
    </span>
  );
}
