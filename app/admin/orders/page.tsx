import { Prisma } from "@prisma/client";
import { AdminShell } from "@/components/admin/AdminShell";
import { OrdersTable } from "@/components/admin/OrderManager";
import {
  Pagination,
  Disconnected,
  listParams,
} from "@/components/admin/OperationsViews";
import { operationsAccess } from "@/lib/operations-access";
export const dynamic = "force-dynamic";
export const metadata = { title: "Order management" };
const payments = ["PENDING", "PAID", "FAILED", "CANCELLED", "REFUNDED"];
const fulfillments = [
  "PENDING",
  "PROCESSING",
  "READY_FOR_PICKUP",
  "DISPATCHED",
  "DELIVERED",
  "CANCELLED",
  "PAYMENT_REVIEW",
];
export default async function Page({
  searchParams,
}: {
  searchParams: {
    q?: string;
    status?: string;
    page?: string;
    fulfillment?: string;
  };
}) {
  const { actor, db } = await operationsAccess();
  const p = listParams(searchParams, payments);
  const fulfillment = fulfillments.includes(searchParams.fulfillment || "")
    ? searchParams.fulfillment!
    : "ALL";
  let data = null;
  if (db) {
    try {
      const match = `%${p.q.replace(/[\\%_]/g, "\\$&")}%`;
      const where = Prisma.sql`WHERE ("reference" ILIKE ${match} OR "customerSnapshot"->>'name' ILIKE ${match} OR "customerSnapshot"->>'email' ILIKE ${match}) ${p.status === "ALL" ? Prisma.empty : Prisma.sql`AND "paymentStatus"=${p.status}`} ${fulfillment === "ALL" ? Prisma.empty : Prisma.sql`AND "fulfillmentStatus"=${fulfillment}`}`;
      const [ids, total] = await Promise.all([
        db.$queryRaw<{ id: string }[]>(
          Prisma.sql`SELECT "id" FROM "Order" ${where} ORDER BY "createdAt" DESC,"id" DESC LIMIT 20 OFFSET ${(p.page - 1) * 20}`,
        ),
        db.$queryRaw<{ count: bigint }[]>(
          Prisma.sql`SELECT count(*) AS count FROM "Order" ${where}`,
        ),
      ]);
      const orders = await db.order.findMany({
        where: { id: { in: ids.map((i) => i.id) } },
      });
      data = {
        orders: ids.map((row) => orders.find((o) => o.id === row.id)!),
        total: Number(total[0].count),
      };
    } catch {
      data = null;
    }
  }
  return (
    <AdminShell title="Orders" authenticated={!!actor}>
      {!data ? (
        <Disconnected />
      ) : (
        <>
          <form method="GET" className="shop-toolbar">
            <label className="search-field">
              <span className="sr-only">Search all orders</span>
              <input
                name="q"
                defaultValue={p.q}
                placeholder="Reference, customer or email"
                maxLength={100}
              />
            </label>
            <label className="sort-field">
              Payment
              <select name="status" defaultValue={p.status}>
                <option value="ALL">All payments</option>
                {payments.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="sort-field">
              Fulfillment
              <select name="fulfillment" defaultValue={fulfillment}>
                <option value="ALL">All fulfillment</option>
                {fulfillments.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <button className="button dark">Apply filters</button>
          </form>
          <OrdersTable
            pageMode
            orders={data.orders.map((o) => {
              const customer = o.customerSnapshot as {
                name: string;
                email: string;
              };
              return {
                id: o.id,
                reference: o.reference,
                name: customer.name,
                email: customer.email,
                totalKobo: o.totalKobo,
                paymentStatus: o.paymentStatus,
                fulfillmentStatus: o.fulfillmentStatus,
                createdAt: o.createdAt.toISOString(),
              };
            })}
          />
          <Pagination
            page={p.page}
            total={data.total}
            query={p.q}
            status={p.status}
            extra={{ fulfillment }}
          />
        </>
      )}
    </AdminShell>
  );
}
