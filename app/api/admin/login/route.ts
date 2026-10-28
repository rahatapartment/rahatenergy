import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { ADMIN_COOKIE, createAdminSession } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { verifyPassword } from "@/lib/passwords";
import { sameOrigin, limitRequest } from "@/lib/security";
import { commerceFailure, smallJson } from "@/lib/commerce-http";
export async function POST(req: Request) {
  try {
    if (!sameOrigin(req))
      return NextResponse.json(
        { error: "Invalid request origin." },
        { status: 403 },
      );
    if (
      !process.env.ENERGY_ADMIN_SESSION_SECRET ||
      process.env.ENERGY_ADMIN_SESSION_SECRET.length < 32
    )
      return NextResponse.json(
        { error: "Independent admin credentials are not configured." },
        { status: 503 },
      );
    if (!(await limitRequest("admin-login", 8, 60000)))
      return NextResponse.json(
        { error: "Too many attempts. Try again in one minute." },
        { status: 429 },
      );
    const body = z
      .object({
        email: z
          .string()
          .trim()
          .toLowerCase()
          .email()
          .max(254)
          .or(z.literal(""))
          .optional(),
        password: z.string().min(1).max(128),
      })
      .strict()
      .safeParse(await smallJson(req));
    if (!body.success)
      return NextResponse.json(
        { error: "Enter your sign-in details." },
        { status: 400 },
      );
    const db = getDb();
    const named = db ? await db.adminUser.count() : 0;
    let token: string;
    if (named) {
      const user = await db!.adminUser.findUnique({
        where: { email: body.data.email || "" },
      });
      if (
        !user?.active ||
        !(await verifyPassword(body.data.password, user.passwordHash))
      )
        return NextResponse.json(
          { error: "Invalid sign-in details." },
          { status: 401 },
        );
      token = await createAdminSession(user);
    } else {
      const expected = process.env.ENERGY_ADMIN_PASSWORD;
      if (!expected || expected.length < 16)
        return NextResponse.json(
          { error: "Independent admin credentials are not configured." },
          { status: 503 },
        );
      const a = Buffer.from(body.data.password),
        b = Buffer.from(expected);
      if (a.length !== b.length || !timingSafeEqual(a, b))
        return NextResponse.json(
          { error: "Invalid sign-in details." },
          { status: 401 },
        );
      token = await createAdminSession();
    }
    const res = NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
    res.cookies.set(ADMIN_COOKIE, token, {
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
