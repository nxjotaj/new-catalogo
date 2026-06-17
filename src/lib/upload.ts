import { mkdir, writeFile } from "fs/promises";
import path from "path";

const validImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function saveUploadedImage(file: File | null, folder = "products") {
  if (!file || file.size === 0) return null;
  if (!validImageTypes.has(file.type)) {
    throw new Error("Formato de imagem invalido.");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const extension = path.extname(file.name) || `.${file.type.split("/")[1]}`;
  const safeName = `${Date.now()}-${crypto.randomUUID()}${extension.toLowerCase()}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, safeName), bytes);

  return `/uploads/${folder}/${safeName}`;
}

export async function saveUploadedImages(files: File[], folder = "products") {
  const saved: string[] = [];

  for (const file of files) {
    const url = await saveUploadedImage(file, folder);
    if (url) saved.push(url);
  }

  return saved;
}
