import { cookies } from "next/headers";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { orderCookie } from "@/lib/commerce";
import { hashToken } from "@/lib/commerce-validation";
import { validPaymentUrl } from "@/lib/paystack";
import { money } from "@/lib/catalogue";
import {
  VerifyOrder,
  ClearPurchasedItems,
} from "@/components/store/OrderActions";
export const dynamic = "force-dynamic";
export const metadata = { title: "Your test order", referrer: "no-referrer" };
export default async function Page({
  params,
}: {
  params: { reference: string };
}) {
  const valid = /^RE-[A-F0-9]{20}$/.test(params.reference);
  const token = valid
    ? cookies().get(orderCookie(params.reference))?.value
    : undefined;
  const db = getDb();
  const order =
    db && token
      ? await db.order
          .findFirst({
            where: {
              reference: params.reference,
              accessTokenHash: hashToken(token),
            },
            include: {
              payments: true,
              refund: true,
              items: true,
              delivery: true,
              events: { orderBy: { createdAt: "asc" } },
            },
          })
          .catch(() => null)
      : null;
  if (!order)
    return (
      <main id="main" className="page-wrap empty">
        <h1>Private order access</h1>
        <p>
          Use your order reference and private access code to view this order.
          No order details are available without verification.
        </p>
        <Link className="button dark" href="/track-order">
          Access your order
        </Link>
      </main>
    );
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
  const paid = order.paymentStatus === "PAID";
  return (
    <main id="main" className="page-wrap">
      {paid && order.fulfillmentStatus !== "PAYMENT_REVIEW" && (
        <ClearPurchasedItems
          checkoutKey={order.checkoutKey}
          items={order.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          }))}
        />
      )}
      <div className="page-heading">
        <span className="eyebrow">RAHAT ENERGY · TEST ORDER</span>
        <h1>{paid ? "Payment verified." : "Your order, in view."}</h1>
        <p>
          Order reference: <strong>{order.reference}</strong>
        </p>
      </div>
      <div
        className={
          order.fulfillmentStatus === "PAYMENT_REVIEW"
            ? "notice error"
            : "notice"
        }
      >
        {order.fulfillmentStatus === "PAYMENT_REVIEW"
          ? "A test payment was captured after the stock reservation expired or was released. Staff review is required; fulfillment is blocked."
          : paid
            ? "Your payment was verified directly with Paystack in test mode. No live funds were charged."
            : `Payment status: ${order.paymentStatus}. A browser redirect alone does not confirm payment.`}
      </div>
      {order.cancelledAt && (
        <p className="notice" style={{ marginTop: 16 }}>
          This order was cancelled. Cancellation and refund verification are
          tracked separately; review the payment status below.
        </p>
      )}
      <div className="cart-layout">
        <div>
          <h2 style={{ fontSize: 30, marginBottom: 20 }}>Your selection</h2>
          {order.items.map((i) => (
            <div className="checkout-line" key={i.id}>
              <span>
                {i.quantity} × {i.name}
                <small className="muted" style={{ display: "block" }}>
                  Unit price {money(i.unitPriceKobo)}
                </small>
              </span>
              <strong>{money(i.quantity * i.unitPriceKobo)}</strong>
            </div>
          ))}
          <section className="checkout-form-section">
            <h2>Contact & delivery</h2>
            <p>
              {customer.name}
              <br />
              {customer.email}
              <br />
              {customer.phone}
            </p>
            <p style={{ marginTop: 15 }}>
              {address?.optionLabel}
              <br />
              {order.delivery?.method === "PICKUP"
                ? address?.pickupAddress
                : [address?.line1, address?.city, address?.state]
                    .filter(Boolean)
                    .join(", ")}
            </p>
          </section>
          <section className="checkout-form-section">
            <h2>Order history</h2>
            <ol className="order-history">
              {order.events.map((e) => (
                <li key={e.id}>
                  <span>{e.event.replaceAll("_", " ").toLowerCase()}</span>
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
        </div>
        <aside className="order-summary">
          <h2>Order status</h2>
          <dl>
            <div>
              <dt>Payment</dt>
              <dd>{order.paymentStatus}</dd>
            </div>
            <div>
              <dt>Fulfillment</dt>
              <dd>{order.fulfillmentStatus.replaceAll("_", " ")}</dd>
            </div>
            <div>
              <dt>Delivery</dt>
              <dd>{order.delivery?.status.replaceAll("_", " ")}</dd>
            </div>
            <div>
              <dt>Subtotal</dt>
              <dd>{money(order.subtotalKobo)}</dd>
            </div>
            <div>
              <dt>Delivery / collection</dt>
              <dd>{money(order.deliveryFeeKobo)}</dd>
            </div>
          </dl>
          <div className="summary-total">
            <span>Total</span>
            <strong>{money(order.totalKobo)}</strong>
          </div>
          {!paid && <VerifyOrder reference={order.reference} />}
          {order.paymentStatus === "PENDING" &&
            order.expiresAt.getTime() > Date.now() &&
            order.payments[0]?.authorizationUrl &&
            validPaymentUrl(order.payments[0].authorizationUrl) && (
              <a
                className="button lime wide"
                href={order.payments[0].authorizationUrl}
              >
                Continue test payment
              </a>
            )}
          <details className="recovery-code">
            <summary>Private order access code</summary>
            <p>
              Save this code privately to restore order access on another
              device.
            </p>
            <code>{token}</code>
          </details>
          <p className="small muted" style={{ marginTop: 20 }}>
            A confirmation email is sent only when the independent email service
            is configured. Keep your reference and access code.
          </p>
        </aside>
      </div>
    </main>
  );
}
