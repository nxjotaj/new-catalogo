import { ImagePlus } from "lucide-react";

export function ImageUploader({
  label,
  name,
  multiple = false,
}: {
  label: string;
  name: string;
  multiple?: boolean;
}) {
  return (
    <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[#b9c7d4] bg-[#f8fafc] px-5 py-8 text-center transition hover:border-[#021126] hover:bg-white">
      <ImagePlus className="h-8 w-8 text-[#d9aa2b]" aria-hidden />
      <span className="mt-3 text-sm font-black text-[#021126]">{label}</span>
      <span className="mt-1 text-xs text-[#6c7b89]">JPG, PNG, WEBP ou GIF</span>
      <input name={name} type="file" accept="image/*" multiple={multiple} className="sr-only" />
    </label>
  );
}
