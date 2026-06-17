import { Package } from "lucide-react";

export function ProductImageFallback({ label = "Sem foto" }: { label?: string }) {
  return (
    <div className="flex h-full min-h-48 w-full flex-col items-center justify-center bg-[#f3f6f9] text-[#6c7b89]">
      <Package className="mb-3 h-10 w-10 text-[#d9aa2b]" aria-hidden />
      <span className="text-sm font-semibold">{label}</span>
    </div>
  );
}
