import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStorageConfig } from "@/lib/upload";

export const dynamic = "force-dynamic";

function databaseFailure(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String(error.code)
      : "DATABASE_ERROR";

  if (message.includes("EMAXCONNSESSION") || message.includes("max clients")) {
    return {
      ok: false,
      code: "DATABASE_CONNECTION_LIMIT",
      message: "O limite de conexoes do banco de dados foi atingido.",
    };
  }
  if (code === "ECONNREFUSED" || code === "P1001") {
    return {
      ok: false,
      code: "DATABASE_UNREACHABLE",
      message: "Nao foi possivel conectar ao banco de dados.",
    };
  }

  return {
    ok: false,
    code: "DATABASE_ERROR",
    message: "O banco de dados respondeu com erro.",
  };
}

async function checkStorage() {
  const { url, key } = getStorageConfig();

  try {
    const response = await fetch(`${url.replace(/\/$/, "")}/storage/v1/object/list/catalog-media`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prefix: "", limit: 1, offset: 0 }),
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });

    return response.ok
      ? { ok: true, code: "STORAGE_OK", message: "Armazenamento conectado." }
      : {
          ok: false,
          code: "STORAGE_UNAVAILABLE",
          message: "O armazenamento de imagens nao respondeu corretamente.",
        };
  } catch {
    return {
      ok: false,
      code: "STORAGE_UNREACHABLE",
      message: "Nao foi possivel conectar ao armazenamento de imagens.",
    };
  }
}

export async function GET() {
  let database: { ok: boolean; code: string; message: string };

  try {
    await prisma.$queryRaw`SELECT 1`;
    database = { ok: true, code: "DATABASE_OK", message: "Banco de dados conectado." };
  } catch (error) {
    console.error("Health check database failure", error);
    database = databaseFailure(error);
  }

  const storage = await checkStorage();
  const healthy = database.ok && storage.ok;

  return NextResponse.json(
    {
      ok: healthy,
      app: { ok: true, code: "APP_OK", message: "Aplicacao em execucao." },
      database,
      storage,
      checkedAt: new Date().toISOString(),
    },
    {
      status: healthy ? 200 : 503,
      headers: { "Cache-Control": "no-store, max-age=0" },
    },
  );
}
