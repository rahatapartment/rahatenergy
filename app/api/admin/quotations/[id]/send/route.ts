import { NextResponse } from "next/server";
import { adminMutation, commerceFailure, requireDb, smallJson } from "@/lib/commerce-http";
import { processNotifications } from "@/lib/notifications";
import { sendQuotation } from "@/lib/operations";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const actor = await adminMutation(req, "quotations.manage");
    const db = requireDb();
    const eventKey = await sendQuotation(db, params.id, await smallJson(req), actor.id);
    const delivery = await processNotifications(db, 1, eventKey).catch(() => null);
    return NextResponse.json({
      ok: true,
      message: delivery?.sent
        ? "Quote accepted by the email provider."
        : "Quote queued. Email delivery is pending.",
    });
  } catch (error) {
    return commerceFailure(error);
  }
}
