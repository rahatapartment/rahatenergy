import { NextResponse } from "next/server";
import { z } from "zod";
import {
  adminMutation,
  requireDb,
  smallJson,
  commerceFailure,
} from "@/lib/commerce-http";
import { auditCreate } from "@/lib/audit";
const schema = z
  .object({
    id: z.string().max(100).optional(),
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().toLowerCase().email().max(254),
    phone: z.string().trim().max(40),
  })
  .strict();
export async function POST(req: Request) {
  try {
    const actor = await adminMutation(req, "customers.manage");
    const { id, ...values } = schema.parse(await smallJson(req));
    await requireDb().$transaction(async (tx) => {
      const before = id
        ? await tx.customer.findUniqueOrThrow({ where: { id } })
        : null;
      const row = id
        ? await tx.customer.update({ where: { id }, data: values })
        : await tx.customer.create({ data: values });
      await auditCreate(tx, {
        data: {
          actor: actor.id,
          action: id ? "CUSTOMER_UPDATED" : "CUSTOMER_CREATED",
          subject: row.id,
          data: {
            before: before
              ? { name: before.name, email: before.email, phone: before.phone }
              : null,
            after: values,
          },
        },
      });
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return commerceFailure(e);
  }
}
