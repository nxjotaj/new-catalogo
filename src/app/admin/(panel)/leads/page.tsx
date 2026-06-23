import Link from "next/link";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { getAdminLeads } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const leads = await getAdminLeads();

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#d9aa2b]">Relacionamento</p>
          <h1 className="mt-2 text-3xl font-black text-[#021126]">Leads e orcamentos</h1>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-[#e2e8f0] bg-white shadow-sm">
        <table className="w-full min-w-[940px] text-left text-sm">
          <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-wide text-[#536476]">
            <tr>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Empresa</th>
              <th className="px-4 py-3">Contato</th>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Mensagem</th>
              <th className="px-4 py-3">Acao</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-t border-[#e2e8f0] align-top">
                <td className="px-4 py-3">{lead.createdAt.toLocaleDateString("pt-BR")}</td>
                <td className="px-4 py-3 font-black text-[#021126]">{lead.nome}</td>
                <td className="px-4 py-3">{lead.empresa || "-"}</td>
                <td className="px-4 py-3">
                  <p>{lead.telefone}</p>
                  <p className="text-xs text-[#536476]">{lead.email || "-"}</p>
                  <p className="text-xs text-[#536476]">
                    {[lead.cidade, lead.estado].filter(Boolean).join(" / ") || "-"}
                  </p>
                </td>
                <td className="px-4 py-3">{lead.produto?.nome || "-"}</td>
                <td className="px-4 py-3">{lead.status}</td>
                <td className="max-w-sm px-4 py-3 text-[#536476]">{lead.mensagem || "-"}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/leads/${lead.id}`}
                    className="inline-flex items-center gap-2 rounded-full border border-[#d8e0e8] px-3 py-2 text-xs font-black text-[#021126] transition hover:border-[#d9aa2b] hover:bg-[#fff8e2]"
                  >
                    <MessageCircle className="h-4 w-4 text-[#d9aa2b]" />
                    Abrir
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {leads.length === 0 && (
          <div className="p-8 text-center text-sm font-bold text-[#536476]">Nenhum lead recebido ainda.</div>
        )}
      </div>
    </div>
  );
}
