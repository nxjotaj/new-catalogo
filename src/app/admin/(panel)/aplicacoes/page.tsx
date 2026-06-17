import { deleteApplication } from "@/app/actions";
import { AdminEntityForm } from "@/components/AdminEntityForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminApplicationsPage() {
  const applications = await prisma.aplicacao.findMany({ orderBy: { nome: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-3xl font-black text-[#021126]">Aplicacoes</h1>
      <AdminEntityForm type="aplicacao" />
      <div className="mt-6 space-y-4">
        {applications.map((application) => (
          <div key={application.id} className="rounded-lg border border-[#e2e8f0] bg-white p-4 shadow-sm">
            <AdminEntityForm type="aplicacao" entity={application} />
            <form action={deleteApplication} className="mt-3">
              <input type="hidden" name="id" value={application.id} />
              <button className="text-xs font-black uppercase tracking-wide text-red-700">Excluir aplicacao</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
