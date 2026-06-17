import Image from "next/image";
import Link from "next/link";
import { Eye, Star } from "lucide-react";
import { ProductImageFallback } from "@/components/ProductImageFallback";
import type { VisibleProduct } from "@/lib/permissions";

export function ProductCard({
  product,
  modalTarget = true,
}: {
  product: VisibleProduct;
  modalTarget?: boolean;
}) {
  const name = product.nome || "Produto restrito";

  return (
    <article className="group overflow-hidden rounded-lg border border-[#e6ebf0] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/catalogo/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-[#f3f6f9]">
          {product.permissions.imagemPrincipal && product.imagemPrincipal ? (
            <Image
              src={product.imagemPrincipal}
              alt={name}
              fill
              sizes="(min-width: 1280px) 20vw, (min-width: 768px) 33vw, 50vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <ProductImageFallback />
          )}
          {product.destaque && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded bg-[#d9aa2b] px-2 py-1 text-[11px] font-black uppercase tracking-wide text-[#021126]">
              <Star className="h-3 w-3 fill-[#021126]" />
              Destaque
            </span>
          )}
        </div>
      </Link>
      <div className="space-y-3 p-4">
        <div>
          {product.categoria && (
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#6c7b89]">
              {product.categoria.nome}
            </p>
          )}
          <Link href={`/catalogo/${product.slug}`}>
            <h3 className="mt-1 line-clamp-2 min-h-11 text-sm font-black leading-snug text-[#021126]">
              {name}
            </h3>
          </Link>
        </div>
        <p className="text-xs font-semibold text-[#536476]">
          {product.codigoInterno ? `Cod. ${product.codigoInterno}` : "Codigo bloqueado"}
        </p>
        {product.descricaoCurta && (
          <p className="line-clamp-2 text-xs leading-5 text-[#536476]">{product.descricaoCurta}</p>
        )}
        {modalTarget && (
          <Link
            href={`/catalogo?produto=${product.slug}`}
            scroll={false}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-[#d9aa2b] px-3 py-2 text-xs font-black uppercase tracking-wide text-[#021126] transition hover:bg-[#d9aa2b]"
          >
            <Eye className="h-4 w-4" />
            Ver detalhes
          </Link>
        )}
      </div>
    </article>
  );
}
