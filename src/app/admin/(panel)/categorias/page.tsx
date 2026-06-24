import Image from "next/image";
import Link from "next/link";
import { Edit3, FolderTree, ImageOff, Search, Trash2 } from "lucide-react";
import { deleteCategory } from "@/app/actions";
import { AdminActionModal } from "@/components/AdminActionModal";
import { AdminFeedback } from "@/components/AdminFeedback";
import { AdminEntityForm } from "@/components/AdminEntityForm";
import { getAdminCategories, type AdminEntityFilters } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string; q?: string; status?: string }>;
}) {
  const feedback = await searchParams;
  const filters: AdminEntityFilters = { q: feedback.q, status: feedback.status };
  const categories = await getAdminCategories(filters);
  const activeCategories = categories.filter((category) => category.ativo).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#d9aa2b]">Organizacao</p>
          <h1 className="mt-2 text-3xl font-black text-[#021126]">Categorias</h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold text-[#6c7b89]">
            Organize a vitrine por grupos de produto com imagem, ordem e status de exibicao.
          </p>
        </div>
        <AdminActionModal
          title="Criar categoria"
          description="Adicione uma nova categoria para organizar os produtos do catalogo."
          triggerLabel="Criar categoria"
        >
          <AdminEntityForm type="categoria" compact />
        </AdminActionModal>
      </div>

      <AdminFeedback success={feedback.success} error={feedback.error} />

      <section className="grid gap-4 md:grid-cols-3">
        <Metric label="Categorias" value={categories.length} />
        <Metric label="Ativas" value={activeCategories} tone="green" />
        <Metric label="Inativas" value={categories.length - activeCategories} tone="red" />
      </section>

      <form className="rounded-[22px] border border-[#e2e8f0] bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8c9aa8]" />
            <input
              name="q"
              defaultValue={filters.q || ""}
              placeholder="Buscar por nome, slug ou descricao"
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
              href="/admin/categorias"
              className="inline-flex h-12 items-center rounded-xl border border-[#edf1f5] px-5 text-sm font-bold text-[#536476] transition hover:bg-[#f8fafc]"
            >
              Limpar
            </Link>
          </div>
        </div>
      </form>

      <section className="grid gap-4 xl:grid-cols-2">
        {categories.map((category) => (
          <article
            key={category.id}
            className="rounded-[24px] border border-[#e2e8f0] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="grid gap-4 p-4 sm:grid-cols-[152px_minmax(0,1fr)]">
              <div className="relative flex aspect-[4/3] min-h-28 items-center justify-center overflow-hidden rounded-[18px] border border-[#edf1f5] bg-[#f8fafc] sm:aspect-auto sm:h-28 sm:min-h-0 sm:w-full">
                {category.imagem ? (
                  <Image src={category.imagem} alt={category.nome} fill className="object-cover" />
                ) : (
                  <ImageOff className="h-6 w-6 text-[#8c9aa8]" />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="min-w-0 text-lg font-black leading-snug text-[#021126]">{category.nome}</h2>
                      <StatusBadge active={category.ativo} activeLabel="Ativa" inactiveLabel="Inativa" />
                    </div>
                    <p className="mt-1 truncate text-sm font-bold text-[#536476]">{category.slug}</p>
                  </div>
                  <span className="rounded-full bg-[#eef3f8] px-3 py-1 text-[11px] font-black uppercase tracking-wide text-[#021126]">
                    Ordem {category.ordem}
                  </span>
                </div>

                <p className="mt-3 line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-[#6c7b89]">
                  {category.descricao || "Sem descricao cadastrada."}
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#edf1f5] pt-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#f8fafc] px-3 py-2 text-xs font-black text-[#536476]">
                    <FolderTree className="h-4 w-4 text-[#d9aa2b]" />
                    {category._count.produtos} produtos
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <details className="relative">
                      <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-xl border border-[#d8e0e8] px-3 py-2 text-xs font-black text-[#021126] transition hover:border-[#d9aa2b] hover:bg-[#fff8e2]">
                        <Edit3 className="h-4 w-4 text-[#d9aa2b]" />
                        Editar
                      </summary>
                      <div className="mt-3 rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-lg xl:absolute xl:right-0 xl:z-20 xl:w-[760px]">
                        <AdminEntityForm type="categoria" entity={category} compact />
                      </div>
                    </details>
                    <form action={deleteCategory}>
                      <input type="hidden" name="id" value={category.id} />
                      <button className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-xs font-black text-red-700 transition hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                        Excluir
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>

      {categories.length === 0 && <EmptyState label="Nenhuma categoria encontrada" />}
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
      <FolderTree className="mx-auto h-8 w-8 text-[#d9aa2b]" />
      <p className="mt-3 text-sm font-black text-[#021126]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#6c7b89]">Ajuste os filtros ou crie um novo registro.</p>
    </div>
  );
}
