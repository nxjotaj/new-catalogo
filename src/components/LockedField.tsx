import Link from "next/link";
import { Lock } from "lucide-react";

export function LockedField({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-dashed border-[#c7d2de] bg-[#f8fafc] p-4 text-[#536476]">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide">
        <Lock className="h-4 w-4 text-[#d9aa2b]" />
        {label}
      </div>
      <Link href="/login?next=/catalogo" className="mt-2 inline-flex text-sm font-bold text-[#021126]">
        Entrar para ver mais informacoes
      </Link>
    </div>
  );
}
