import Link from "next/link";
import { ArrowRight, Boxes, FolderTree, Sparkles, UsersRound } from "lucide-react";
import { getAdminDashboard } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const data = await getAdminDashboard();

  return (
    <div className="space-y-8">
      <Header title="Dashboard" description="Visao geral do catalogo e dos orcamentos recebidos." />

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <Stat label="Produtos" value={data.products} icon={Boxes} />
        <Stat label="Ativos" value={data.activeProducts} icon={Sparkles} />
        <Stat label="Categorias" value={data.categories} icon={FolderTree} />
        <Stat label="Marcas" value={data.brands} icon={Boxes} />
        <Stat label="Aplicacoes" value={data.applications} icon={Sparkles} />
        <Stat label="Leads novos" value={data.newLeads} icon={UsersRound} highlight />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="overflow-hidden rounded-[28px] border border-white bg-[#021126] p-6 text-white shadow-[0_28px_80px_rgba(2,17,38,0.22)]">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#d9aa2b]">Operacao</p>
          <h2 className="mt-3 max-w-xl text-3xl font-black leading-tight">
            Painel pronto para cadastrar, publicar e controlar visibilidade do catalogo.
          </h2>
          <div className="mt-6 flex flex-wrap gap-3">
            <Action href="/admin/produtos/novo" label="Novo produto" primary />
            <Action href="/admin/permissoes" label="Permissoes" />
            <Action href="/admin/leads" label="Ver leads" />
          </div>
        </section>

        <section className="rounded-[28px] border border-white bg-white/85 p-6 shadow-[0_24px_70px_rgba(2,17,38,0.08)] backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#d9aa2b]">Resumo</p>
          <p className="mt-3 text-4xl font-black text-[#021126]">{data.products}</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#536476]">
            produtos cadastrados no Supabase, com regras de visibilidade aplicadas no servidor.
          </p>
        </section>
      </div>
    </div>
  );
}

function Action({ href, label, primary = false }: { href: string; label: string; primary?: boolean }) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-black transition duration-300 hover:-translate-y-0.5 ${
        primary
          ? "bg-[#d9aa2b] text-[#021126] shadow-[0_16px_40px_rgba(217,170,43,0.28)] hover:bg-[#e3b944]"
          : "border border-white/15 bg-white/[0.06] text-white hover:border-[#d9aa2b]/50 hover:bg-white/[0.11]"
      }`}
    >
      {label}
      <ArrowRight className="h-4 w-4 transition duration-300 group-hover:translate-x-0.5" />
    </Link>
  );
}

function Header({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[32px] border border-white bg-white/82 p-6 shadow-[0_24px_70px_rgba(2,17,38,0.08)] backdrop-blur md:p-8">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.22em] text-[#d9aa2b]">Admin Briland</p>
          <h1 className="mt-3 text-4xl font-black text-[#021126] md:text-5xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[#536476]">{description}</p>
        </div>
        <div className="inline-flex rounded-full border border-[#e2e8f0] bg-[#f8fafc] p-1">
          <span className="rounded-full bg-[#021126] px-4 py-2 text-xs font-black uppercase tracking-wide text-white">
            Online
          </span>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  highlight = false,
}: {
  label: string;
  value: number;
  icon: typeof Boxes;
  highlight?: boolean;
}) {
  return (
    <div
      className={`group rounded-[24px] border p-5 shadow-[0_18px_50px_rgba(2,17,38,0.07)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(2,17,38,0.12)] ${
        highlight ? "border-[#d9aa2b]/60 bg-[#fff8e2]" : "border-white bg-white/88"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-wide text-[#536476]">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#021126] text-[#d9aa2b] transition duration-300 group-hover:scale-105">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-5 text-4xl font-black text-[#021126]">{value}</p>
    </div>
  );
}
