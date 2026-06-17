import { deleteUser } from "@/app/actions";
import { AdminUserForm } from "@/components/AdminUserForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({ orderBy: [{ role: "asc" }, { name: "asc" }] });

  return (
    <div>
      <h1 className="mb-6 text-3xl font-black text-[#021126]">Usuarios</h1>
      <AdminUserForm />
      <div className="mt-6 space-y-4">
        {users.map((user) => (
          <div key={user.id} className="rounded-lg border border-[#e2e8f0] bg-white p-4 shadow-sm">
            <AdminUserForm user={user} />
            <form action={deleteUser} className="mt-3">
              <input type="hidden" name="id" value={user.id} />
              <button className="text-xs font-black uppercase tracking-wide text-red-700">Excluir usuario</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
