"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import clsx from "clsx";

export function AdminActionModal({
  title,
  description,
  triggerLabel,
  triggerIcon,
  triggerClassName,
  children,
}: {
  title: string;
  description?: string;
  triggerLabel: string;
  triggerIcon?: React.ReactNode;
  triggerClassName?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={clsx(
          "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#021126] px-4 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#061b3a] active:translate-y-0",
          triggerClassName,
        )}
      >
        {triggerIcon || <Plus className="h-4 w-4 text-[#d9aa2b]" />}
        {triggerLabel}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#021126]/45 p-3 backdrop-blur-sm sm:items-center sm:p-6">
          <button
            type="button"
            aria-label="Fechar"
            className="absolute inset-0 h-full w-full cursor-default"
            onClick={() => setOpen(false)}
          />
          <section className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-t-[28px] border border-white/70 bg-white p-4 shadow-2xl sm:rounded-[28px] sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-[#edf1f5] pb-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d9aa2b]">Cadastro</p>
                <h2 className="mt-1 text-2xl font-black text-[#021126]">{title}</h2>
                {description && <p className="mt-1 text-sm font-bold text-[#536476]">{description}</p>}
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#d8e0e8] text-[#536476] transition hover:bg-[#f8fafc]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {children}
          </section>
        </div>
      )}
    </>
  );
}
