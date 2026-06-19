"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { UserRole, UserStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { clearSession, createSession, getSessionUser, requireAdmin } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { getPermissionMap } from "@/lib/permissions";
import { makeSlug } from "@/lib/slug";
import {
  importProductsFromXlsx,
} from "@/lib/product-import";
import {
  emptyProductImportResult,
  type ProductImportResult,
} from "@/lib/product-import-types";
import { saveUploadedImage, saveUploadedImages } from "@/lib/upload";

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function numberValue(formData: FormData, key: string) {
  const value = text(formData, key);
  return value ? Number(value) || 0 : 0;
}

export async function login(formData: FormData) {
  const email = text(formData, "email")?.toLowerCase();
  const password = text(formData, "password");
  const next = text(formData, "next") || "/admin";

  if (!email || !password) {
    redirect(`/login?erro=1&next=${encodeURIComponent(next)}`);
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || user.status !== "ACTIVE" || !verifyPassword(password, user.passwordHash)) {
    redirect(`/login?erro=1&next=${encodeURIComponent(next)}`);
  }

  await createSession({
    id: user.id,
    name: user.name,
    company: user.company,
    email: user.email,
    role: user.role,
  });

  if (user.role === "ADMIN") redirect("/admin");
  redirect("/catalogo");
}

export async function logout() {
  await clearSession();
  redirect("/catalogo");
}

export async function createLead(formData: FormData) {
  const user = await getSessionUser();
  const permissions = await getPermissionMap(user?.role || "VISITANTE");
  if (!permissions.quoteButton) {
    throw new Error("Seu perfil nao tem permissao para solicitar orcamento.");
  }

  const nome = text(formData, "nome");
  const telefone = text(formData, "telefone");

  if (!nome || !telefone) {
    throw new Error("Nome e telefone sao obrigatorios.");
  }

  await prisma.leadOrcamento.create({
    data: {
      nome,
      telefone,
      empresa: text(formData, "empresa"),
      email: text(formData, "email"),
      cidade: text(formData, "cidade"),
      estado: text(formData, "estado"),
      produtoId: text(formData, "produtoId"),
      mensagem: text(formData, "mensagem"),
      origem: text(formData, "origem") || "catalogo",
    },
  });

  revalidatePath("/admin/leads");
  redirect("/catalogo?lead=enviado");
}

export async function saveProduct(formData: FormData) {
  await requireAdmin();

  const id = text(formData, "id");
  const nome = text(formData, "nome");
  const codigoInterno = text(formData, "codigoInterno");
  const categoriaId = text(formData, "categoriaId");
  const marcaId = text(formData, "marcaId");

  if (!nome || !codigoInterno || !categoriaId || !marcaId) {
    throw new Error("Produto precisa de nome, codigo, categoria e marca.");
  }

  const current = id ? await prisma.produto.findUnique({ where: { id } }) : null;
  const mainImage =
    (await saveUploadedImage(formData.get("imagemPrincipal") as File | null)) ||
    current?.imagemPrincipal ||
    null;
  const extraFiles = formData.getAll("imagensExtras").filter((file): file is File => file instanceof File);
  const newExtras = await saveUploadedImages(extraFiles);
  const existingExtras = current?.imagensExtras ?? [];
  const aplicacaoIds = formData
    .getAll("aplicacoes")
    .filter((value): value is string => typeof value === "string" && value.length > 0);

  const desiredSlug = text(formData, "slug") || nome;
  const data = {
    nome,
    slug: makeSlug(desiredSlug),
    codigoInterno,
    categoriaId,
    marcaId,
    descricaoCurta: text(formData, "descricaoCurta"),
    descricaoCompleta: text(formData, "descricaoCompleta"),
    ca: text(formData, "ca"),
    ean: text(formData, "ean"),
    ncm: text(formData, "ncm"),
    caixaMaster: text(formData, "caixaMaster"),
    imagemPrincipal: mainImage,
    imagensExtras: [...existingExtras, ...newExtras],
    preco: text(formData, "preco"),
    estoque: text(formData, "estoque") ? numberValue(formData, "estoque") : null,
    condicaoComercial: text(formData, "condicaoComercial"),
    prazoEntrega: text(formData, "prazoEntrega"),
    fichaTecnica: text(formData, "fichaTecnica"),
    manualPdf: text(formData, "manualPdf"),
    observacaoComercial: text(formData, "observacaoComercial"),
    margem: text(formData, "margem"),
    ativo: formData.get("ativo") === "on",
    destaque: formData.get("destaque") === "on",
    ordem: numberValue(formData, "ordem"),
    observacaoInterna: text(formData, "observacaoInterna"),
  };

  const product = id
    ? await prisma.produto.update({ where: { id }, data })
    : await prisma.produto.create({ data });

  await prisma.produtoAplicacao.deleteMany({ where: { produtoId: product.id } });
  if (aplicacaoIds.length > 0) {
    await prisma.produtoAplicacao.createMany({
      data: aplicacaoIds.map((aplicacaoId) => ({ produtoId: product.id, aplicacaoId })),
      skipDuplicates: true,
    });
  }

  revalidatePath("/catalogo");
  revalidatePath("/admin/produtos");
  redirect("/admin/produtos");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  if (!id) return;
  await prisma.produto.delete({ where: { id } });
  revalidatePath("/catalogo");
  revalidatePath("/admin/produtos");
}

export async function importProducts(
  _previousState: ProductImportResult,
  formData: FormData,
): Promise<ProductImportResult> {
  await requireAdmin();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { ...emptyProductImportResult, message: "Selecione uma planilha XLSX." };
  }

  try {
    const result = await importProductsFromXlsx(file);
    revalidatePath("/catalogo");
    revalidatePath("/admin");
    revalidatePath("/admin/produtos");
    return result;
  } catch {
    return {
      ...emptyProductImportResult,
      message: "Nao foi possivel ler a planilha. Verifique o arquivo e tente novamente.",
    };
  }
}

export async function saveCategory(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  const nome = text(formData, "nome");
  if (!nome) throw new Error("Nome obrigatorio.");

  const current = id ? await prisma.categoria.findUnique({ where: { id } }) : null;
  const imagem = (await saveUploadedImage(formData.get("imagem") as File | null, "categories")) || current?.imagem || null;
  const data = {
    nome,
    slug: text(formData, "slug") || makeSlug(nome),
    descricao: text(formData, "descricao"),
    imagem,
    ordem: numberValue(formData, "ordem"),
    ativo: formData.get("ativo") === "on",
  };

  if (id) await prisma.categoria.update({ where: { id }, data });
  else await prisma.categoria.create({ data });

  revalidatePath("/catalogo");
  revalidatePath("/admin/categorias");
}

export async function saveBrand(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  const nome = text(formData, "nome");
  if (!nome) throw new Error("Nome obrigatorio.");

  const current = id ? await prisma.marca.findUnique({ where: { id } }) : null;
  const logo = (await saveUploadedImage(formData.get("logo") as File | null, "brands")) || current?.logo || null;
  const data = {
    nome,
    slug: text(formData, "slug") || makeSlug(nome),
    logo,
    ativo: formData.get("ativo") === "on",
  };

  if (id) await prisma.marca.update({ where: { id }, data });
  else await prisma.marca.create({ data });

  revalidatePath("/catalogo");
  revalidatePath("/admin/marcas");
}

export async function saveApplication(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  const nome = text(formData, "nome");
  if (!nome) throw new Error("Nome obrigatorio.");

  const data = {
    nome,
    slug: text(formData, "slug") || makeSlug(nome),
    tipo: text(formData, "tipo"),
    ativo: formData.get("ativo") === "on",
  };

  if (id) await prisma.aplicacao.update({ where: { id }, data });
  else await prisma.aplicacao.create({ data });

  revalidatePath("/catalogo");
  revalidatePath("/admin/aplicacoes");
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  if (!id) return;
  await prisma.categoria.delete({ where: { id } });
  revalidatePath("/catalogo");
  revalidatePath("/admin/categorias");
}

export async function deleteBrand(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  if (!id) return;
  await prisma.marca.delete({ where: { id } });
  revalidatePath("/catalogo");
  revalidatePath("/admin/marcas");
}

export async function deleteApplication(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  if (!id) return;
  await prisma.aplicacao.delete({ where: { id } });
  revalidatePath("/catalogo");
  revalidatePath("/admin/aplicacoes");
}

export async function saveUser(formData: FormData) {
  await requireAdmin();

  const id = text(formData, "id");
  const name = text(formData, "name");
  const email = text(formData, "email")?.toLowerCase();
  const role = text(formData, "role") as UserRole | null;
  const status = text(formData, "status") as UserStatus | null;
  const password = text(formData, "password");

  if (!name || !email || !role || !status) {
    throw new Error("Usuario precisa de nome, e-mail, perfil e status.");
  }

  if (!id && !password) {
    throw new Error("Senha obrigatoria para novo usuario.");
  }

  await prisma.user.upsert({
    where: { id: id || "__new_user__" },
    update: {
      name,
      company: text(formData, "company"),
      email,
      role,
      status,
      notes: text(formData, "notes"),
      ...(password ? { passwordHash: hashPassword(password) } : {}),
    },
    create: {
      name,
      company: text(formData, "company"),
      email,
      role,
      status,
      notes: text(formData, "notes"),
      passwordHash: hashPassword(password || crypto.randomUUID()),
    },
  });

  revalidatePath("/admin/usuarios");
  redirect("/admin/usuarios");
}

export async function deleteUser(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  if (!id) return;
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/usuarios");
}

export async function savePermissions(formData: FormData) {
  await requireAdmin();

  const rows = await prisma.productFieldPermission.findMany();
  for (const row of rows) {
    await prisma.productFieldPermission.update({
      where: { id: row.id },
      data: {
        visibleToVisitor: formData.get(`${row.fieldKey}:VISITANTE`) === "on",
        visibleToClient: formData.get(`${row.fieldKey}:CLIENTE`) === "on",
        visibleToRepresentative: formData.get(`${row.fieldKey}:REPRESENTANTE`) === "on",
        visibleToAdmin: formData.get(`${row.fieldKey}:ADMIN`) === "on",
      },
    });
  }

  revalidatePath("/catalogo");
  revalidatePath("/admin/permissoes");
}
