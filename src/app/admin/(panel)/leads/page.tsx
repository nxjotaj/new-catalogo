import { getAdminLeads } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const leads = await getAdminLeads();

  return (
    <div>
      <h1 className="mb-6 text-3xl font-black text-[#021126]">Leads e orcamentos</h1>
      <div className="overflow-x-auto rounded-lg border border-[#e2e8f0] bg-white shadow-sm">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-wide text-[#536476]">
            <tr>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Empresa</th>
              <th className="px-4 py-3">Contato</th>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Mensagem</th>
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
