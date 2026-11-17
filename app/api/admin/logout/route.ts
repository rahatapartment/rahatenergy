import { adminMutation, requireDb } from "@/lib/commerce-http";
import { auditCreate } from "@/lib/audit";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin-auth";
import { sameOrigin } from "@/lib/security";
export async function POST(req: Request) {
  if (!sameOrigin(req))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  try {
    const actor = await adminMutation(req);
    await requireDb().$transaction((tx) =>
      auditCreate(tx, {
        data: {
          actor: actor.id,
          action: "SIGN_OUT",
          subject: actor.id,
          data: {},
        },
      }),
    );
  } catch {
    /* Always allow clearing an expired session. */
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
