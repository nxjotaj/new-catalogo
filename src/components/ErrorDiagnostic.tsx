"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, Database, RefreshCw, ServerOff, WifiOff } from "lucide-react";

type Health = {
  ok?: boolean;
  database?: { ok: boolean; code: string; message: string };
  storage?: { ok: boolean; code: string; message: string };
};

type Diagnosis = {
  title: string;
  message: string;
  detail: string;
  icon: typeof AlertTriangle;
};

function diagnose(health: Health | null, requestFailed: boolean): Diagnosis {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return {
      title: "Sem conexao com a internet",
      message: "O dispositivo esta offline.",
      detail: "Verifique o Wi-Fi ou os dados moveis e tente novamente.",
      icon: WifiOff,
    };
  }

  if (requestFailed) {
    return {
      title: "Aplicacao indisponivel",
      message: "O servidor nao respondeu ao diagnostico.",
      detail: "A conexao pode estar instavel ou o servico pode estar reiniciando.",
      icon: ServerOff,
    };
  }

  if (health?.ok) {
    return {
      title: "Erro interno nesta pagina",
      message: "A aplicacao respondeu ao diagnostico.",
      detail: "Tente novamente. Se persistir, informe o codigo abaixo para localizar o erro nos logs.",
      icon: AlertTriangle,
    };
  }

  if (health?.database && !health.database.ok) {
    return {
      title: "Falha na conexao com o banco",
      message: health.database.message,
      detail:
        health.database.code === "DATABASE_CONNECTION_LIMIT"
          ? "O limite de conexoes do Supabase foi atingido. Aguarde alguns segundos e tente novamente."
          : "Os dados continuam salvos no Supabase, mas nao puderam ser consultados agora.",
      icon: Database,
    };
  }

  if (health?.storage && !health.storage.ok) {
    return {
      title: "Falha no armazenamento de imagens",
      message: health.storage.message,
      detail: "Cadastros sem imagem podem funcionar, mas novos arquivos nao devem ser enviados agora.",
      icon: ServerOff,
    };
  }

  return {
    title: "Erro interno nesta pagina",
    message: "A aplicacao e o Supabase estao acessiveis, mas esta tela encontrou um erro.",
    detail: "Tente novamente. Se persistir, informe o codigo abaixo para localizar o erro nos logs.",
    icon: AlertTriangle,
  };
}

export function ErrorDiagnostic({
  error,
  retry,
  area = "pagina",
}: {
  error: Error & { digest?: string };
  retry: () => void;
  area?: string;
}) {
  const [health, setHealth] = useState<Health | null>(null);
  const [requestFailed, setRequestFailed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    console.error(`Erro na ${area}`, error);
    fetch("/api/health", { cache: "no-store" })
      .then(async (response) => {
        const data = (await response.json()) as Health;
        setHealth(data);
      })
      .catch(() => setRequestFailed(true))
      .finally(() => setChecking(false));
  }, [area, error]);

  const diagnosis = diagnose(health, requestFailed);
  const Icon = checking ? RefreshCw : diagnosis.icon;

  return (
    <main className="min-h-screen bg-[#f4f6f9] px-5 py-12">
      <section className="mx-auto max-w-2xl overflow-hidden rounded-lg border border-[#dce3ea] bg-white shadow-xl">
        <div className="bg-[#021126] px-6 py-5 text-white">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d9aa2b]">
            Diagnostico Briland
          </p>
          <h1 className="mt-2 text-2xl font-black">
            {checking ? "Verificando o sistema..." : diagnosis.title}
          </h1>
        </div>
        <div className="p-6">
          <Icon
            className={`h-10 w-10 text-[#d9aa2b] ${checking ? "animate-spin" : ""}`}
            aria-hidden
          />
          {!checking && (
            <>
              <p className="mt-5 text-base font-black text-[#021126]">{diagnosis.message}</p>
              <p className="mt-2 leading-7 text-[#536476]">{diagnosis.detail}</p>
            </>
          )}
          {error.digest && (
            <p className="mt-5 rounded-md bg-[#f4f6f9] px-4 py-3 text-xs font-bold text-[#536476]">
              Codigo do erro: {error.digest}
            </p>
          )}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={retry}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#021126] px-5 py-3 text-sm font-black text-white"
            >
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md border border-[#d8e0e8] px-5 py-3 text-sm font-black text-[#021126]"
            >
              Ir para o inicio
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
