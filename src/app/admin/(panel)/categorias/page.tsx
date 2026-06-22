import { deleteCategory } from "@/app/actions";
import { AdminFeedback } from "@/components/AdminFeedback";
import { AdminEntityForm } from "@/components/AdminEntityForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const feedback = await searchParams;
  const categories = await prisma.categoria.findMany({ orderBy: [{ ordem: "asc" }, { nome: "asc" }] });

  return (
    <div>
      <h1 className="mb-6 text-3xl font-black text-[#021126]">Categorias</h1>
      <AdminFeedback success={feedback.success} error={feedback.error} />
      <AdminEntityForm type="categoria" />
      <div className="mt-6 space-y-4">
        {categories.map((category) => (
          <div key={category.id} className="rounded-lg border border-[#e2e8f0] bg-white p-4 shadow-sm">
            <AdminEntityForm type="categoria" entity={category} />
            <form action={deleteCategory} className="mt-3">
              <input type="hidden" name="id" value={category.id} />
              <button className="text-xs font-black uppercase tracking-wide text-red-700">Excluir categoria</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
