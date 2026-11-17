import { getDb } from "@/lib/db";
export const runtime = "nodejs";
export async function GET(req: Request, { params }: { params: { id: string } }) {
  if (!/^[a-f0-9]{64}$/.test(params.id)) return new Response(null, { status: 404 });
  const db = getDb(); if (!db) return new Response(null, { status: 503 });
  try {
    const width = Number(new URL(req.url).searchParams.get("w") || 1600);
    const field = width <= 160 ? "thumbnail" : width <= 640 ? "medium" : "data";
    const image = await db.productImage.findUnique({ where: { id: params.id }, select: { [field]: true } });
    if (!image) return new Response(null, { status: 404 });
    const etag = `"${params.id}-${field}"`;
    const headers = { "Content-Type": "image/webp", "Cache-Control": "public, max-age=31536000, immutable", ETag: etag, "X-Content-Type-Options": "nosniff" };
    if (req.headers.get("if-none-match") === etag) return new Response(null, { status: 304, headers });
    return new Response(new Uint8Array(image[field]), { headers });
  } catch { return new Response(null, { status: 503 }); }
}
