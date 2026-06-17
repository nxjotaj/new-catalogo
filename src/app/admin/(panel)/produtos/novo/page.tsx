import { AdminProductForm } from "@/components/AdminProductForm";
import { getAdminOptions } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const options = await getAdminOptions();
  return (
    <div>
      <h1 className="mb-6 text-3xl font-black text-[#021126]">Novo produto</h1>
      <AdminProductForm categories={options.categories} brands={options.brands} applications={options.applications} />
    </div>
  );
}
