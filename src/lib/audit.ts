import type { Prisma } from "@/generated/prisma/client";
import type { SessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRequestContext } from "@/lib/security";

export async function logAudit({
  actor,
  action,
  entityType,
  entityId,
  metadata,
}: {
  actor?: SessionUser | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
}) {
  try {
    const context = await getRequestContext();
    await prisma.auditLog.create({
      data: {
        actorUserId: actor?.id || null,
        actorEmail: actor?.email || null,
        action,
        entityType,
        entityId: entityId || null,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        metadata,
      },
    });
  } catch (error) {
    console.error("Audit log failure", error);
  }
}
