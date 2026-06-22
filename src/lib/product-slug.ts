import { prisma } from "@/lib/prisma";
import { makeSlug } from "@/lib/slug";

type UniqueProductSlugInput = {
  name: string;
  internalCode: string;
  requestedSlug?: string | null;
  excludeProductId?: string | null;
};

export async function createUniqueProductSlug({
  name,
  internalCode,
  requestedSlug,
  excludeProductId,
}: UniqueProductSlugInput) {
  const base =
    makeSlug(requestedSlug || `${name}-${internalCode}`) ||
    makeSlug(`produto-${internalCode}`) ||
    `produto-${Date.now()}`;

  for (let suffix = 0; suffix < 1000; suffix += 1) {
    const candidate = suffix === 0 ? base : `${base}-${suffix + 1}`;
    const conflict = await prisma.produto.findFirst({
      where: {
        slug: candidate,
        ...(excludeProductId ? { id: { not: excludeProductId } } : {}),
      },
      select: { id: true },
    });

    if (!conflict) return candidate;
  }

  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}
