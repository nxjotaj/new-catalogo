"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { ProductImageFallback } from "@/components/ProductImageFallback";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import type { VisibleProduct } from "@/lib/permissions";

export function ProductModal({ product }: { product: VisibleProduct | null }) {
  if (!product) return null;
  const name = product.nome || "Produto restrito";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#03182d]/70 px-4 py-6 backdrop-blur-sm">
      <div className="relative grid max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-2xl md:grid-cols-[0.95fr_1.05fr]">
        <Link
          href="/catalogo"
          scroll={false}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-[#021126] shadow transition hover:bg-[#d9aa2b]"
          aria-label="Fechar modal"
        >
          <X className="h-5 w-5" />
        </Link>
        <div className="relative min-h-80 bg-[#f3f6f9]">
          {product.permissions.imagemPrincipal && product.imagemPrincipal ? (
            <Image src={product.imagemPrincipal} alt={name} fill className="object-cover" />
          ) : (
            <ProductImageFallback />
          )}
        </div>
        <div className="overflow-y-auto p-8">
          {product.categoria && (
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d9aa2b]">
              {product.categoria.nome}
            </p>
          )}
          <h2 className="mt-3 text-3xl font-black leading-tight text-[#021126]">{name}</h2>
          {product.codigoInterno && (
            <p className="mt-2 text-sm font-bold text-[#536476]">Codigo interno: {product.codigoInterno}</p>
          )}
          {product.descricaoCurta && (
            <p className="mt-5 text-base leading-7 text-[#36485a]">{product.descricaoCurta}</p>
          )}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/catalogo/${product.slug}`}
              className="inline-flex items-center justify-center rounded-md bg-[#021126] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#061b3a]"
            >
              Pagina do produto
            </Link>
            {product.permissions.whatsappButton && <WhatsAppButton productName={product.nome} />}
          </div>
        </div>
      </div>
    </div>
  );
}
