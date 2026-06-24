"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { UserRole, UserStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { clearSession, createSession, getSessionUser, requireAdmin } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { getPermissionMap } from "@/lib/permissions";
import { makeSlug } from "@/lib/slug";
import { createUniqueProductSlug } from "@/lib/product-slug";
import {
  importProductsFromXlsx,
} from "@/lib/product-import";
import {
  emptyProductImportResult,
  type ProductImportResult,
} from "@/lib/product-import-types";
import { saveUploadedImage, saveUploadedImages } from "@/lib/upload";
import { logAudit } from "@/lib/audit";
import {
  cleanupExpiredRateLimits,
  enforceRateLimit,
  RateLimitError,
  requireSameOrigin,
} from "@/lib/security";

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function numberValue(formData: FormData, key: string) {
  const value = text(formData, key);
  return value ? Number(value) || 0 : 0;
}

function actionUrl(path: string, type: "success" | "error", message: string) {
  const params = new URLSearchParams({ [type]: message });
  return `${path}?${params.toString()}`;
}

function actionErrorMessage(error: unknown, fallback: string) {
  if (error instanceof RateLimitError) {
    return error.message;
  }

  const prismaCode =
    typeof error === "object" && error !== null && "code" in error
      ? String(error.code)
      : null;

  if (prismaCode === "P2002") {
    return "Ja existe um cadastro utilizando um dos dados informados.";
  }
  if (prismaCode === "P2003") {
    return "Este registro esta vinculado a outros dados e nao pode ser excluido.";
  }
  if (prismaCode === "P2025") {
    return "O registro nao existe mais.";
  }

  if (error instanceof Error) {
    if (
      error.message.includes("EMAXCONNSESSION") ||
      error.message.includes("max clients") ||
      error.message.includes("ECONNREFUSED") ||
      error.message.includes("P1001")
    ) {
      return "O Supabase esta temporariamente indisponivel. Aguarde alguns segundos e tente novamente.";
    }
    if (error.message.startsWith("FORM:")) {
      return error.message.slice(5);
    }
    if (error.message.includes("Unique constraint")) {
      return "Ja existe um cadastro utilizando um dos dados informados.";
    }
    if (error.message.includes("Foreign key constraint")) {
      return "Este registro esta vinculado a outros dados e nao pode ser excluido.";
    }
    if (error.message.includes("Record to delete does not exist")) {
      return "O registro nao existe mais.";
    }
    if (
      error.message.includes("imagem") ||
      error.message.includes("armazenamento") ||
      error.message.includes("SUPABASE")
    ) {
      return error.message;
    }
  }
  return fallback;
}

async function requireSecureAdmin(action: string) {
  const context = await requireSameOrigin();
  const admin = await requireAdmin();
  await enforceRateLimit(`admin:${action}`, `${admin.id}:${context.ipAddress}`, 120, 60);
  return admin;
}

export async function login(formData: FormData) {
  const context = await requireSameOrigin();
  const email = text(formData, "email")?.toLowerCase();
  const password = text(formData, "password");
  const next = text(formData, "next") || "/admin";

  if (!email || !password) {
    redirect(`/login?erro=1&next=${encodeURIComponent(next)}`);
  }

  try {
    await enforceRateLimit("login", `${context.ipAddress}:${email}`, 8, 15 * 60);
    if (Math.random() < 0.02) await cleanupExpiredRateLimits();
  } catch {
    redirect(`/login?erro=1&next=${encodeURIComponent(next)}`);
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || user.status !== "ACTIVE" || !verifyPassword(password, user.passwordHash)) {
    redirect(`/login?erro=1&next=${encodeURIComponent(next)}`);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  await createSession({
    id: user.id,
    name: user.name,
    company: user.company,
    email: user.email,
    role: user.role,
  });

  await logAudit({
    actor: {
      id: user.id,
      name: user.name,
      company: user.company,
      email: user.email,
      role: user.role,
    },
    action: "LOGIN",
    entityType: "User",
    entityId: user.id,
  });

  if (user.role === "ADMIN") redirect("/admin");
  redirect("/catalogo");
}

export async function logout() {
  await requireSameOrigin();
  await clearSession();
  redirect("/catalogo");
}

export async function createLead(formData: FormData) {
  const context = await requireSameOrigin();
  try {
    await enforceRateLimit("lead", context.ipAddress, 10, 60 * 60);
  } catch {
    redirect("/catalogo?lead=erro");
  }

  const user = await getSessionUser();
  const permissions = await getPermissionMap(user?.role || "VISITANTE");
  if (!permissions.quoteButton) {
    redirect("/catalogo?lead=sem-permissao");
  }

  const nome = text(formData, "nome");
  const telefone = text(formData, "telefone");

  if (!nome || !telefone) {
    redirect("/catalogo?lead=erro");
  }

  try {
    const lead = await prisma.leadOrcamento.create({
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
    await logAudit({
      actor: user,
      action: "CREATE_LEAD",
      entityType: "LeadOrcamento",
      entityId: lead.id,
      metadata: { origem: lead.origem || "catalogo" },
    });
  } catch {
    redirect("/catalogo?lead=erro");
  }

  revalidatePath("/admin/leads");
  redirect("/catalogo?lead=enviado");
}

export async function saveProduct(formData: FormData) {
  const admin = await requireSecureAdmin("saveProduct");

  const id = text(formData, "id");
  const errorPath = id ? `/admin/produtos/${id}` : "/admin/produtos/novo";
  const nome = text(formData, "nome");
  const codigoInterno = text(formData, "codigoInterno");
  const categoriaId = text(formData, "categoriaId");
  const marcaId = text(formData, "marcaId");

  if (!nome || !codigoInterno || !categoriaId || !marcaId) {
    redirect(actionUrl(errorPath, "error", "Informe nome, codigo, categoria e marca."));
  }

  try {
    const current = id ? await prisma.produto.findUnique({ where: { id } }) : null;
    if (id && !current) {
      throw new Error("FORM:Produto nao encontrado.");
    }

    const duplicateCode = await prisma.produto.findFirst({
      where: {
        codigoInterno,
        ...(id ? { id: { not: id } } : {}),
      },
      select: { id: true },
    });
    if (duplicateCode) {
      throw new Error("FORM:O codigo interno ja pertence a outro produto.");
    }

    const mainImage =
      (await saveUploadedImage(formData.get("imagemPrincipal") as File | null)) ||
      current?.imagemPrincipal ||
      null;
    const extraFiles = formData
      .getAll("imagensExtras")
      .filter((file): file is File => file instanceof File && file.size > 0);
    const newExtras = await saveUploadedImages(extraFiles);
    const existingExtras = current?.imagensExtras ?? [];
    const aplicacaoIds = formData
      .getAll("aplicacoes")
      .filter((value): value is string => typeof value === "string" && value.length > 0);

    const uniqueSlug = await createUniqueProductSlug({
      name: nome,
      internalCode: codigoInterno,
      requestedSlug: text(formData, "slug"),
      excludeProductId: id,
    });
    const data = {
      nome,
      slug: uniqueSlug,
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

    let productId = id;
    await prisma.$transaction(async (transaction) => {
      const product = id
        ? await transaction.produto.update({ where: { id }, data })
        : await transaction.produto.create({ data });
      productId = product.id;

      await transaction.produtoAplicacao.deleteMany({
        where: { produtoId: product.id },
      });

      if (aplicacaoIds.length > 0) {
        await transaction.produtoAplicacao.createMany({
          data: aplicacaoIds.map((aplicacaoId) => ({
            produtoId: product.id,
            aplicacaoId,
          })),
          skipDuplicates: true,
        });
      }
    });
    await logAudit({
      actor: admin,
      action: id ? "UPDATE_PRODUCT" : "CREATE_PRODUCT",
      entityType: "Produto",
      entityId: productId,
      metadata: { codigoInterno, nome },
    });
  } catch (error) {
    redirect(
      actionUrl(
        errorPath,
        "error",
        actionErrorMessage(error, "Nao foi possivel salvar o produto."),
      ),
    );
  }

  revalidatePath("/catalogo");
  revalidatePath("/admin");
  revalidatePath("/admin/produtos");
  redirect(actionUrl("/admin/produtos", "success", "Produto salvo com sucesso."));
}

export async function deleteProduct(formData: FormData) {
  const admin = await requireSecureAdmin("deleteProduct");
  const id = text(formData, "id");
  if (!id) {
    redirect(actionUrl("/admin/produtos", "error", "Produto invalido."));
  }
  try {
    await prisma.produto.delete({ where: { id } });
    await logAudit({
      actor: admin,
      action: "DELETE_PRODUCT",
      entityType: "Produto",
      entityId: id,
    });
  } catch (error) {
    redirect(
      actionUrl(
        "/admin/produtos",
        "error",
        actionErrorMessage(error, "Nao foi possivel excluir o produto."),
      ),
    );
  }
  revalidatePath("/catalogo");
  revalidatePath("/admin");
  revalidatePath("/admin/produtos");
  redirect(actionUrl("/admin/produtos", "success", "Produto excluido com sucesso."));
}

export async function deactivateProduct(formData: FormData) {
  const admin = await requireSecureAdmin("deactivateProduct");
  const id = text(formData, "id");
  if (!id) {
    redirect(actionUrl("/admin/produtos", "error", "Produto invalido."));
  }

  try {
    await prisma.produto.update({
      where: { id },
      data: { ativo: false },
    });
    await logAudit({
      actor: admin,
      action: "DEACTIVATE_PRODUCT",
      entityType: "Produto",
      entityId: id,
    });
  } catch (error) {
    redirect(
      actionUrl(
        "/admin/produtos",
        "error",
        actionErrorMessage(error, "Nao foi possivel desativar o produto."),
      ),
    );
  }

  revalidatePath("/catalogo");
  revalidatePath("/admin");
  revalidatePath("/admin/produtos");
  redirect(actionUrl("/admin/produtos", "success", "Produto desativado com sucesso."));
}

export async function importProducts(
  _previousState: ProductImportResult,
  formData: FormData,
): Promise<ProductImportResult> {
  const admin = await requireSecureAdmin("importProducts");
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { ...emptyProductImportResult, message: "Selecione uma planilha XLSX." };
  }

  try {
    await enforceRateLimit("product-import", admin.id, 12, 60 * 60);
    const result = await importProductsFromXlsx(file);
    await logAudit({
      actor: admin,
      action: "IMPORT_PRODUCTS",
      entityType: "Produto",
      metadata: {
        fileName: file.name,
        created: result.created,
        updated: result.updated,
        failed: result.failed,
      },
    });
    revalidatePath("/catalogo");
    revalidatePath("/admin");
    revalidatePath("/admin/produtos");
    return result;
  } catch (error) {
    return {
      ...emptyProductImportResult,
      message: actionErrorMessage(
        error,
        "Nao foi possivel ler a planilha. Verifique o arquivo e tente novamente.",
      ),
    };
  }
}

export async function saveCategory(formData: FormData) {
  const admin = await requireSecureAdmin("saveCategory");
  const id = text(formData, "id");
  const nome = text(formData, "nome");
  if (!nome) {
    redirect(actionUrl("/admin/categorias", "error", "Informe o nome da categoria."));
  }

  try {
    const current = id ? await prisma.categoria.findUnique({ where: { id } }) : null;
    const imagem =
      (await saveUploadedImage(formData.get("imagem") as File | null, "categories")) ||
      current?.imagem ||
      null;
    const data = {
      nome,
      slug: makeSlug(text(formData, "slug") || nome),
      descricao: text(formData, "descricao"),
      imagem,
      ordem: numberValue(formData, "ordem"),
      ativo: formData.get("ativo") === "on",
    };

    const category = id
      ? await prisma.categoria.update({ where: { id }, data })
      : await prisma.categoria.create({ data });
    await logAudit({
      actor: admin,
      action: id ? "UPDATE_CATEGORY" : "CREATE_CATEGORY",
      entityType: "Categoria",
      entityId: category.id,
      metadata: { nome },
    });
  } catch (error) {
    redirect(
      actionUrl(
        "/admin/categorias",
        "error",
        actionErrorMessage(error, "Nao foi possivel salvar a categoria."),
      ),
    );
  }

  revalidatePath("/catalogo");
  revalidatePath("/admin/categorias");
  redirect(actionUrl("/admin/categorias", "success", "Categoria salva com sucesso."));
}

export async function saveBrand(formData: FormData) {
  const admin = await requireSecureAdmin("saveBrand");
  const id = text(formData, "id");
  const nome = text(formData, "nome");
  if (!nome) {
    redirect(actionUrl("/admin/marcas", "error", "Informe o nome da marca."));
  }

  try {
    const current = id ? await prisma.marca.findUnique({ where: { id } }) : null;
    const logo =
      (await saveUploadedImage(formData.get("logo") as File | null, "brands")) ||
      current?.logo ||
      null;
    const data = {
      nome,
      slug: makeSlug(text(formData, "slug") || nome),
      logo,
      ativo: formData.get("ativo") === "on",
    };

    const brand = id
      ? await prisma.marca.update({ where: { id }, data })
      : await prisma.marca.create({ data });
    await logAudit({
      actor: admin,
      action: id ? "UPDATE_BRAND" : "CREATE_BRAND",
      entityType: "Marca",
      entityId: brand.id,
      metadata: { nome },
    });
  } catch (error) {
    redirect(
      actionUrl(
        "/admin/marcas",
        "error",
        actionErrorMessage(error, "Nao foi possivel salvar a marca."),
      ),
    );
  }

  revalidatePath("/catalogo");
  revalidatePath("/admin/marcas");
  redirect(actionUrl("/admin/marcas", "success", "Marca salva com sucesso."));
}

export async function saveApplication(formData: FormData) {
  const admin = await requireSecureAdmin("saveApplication");
  const id = text(formData, "id");
  const nome = text(formData, "nome");
  if (!nome) {
    redirect(actionUrl("/admin/aplicacoes", "error", "Informe o nome da aplicacao."));
  }

  try {
    const data = {
      nome,
      slug: makeSlug(text(formData, "slug") || nome),
      tipo: text(formData, "tipo"),
      ativo: formData.get("ativo") === "on",
    };

    const application = id
      ? await prisma.aplicacao.update({ where: { id }, data })
      : await prisma.aplicacao.create({ data });
    await logAudit({
      actor: admin,
      action: id ? "UPDATE_APPLICATION" : "CREATE_APPLICATION",
      entityType: "Aplicacao",
      entityId: application.id,
      metadata: { nome },
    });
  } catch (error) {
    redirect(
      actionUrl(
        "/admin/aplicacoes",
        "error",
        actionErrorMessage(error, "Nao foi possivel salvar a aplicacao."),
      ),
    );
  }

  revalidatePath("/catalogo");
  revalidatePath("/admin/aplicacoes");
  redirect(actionUrl("/admin/aplicacoes", "success", "Aplicacao salva com sucesso."));
}

export async function deleteCategory(formData: FormData) {
  const admin = await requireSecureAdmin("deleteCategory");
  const id = text(formData, "id");
  if (!id) redirect(actionUrl("/admin/categorias", "error", "Categoria invalida."));
  try {
    await prisma.categoria.delete({ where: { id } });
    await logAudit({
      actor: admin,
      action: "DELETE_CATEGORY",
      entityType: "Categoria",
      entityId: id,
    });
  } catch (error) {
    redirect(
      actionUrl(
        "/admin/categorias",
        "error",
        actionErrorMessage(error, "Nao foi possivel excluir a categoria."),
      ),
    );
  }
  revalidatePath("/catalogo");
  revalidatePath("/admin/categorias");
  redirect(actionUrl("/admin/categorias", "success", "Categoria excluida com sucesso."));
}

export async function deleteBrand(formData: FormData) {
  const admin = await requireSecureAdmin("deleteBrand");
  const id = text(formData, "id");
  if (!id) redirect(actionUrl("/admin/marcas", "error", "Marca invalida."));
  try {
    await prisma.marca.delete({ where: { id } });
    await logAudit({
      actor: admin,
      action: "DELETE_BRAND",
      entityType: "Marca",
      entityId: id,
    });
  } catch (error) {
    redirect(
      actionUrl(
        "/admin/marcas",
        "error",
        actionErrorMessage(error, "Nao foi possivel excluir a marca."),
      ),
    );
  }
  revalidatePath("/catalogo");
  revalidatePath("/admin/marcas");
  redirect(actionUrl("/admin/marcas", "success", "Marca excluida com sucesso."));
}

export async function deleteApplication(formData: FormData) {
  const admin = await requireSecureAdmin("deleteApplication");
  const id = text(formData, "id");
  if (!id) redirect(actionUrl("/admin/aplicacoes", "error", "Aplicacao invalida."));
  try {
    await prisma.aplicacao.delete({ where: { id } });
    await logAudit({
      actor: admin,
      action: "DELETE_APPLICATION",
      entityType: "Aplicacao",
      entityId: id,
    });
  } catch (error) {
    redirect(
      actionUrl(
        "/admin/aplicacoes",
        "error",
        actionErrorMessage(error, "Nao foi possivel excluir a aplicacao."),
      ),
    );
  }
  revalidatePath("/catalogo");
  revalidatePath("/admin/aplicacoes");
  redirect(actionUrl("/admin/aplicacoes", "success", "Aplicacao excluida com sucesso."));
}

export async function saveUser(formData: FormData) {
  const admin = await requireSecureAdmin("saveUser");

  const id = text(formData, "id");
  const name = text(formData, "name");
  const email = text(formData, "email")?.toLowerCase();
  const role = text(formData, "role") as UserRole | null;
  const status = text(formData, "status") as UserStatus | null;
  const password = text(formData, "password");

  if (!name || !email || !role || !status) {
    redirect(
      actionUrl(
        "/admin/usuarios",
        "error",
        "Informe nome, e-mail, perfil e status do usuario.",
      ),
    );
  }

  if (!id && !password) {
    redirect(actionUrl("/admin/usuarios", "error", "Informe a senha do novo usuario."));
  }

  try {
    if (id) {
      await prisma.user.update({
        where: { id },
        data: {
          name,
          company: text(formData, "company"),
          email,
          role,
          status,
          notes: text(formData, "notes"),
          ...(password ? { passwordHash: hashPassword(password) } : {}),
        },
      });
      await logAudit({
        actor: admin,
        action: "UPDATE_USER",
        entityType: "User",
        entityId: id,
        metadata: { email, role, status },
      });
    } else {
      const user = await prisma.user.create({
        data: {
          name,
          company: text(formData, "company"),
          email,
          role,
          status,
          notes: text(formData, "notes"),
          passwordHash: hashPassword(password!),
        },
      });
      await logAudit({
        actor: admin,
        action: "CREATE_USER",
        entityType: "User",
        entityId: user.id,
        metadata: { email, role, status },
      });
    }
  } catch (error) {
    redirect(
      actionUrl(
        "/admin/usuarios",
        "error",
        actionErrorMessage(error, "Nao foi possivel salvar o usuario."),
      ),
    );
  }

  revalidatePath("/admin/usuarios");
  redirect(actionUrl("/admin/usuarios", "success", "Usuario salvo com sucesso."));
}

export async function deleteUser(formData: FormData) {
  const admin = await requireSecureAdmin("deleteUser");
  const id = text(formData, "id");
  if (!id) redirect(actionUrl("/admin/usuarios", "error", "Usuario invalido."));
  if (id === admin.id) {
    redirect(actionUrl("/admin/usuarios", "error", "Voce nao pode excluir sua propria conta."));
  }

  try {
    const target = await prisma.user.findUnique({
      where: { id },
      select: { role: true, status: true },
    });
    if (!target) {
      throw new Error("FORM:Usuario nao encontrado.");
    }
    if (target.role === "ADMIN" && target.status === "ACTIVE") {
      const activeAdmins = await prisma.user.count({
        where: { role: "ADMIN", status: "ACTIVE" },
      });
      if (activeAdmins <= 1) {
        throw new Error("FORM:Nao e permitido excluir o ultimo administrador ativo.");
      }
    }
    await prisma.user.delete({ where: { id } });
    await logAudit({
      actor: admin,
      action: "DELETE_USER",
      entityType: "User",
      entityId: id,
    });
  } catch (error) {
    redirect(
      actionUrl(
        "/admin/usuarios",
        "error",
        actionErrorMessage(error, "Nao foi possivel excluir o usuario."),
      ),
    );
  }
  revalidatePath("/admin/usuarios");
  redirect(actionUrl("/admin/usuarios", "success", "Usuario excluido com sucesso."));
}

export async function updateUserStatus(formData: FormData) {
  const admin = await requireSecureAdmin("updateUserStatus");
  const id = text(formData, "id");
  const status = text(formData, "status") as UserStatus | null;
  if (!id || !status) redirect(actionUrl("/admin/usuarios", "error", "Usuario invalido."));
  if (!["ACTIVE", "INACTIVE"].includes(status)) {
    redirect(actionUrl("/admin/usuarios", "error", "Status invalido."));
  }
  if (id === admin.id && status === "INACTIVE") {
    redirect(actionUrl("/admin/usuarios", "error", "Voce nao pode desativar sua propria conta."));
  }

  try {
    const target = await prisma.user.findUnique({
      where: { id },
      select: { role: true, status: true },
    });
    if (!target) {
      throw new Error("FORM:Usuario nao encontrado.");
    }
    if (target.role === "ADMIN" && target.status === "ACTIVE" && status === "INACTIVE") {
      const activeAdmins = await prisma.user.count({
        where: { role: "ADMIN", status: "ACTIVE" },
      });
      if (activeAdmins <= 1) {
        throw new Error("FORM:Nao e permitido desativar o ultimo administrador ativo.");
      }
    }

    await prisma.user.update({
      where: { id },
      data: { status },
    });
    await logAudit({
      actor: admin,
      action: status === "ACTIVE" ? "ACTIVATE_USER" : "DEACTIVATE_USER",
      entityType: "User",
      entityId: id,
      metadata: { status },
    });
  } catch (error) {
    redirect(
      actionUrl(
        "/admin/usuarios",
        "error",
        actionErrorMessage(error, "Nao foi possivel alterar o status do usuario."),
      ),
    );
  }

  revalidatePath("/admin/usuarios");
  redirect(
    actionUrl(
      "/admin/usuarios",
      "success",
      status === "ACTIVE" ? "Usuario ativado com sucesso." : "Usuario desativado com sucesso.",
    ),
  );
}

export async function savePermissions(formData: FormData) {
  const admin = await requireSecureAdmin("savePermissions");

  try {
    const rows = await prisma.productFieldPermission.findMany();
    await prisma.$transaction(
      rows.map((row) =>
        prisma.productFieldPermission.update({
          where: { id: row.id },
          data: {
            visibleToVisitor: formData.get(`${row.fieldKey}:VISITANTE`) === "on",
            visibleToClient: formData.get(`${row.fieldKey}:CLIENTE`) === "on",
            visibleToRepresentative:
              formData.get(`${row.fieldKey}:REPRESENTANTE`) === "on",
            visibleToAdmin: formData.get(`${row.fieldKey}:ADMIN`) === "on",
          },
        }),
      ),
    );
    await logAudit({
      actor: admin,
      action: "UPDATE_PERMISSIONS",
      entityType: "ProductFieldPermission",
    });
  } catch (error) {
    redirect(
      actionUrl(
        "/admin/permissoes",
        "error",
        actionErrorMessage(error, "Nao foi possivel salvar as permissoes."),
      ),
    );
  }

  revalidatePath("/catalogo");
  revalidatePath("/admin/permissoes");
  redirect(actionUrl("/admin/permissoes", "success", "Permissoes salvas com sucesso."));
}
