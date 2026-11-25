import { permissionKeys } from "@/lib/admin-permissions";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  adminMutation,
  requireDb,
  smallJson,
  commerceFailure,
} from "@/lib/commerce-http";
import { editAdminUser } from "@/lib/admin-users";
const role = z.enum(["OWNER", "OPERATOR"]);
export async function PATCH(req: Request) {
  try {
    const actor = await adminMutation(req, true);
    const { id, ...input } = z
      .object({
        id: z.string().min(1).max(100),
        role,
        active: z.boolean(),
        roleLabel: z.string().trim().min(2).max(60).optional(),
        permissions: z
          .array(z.string().refine((v) => permissionKeys.includes(v as never)))
          .max(30)
          .optional(),
        password: z.string().min(16).max(128).optional(),
      })
      .strict()
      .parse(await smallJson(req));
    await editAdminUser(requireDb(), actor, id, input);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return commerceFailure(e);
  }
}
