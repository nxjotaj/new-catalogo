import { saveProduct } from "@/app/actions";
import { ImageUploader } from "@/components/ImageUploader";

type Option = { id: string; nome: string; ativo: boolean };
type ProductForForm = {
  id?: string;
  nome?: string;
  slug?: string;
  codigoInterno?: string;
  categoriaId?: string;
  marcaId?: string;
  descricaoCurta?: string | null;
  descricaoCompleta?: string | null;
  ean?: string | null;
  ncm?: string | null;
  caixaMaster?: string | null;
  preco?: unknown;
  estoque?: number | null;
  condicaoComercial?: string | null;
  prazoEntrega?: string | null;
  fichaTecnica?: string | null;
  manualPdf?: string | null;
  observacaoComercial?: string | null;
  margem?: unknown;
  ativo?: boolean;
  destaque?: boolean;
  ordem?: number;
  observacaoInterna?: string | null;
  aplicacoes?: { aplicacaoId: string }[];
};

export function AdminProductForm({
  product,
  categories,
  brands,
  applications,
}: {
  product?: ProductForForm;
  categories: Option[];
  brands: Option[];
  applications: Option[];
}) {
  const selectedApplications = new Set(product?.aplicacoes?.map((item) => item.aplicacaoId));

  return (
    <form action={saveProduct} className="space-y-6 rounded-lg border border-[#e2e8f0] bg-white p-6 shadow-sm">
      {product?.id && <input type="hidden" name="id" value={product.id} />}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nome" name="nome" defaultValue={product?.nome} required />
        <Field label="Slug" name="slug" defaultValue={product?.slug} placeholder="Gerado automaticamente se vazio" />
        <Field label="Codigo interno" name="codigoInterno" defaultValue={product?.codigoInterno} required />
        <Field label="Ordem" name="ordem" type="number" defaultValue={product?.ordem ?? 0} />
        <Select label="Categoria" name="categoriaId" options={categories} value={product?.categoriaId} />
        <Select label="Marca" name="marcaId" options={brands} value={product?.marcaId} />
        <Field label="EAN" name="ean" defaultValue={product?.ean ?? ""} />
        <Field label="NCM" name="ncm" defaultValue={product?.ncm ?? ""} />
        <Field label="Caixa master" name="caixaMaster" defaultValue={product?.caixaMaster ?? ""} />
        <Field label="Preco" name="preco" type="number" defaultValue={product?.preco?.toString() ?? ""} />
        <Field label="Estoque" name="estoque" type="number" defaultValue={product?.estoque ?? ""} />
        <Field label="Prazo de entrega" name="prazoEntrega" defaultValue={product?.prazoEntrega ?? ""} />
        <Field label="Margem" name="margem" type="number" defaultValue={product?.margem?.toString() ?? ""} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Textarea label="Descricao curta" name="descricaoCurta" defaultValue={product?.descricaoCurta ?? ""} />
        <Textarea label="Descricao completa" name="descricaoCompleta" defaultValue={product?.descricaoCompleta ?? ""} />
        <Textarea label="Condicao comercial" name="condicaoComercial" defaultValue={product?.condicaoComercial ?? ""} />
        <Textarea label="Observacao comercial" name="observacaoComercial" defaultValue={product?.observacaoComercial ?? ""} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Ficha tecnica" name="fichaTecnica" defaultValue={product?.fichaTecnica ?? ""} />
        <Field label="Manual PDF" name="manualPdf" defaultValue={product?.manualPdf ?? ""} />
      </div>

      <div>
        <p className="mb-3 text-sm font-black text-[#021126]">Aplicacoes</p>
        <div className="grid gap-3 md:grid-cols-3">
          {applications.map((application) => (
            <label key={application.id} className="flex items-center gap-2 rounded-md border border-[#d8e0e8] px-3 py-2 text-sm font-semibold text-[#12263a]">
              <input
                type="checkbox"
                name="aplicacoes"
                value={application.id}
                defaultChecked={selectedApplications.has(application.id)}
                className="h-4 w-4 accent-[#021126]"
              />
              {application.nome}
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ImageUploader label="Imagem principal" name="imagemPrincipal" />
        <ImageUploader label="Imagens extras" name="imagensExtras" multiple />
      </div>

      <Textarea label="Observacao interna" name="observacaoInterna" defaultValue={product?.observacaoInterna ?? ""} />

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm font-bold text-[#12263a]">
          <input type="checkbox" name="ativo" defaultChecked={product?.ativo ?? true} className="h-4 w-4 accent-[#021126]" />
          Produto ativo
        </label>
        <label className="flex items-center gap-2 text-sm font-bold text-[#12263a]">
          <input type="checkbox" name="destaque" defaultChecked={product?.destaque ?? false} className="h-4 w-4 accent-[#d9aa2b]" />
          Em destaque
        </label>
      </div>

      <button className="rounded-md bg-[#021126] px-5 py-3 text-sm font-black text-white transition hover:bg-[#061b3a]">
        Salvar produto
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-wide text-[#536476]">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        className="h-11 w-full rounded-md border border-[#d8e0e8] px-3 text-sm outline-none focus:border-[#021126] focus:ring-4 focus:ring-[#021126]/10"
      />
    </label>
  );
}

function Select({
  label,
  name,
  options,
  value,
}: {
  label: string;
  name: string;
  options: Option[];
  value?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-wide text-[#536476]">{label}</span>
      <select
        name={name}
        defaultValue={value || ""}
        required
        className="h-11 w-full rounded-md border border-[#d8e0e8] px-3 text-sm outline-none focus:border-[#021126] focus:ring-4 focus:ring-[#021126]/10"
      >
        <option value="">Selecione</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.nome}
          </option>
        ))}
      </select>
    </label>
  );
}

function Textarea({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-wide text-[#536476]">{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={4}
        className="w-full rounded-md border border-[#d8e0e8] px-3 py-3 text-sm outline-none focus:border-[#021126] focus:ring-4 focus:ring-[#021126]/10"
      />
    </label>
  );
}
