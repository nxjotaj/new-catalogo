import { ProductCard } from "@/components/ProductCard";
import type { VisibleProduct } from "@/lib/permissions";

export function ProductGrid({ products }: { products: VisibleProduct[] }) {
  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[#c7d2de] bg-white p-10 text-center">
        <p className="text-lg font-black text-[#021126]">Nenhum produto encontrado</p>
        <p className="mt-2 text-sm text-[#536476]">
          Ajuste os filtros ou cadastre produtos ativos no painel administrativo.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
