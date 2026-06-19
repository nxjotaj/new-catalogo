import Link from "next/link";
import { FileSpreadsheet, Pencil, Plus } from "lucide-react";
import { deleteProduct } from "@/app/actions";
import { getAdminProducts } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#d9aa2b]">Produtos</p>
          <h1 className="mt-2 text-3xl font-black text-[#021126]">Catalogo</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/produtos/importar"
            className="inline-flex items-center gap-2 rounded-full border border-[#d8e0e8] bg-white px-4 py-3 text-sm font-black text-[#021126] transition hover:-translate-y-0.5"
          >
            <FileSpreadsheet className="h-4 w-4 text-[#d9aa2b]" />
            Importar XLSX
          </Link>
          <Link
            href="/admin/produtos/novo"
            className="inline-flex items-center gap-2 rounded-full bg-[#021126] px-4 py-3 text-sm font-black text-white transition hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            Novo produto
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[#e2e8f0] bg-white shadow-sm">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-wide text-[#536476]">
            <tr>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Codigo</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Marca</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-[#e2e8f0]">
                <td className="px-4 py-3 font-black text-[#021126]">{product.nome}</td>
                <td className="px-4 py-3">{product.codigoInterno}</td>
                <td className="px-4 py-3">{product.categoria.nome}</td>
                <td className="px-4 py-3">{product.marca.nome}</td>
                <td className="px-4 py-3">{product.ativo ? "Ativo" : "Inativo"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/produtos/${product.id}`} className="rounded-md border border-[#d8e0e8] p-2 text-[#021126]">
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <form action={deleteProduct}>
                      <input type="hidden" name="id" value={product.id} />
                      <button className="rounded-md border border-red-200 px-3 py-2 text-xs font-black text-red-700">
                        Excluir
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
