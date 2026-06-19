import { ProductImportForm } from "@/components/ProductImportForm";

export default function ImportProductsPage() {
  return (
    <div>
      <div className="mb-7">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#d9aa2b]">
          Produtos
        </p>
        <h1 className="mt-2 text-3xl font-black text-[#021126]">Importar planilha</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#536476]">
          As sete primeiras colunas sao obrigatorias: Codigo Interno, Categoria, Marca,
          Nome, EAN, NCM e Caixa Master.
        </p>
        <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-[#536476]">
          Na planilha, formate Codigo Interno, EAN e NCM como texto para preservar zeros
          iniciais e pontuacao.
        </p>
      </div>
      <ProductImportForm />
    </div>
  );
}
