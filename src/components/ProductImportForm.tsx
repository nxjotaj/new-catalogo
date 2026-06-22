"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, FileSpreadsheet, Upload } from "lucide-react";
import { importProducts } from "@/app/actions";
import {
  emptyProductImportResult,
  type ProductImportResult,
} from "@/lib/product-import-types";

export function ProductImportForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [state, action, pending] = useActionState<ProductImportResult, FormData>(
    importProducts,
    emptyProductImportResult,
  );

  return (
    <div className="space-y-6">
      <form
        action={action}
        className="rounded-[28px] border border-white bg-white p-6 shadow-[0_24px_70px_rgba(2,17,38,0.08)]"
      >
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#021126] text-[#d9aa2b]">
            <FileSpreadsheet className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-black text-[#021126]">Planilha XLSX</h2>
            <p className="mt-1 text-sm leading-6 text-[#536476]">
              Produtos existentes sao atualizados pelo Codigo Interno. Categorias, marcas e
              aplicacoes precisam estar cadastradas no painel.
            </p>
          </div>
        </div>

        <label
          className={`mt-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-5 py-10 text-center transition hover:border-[#021126] hover:bg-white ${
            selectedFile
              ? "border-emerald-400 bg-emerald-50"
              : "border-[#b9c7d4] bg-[#f8fafc]"
          }`}
        >
          {selectedFile ? (
            <CheckCircle2 className="h-9 w-9 text-emerald-600" />
          ) : (
            <Upload className="h-8 w-8 text-[#d9aa2b]" />
          )}
          <span className="mt-3 text-sm font-black text-[#021126]">
            {selectedFile ? "Planilha recebida e pronta" : "Selecionar planilha de produtos"}
          </span>
          {selectedFile ? (
            <>
              <span className="mt-1 max-w-full break-all text-sm font-bold text-emerald-800">
                {selectedFile.name}
              </span>
              <span className="mt-1 text-xs text-emerald-700">
                {(selectedFile.size / 1024).toFixed(1)} KB - clique para substituir
              </span>
            </>
          ) : (
            <span className="mt-1 text-xs text-[#6c7b89]">Somente arquivo .xlsx</span>
          )}
          <input
            name="file"
            type="file"
            accept=".xlsx"
            required
            className="sr-only"
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
          />
        </label>

        <button
          disabled={pending || !selectedFile}
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-[#021126] px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#061b3a] disabled:cursor-wait disabled:opacity-60"
        >
          <Upload className="h-4 w-4" />
          {pending ? "Importando..." : "Validar e importar"}
        </button>
      </form>

      {state.message && (
        <section
          className={`rounded-2xl border p-5 ${
            state.success
              ? "border-emerald-200 bg-emerald-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          <p className="font-black text-[#021126]">{state.message}</p>
          {state.errors.length > 0 && (
            <div className="mt-4 max-h-80 overflow-y-auto rounded-xl bg-white p-4">
              <p className="mb-2 text-xs font-black uppercase tracking-wide text-[#536476]">
                Avisos e erros por linha
              </p>
              <ul className="space-y-2 text-sm text-[#36485a]">
                {state.errors.map((error, index) => (
                  <li key={`${error}-${index}`}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
