import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { DeliveryOptions } from "@/components/admin/DeliveryOptions";
import { operationsAccess } from "@/lib/operations-access";
import {
  Disconnected,
  ListFilters,
  Pagination,
  listParams,
} from "@/components/admin/OperationsViews";
export const dynamic = "force-dynamic";
export const metadata = { title: "Delivery operations" };
const statuses = [
  "PENDING",
  "PREPARING",
  "READY_FOR_DISPATCH",
  "READY_FOR_PICKUP",
  "DISPATCHED",
  "OUT_FOR_DELIVERY",
  "FAILED_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];
export default async function Page({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; page?: string };
}) {
  const { actor, db } = await operationsAccess();
  const p = listParams(searchParams, statuses);
  const where = {
    ...(p.status === "ALL" ? {} : { status: p.status }),
    ...(p.q
      ? {
          order: { reference: { contains: p.q, mode: "insensitive" as const } },
        }
      : {}),
  };
  const data = db
    ? await Promise.all([
        db.delivery.findMany({
          where,
          include: {
            order: { select: { reference: true, customerSnapshot: true } },
          },
          orderBy: { updatedAt: "desc" },
          skip: (p.page - 1) * 20,
          take: 20,
        }),
        db.delivery.count({ where }),
        db.deliveryOption.findMany({ orderBy: { label: "asc" } }),
      ]).catch(() => null)
    : null;
  return (
    <AdminShell title="Deliveries" authenticated={!!actor}>
      {!data ? (
        <Disconnected />
      ) : (
        <>
          <ListFilters query={p.q} status={p.status} statuses={statuses} />
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ORDER</th>
                  <th>RECIPIENT</th>
                  <th>METHOD</th>
                  <th>STATUS</th>
                  <th>TRACKING</th>
                  <th>DETAILS</th>
                </tr>
              </thead>
              <tbody>
                {data[0].map((d) => (
                  <tr key={d.id}>
                    <td>{d.order.reference}</td>
                    <td>
                      {(d.order.customerSnapshot as { name: string }).name}
                    </td>
                    <td>{d.method}</td>
                    <td>{d.status}</td>
                    <td>{d.trackingReference || "Not assigned"}</td>
                    <td>
                      <Link
                        className="inline-link"
                        href={`/admin/orders/${d.orderId}`}
                      >
                        Manage delivery →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data[1] && <p className="empty">No matching deliveries.</p>}
          </div>
          <Pagination
            page={p.page}
            total={data[1]}
            query={p.q}
            status={p.status}
          />
          <DeliveryOptions options={data[2]} />
        </>
      )}
    </AdminShell>
  );
}
