import Link from "next/link";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

export default function Home() {
  return (
    <main className="premium-shell min-h-screen">
      <section className="bg-[#021126]">
        <div className="mx-auto flex min-h-[92vh] max-w-7xl flex-col px-6 py-6">
          <header className="flex items-center justify-between">
            <BrandLogo />
            <Link
              href="/admin"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/20 text-white transition hover:bg-white/10"
              aria-label="Painel administrativo"
            >
              <LayoutDashboard className="h-5 w-5" />
            </Link>
          </header>

          <div className="flex flex-1 items-center">
            <div className="max-w-3xl py-14">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#d9aa2b]">
                Catalogo digital premium
              </p>
              <h1 className="mt-5 text-5xl font-black leading-tight text-white md:text-7xl">
                Briland
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78">
                Uma experiencia limpa e corporativa para consultar produtos, filtrar por
                aplicacao e solicitar orcamentos com agilidade.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/catalogo"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-[#d9aa2b] px-5 py-3 text-sm font-black text-[#021126] transition hover:bg-[#c99a1f]"
                >
                  Abrir catalogo
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/admin"
                  className="inline-flex items-center justify-center rounded-md border border-white/25 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  Painel administrativo
                </Link>
              </div>
            </div>
          </div>
          <div className="h-14 border-t border-white/10" />
        </div>
      </section>
    </main>
  );
}
