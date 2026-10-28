import type { PrismaClient } from "@prisma/client";
const allowed = new Set([
  "Product",
  "Inventory",
  "InventoryMovement",
  "Customer",
  "Order",
  "OrderItem",
  "Payment",
  "Delivery",
  "Quotation",
  "AuditLog",
  "OrderEvent",
  "InventoryReservation",
  "DeliveryOption",
  "Notification",
  "Refund", "AdminUser", "RateLimitBucket", "JobRun",
  "_prisma_migrations",
]);
export async function assertEnergyDatabase(db: PrismaClient) {
  const tables = await db.$queryRaw<
    { tablename: string }[]
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;
  if (tables.some((t) => !allowed.has(t.tablename)))
    throw new Error("UNRELATED");
}
export function assertConnectionPair(runtime: string, direct: string) {
  const a = new URL(runtime),
    b = new URL(direct);
  const project = (url: URL) =>
    url.hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/)?.[1] ||
    (url.hostname.includes(".pooler.supabase.")
      ? decodeURIComponent(url.username).split(".").at(-1)
      : null);
  const pa = project(a),
    pb = project(b);
  if (a.pathname !== b.pathname) throw new Error("TARGET");
  if (pa || pb) {
    if (
      !pa ||
      !pb ||
      pa !== pb ||
      (process.env.ENERGY_SUPABASE_PROJECT_REF &&
        pa !== process.env.ENERGY_SUPABASE_PROJECT_REF)
    )
      throw new Error("TARGET");
  } else if (a.hostname !== b.hostname || a.port !== b.port)
    throw new Error("TARGET");
}
