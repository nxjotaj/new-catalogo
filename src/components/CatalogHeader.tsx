import Link from "next/link";
import { LogIn, LogOut, Shield } from "lucide-react";
import { logout } from "@/app/actions";
import { BrandLogo } from "@/components/BrandLogo";
import type { SessionUser } from "@/lib/auth";

export function CatalogHeader({ user }: { user: SessionUser | null }) {
  return (
    <header className="bg-[#021126]">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
        <Link href="/">
          <BrandLogo />
        </Link>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {user ? (
            <>
              <div className="rounded-md border border-white/15 px-3 py-2 text-white/90">
                <span className="font-black">{user.name}</span>
                <span className="ml-2 text-white/60">{user.role}</span>
              </div>
              {user.role === "ADMIN" && (
                <Link className="inline-flex items-center gap-2 rounded-md border border-white/20 px-3 py-2 font-bold text-white" href="/admin">
                  <Shield className="h-4 w-4" />
                  Admin
                </Link>
              )}
              <form action={logout}>
                <button className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 font-bold text-white transition hover:bg-white/15">
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </form>
            </>
          ) : (
            <Link className="inline-flex items-center gap-2 rounded-md bg-[#d9aa2b] px-4 py-2 font-black text-[#021126]" href="/login?next=/catalogo">
              <LogIn className="h-4 w-4" />
              Entrar para ver mais informacoes
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
