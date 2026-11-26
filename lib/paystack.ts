import { createHmac, timingSafeEqual } from "node:crypto";
import { CommerceError } from "./commerce-validation";
export function paymentMode(): "test" | "live" {
  const mode = process.env.ENERGY_PAYSTACK_MODE ?? "live";
  if (mode !== "test" && mode !== "live")
    throw new CommerceError("Paystack mode is invalid.", 503);
  return mode;
}
export const paymentReferencePattern = /^REPAY-(?:LIVE-)?[a-f0-9]{32}$/;
export const referenceMode = (reference: string) =>
  reference.startsWith("REPAY-LIVE-") ? "live" : "test";

export function paymentKey() {
  const mode = paymentMode();
  const key = process.env.ENERGY_PAYSTACK_SECRET_KEY;
  if (!key?.startsWith(`sk_${mode}_`))
    throw new CommerceError(
      "Paystack credentials do not match the configured payment mode.",
      503,
    );
  return key;
}
export function appOrigin() {
  const value = process.env.NEXT_PUBLIC_APP_URL;
  if (!value)
    throw new CommerceError("Application callback URL is not configured.", 503);
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new CommerceError("Application callback URL is invalid.", 503);
  }
  if (
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    url.username ||
    url.password ||
    !(
      url.protocol === "https:" ||
      ((paymentMode() === "test" || process.env.NODE_ENV === "development") &&
        url.protocol === "http:" &&
        ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname))
    )
  )
    throw new CommerceError(
      "A valid HTTPS application URL is required (HTTP localhost is allowed).",
      503,
    );
  return url.origin;
}
export function paymentsReady() {
  try {
    paymentKey();
    appOrigin();
    return true;
  } catch {
    return false;
  }
}
export function paymentModeLabel() {
  try {
    return paymentMode() === "live" ? "Live mode" : "Test mode";
  } catch {
    return "Invalid payment mode";
  }
}
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`https://api.paystack.co${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${paymentKey()}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || body?.status !== true || !body.data) {
    if (path === "/transaction/initialize") {
      const providerCode = body?.code;
      console.warn("Paystack checkout initialization failed", {
        httpStatus: res.status,
        providerCode:
          typeof providerCode === "string" &&
          /^[a-z][a-z0-9_]{0,63}$/.test(providerCode)
            ? providerCode
            : undefined,
      });
    }
    throw new CommerceError(
      "The payment service could not complete this request. Please check your order before trying again.",
      502,
    );
  }
  return body.data as T;
}
export type VerifiedPayment = {
  id?: number;
  reference: string;
  domain: string;
  status: string;
  amount: number;
  requested_amount?: number | null;
  currency: string;
  paid_at: string | null;
  customer: { email: string };
};
export async function initializePayment(input: {
  email: string;
  amountKobo: number;
  reference: string;
}) {
  const data = await request<{ authorization_url: string; reference: string }>(
    "/transaction/initialize",
    {
      method: "POST",
      body: JSON.stringify({
        email: input.email,
        amount: input.amountKobo,
        currency: "NGN",
        reference: input.reference,
        callback_url: `${appOrigin()}/api/payments/callback`,
        metadata: { application: "rahat-energy" },
      }),
    },
  );
  if (
    data.reference !== input.reference ||
    !validPaymentUrl(data.authorization_url)
  )
    throw new CommerceError(
      "The gateway returned an invalid payment session.",
      502,
    );
  return data;
}
export async function verifyPayment(reference: string) {
  if (referenceMode(reference) !== paymentMode())
    throw new CommerceError("The payment belongs to a different Paystack mode.", 409);
  return request<VerifiedPayment>(
    `/transaction/verify/${encodeURIComponent(reference)}`,
  );
}
export function validPaymentUrl(value: string) {
  try {
    const u = new URL(value);
    return (
      u.protocol === "https:" &&
      u.hostname === "checkout.paystack.com" &&
      !u.username &&
      !u.password
    );
  } catch {
    return false;
  }
}
export function validSignature(raw: string | Buffer, signature: string | null) {
  if (!signature || !/^[a-f0-9]{128}$/i.test(signature)) return false;
  const expected = createHmac("sha512", paymentKey()).update(raw).digest();
  return timingSafeEqual(expected, Buffer.from(signature, "hex"));
}
export function validWebhookSignature(raw: Buffer, headers: Headers) {
  const secret = process.env.ENERGY_PAYSTACK_WEBHOOK_SECRET;
  if (!secret) return validSignature(raw, headers.get("x-paystack-signature"));

  const signature = headers.get("paystack-signature");
  if (!signature) return false;
  const fields = signature.split(",").map((field) => field.trim());
  const timestamps = fields.filter((field) => field.startsWith("t="));
  if (timestamps.length !== 1 || !/^t=\d+$/.test(timestamps[0])) return false;
  const timestamp = timestamps[0].slice(2);
  if (Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp)) > 300)
    return false;

  const expected = createHmac("sha512", secret)
    .update(`${timestamp}.`)
    .update(raw)
    .digest();
  return fields.some((field) => {
    const match = /^v1=whk_[a-z0-9_-]+:([a-f0-9]{128})$/i.exec(field);
    return match !== null && timingSafeEqual(expected, Buffer.from(match[1], "hex"));
  });
}
export type ProviderRefund = {
  id: number;
  domain: string;
  transaction: number | { id: number };
  amount: number;
  currency: string;
  status: string;
  refunded_at: string | null;
};
export const fetchRefund = (id: string) =>
  request<ProviderRefund>(`/refund/${encodeURIComponent(id)}`);
