import { NextResponse } from "next/server";
import { quoteSchema } from "@/lib/validation";
import { getDb } from "@/lib/db";
import { sameOrigin, limitRequest, unavailable } from "@/lib/security";
export async function POST(req: Request) {
  if (!sameOrigin(req))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  if (!(await limitRequest("quotation-submissions", 30, 60_000)))
    return NextResponse.json(
      { error: "Please try again in a minute." },
      { status: 429 },
    );
  if (Number(req.headers.get("content-length") || 0) > 20000)
    return NextResponse.json(
      { error: "Submission too large." },
      { status: 413 },
    );
  const parsed = quoteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      {
        error:
          "Please check your contact details, product, quantity and project requirements.",
      },
      { status: 400 },
    );
  const db = getDb();
  if (!db) return unavailable();
  const { consent, ...data } = parsed.data;
  void consent;
  try {
    const saved = await db.$transaction(async (tx) => {
      const quotation = await tx.quotation.create({
        data: { ...data, productId: data.productId || null },
      });
      const from = process.env.ENERGY_EMAIL_FROM;
      if (from) {
        await tx.notification.create({
          data: {
            eventKey: `quote-ack:${quotation.id}`,
            payload: {
              from,
              to: [quotation.email],
              subject: "Rahat Energy enquiry received",
              text: `Hello ${quotation.name},\nYour enquiry has been saved. Reference: ${quotation.id}. Product details and any project arrangements require confirmation.`,
            },
          },
        });
        const admin = process.env.ENERGY_ADMIN_EMAIL;
        if (admin && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(admin))
          await tx.notification.create({
            data: {
              eventKey: `quote-admin:${quotation.id}`,
              payload: {
                from,
                to: [admin],
                subject: `New Rahat Energy enquiry ${quotation.id}`,
                text: `A new enquiry from ${quotation.name} is ready for review in operations. Reference: ${quotation.id}.`,
              },
            },
          });
      }
      return quotation;
    });
    return NextResponse.json({ reference: saved.id }, { status: 201 });
  } catch {
    return unavailable();
  }
}
