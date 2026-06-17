import { deleteBrand } from "@/app/actions";
import { AdminEntityForm } from "@/components/AdminEntityForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminBrandsPage() {
  const brands = await prisma.marca.findMany({ orderBy: { nome: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-3xl font-black text-[#021126]">Marcas</h1>
      <AdminEntityForm type="marca" />
      <div className="mt-6 space-y-4">
        {brands.map((brand) => (
          <div key={brand.id} className="rounded-lg border border-[#e2e8f0] bg-white p-4 shadow-sm">
            <AdminEntityForm type="marca" entity={brand} />
            <form action={deleteBrand} className="mt-3">
              <input type="hidden" name="id" value={brand.id} />
              <button className="text-xs font-black uppercase tracking-wide text-red-700">Excluir marca</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
