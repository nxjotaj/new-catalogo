import { createHash } from "crypto";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export class RateLimitError extends Error {
  constructor(message = "Muitas tentativas. Aguarde alguns minutos e tente novamente.") {
    super(message);
    this.name = "RateLimitError";
  }
}

function hashKey(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export async function requestHeaders() {
  return headers();
}

export function clientIpFromHeaders(headerList: Headers) {
  const forwarded = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (
    forwarded ||
    headerList.get("x-real-ip") ||
    headerList.get("cf-connecting-ip") ||
    "unknown"
  );
}

export async function getRequestContext() {
  const headerList = await requestHeaders();
  return {
    ipAddress: clientIpFromHeaders(headerList),
    userAgent: headerList.get("user-agent") || null,
    host: headerList.get("x-forwarded-host") || headerList.get("host") || null,
    origin: headerList.get("origin"),
    referer: headerList.get("referer"),
    protocol: headerList.get("x-forwarded-proto") || "https",
  };
}

export async function requireSameOrigin() {
  const context = await getRequestContext();
  const host = context.host;
  if (!host) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Origem da requisicao nao identificada.");
    }
    return context;
  }

  const expectedOrigins = new Set<string>();
  expectedOrigins.add(`${context.protocol}://${host}`);
  expectedOrigins.add(`https://${host}`);
  expectedOrigins.add(`http://${host}`);

  if (process.env.NEXT_PUBLIC_APP_URL) {
    expectedOrigins.add(process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, ""));
  }
  if (process.env.VERCEL_URL) {
    expectedOrigins.add(`https://${process.env.VERCEL_URL.replace(/\/$/, "")}`);
  }

  const source = context.origin || context.referer;
  if (!source) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Origem da requisicao nao informada.");
    }
    return context;
  }

  const sourceOrigin = new URL(source).origin;
  if (!expectedOrigins.has(sourceOrigin)) {
    throw new Error("Requisicao bloqueada por origem invalida.");
  }

  return context;
}

export async function enforceRateLimit(
  scope: string,
  identifier: string,
  limit: number,
  windowSeconds: number,
) {
  const key = hashKey(`${scope}:${identifier}`);
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowSeconds * 1000);

  const current = await prisma.securityRateLimit.findUnique({ where: { key } });
  if (!current || current.resetAt <= now) {
    await prisma.securityRateLimit.upsert({
      where: { key },
      create: { key, count: 1, resetAt },
      update: { count: 1, resetAt },
    });
    return;
  }

  if (current.count >= limit) {
    throw new RateLimitError();
  }

  await prisma.securityRateLimit.update({
    where: { key },
    data: { count: { increment: 1 } },
  });
}

export async function cleanupExpiredRateLimits() {
  await prisma.securityRateLimit.deleteMany({
    where: { resetAt: { lt: new Date(Date.now() - 60 * 60 * 1000) } },
  });
}
