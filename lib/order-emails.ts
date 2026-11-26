import type { Prisma, PrismaClient } from "@prisma/client";
import { processNotifications } from "./notifications";
import { money } from "./catalogue";
import { courierDeliveryFeeNote } from "./delivery-fees";

type EmailKind = "order-confirmation" | "order-fulfilled" | "sale-notification";
type EmailOrder = {
  id: string;
  reference: string;
  customerSnapshot: Prisma.JsonValue;
  totalKobo: number;
  deliveryFeeKobo: number;
  items: { name: string; quantity: number; unitPriceKobo: number }[];
  delivery: { method: string; address: Prisma.JsonValue } | null;
};
type EmailOptions = {
  test?: boolean;
  review?: boolean;
  paymentReference?: string;
};

const entities: Record<string, string> = {
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
};
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => entities[char]);

export const orderEmailKey = (kind: EmailKind, orderId: string) => `${kind}:${orderId}`;

function storefrontOrigin() {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_APP_URL ?? "");
    if (url.protocol === "https:" && !url.username && !url.password)
      return url.origin;
  } catch {
    // The reference remains available in the email without a storefront link.
  }
}

function renderSaleNotification(order: EmailOrder, options: EmailOptions) {
  const title = options.review ? "Payment received. Review required." : "New Rahat Energy sale";
  const subject = `${title} · ${order.reference}`;
  const customer = order.customerSnapshot as { name?: string; email?: string; phone?: string };
  const address = order.delivery?.address as {
    optionLabel?: string;
    pickupAddress?: string;
    line1?: string;
    city?: string;
    state?: string;
    courierCollectsFee?: boolean;
  } | null;
  const pickup = order.delivery?.method === "PICKUP";
  const fulfillment = pickup ? "Pickup" : order.delivery ? "Delivery" : "Not recorded";
  const location = pickup
    ? address?.pickupAddress
    : [address?.line1, address?.city, address?.state].filter(Boolean).join(", ");
  const contact = [
    ["Name", customer?.name],
    ["Email", customer?.email],
    ["Phone", customer?.phone],
  ];
  const delivery = [
    ["Method", address?.optionLabel || fulfillment],
    [pickup ? "Pickup address" : "Delivery address", location],
  ];
  const details = [
    ["Order reference", order.reference],
    ["Paystack reference", options.paymentReference],
  ].filter(([, value]) => value);
  const subtotal = money(order.items.reduce((sum, item) => sum + item.quantity * item.unitPriceKobo, 0));
  const deliveryFee = order.deliveryFeeKobo > 0 ? money(order.deliveryFeeKobo) : "";
  const courierNote = address?.courierCollectsFee ? courierDeliveryFeeNote : "";
  const total = money(order.totalKobo);
  const origin = storefrontOrigin();
  const destination = origin ? `${origin}/admin/orders/${encodeURIComponent(order.id)}` : "";
  const formatDetails = (fields: (string | undefined)[][]) =>
    fields.map(([label, value]) => `${label}: ${value || "Not recorded"}`).join("\n");
  const detailRows = (fields: (string | undefined)[][]) =>
    fields.map(([label, value]) => `<p style="margin:0 0 8px;overflow-wrap:anywhere"><strong>${escapeHtml(label ?? "")}</strong><br>${escapeHtml(value || "Not recorded")}</p>`).join("");
  const itemRows = order.items.map(item => `<tr>
<td style="border-bottom:1px solid #e2e8df;padding:12px 8px 12px 0;overflow-wrap:anywhere"><strong>${escapeHtml(item.name)}</strong><br><span style="color:#516458">${item.quantity} × ${money(item.unitPriceKobo)}</span></td>
<td align="right" style="border-bottom:1px solid #e2e8df;padding:12px 0;white-space:nowrap">${money(item.quantity * item.unitPriceKobo)}</td>
</tr>`).join("");
  const text = [
    title,
    formatDetails(details),
    `Customer\n${formatDetails(contact)}`,
    `Fulfillment\n${formatDetails(delivery)}`,
    order.items.map(item => `${item.quantity} × ${item.name} at ${money(item.unitPriceKobo)} each — ${money(item.quantity * item.unitPriceKobo)}`).join("\n"),
    `Items subtotal: ${subtotal}`,
    deliveryFee ? `Delivery included in payment: ${deliveryFee}` : "",
    `Paid via Paystack: ${total}`,
    courierNote,
    destination ? `View order in Admin: ${destination}` : "",
  ].filter(Boolean).join("\n\n");
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;background:#eff3ed;color:#253e32;font:15px/1.55 Arial,sans-serif">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eff3ed"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#fffdf7">
<tr><td style="padding:24px;background:#143729;color:#f4dfb7;border-bottom:4px solid #d7b777">
<div style="font:24px Georgia,serif">Rahat Energy</div>
<div style="margin-top:8px;font-size:11px;letter-spacing:2px">STORE ORDERS</div>
</td></tr>
<tr><td style="padding:28px 24px">
<h1 style="margin:0 0 18px;color:#143729;font:32px/1.15 Georgia,serif">${escapeHtml(title)}</h1>
<div style="padding:16px;background:#eff3ed">${detailRows(details)}</div>
<h2 style="margin:24px 0 10px;color:#143729;font:22px Georgia,serif">Customer</h2>
${detailRows(contact)}
<h2 style="margin:24px 0 10px;color:#143729;font:22px Georgia,serif">Fulfillment</h2>
${detailRows(delivery)}
<h2 style="margin:24px 0 10px;color:#143729;font:22px Georgia,serif">Items</h2>
<table width="100%" cellspacing="0" cellpadding="0"><thead><tr><th scope="col" align="left" style="border-bottom:1px solid #e2e8df;padding-bottom:8px">Product</th><th scope="col" align="right" style="border-bottom:1px solid #e2e8df;padding-bottom:8px">Amount</th></tr></thead><tbody>${itemRows}</tbody></table>
<p style="margin:16px 0 4px">Items subtotal <strong>${subtotal}</strong></p>
${deliveryFee ? `<p style="margin:0 0 4px">Delivery included in payment <strong>${deliveryFee}</strong></p>` : ""}
<p style="margin:14px 0;padding:14px 16px;background:#eff3ed;color:#143729"><strong>Paid via Paystack</strong><br><span style="font:26px Georgia,serif">${total}</span></p>
${courierNote ? `<p style="margin:12px 0;color:#516458">${escapeHtml(courierNote)}</p>` : ""}
${destination ? `<p style="margin:24px 0 0"><a href="${escapeHtml(destination)}" style="display:inline-block;background:#1c4a3b;color:#fff;padding:12px 18px;border-radius:4px;text-decoration:none">View order in Admin</a></p>` : ""}
</td></tr><tr><td style="border-top:1px solid #e2e8df;padding:16px 24px;color:#516458;font-size:12px">Rahat Energy · Sales notifications</td></tr>
</table></td></tr></table></body></html>`;
  return { to: ["experience@rahat-energy.com"], subject, text, html };
}

export function renderOrderEmail(kind: EmailKind, order: EmailOrder, options: EmailOptions = {}) {
  if (kind === "sale-notification") return renderSaleNotification(order, options);
  const customer = order.customerSnapshot as { name: string; email: string };
  const address = order.delivery?.address as {
    pickupAddress?: string;
    line1?: string;
    city?: string;
    state?: string;
    courierCollectsFee?: boolean;
  } | null;
  const pickup = order.delivery?.method === "PICKUP";
  const fulfilled = kind === "order-fulfilled";
  const title = fulfilled
    ? pickup ? "Your order was collected" : "Your order was delivered"
    : options.review ? "Payment received. Order under review." : "Your order is confirmed";
  const subject = `${options.test ? "[Test] " : ""}${title} · ${order.reference}`;
  const introduction = fulfilled
    ? `Thank you for trusting Rahat Energy. Your order has been ${pickup ? "collected" : "delivered"}. We appreciate the opportunity to help power your home or business.`
    : options.review
      ? "We received your payment. Our team is reviewing your order and will contact you about the next steps."
      : "We received your payment and confirmed your order. Thank you for shopping with Rahat Energy.";
  const fulfilment = pickup
    ? address?.pickupAddress || ""
    : [address?.line1, address?.city, address?.state].filter(Boolean).join(", ");
  const nextSteps = fulfilled
    ? "If you have questions about your purchase, our team is here to help."
    : options.review
      ? "Please wait for our team to confirm the next steps."
      : pickup
        ? "We’ll contact you when your order is ready for pickup."
        : "Our team will contact you to arrange delivery.";
  const courierNote = !fulfilled && address?.courierCollectsFee ? courierDeliveryFeeNote : "";
  const testNote = options.test ? "This was a test order. No live payment was taken." : "";
  const origin = storefrontOrigin();
  const destination = origin ? `${origin}${fulfilled ? "/contact" : "/track-order"}` : null;
  const action = fulfilled ? "Contact our team" : "Track your order";
  const rows = order.items.map(item =>
    `<tr><td style="padding:10px 0;border-bottom:1px solid #e2e8df">${escapeHtml(item.name)} × ${item.quantity}</td><td align="right" style="padding:10px 0 10px 12px;border-bottom:1px solid #e2e8df;white-space:nowrap">${money(item.unitPriceKobo * item.quantity)}</td></tr>`
  ).join("");
  const fee = order.deliveryFeeKobo > 0 ? `Delivery included in payment: ${money(order.deliveryFeeKobo)}` : "";
  const total = `Paid via Paystack: ${money(order.totalKobo)}`;
  const method = pickup ? "Pickup" : "Delivery";
  const paragraphs = [nextSteps, courierNote, testNote].filter(Boolean);
  const text = [
    `Hello ${customer.name},`,
    introduction,
    `Order reference: ${order.reference}`,
    order.items.map(item => `${item.quantity} × ${item.name} — ${money(item.unitPriceKobo * item.quantity)}`).join("\n"),
    [fee, total].filter(Boolean).join("\n"),
    fulfilment ? `${method}: ${fulfilment}` : method,
    ...paragraphs,
    destination ? `${action}: ${destination}` : "",
    "Rahat Energy",
  ].filter(Boolean).join("\n\n");
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#eff3ed;color:#253e32;font-family:Arial,sans-serif">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eff3ed"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:590px;background:#fffdf7">
<tr><td style="background:#143729;color:#f4dfb7;padding:22px 24px;font-size:13px;letter-spacing:3px">RAHAT ENERGY</td></tr>
<tr><td style="padding:32px 24px;font-size:15px;line-height:1.6">
<h1 style="margin:0 0 21px;font:400 35px/1.1 Georgia,serif;color:#143729">${escapeHtml(title)}</h1>
<p>Hello ${escapeHtml(customer.name)},</p><p>${escapeHtml(introduction)}</p>
<p style="color:#516458;font-size:13px">Order reference <strong>${escapeHtml(order.reference)}</strong></p>
<table width="100%" cellspacing="0" cellpadding="0" style="font-size:14px"><thead><tr><th align="left">Item</th><th align="right">Amount</th></tr></thead><tbody>${rows}</tbody></table>
${fee ? `<p style="margin:12px 0 0;font-size:13px">${escapeHtml(fee)}</p>` : ""}
<p style="margin:14px 0 22px"><strong>${escapeHtml(total)}</strong></p>
<p><strong>${method}</strong>${fulfilment ? `<br>${escapeHtml(fulfilment)}` : ""}</p>
${paragraphs.map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join("")}
${destination ? `<p style="margin:24px 0 0"><a href="${escapeHtml(destination)}" style="display:inline-block;background:#1c4a3b;color:#ffffff;padding:12px 20px;border-radius:4px;text-decoration:none">${action}</a></p>` : ""}
</td></tr><tr><td style="padding:16px 24px;border-top:1px solid #e2e8df;font-size:12px;color:#52665a">Rahat Energy</td></tr>
</table></td></tr></table></body></html>`;
  return {
    to: [customer.email],
    subject,
    text,
    html,
  };
}

export async function queueOrderEmail(
  tx: Prisma.TransactionClient,
  kind: EmailKind,
  order: EmailOrder,
  options?: EmailOptions,
) {
  const eventKey = orderEmailKey(kind, order.id);
  const from = process.env.ENERGY_EMAIL_FROM;
  await tx.notification.upsert({
    where: { eventKey },
    create: {
      eventKey,
      payload: { ...renderOrderEmail(kind, order, options), ...(from ? { from } : {}) },
    },
    update: {},
  });
}

export async function sendPaymentEmails(db: PrismaClient, orderId: string) {
  await Promise.allSettled([
    processNotifications(db, 1, orderEmailKey("order-confirmation", orderId)),
    processNotifications(db, 1, orderEmailKey("sale-notification", orderId)),
  ]);
}
