"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { CheckCircle2, ImagePlus } from "lucide-react";

export function ImageUploader({
  label,
  name,
  multiple = false,
  existingUrls = [],
}: {
  label: string;
  name: string;
  multiple?: boolean;
  existingUrls?: string[];
}) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [previews]);

  function handleSelection(files: FileList | null) {
    const nextFiles = files ? Array.from(files) : [];
    setSelectedFiles(nextFiles);
    setPreviews(nextFiles.map((file) => URL.createObjectURL(file)));
  }

  const visibleImages = previews.length > 0 ? previews : existingUrls;
  const hasSelection = selectedFiles.length > 0;

  return (
    <div className="space-y-3">
      <label
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-5 py-8 text-center transition hover:border-[#021126] hover:bg-white ${
          hasSelection ? "border-emerald-400 bg-emerald-50" : "border-[#b9c7d4] bg-[#f8fafc]"
        }`}
      >
        {hasSelection ? (
          <CheckCircle2 className="h-8 w-8 text-emerald-600" aria-hidden />
        ) : (
          <ImagePlus className="h-8 w-8 text-[#d9aa2b]" aria-hidden />
        )}
        <span className="mt-3 text-sm font-black text-[#021126]">
          {hasSelection
            ? `${selectedFiles.length} ${selectedFiles.length === 1 ? "imagem selecionada" : "imagens selecionadas"}`
            : label}
        </span>
        <span className="mt-1 text-xs text-[#6c7b89]">
          {hasSelection ? "Clique para substituir a selecao" : "JPG, PNG, WEBP ou GIF"}
        </span>
        <input
          name={name}
          type="file"
          accept="image/*"
          multiple={multiple}
          className="sr-only"
          onChange={(event) => handleSelection(event.target.files)}
        />
      </label>

      {visibleImages.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {visibleImages.map((src, index) => (
            <div
              key={`${src}-${index}`}
              className="relative aspect-square overflow-hidden rounded-lg border border-[#d8e0e8] bg-white"
            >
              <Image
                src={src}
                alt={`${label} ${index + 1}`}
                fill
                unoptimized={src.startsWith("blob:")}
                className="object-cover"
              />
              <span className="absolute bottom-1 left-1 rounded bg-[#021126]/85 px-2 py-1 text-[10px] font-bold text-white">
                {hasSelection ? "Nova" : "Salva"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
