import type { UserRole, UserStatus } from "@/generated/prisma/client";
import { saveUser } from "@/app/actions";
import { SubmitButton } from "@/components/SubmitButton";

type UserForForm = {
  id?: string;
  name?: string;
  company?: string | null;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  notes?: string | null;
};

export function AdminUserForm({ user, compact = false }: { user?: UserForForm; compact?: boolean }) {
  return (
    <form
      action={saveUser}
      className={`grid gap-4 md:grid-cols-6 ${
        compact ? "" : "rounded-lg border border-[#e2e8f0] bg-white p-5 shadow-sm"
      }`}
    >
      {user?.id && <input type="hidden" name="id" value={user.id} />}
      <Field label="Nome" name="name" defaultValue={user?.name} required />
      <Field label="Empresa" name="company" defaultValue={user?.company ?? ""} />
      <Field label="E-mail" name="email" type="email" defaultValue={user?.email} required />
      <label className="block">
        <span className="mb-2 block text-xs font-black uppercase tracking-wide text-[#536476]">Perfil</span>
        <select name="role" defaultValue={user?.role ?? "CLIENTE"} className="h-11 w-full rounded-md border border-[#d8e0e8] px-3 text-sm outline-none focus:border-[#021126]">
          <option value="ADMIN">ADMIN</option>
          <option value="REPRESENTANTE">REPRESENTANTE</option>
          <option value="CLIENTE">CLIENTE</option>
        </select>
      </label>
      <label className="block">
        <span className="mb-2 block text-xs font-black uppercase tracking-wide text-[#536476]">Status</span>
        <select name="status" defaultValue={user?.status ?? "ACTIVE"} className="h-11 w-full rounded-md border border-[#d8e0e8] px-3 text-sm outline-none focus:border-[#021126]">
          <option value="ACTIVE">Ativo</option>
          <option value="INACTIVE">Inativo</option>
        </select>
      </label>
      <Field label={user?.id ? "Nova senha" : "Senha"} name="password" type="password" required={!user?.id} />
      <label className="block md:col-span-5">
        <span className="mb-2 block text-xs font-black uppercase tracking-wide text-[#536476]">Notas</span>
        <input
          name="notes"
          defaultValue={user?.notes ?? ""}
          className="h-11 w-full rounded-md border border-[#d8e0e8] px-3 text-sm outline-none focus:border-[#021126]"
        />
      </label>
      <SubmitButton
        pendingLabel="Salvando..."
        className="self-end rounded-md bg-[#021126] px-4 py-3 text-sm font-black text-white transition hover:bg-[#061b3a]"
      >
        Salvar
      </SubmitButton>
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
  defaultValue?: string;
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
        className="h-11 w-full rounded-md border border-[#d8e0e8] px-3 text-sm outline-none focus:border-[#021126]"
      />
    </label>
  );
}
