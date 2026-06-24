import path from "path";

const validImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const imageExtensions: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};
const maxImageSize = 5 * 1024 * 1024;
const bucket = "catalog-media";

export function getStorageConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("SUPABASE_URL e chave do Supabase precisam estar configuradas.");
  }

  return { url: url.replace(/\/$/, ""), key };
}

function getStorageUploadConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("SUPABASE_URL e chave do Supabase precisam estar configuradas.");
  }

  return { url: url.replace(/\/$/, ""), key };
}

function encodeObjectPath(objectPath: string) {
  return objectPath.split("/").map(encodeURIComponent).join("/");
}

function matchesImageSignature(type: string, bytes: Uint8Array) {
  if (type === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (type === "image/png") {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    );
  }
  if (type === "image/webp") {
    return (
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    );
  }
  if (type === "image/gif") {
    return (
      bytes[0] === 0x47 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x38 &&
      (bytes[4] === 0x37 || bytes[4] === 0x39) &&
      bytes[5] === 0x61
    );
  }
  return false;
}

export async function saveUploadedImage(file: File | null, folder = "products") {
  if (!file || file.size === 0) return null;
  if (!validImageTypes.has(file.type)) {
    throw new Error("Formato de imagem invalido. Use JPG, PNG, WEBP ou GIF.");
  }
  if (file.size > maxImageSize) {
    throw new Error("A imagem excede o limite de 5 MB.");
  }

  const buffer = new Uint8Array(await file.arrayBuffer());
  if (!matchesImageSignature(file.type, buffer)) {
    throw new Error("O arquivo enviado nao parece ser uma imagem valida.");
  }

  const { url, key } = getStorageUploadConfig();
  const extension = imageExtensions[file.type] || path.extname(file.name).toLowerCase();
  const safeFolder = folder.replace(/[^a-z0-9/_-]/gi, "-").toLowerCase();
  const objectPath = `${safeFolder}/${Date.now()}-${crypto.randomUUID()}${extension}`;
  const encodedPath = encodeObjectPath(objectPath);

  const response = await fetch(`${url}/storage/v1/object/${bucket}/${encodedPath}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": file.type,
      "x-upsert": "false",
    },
    body: buffer,
  });

  if (!response.ok) {
    const details = await response.text();
    console.error("Supabase Storage upload failed", response.status, details);
    throw new Error("Nao foi possivel enviar a imagem para o armazenamento.");
  }

  return `${url}/storage/v1/object/public/${bucket}/${encodedPath}`;
}

export async function saveUploadedImages(files: File[], folder = "products") {
  return Promise.all(
    files
      .filter((file) => file.size > 0)
      .map((file) => saveUploadedImage(file, folder)),
  ).then((urls) => urls.filter((url): url is string => Boolean(url)));
}
