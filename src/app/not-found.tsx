import Link from "next/link";
import { MapPinOff } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f6f9] px-5">
      <section className="w-full max-w-xl rounded-lg border border-[#dce3ea] bg-white p-8 text-center shadow-xl">
        <MapPinOff className="mx-auto h-12 w-12 text-[#d9aa2b]" aria-hidden />
        <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-[#d9aa2b]">
          Erro 404
        </p>
        <h1 className="mt-2 text-3xl font-black text-[#021126]">Pagina nao encontrada</h1>
        <p className="mt-3 leading-7 text-[#536476]">
          O endereco pode estar incorreto ou o cadastro solicitado nao existe mais.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/catalogo"
            className="rounded-md bg-[#021126] px-5 py-3 text-sm font-black text-white"
          >
            Abrir catalogo
          </Link>
          <Link
            href="/"
            className="rounded-md border border-[#d8e0e8] px-5 py-3 text-sm font-black text-[#021126]"
          >
            Ir para o inicio
          </Link>
        </div>
      </section>
    </main>
  );
}
