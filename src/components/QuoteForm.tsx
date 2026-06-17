import { createLead } from "@/app/actions";

export function QuoteForm({
  productId,
  productName,
}: {
  productId?: string;
  productName?: string;
}) {
  return (
    <form action={createLead} className="space-y-4 rounded-lg border border-[#e2e8f0] bg-white p-6 shadow-sm">
      {productId && <input type="hidden" name="produtoId" value={productId} />}
      <input type="hidden" name="origem" value="catalogo" />
      <div>
        <p className="text-lg font-black text-[#021126]">Solicitar orcamento</p>
        {productName && <p className="mt-1 text-sm text-[#536476]">{productName}</p>}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Input label="Nome" name="nome" required />
        <Input label="Empresa" name="empresa" />
        <Input label="Telefone" name="telefone" required />
        <Input label="Email" name="email" type="email" />
        <Input label="Cidade" name="cidade" />
        <Input label="Estado" name="estado" maxLength={2} />
      </div>
      <label className="block">
        <span className="mb-2 block text-xs font-black uppercase tracking-wide text-[#536476]">Mensagem</span>
        <textarea
          name="mensagem"
          rows={4}
          className="w-full rounded-md border border-[#d8e0e8] px-3 py-3 text-sm outline-none focus:border-[#021126] focus:ring-4 focus:ring-[#021126]/10"
        />
      </label>
      <button className="rounded-md bg-[#021126] px-5 py-3 text-sm font-black text-white transition hover:bg-[#061b3a]">
        Enviar solicitacao
      </button>
    </form>
  );
}

function Input({
  label,
  name,
  type = "text",
  required,
  maxLength,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-wide text-[#536476]">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        maxLength={maxLength}
        className="h-11 w-full rounded-md border border-[#d8e0e8] px-3 text-sm outline-none focus:border-[#021126] focus:ring-4 focus:ring-[#021126]/10"
      />
    </label>
  );
}
