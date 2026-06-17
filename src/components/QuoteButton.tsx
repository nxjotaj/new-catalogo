import Link from "next/link";
import { FileText } from "lucide-react";

export function QuoteButton({
  productId,
  className = "",
}: {
  productId?: string;
  className?: string;
}) {
  const href = productId ? `/catalogo?orcamento=${productId}` : "/catalogo";

  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-md bg-[#021126] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#061b3a] ${className}`}
    >
      <FileText className="h-4 w-4" aria-hidden />
      Solicitar orcamento
    </Link>
  );
}
