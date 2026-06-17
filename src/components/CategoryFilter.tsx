type Option = { id: string; nome: string; slug: string };

export function CategoryFilter({
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
      <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#536476]">
        {label}
      </span>
      <select
        name={name}
        defaultValue={value || ""}
        className="h-12 w-full rounded-md border border-[#d8e0e8] bg-white px-3 text-sm font-semibold text-[#12263a] outline-none transition focus:border-[#021126] focus:ring-4 focus:ring-[#021126]/10"
      >
        <option value="">Todos</option>
        {options.map((option) => (
          <option key={option.id} value={option.slug}>
            {option.nome}
          </option>
        ))}
      </select>
    </label>
  );
}
