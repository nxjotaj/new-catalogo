import { Search } from "lucide-react";

export function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <label className="relative block">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6c7b89]" />
      <input
        name="q"
        defaultValue={defaultValue}
        placeholder="Buscar por nome, codigo, EAN, NCM ou descricao"
        className="h-12 w-full rounded-md border border-[#d8e0e8] bg-white pl-12 pr-4 text-sm text-[#12263a] outline-none transition placeholder:text-[#8c9aa8] focus:border-[#021126] focus:ring-4 focus:ring-[#021126]/10"
      />
    </label>
  );
}
