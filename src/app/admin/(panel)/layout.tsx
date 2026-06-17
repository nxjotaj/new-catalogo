import Link from "next/link";
import { redirect } from "next/navigation";
import { Box, FolderTree, Gauge, Layers, LockKeyhole, LogOut, Tags, UserCog, UsersRound } from "lucide-react";
import { logout } from "@/app/actions";
import { BrandLogo } from "@/components/BrandLogo";
import { getSessionUser } from "@/lib/auth";

const nav = [
  { href: "/admin", label: "Dashboard", icon: Gauge },
  { href: "/admin/produtos", label: "Produtos", icon: Box },
  { href: "/admin/categorias", label: "Categorias", icon: FolderTree },
  { href: "/admin/marcas", label: "Marcas", icon: Tags },
  { href: "/admin/aplicacoes", label: "Aplicacoes", icon: Layers },
  { href: "/admin/usuarios", label: "Usuarios", icon: UserCog },
  { href: "/admin/permissoes", label: "Permissoes", icon: LockKeyhole },
  { href: "/admin/leads", label: "Leads", icon: UsersRound },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (user?.role !== "ADMIN") {
    redirect("/login?next=/admin");
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-[#111827]">
      <aside className="fixed inset-y-0 left-0 hidden w-72 overflow-y-auto overscroll-contain border-r border-white/10 bg-[#021126] p-5 shadow-2xl lg:block">
        <div className="flex min-h-full flex-col gap-4">
          <Link
            href="/admin"
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-5 shadow-[0_20px_80px_rgba(0,0,0,0.24)] backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.07]"
          >
            <BrandLogo />
          </Link>
          <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white/50">
            Controle
          </div>
          <nav className="space-y-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.035] px-4 py-3 text-sm font-bold text-white/78 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition duration-300 hover:-translate-y-0.5 hover:border-[#d9aa2b]/50 hover:bg-white/[0.09] hover:text-white hover:shadow-[0_18px_50px_rgba(0,0,0,0.28)]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] transition duration-300 group-hover:bg-[#d9aa2b]">
                  <item.icon className="h-4 w-4 text-[#d9aa2b] transition duration-300 group-hover:text-[#021126]" />
                </span>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d9aa2b]">Sessao ativa</p>
            <p className="mt-2 truncate text-sm font-black text-white">{user.name}</p>
            <p className="truncate text-xs text-white/50">{user.email}</p>
            <form action={logout} className="mt-4">
              <button className="group flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-4 py-3 text-sm font-bold text-white/82 transition duration-300 hover:-translate-y-0.5 hover:border-[#d9aa2b]/50 hover:bg-[#d9aa2b] hover:text-[#021126]">
                <LogOut className="h-4 w-4 transition duration-300 group-hover:-translate-x-0.5" />
                Sair
              </button>
            </form>
          </div>
        </div>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-white/70 bg-white/80 px-6 py-4 shadow-sm backdrop-blur-xl lg:hidden">
          <div className="rounded-2xl bg-[#021126] px-4 py-3">
            <BrandLogo compact />
          </div>
        </header>
        <main className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#f4f6f9_46%,#eef2f7_100%)] px-4 py-6 md:px-7 md:py-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
