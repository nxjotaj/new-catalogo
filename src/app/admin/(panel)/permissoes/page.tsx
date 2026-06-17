import { savePermissions } from "@/app/actions";
import { ensureDefaultPermissions } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPermissionsPage() {
  await ensureDefaultPermissions();
  const permissions = await prisma.productFieldPermission.findMany({ orderBy: { fieldLabel: "asc" } });

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#d9aa2b]">Visibilidade</p>
        <h1 className="mt-2 text-3xl font-black text-[#021126]">Permissoes do catalogo</h1>
        <p className="mt-2 max-w-3xl text-sm text-[#536476]">
          Estes controles sao aplicados no servidor antes dos produtos serem enviados para a interface.
        </p>
      </div>
      <form action={savePermissions} className="overflow-hidden rounded-lg border border-[#e2e8f0] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-wide text-[#536476]">
            <tr>
              <th className="px-4 py-3">Campo</th>
              <th className="px-4 py-3">Visitante</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Representante</th>
              <th className="px-4 py-3">Admin</th>
            </tr>
          </thead>
          <tbody>
            {permissions.map((item) => (
              <tr key={item.id} className="border-t border-[#e2e8f0]">
                <td className="px-4 py-3 font-black text-[#021126]">{item.fieldLabel}</td>
                <Cell name={`${item.fieldKey}:VISITANTE`} checked={item.visibleToVisitor} />
                <Cell name={`${item.fieldKey}:CLIENTE`} checked={item.visibleToClient} />
                <Cell name={`${item.fieldKey}:REPRESENTANTE`} checked={item.visibleToRepresentative} />
                <Cell name={`${item.fieldKey}:ADMIN`} checked={item.visibleToAdmin} />
              </tr>
            ))}
          </tbody>
          </table>
        </div>
        <div className="border-t border-[#e2e8f0] p-4">
          <button className="rounded-md bg-[#021126] px-5 py-3 text-sm font-black text-white transition hover:bg-[#061b3a]">
            Salvar permissoes
          </button>
        </div>
      </form>
    </div>
  );
}

function Cell({ name, checked }: { name: string; checked: boolean }) {
  return (
    <td className="px-4 py-3">
      <input name={name} type="checkbox" defaultChecked={checked} className="h-4 w-4 accent-[#021126]" />
    </td>
  );
}
