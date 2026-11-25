import { auditCreate } from "@/lib/audit";
import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { ADMIN_COOKIE, createAdminSession } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { environmentOwnerCredentials, environmentOwnerEmail, environmentOwnerId } from "@/lib/admin-owner";
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
          .max(254),
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
    const { email, password } = body.data;
    let token: string;
    const owner = environmentOwnerCredentials();
    if (email === environmentOwnerEmail() || !db) {
      if (!owner && !db)
        return NextResponse.json({ error: "Admin credentials are not configured." }, { status: 503 });
      const digest = (value: string) => createHash("sha256").update(value).digest();
      if (!owner || email !== owner.email || !timingSafeEqual(digest(password), digest(owner.password)))
        return NextResponse.json({ error: "Invalid sign-in details." }, { status: 401 });
      if (db)
        await db.$transaction(tx => auditCreate(tx, {
          data: { actor: environmentOwnerId, action: "SIGN_IN", subject: environmentOwnerId, data: {} },
        }));
      token = await createAdminSession();
    } else {
      const user = await db.adminUser.findUnique({ where: { email } });
      const valid = !!user?.active && user.role === "OPERATOR" &&
        await verifyPassword(password, user.passwordHash);
      if (user)
        await db.$transaction(tx => auditCreate(tx, {
          data: { actor: user.id, action: valid ? "SIGN_IN" : "SIGN_IN_FAILED", subject: user.id, data: {} },
        }));
      if (!valid || !user)
        return NextResponse.json({ error: "Invalid sign-in details." }, { status: 401 });
      token = await createAdminSession(user);
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
