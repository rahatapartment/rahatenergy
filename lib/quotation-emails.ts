import { z } from "zod";

export function salesInbox() {
  const raw = process.env.ENERGY_SALES_EMAIL?.trim();
  const email = z.string().email().max(254).safeParse(raw);
  return email.success && !email.data.toLowerCase().endsWith(".invalid")
    ? email.data
    : null;
}

export const salesEnquiryKey = (id: string) => `quote-sales:${id}`;
export const quoteResponsePrefix = (id: string) => `quote-response:${id}:`;

export function enquiryAdminLink(id: string) {
  try {
    const origin = new URL(process.env.NEXT_PUBLIC_APP_URL ?? "");
    if (origin.protocol === "https:" && !origin.username && !origin.password)
      return new URL(`/admin/quotations/${encodeURIComponent(id)}`, origin.origin).href;
  } catch {
    // The email includes the enquiry reference when a public origin is unavailable.
  }
}
