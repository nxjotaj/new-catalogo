import Link from "next/link";
import {
  CheckCircle2,
  Edit3,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  XCircle,
} from "lucide-react";
import { deleteUser, updateUserStatus } from "@/app/actions";
import { AdminActionModal } from "@/components/AdminActionModal";
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
  const activeUsers = users.filter((user) => user.status === "ACTIVE").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#d9aa2b]">Acessos</p>
          <h1 className="mt-2 text-3xl font-black text-[#021126]">Usuarios</h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold text-[#6c7b89]">
            Controle perfis, status e ultimo acesso dos usuarios do catalogo Briland.
          </p>
        </div>
        <AdminActionModal
          title="Criar usuario"
          description="Cadastre um novo acesso para administrador, representante ou cliente."
          triggerLabel="Criar usuario"
        >
          <AdminUserForm compact />
        </AdminActionModal>
      </div>

      <AdminFeedback success={feedback.success} error={feedback.error} />

      <section className="grid gap-4 md:grid-cols-3">
        <Metric label="Usuarios" value={users.length} />
        <Metric label="Ativos" value={activeUsers} tone="green" />
        <Metric label="Inativos" value={users.length - activeUsers} tone="red" />
      </section>

      <form className="rounded-[22px] border border-[#e2e8f0] bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px_auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8c9aa8]" />
            <input
              name="q"
              defaultValue={filters.q || ""}
              placeholder="Buscar por nome, empresa ou e-mail"
              className="h-12 w-full rounded-xl border border-[#edf1f5] bg-[#f8fafc] pl-11 pr-3 text-sm font-semibold text-[#12263a] outline-none transition focus:border-[#021126] focus:bg-white focus:ring-4 focus:ring-[#021126]/10"
            />
          </label>
          <select
            name="role"
            defaultValue={filters.role || ""}
            className="h-12 rounded-xl border border-[#edf1f5] bg-[#f8fafc] px-3 text-sm font-bold text-[#12263a] outline-none transition focus:border-[#021126] focus:bg-white focus:ring-4 focus:ring-[#021126]/10"
          >
            <option value="">Todos os perfis</option>
            <option value="ADMIN">Admin</option>
            <option value="REPRESENTANTE">Representante</option>
            <option value="CLIENTE">Cliente</option>
          </select>
          <select
            name="status"
            defaultValue={filters.status || ""}
            className="h-12 rounded-xl border border-[#edf1f5] bg-[#f8fafc] px-3 text-sm font-bold text-[#12263a] outline-none transition focus:border-[#021126] focus:bg-white focus:ring-4 focus:ring-[#021126]/10"
          >
            <option value="">Todos os status</option>
            <option value="ACTIVE">Ativos</option>
            <option value="INACTIVE">Inativos</option>
          </select>
          <div className="flex gap-2">
            <button className="h-12 rounded-xl bg-[#021126] px-5 text-sm font-black text-white transition hover:bg-[#061b3a]">
              Buscar
            </button>
            <Link
              href="/admin/usuarios"
              className="inline-flex h-12 items-center rounded-xl border border-[#edf1f5] px-5 text-sm font-bold text-[#536476] transition hover:bg-[#f8fafc]"
            >
              Limpar
            </Link>
          </div>
        </div>
      </form>

      <section className="rounded-[24px] border border-[#e2e8f0] bg-white shadow-sm">
        <div className="hidden grid-cols-[minmax(260px,1.4fr)_160px_150px_190px_250px] gap-4 border-b border-[#edf1f5] bg-[#f8fafc] px-5 py-4 text-[11px] font-black uppercase tracking-wide text-[#6c7b89] xl:grid">
          <span>Usuario</span>
          <span>Perfil</span>
          <span>Status</span>
          <span>Ultimo acesso</span>
          <span className="text-right">Acoes</span>
        </div>

        <div className="divide-y divide-[#edf1f5]">
          {users.map((user) => (
            <article key={user.id} className="group px-4 py-4 transition hover:bg-[#fbfcfe] xl:px-5">
              <div className="grid gap-4 xl:grid-cols-[minmax(260px,1.4fr)_160px_150px_190px_250px] xl:items-center">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#021126] text-white shadow-sm">
                    <UserRound className="h-5 w-5 text-[#d9aa2b]" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-black text-[#021126]">{user.name}</h2>
                    <p className="truncate text-sm font-semibold text-[#536476]">{user.email}</p>
                    <p className="truncate text-xs font-semibold text-[#8c9aa8]">{user.company || "Sem empresa"}</p>
                  </div>
                </div>

                <div>
                  <MobileLabel>Perfil</MobileLabel>
                  <span className="inline-flex rounded-full bg-[#eef3f8] px-3 py-1 text-[11px] font-black uppercase tracking-wide text-[#021126]">
                    {user.role}
                  </span>
                </div>

                <div>
                  <MobileLabel>Status</MobileLabel>
                  <StatusBadge active={user.status === "ACTIVE"} />
                </div>

                <div>
                  <MobileLabel>Ultimo acesso</MobileLabel>
                  <p className="text-sm font-bold text-[#536476]">{formatDate(user.lastLoginAt)}</p>
                </div>

                <div className="flex flex-wrap justify-start gap-2 xl:justify-end">
                  <details className="relative">
                    <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-xl border border-[#d8e0e8] px-3 py-2 text-xs font-black text-[#021126] transition hover:border-[#d9aa2b] hover:bg-[#fff8e2]">
                      <Edit3 className="h-4 w-4 text-[#d9aa2b]" />
                      Editar
                    </summary>
                    <div className="mt-3 w-full rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-lg xl:absolute xl:right-0 xl:z-20 xl:w-[820px]">
                      <AdminUserForm user={user} compact />
                    </div>
                  </details>

                  <form action={updateUserStatus}>
                    <input type="hidden" name="id" value={user.id} />
                    <input type="hidden" name="status" value={user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"} />
                    <button className="inline-flex items-center gap-2 rounded-xl border border-[#d8e0e8] px-3 py-2 text-xs font-black text-[#021126] transition hover:bg-[#f8fafc]">
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
                    <button className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-xs font-black text-red-700 transition hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </button>
                  </form>
                </div>
              </div>
            </article>
          ))}
        </div>

        {users.length === 0 && (
          <div className="p-10 text-center">
            <ShieldCheck className="mx-auto h-8 w-8 text-[#d9aa2b]" />
            <p className="mt-3 text-sm font-black text-[#021126]">Nenhum usuario encontrado</p>
            <p className="mt-1 text-sm font-semibold text-[#6c7b89]">Ajuste os filtros ou cadastre um novo acesso.</p>
          </div>
        )}
      </section>
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

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ${
        active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
      }`}
    >
      {active ? "Ativo" : "Inativo"}
    </span>
  );
}

function MobileLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-1 text-[11px] font-black uppercase tracking-wide text-[#8c9aa8] xl:hidden">{children}</p>;
}

function formatDate(date?: Date | null) {
  if (!date) return "Nunca acessou";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}
