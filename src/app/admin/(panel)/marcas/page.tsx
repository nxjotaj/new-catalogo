import Image from "next/image";
import Link from "next/link";
import { Edit3, ImageOff, Search, Tags, Trash2 } from "lucide-react";
import { deleteBrand } from "@/app/actions";
import { AdminActionModal } from "@/components/AdminActionModal";
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
  const activeBrands = brands.filter((brand) => brand.ativo).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#d9aa2b]">Portfolio</p>
          <h1 className="mt-2 text-3xl font-black text-[#021126]">Marcas</h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold text-[#6c7b89]">
            Gerencie logos, status e relacionamento das marcas com os produtos cadastrados.
          </p>
        </div>
        <AdminActionModal
          title="Criar marca"
          description="Cadastre uma marca e, se desejar, envie o logo para aparecer no painel."
          triggerLabel="Criar marca"
        >
          <AdminEntityForm type="marca" compact />
        </AdminActionModal>
      </div>

      <AdminFeedback success={feedback.success} error={feedback.error} />

      <section className="grid gap-4 md:grid-cols-3">
        <Metric label="Marcas" value={brands.length} />
        <Metric label="Ativas" value={activeBrands} tone="green" />
        <Metric label="Inativas" value={brands.length - activeBrands} tone="red" />
      </section>

      <form className="rounded-[22px] border border-[#e2e8f0] bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8c9aa8]" />
            <input
              name="q"
              defaultValue={filters.q || ""}
              placeholder="Buscar por nome ou slug"
              className="h-12 w-full rounded-xl border border-[#edf1f5] bg-[#f8fafc] pl-11 pr-3 text-sm font-semibold text-[#12263a] outline-none transition focus:border-[#021126] focus:bg-white focus:ring-4 focus:ring-[#021126]/10"
            />
          </label>
          <select
            name="status"
            defaultValue={filters.status || ""}
            className="h-12 rounded-xl border border-[#edf1f5] bg-[#f8fafc] px-3 text-sm font-bold text-[#12263a] outline-none transition focus:border-[#021126] focus:bg-white focus:ring-4 focus:ring-[#021126]/10"
          >
            <option value="">Todos os status</option>
            <option value="ativos">Ativas</option>
            <option value="inativos">Inativas</option>
          </select>
          <div className="flex gap-2">
            <button className="h-12 rounded-xl bg-[#021126] px-5 text-sm font-black text-white transition hover:bg-[#061b3a]">
              Buscar
            </button>
            <Link
              href="/admin/marcas"
              className="inline-flex h-12 items-center rounded-xl border border-[#edf1f5] px-5 text-sm font-bold text-[#536476] transition hover:bg-[#f8fafc]"
            >
              Limpar
            </Link>
          </div>
        </div>
      </form>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {brands.map((brand) => (
          <article
            key={brand.id}
            className="rounded-[24px] border border-[#e2e8f0] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[22px] border border-[#edf1f5] bg-[#f8fafc]">
                  {brand.logo ? (
                    <Image src={brand.logo} alt={brand.nome} fill className="object-contain p-3" />
                  ) : (
                    <ImageOff className="h-6 w-6 text-[#8c9aa8]" />
                  )}
                </div>
                <StatusBadge active={brand.ativo} activeLabel="Ativa" inactiveLabel="Inativa" />
              </div>

              <h2 className="mt-5 truncate text-lg font-black text-[#021126]">{brand.nome}</h2>
              <p className="mt-1 truncate text-sm font-bold text-[#536476]">{brand.slug}</p>

              <div className="mt-5 flex items-center justify-between rounded-2xl bg-[#f8fafc] px-4 py-3">
                <span className="text-xs font-black uppercase tracking-wide text-[#6c7b89]">Produtos</span>
                <span className="text-lg font-black text-[#021126]">{brand._count.produtos}</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <details className="relative flex-1">
                  <summary className="inline-flex w-full cursor-pointer list-none items-center justify-center gap-2 rounded-xl border border-[#d8e0e8] px-3 py-2 text-xs font-black text-[#021126] transition hover:border-[#d9aa2b] hover:bg-[#fff8e2]">
                    <Edit3 className="h-4 w-4 text-[#d9aa2b]" />
                    Editar
                  </summary>
                  <div className="mt-3 rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-lg xl:absolute xl:right-0 xl:z-20 xl:w-[680px]">
                    <AdminEntityForm type="marca" entity={brand} compact />
                  </div>
                </details>
                <form action={deleteBrand}>
                  <input type="hidden" name="id" value={brand.id} />
                  <button className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-xs font-black text-red-700 transition hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </button>
                </form>
              </div>
            </div>
          </article>
        ))}
      </section>

      {brands.length === 0 && <EmptyState label="Nenhuma marca encontrada" />}
    </div>
  );
}

function Metric({ label, value, tone = "blue" }: { label: string; value: number; tone?: "blue" | "green" | "red" }) {
  const colors = {
    blue: "bg-[#021126] text-white",
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
  };
  return (
    <div className="rounded-[22px] border border-[#e2e8f0] bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-wide text-[#6c7b89]">{label}</p>
      <p className={`mt-3 inline-flex rounded-2xl px-4 py-2 text-2xl font-black ${colors[tone]}`}>{value}</p>
    </div>
  );
}

function StatusBadge({
  active,
  activeLabel,
  inactiveLabel,
}: {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
}) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ${
        active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
      }`}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-[24px] border border-[#e2e8f0] bg-white p-10 text-center shadow-sm">
      <Tags className="mx-auto h-8 w-8 text-[#d9aa2b]" />
      <p className="mt-3 text-sm font-black text-[#021126]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#6c7b89]">Ajuste os filtros ou crie um novo registro.</p>
    </div>
  );
}
