import path from "path";

const validImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const maxImageSize = 5 * 1024 * 1024;
const bucket = "catalog-media";

function storageConfig() {
  const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://jdxbxsufqjiinkfvvbda.supabase.co";
  const key =
    process.env.SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkeGJ4c3VmcWppaW5rZnZ2YmRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2NzM3OTAsImV4cCI6MjA5NzI0OTc5MH0.g40V1rpJ8_0URRcdxVC9EzRFrJzyKK1lFL7yh3HNeHY";

  return { url: url.replace(/\/$/, ""), key };
}

function encodeObjectPath(objectPath: string) {
  return objectPath.split("/").map(encodeURIComponent).join("/");
}

export async function saveUploadedImage(file: File | null, folder = "products") {
  if (!file || file.size === 0) return null;
  if (!validImageTypes.has(file.type)) {
    throw new Error("Formato de imagem invalido. Use JPG, PNG, WEBP ou GIF.");
  }
  if (file.size > maxImageSize) {
    throw new Error("A imagem excede o limite de 5 MB.");
  }

  const { url, key } = storageConfig();
  const extension = path.extname(file.name).toLowerCase() || `.${file.type.split("/")[1]}`;
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
    body: new Uint8Array(await file.arrayBuffer()),
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
