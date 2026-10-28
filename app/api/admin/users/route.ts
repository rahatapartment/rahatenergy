import { NextResponse } from "next/server";
import { z } from "zod";
import {
  adminMutation,
  requireDb,
  smallJson,
  commerceFailure,
} from "@/lib/commerce-http";
import { createAdminUser, editAdminUser } from "@/lib/admin-users";
import { ADMIN_COOKIE, createAdminSession } from "@/lib/admin-auth";
const role = z.enum(["OWNER", "OPERATOR"]);
export async function POST(req: Request) {
  try {
    const actor = await adminMutation(req, true);
    const input = z
      .object({
        name: z.string().trim().min(2).max(100),
        email: z.string().trim().toLowerCase().email().max(254),
        password: z.string().min(16).max(128),
        role,
      })
      .strict()
      .parse(await smallJson(req));
    const user = await createAdminUser(requireDb(), actor, input);
    const res = NextResponse.json({ ok: true }, { status: 201 });
    if (actor.bootstrap)
      res.cookies.set(ADMIN_COOKIE, await createAdminSession(user), {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 14400,
      });
    return res;
  } catch (e) {
    return commerceFailure(e);
  }
}
export async function PATCH(req: Request) {
  try {
    const actor = await adminMutation(req, true);
    const { id, ...input } = z
      .object({
        id: z.string().min(1).max(100),
        role,
        active: z.boolean(),
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
