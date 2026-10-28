// Adapted from the isolated application's gateway wrapper; energy test keys only.
import { createHmac, timingSafeEqual } from "node:crypto";
import { CommerceError } from "./commerce-validation";
export function testKey() {
  const key = process.env.ENERGY_PAYSTACK_SECRET_KEY;
  if (!key?.startsWith("sk_test_"))
    throw new CommerceError(
      "Rahat Energy Paystack test credentials are not configured. Live payments are disabled.",
      503,
    );
  return key;
}
export function appOrigin() {
  const value = process.env.NEXT_PUBLIC_APP_URL;
  if (!value)
    throw new CommerceError("Application callback URL is not configured.", 503);
  const url = new URL(value);
  if (
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    url.username ||
    url.password ||
    !(
      url.protocol === "https:" ||
      (url.protocol === "http:" &&
        ["localhost", "127.0.0.1"].includes(url.hostname))
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
    testKey();
    appOrigin();
    return true;
  } catch {
    return false;
  }
}
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`https://api.paystack.co${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${testKey()}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || body?.status !== true || !body.data)
    throw new CommerceError(
      "The test payment service could not complete this request. Please check your order before trying again.",
      502,
    );
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
export const verifyPayment = (reference: string) =>
  request<VerifiedPayment>(
    `/transaction/verify/${encodeURIComponent(reference)}`,
  );
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
export function validSignature(raw: string, signature: string | null) {
  if (!signature || !/^[a-f0-9]{128}$/i.test(signature)) return false;
  const expected = createHmac("sha512", testKey()).update(raw).digest();
  return timingSafeEqual(expected, Buffer.from(signature, "hex"));
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
