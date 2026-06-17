import Image from "next/image";

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="inline-flex items-center gap-3 text-white">
      <Image
        src="/brand/briland-logo.png"
        alt="Briland"
        width={compact ? 128 : 190}
        height={compact ? 41 : 61}
        priority
        className="h-auto w-32 object-contain md:w-48"
      />
      {!compact && (
        <div className="hidden leading-none sm:block">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d9aa2b]">
            Catalogo Premium
          </p>
        </div>
      )}
    </div>
  );
}
