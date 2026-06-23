import Link from "next/link";
import { CheckCircle2, Search, ShieldCheck, Trash2, UserRound, XCircle } from "lucide-react";
import { deleteUser, updateUserStatus } from "@/app/actions";
import { AdminFeedback } from "@/components/AdminFeedback";
import { AdminUserForm } from "@/components/AdminUserForm";
import { getAdminUsers, type AdminUserFilters } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string; q?: string; role?: string; status?: string }>;
}) {
  const feedback = await searchParams;
  const filters: AdminUserFilters = {
    q: feedback.q,
    role: feedback.role,
    status: feedback.status,
  };
  const users = await getAdminUsers(filters);

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#d9aa2b]">Acessos</p>
          <h1 className="mt-2 text-3xl font-black text-[#021126]">Usuarios</h1>
        </div>
        <div className="rounded-full border border-[#e2e8f0] bg-white px-4 py-2 text-xs font-black uppercase tracking-wide text-[#536476] shadow-sm">
          {users.length} registros
        </div>
      </div>
      <AdminFeedback success={feedback.success} error={feedback.error} />

      <form className="mb-6 rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-[#021126]">
          <Search className="h-4 w-4 text-[#d9aa2b]" />
          Filtros
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#536476]">Buscar usuario</span>
            <input
              name="q"
              defaultValue={filters.q || ""}
              placeholder="Nome, empresa ou e-mail"
              className="h-12 w-full rounded-md border border-[#d8e0e8] bg-white px-3 text-sm font-semibold text-[#12263a] outline-none transition focus:border-[#021126] focus:ring-4 focus:ring-[#021126]/10"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#536476]">Tipo</span>
            <select
              name="role"
              defaultValue={filters.role || ""}
              className="h-12 w-full rounded-md border border-[#d8e0e8] bg-white px-3 text-sm font-semibold text-[#12263a] outline-none transition focus:border-[#021126] focus:ring-4 focus:ring-[#021126]/10"
            >
              <option value="">Todos</option>
              <option value="ADMIN">Admin</option>
              <option value="REPRESENTANTE">Representante</option>
              <option value="CLIENTE">Cliente</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#536476]">Status</span>
            <select
              name="status"
              defaultValue={filters.status || ""}
              className="h-12 w-full rounded-md border border-[#d8e0e8] bg-white px-3 text-sm font-semibold text-[#12263a] outline-none transition focus:border-[#021126] focus:ring-4 focus:ring-[#021126]/10"
            >
              <option value="">Todos</option>
              <option value="ACTIVE">Ativos</option>
              <option value="INACTIVE">Inativos</option>
            </select>
          </label>
          <div className="flex items-end gap-2">
            <button className="h-12 rounded-md bg-[#021126] px-5 text-sm font-black text-white transition hover:bg-[#061b3a]">
              Aplicar
            </button>
            <Link
              href="/admin/usuarios"
              className="inline-flex h-12 items-center rounded-md border border-[#d8e0e8] px-5 text-sm font-bold text-[#536476] transition hover:bg-[#f8fafc]"
            >
              Limpar
            </Link>
          </div>
        </div>
      </form>

      <section className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-[#d9aa2b]" />
          <h2 className="text-lg font-black text-[#021126]">Novo usuario</h2>
        </div>
        <AdminUserForm compact />
      </section>

      <div className="mt-6 space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="mb-5 flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#021126] text-white">
                  <UserRound className="h-5 w-5 text-[#d9aa2b]" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-black text-[#021126]">{user.name}</h2>
                    <StatusBadge active={user.status === "ACTIVE"} />
                    <span className="rounded-full bg-[#f2f5f8] px-3 py-1 text-[11px] font-black uppercase tracking-wide text-[#536476]">
                      {user.role}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-bold text-[#536476]">{user.email}</p>
                  <p className="text-xs font-semibold text-[#8c9aa8]">
                    {user.company || "Sem empresa"} | Ultimo acesso: {formatDate(user.lastLoginAt)}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <form action={updateUserStatus}>
                  <input type="hidden" name="id" value={user.id} />
                  <input type="hidden" name="status" value={user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"} />
                  <button className="inline-flex items-center gap-2 rounded-full border border-[#d8e0e8] px-4 py-2 text-xs font-black text-[#021126] transition hover:border-[#d9aa2b] hover:bg-[#fff8e2]">
                    {user.status === "ACTIVE" ? (
                      <XCircle className="h-4 w-4 text-amber-600" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    )}
                    {user.status === "ACTIVE" ? "Desativar" : "Ativar"}
                  </button>
                </form>
                <form action={deleteUser}>
                  <input type="hidden" name="id" value={user.id} />
                  <button className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-xs font-black text-red-700 transition hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </button>
                </form>
              </div>
            </div>
            <AdminUserForm user={user} compact />
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
      {active ? "Ativo" : "Inativo"}
    </span>
  );
}

function formatDate(date?: Date | null) {
  if (!date) return "Nunca acessou";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}
