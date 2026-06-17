import { login } from "@/app/actions";
import { BrandLogo } from "@/components/BrandLogo";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "/catalogo";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#021126] px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <BrandLogo />
        </div>
        <form action={login} className="rounded-lg bg-white p-7 shadow-2xl">
          <input type="hidden" name="next" value={next} />
          <h1 className="text-2xl font-black text-[#021126]">Entrar no catalogo</h1>
          <p className="mt-2 text-sm text-[#536476]">
            Acesse como cliente, representante ou administrador.
          </p>
          {params.erro && (
            <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
              E-mail, senha ou status de usuario invalido.
            </p>
          )}
          <label className="mt-6 block">
            <span className="mb-2 block text-xs font-black uppercase tracking-wide text-[#536476]">E-mail</span>
            <input
              name="email"
              type="email"
              required
              className="h-12 w-full rounded-md border border-[#d8e0e8] px-3 outline-none focus:border-[#021126] focus:ring-4 focus:ring-[#021126]/10"
            />
          </label>
          <label className="mt-4 block">
            <span className="mb-2 block text-xs font-black uppercase tracking-wide text-[#536476]">Senha</span>
            <input
              name="password"
              type="password"
              required
              className="h-12 w-full rounded-md border border-[#d8e0e8] px-3 outline-none focus:border-[#021126] focus:ring-4 focus:ring-[#021126]/10"
            />
          </label>
          <button className="mt-6 w-full rounded-md bg-[#021126] px-5 py-3 text-sm font-black text-white transition hover:bg-[#061b3a]">
            Entrar
          </button>
        </form>
      </div>
    </main>
  );
}
