import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { isAdmin, currentAdmin } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { fulfillmentTransitions } from "@/lib/commerce";
import { money } from "@/lib/catalogue";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  DeliveryEditor,
  OrderResolution,
} from "@/components/admin/OperationForms";
import { FulfillmentControl } from "@/components/admin/OrderManager";
export const dynamic = "force-dynamic";
export const metadata = { title: "Order details" };
export default async function Page({ params }: { params: { id: string } }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const actor = await currentAdmin();
  const db = getDb();
  const order = db
    ? await db.order
        .findUnique({
          where: { id: params.id },
          include: {
            items: true,
            payments: true,
            delivery: true,
            refund: true,
            events: { orderBy: { createdAt: "asc" } },
          },
        })
        .catch(() => null)
    : null;
  if (!order) notFound();
  const customer = order.customerSnapshot as {
    name: string;
    email: string;
    phone: string;
  };
  const address = order.delivery?.address as
    | {
        line1?: string;
        city?: string;
        state?: string;
        pickupAddress?: string;
        optionLabel?: string;
      }
    | undefined;
  const allowed =
    order.paymentStatus === "PAID"
      ? (fulfillmentTransitions[order.fulfillmentStatus] || []).filter((s) =>
          s === "READY_FOR_PICKUP"
            ? order.delivery?.method === "PICKUP"
            : s === "DISPATCHED"
              ? order.delivery?.method === "DELIVERY"
              : true,
        )
      : [];
  return (
    <AdminShell title={order.reference} authenticated>
      <Link href="/admin/orders" className="text-link">
        ← All orders
      </Link>
      <div className="metric-grid">
        {[
          ["Payment", order.paymentStatus],
          ["Fulfillment", order.fulfillmentStatus],
          ["Delivery", order.delivery?.status || "PENDING"],
          ["Total", money(order.totalKobo)],
        ].map(([label, value]) => (
          <div className="metric" key={label}>
            <span>{label}</span>
            <strong style={{ fontSize: 18 }}>{value}</strong>
          </div>
        ))}
      </div>
      {order.fulfillmentStatus === "PAYMENT_REVIEW" && (
        <div className="notice error">
          A verified test payment requires manual resolution. Stock was not
          deducted and fulfillment is blocked. Investigate the gateway record
          before arranging a new reservation or a refund.
        </div>
      )}
      {order.cancelledAt && (
        <section className="inventory-form">
          <h2>Cancellation record</h2>
          <p className="preserve-lines">{order.cancellationReason}</p>
          <p className="small muted">
            Recorded{" "}
            {new Intl.DateTimeFormat("en-NG", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "Africa/Lagos",
            }).format(order.cancelledAt)}{" "}
            WAT.{" "}
            {order.stockRestoredAt
              ? "Unshipped sold stock was restored."
              : "No sold stock was restored by this cancellation."}
          </p>
          {order.refund?.providerRefundId && (
            <p className="small">
              Verified test refund ID: {order.refund.providerRefundId}
            </p>
          )}
        </section>
      )}
      <section className="planning-panel">
        <div>
          <h2>Customer snapshot</h2>
          <p>
            {customer.name}
            <br />
            {customer.email}
            <br />
            {customer.phone}
          </p>
        </div>
        <div>
          <h2>Delivery snapshot</h2>
          <p>
            {address?.optionLabel}
            <br />
            {order.delivery?.method === "PICKUP"
              ? address?.pickupAddress
              : [address?.line1, address?.city, address?.state]
                  .filter(Boolean)
                  .join(", ")}
          </p>
        </div>
      </section>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>PRODUCT / SKU</th>
              <th>QTY</th>
              <th>UNIT PRICE</th>
              <th>LINE TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((i) => (
              <tr key={i.id}>
                <td>
                  {i.name}
                  <small>{i.sku}</small>
                </td>
                <td>{i.quantity}</td>
                <td>{money(i.unitPriceKobo)}</td>
                <td>{money(i.quantity * i.unitPriceKobo)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="small" style={{ marginTop: 20 }}>
        Subtotal {money(order.subtotalKobo)} · Delivery{" "}
        {money(order.deliveryFeeKobo)} · Total {money(order.totalKobo)}
      </p>
      <FulfillmentControl id={order.id} allowed={allowed} />
      {order.delivery && (
        <DeliveryEditor
          orderId={order.id}
          status={order.delivery.status}
          method={order.delivery.method}
          tracking={order.delivery.trackingReference || ""}
          version={order.delivery.version}
          eligible={
            order.paymentStatus === "PAID" &&
            !["CANCELLED", "DELIVERED", "PAYMENT_REVIEW"].includes(
              order.fulfillmentStatus,
            )
          }
        />
      )}
      {actor?.role === "OWNER" && (
        <OrderResolution
          id={order.id}
          reference={order.reference}
          review={
            order.fulfillmentStatus === "PAYMENT_REVIEW" && !order.cancelledAt
          }
          cancellable={
            !order.cancelledAt &&
            !["DISPATCHED", "DELIVERED"].includes(order.fulfillmentStatus) &&
            order.paymentStatus !== "REFUNDED"
          }
          refundStatus={order.refund?.status || null}
          amount={money(order.refund?.amountKobo ?? order.totalKobo)}
        />
      )}
      <section className="content-section">
        <h2>Payment references</h2>
        {order.payments.map((p) => (
          <p className="small" key={p.id}>
            {p.reference} · {p.status} · {money(p.amountKobo)}
          </p>
        ))}
        <h2 style={{ marginTop: 30 }}>Order history</h2>
        <ol className="order-history">
          {order.events.map((e) => (
            <li key={e.id}>
              <span>
                {e.event.replaceAll("_", " ")} · {e.actor}
              </span>
              <time>
                {new Intl.DateTimeFormat("en-NG", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: "Africa/Lagos",
                }).format(e.createdAt)}{" "}
                WAT
              </time>
            </li>
          ))}
        </ol>
      </section>
    </AdminShell>
  );
}
