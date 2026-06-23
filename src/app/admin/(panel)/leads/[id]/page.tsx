import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { getAdminLead } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function whatsappPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("55")) return digits;
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits;
}

function whatsappMessage(lead: NonNullable<Awaited<ReturnType<typeof getAdminLead>>>) {
  const lines = [
    `Ola ${lead.nome}, tudo bem?`,
    "",
    "Recebemos sua solicitacao pelo catalogo Briland e estou entrando em contato para dar continuidade ao atendimento.",
    lead.produto ? `Produto: ${lead.produto.nome}` : null,
    lead.produto?.codigoInterno ? `Codigo: ${lead.produto.codigoInterno}` : null,
    lead.empresa ? `Empresa: ${lead.empresa}` : null,
    lead.cidade || lead.estado ? `Cidade/UF: ${[lead.cidade, lead.estado].filter(Boolean).join(" / ")}` : null,
    lead.mensagem ? `Mensagem recebida: ${lead.mensagem}` : null,
  ].filter(Boolean);

  return encodeURIComponent(lines.join("\n"));
}

export default async function AdminLeadDetailPage({ params }: PageProps) {
  const { id } = await params;
  const lead = await getAdminLead(id);
  if (!lead) notFound();

  const phone = whatsappPhone(lead.telefone);
  const whatsappHref = phone
    ? `https://wa.me/${phone}?text=${whatsappMessage(lead)}`
    : null;

  return (
    <div>
      <Link href="/admin/leads" className="mb-6 inline-flex items-center gap-2 text-sm font-black text-[#021126]">
        <ArrowLeft className="h-4 w-4" />
        Voltar para leads
      </Link>

      <div className="mb-6 flex flex-col justify-between gap-4 rounded-3xl border border-[#e2e8f0] bg-white p-6 shadow-sm md:flex-row md:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#d9aa2b]">Lead recebido</p>
          <h1 className="mt-2 text-3xl font-black text-[#021126]">{lead.nome}</h1>
          <p className="mt-2 text-sm font-bold text-[#536476]">
            Recebido em {formatDate(lead.createdAt)} pelo canal {lead.origem || "catalogo"}.
          </p>
        </div>
        {whatsappHref && (
          <Link
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#021126] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#061b3a]"
          >
            <MessageCircle className="h-4 w-4 text-[#d9aa2b]" />
            Chamar no WhatsApp
          </Link>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-[#021126]">Dados do cliente</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Info label="Nome" value={lead.nome} />
            <Info label="Empresa" value={lead.empresa} />
            <Info label="Telefone" value={lead.telefone} />
            <Info label="E-mail" value={lead.email} />
            <Info label="Cidade" value={lead.cidade} />
            <Info label="Estado" value={lead.estado} />
            <Info label="Status" value={lead.status} />
          </div>
        </section>

        <section className="rounded-3xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-[#021126]">Produto solicitado</h2>
          {lead.produto ? (
            <div className="mt-5 space-y-4">
              <Info label="Produto" value={lead.produto.nome} />
              <Info label="Codigo" value={lead.produto.codigoInterno} />
              <Info label="Categoria" value={lead.produto.categoria.nome} />
              <Info label="Marca" value={lead.produto.marca.nome} />
              <Link
                href={`/catalogo/${lead.produto.slug}`}
                className="inline-flex rounded-full border border-[#d8e0e8] px-4 py-2 text-xs font-black text-[#021126] transition hover:border-[#d9aa2b] hover:bg-[#fff8e2]"
              >
                Abrir produto
              </Link>
            </div>
          ) : (
            <p className="mt-4 text-sm font-bold text-[#536476]">Lead sem produto vinculado.</p>
          )}
        </section>
      </div>

      <section className="mt-5 rounded-3xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-[#021126]">Mensagem recebida</h2>
        <p className="mt-4 whitespace-pre-line text-sm leading-6 text-[#536476]">
          {lead.mensagem || "Nenhuma mensagem informada."}
        </p>
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-2xl border border-[#edf1f5] bg-[#f8fafc] px-4 py-3">
      <p className="text-[11px] font-black uppercase tracking-wide text-[#6c7b89]">{label}</p>
      <p className="mt-1 break-words text-sm font-black text-[#021126]">{value || "-"}</p>
    </div>
  );
}
