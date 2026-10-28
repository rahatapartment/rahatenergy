import { getDb } from "./db";
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
const globalLimits = globalThis as unknown as {
  energyLimits?: Map<string, { count: number; until: number }>;
};
const limits = (globalLimits.energyLimits ??= new Map());
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  for (const [k, v] of limits) if (v.until < now) limits.delete(k);
  const row = limits.get(key);
  if (!row) {
    limits.set(key, { count: 1, until: now + windowMs });
    return true;
  }
  row.count++;
  return row.count <= limit;
}
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    const configured = process.env.NEXT_PUBLIC_APP_URL;
    if (configured) return origin === new URL(configured).origin;
    const url = new URL(req.url);
    const host = req.headers.get("host");
    return origin === (host ? `${url.protocol}//${host}` : url.origin);
  } catch {
    return false;
  }
}
export function unavailable() {
  return NextResponse.json(
    {
      error:
        "The independent data service is not available. Please try again after configuration.",
    },
    { status: 503 },
  );
}

export async function limitRequest(
  key: string,
  limit: number,
  windowMs: number,
) {
  const db = getDb();
  if (!db) return rateLimit(key, limit, windowMs);
  try {
    const id = createHash("sha256").update(key).digest("hex");
    const rows = await db.$queryRaw<
      { count: number }[]
    >`INSERT INTO "RateLimitBucket" ("id","count","expiresAt") VALUES (${id},1,NOW()+(${windowMs} * INTERVAL '1 millisecond')) ON CONFLICT ("id") DO UPDATE SET "count"=CASE WHEN "RateLimitBucket"."expiresAt"<=NOW() THEN 1 ELSE "RateLimitBucket"."count"+1 END,"expiresAt"=CASE WHEN "RateLimitBucket"."expiresAt"<=NOW() THEN NOW()+(${windowMs} * INTERVAL '1 millisecond') ELSE "RateLimitBucket"."expiresAt" END RETURNING "count"`;
    return rows[0].count <= limit;
  } catch {
    return false;
  }
}
