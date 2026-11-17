import { NextResponse } from "next/server";
import { z } from "zod";
import { sameOrigin, limitRequest } from "@/lib/security";
import { commerceFailure, requireDb, smallJson } from "@/lib/commerce-http";
import { acceptAdminInvitation } from "@/lib/admin-invitations";
import { ADMIN_COOKIE, createAdminSession } from "@/lib/admin-auth";
export async function POST(req: Request) {
  try {
    if (!sameOrigin(req))
      return NextResponse.json(
        { error: "Invalid request origin." },
        { status: 403 },
      );
    if (!(await limitRequest("admin-invitation-accept", 15, 60000)))
      return NextResponse.json(
        { error: "Please try again in a minute." },
        { status: 429 },
      );
    const input = z
      .object({
        token: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
        name: z.string().trim().min(2).max(100),
        password: z.string().min(16).max(128),
      })
      .strict()
      .parse(await smallJson(req));
    const user = await acceptAdminInvitation(requireDb(), input);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, await createAdminSession(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 14400,
    });
    return res;
  } catch (e) {
    return commerceFailure(e);
  }
}
