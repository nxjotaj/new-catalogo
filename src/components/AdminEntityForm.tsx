import { saveApplication, saveBrand, saveCategory } from "@/app/actions";
import { ImageUploader } from "@/components/ImageUploader";

type Entity = {
  id: string;
  nome: string;
  slug: string;
  descricao?: string | null;
  tipo?: string | null;
  ordem?: number;
  ativo: boolean;
};

const actions = {
  categoria: saveCategory,
  marca: saveBrand,
  aplicacao: saveApplication,
};

export function AdminEntityForm({
  type,
  entity,
}: {
  type: keyof typeof actions;
  entity?: Partial<Entity>;
}) {
  return (
    <form action={actions[type]} className="grid gap-4 rounded-lg border border-[#e2e8f0] bg-white p-5 shadow-sm md:grid-cols-5">
      {entity?.id && <input type="hidden" name="id" value={entity.id} />}
      <Field label="Nome" name="nome" defaultValue={entity?.nome} required />
      <Field label="Slug" name="slug" defaultValue={entity?.slug} />
      {type === "categoria" && <Field label="Ordem" name="ordem" type="number" defaultValue={entity?.ordem ?? 0} />}
      {type === "categoria" && <Field label="Descricao" name="descricao" defaultValue={entity?.descricao ?? ""} />}
      {type === "aplicacao" && <Field label="Tipo" name="tipo" defaultValue={entity?.tipo ?? ""} />}
      <label className="flex items-center gap-2 self-end pb-3 text-sm font-bold text-[#12263a]">
        <input type="checkbox" name="ativo" defaultChecked={entity?.ativo ?? true} className="h-4 w-4 accent-[#021126]" />
        Ativo
      </label>
      {(type === "categoria" || type === "marca") && (
        <div className="md:col-span-2">
          <ImageUploader label={type === "marca" ? "Logo" : "Imagem"} name={type === "marca" ? "logo" : "imagem"} />
        </div>
      )}
      <button className="self-end rounded-md bg-[#021126] px-4 py-3 text-sm font-black text-white transition hover:bg-[#061b3a]">
        Salvar
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
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-wide text-[#536476]">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="h-11 w-full rounded-md border border-[#d8e0e8] px-3 text-sm outline-none focus:border-[#021126] focus:ring-4 focus:ring-[#021126]/10"
      />
    </label>
  );
}
