import { notFound } from "next/navigation";
import { AdminFeedback } from "@/components/AdminFeedback";
import { AdminProductForm } from "@/components/AdminProductForm";
import { getAdminOptions } from "@/lib/admin-data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditProductPage({
  params,
  searchParams,
}: PageProps & { searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const feedback = await searchParams;
  const [product, options] = await Promise.all([
    prisma.produto.findUnique({ where: { id }, include: { aplicacoes: true } }),
    getAdminOptions(),
  ]);
  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-6 text-3xl font-black text-[#021126]">Editar produto</h1>
      <AdminFeedback error={feedback.error} />
      <AdminProductForm product={product} categories={options.categories} brands={options.brands} applications={options.applications} />
    </div>
  );
}
