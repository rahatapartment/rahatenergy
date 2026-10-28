import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getDb } from "./db";
export const ADMIN_COOKIE = "rahat_energy_admin_session";
const issuer = "rahat-energy",
  audience = "rahat-energy-operations";
export type AdminIdentity = {
  id: string;
  name: string;
  role: "OWNER" | "OPERATOR";
  sessionVersion: number;
  bootstrap: boolean;
};
function secret() {
  const value = process.env.ENERGY_ADMIN_SESSION_SECRET;
  if (!value || value.length < 32)
    throw new Error(
      "Independent session secret must be at least 32 characters.",
    );
  return new TextEncoder().encode(value);
}
export async function createAdminSession(user?: {
  id: string;
  role: string;
  sessionVersion: number;
}) {
  return new SignJWT({ role: "admin", version: user?.sessionVersion ?? 0 })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user?.id ?? "energy-admin")
    .setIssuer(issuer)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime("4h")
    .sign(secret());
}
export async function adminIdentity(
  token: string | undefined,
): Promise<AdminIdentity | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), {
      issuer,
      audience,
      algorithms: ["HS256"],
    });
    if (payload.role !== "admin" || !payload.sub) return null;
    const db = getDb();
    if (payload.sub === "energy-admin") {
      if (db && (await db.adminUser.count()) > 0) return null;
      return {
        id: "energy-admin",
        name: "Initial administrator",
        role: "OWNER",
        sessionVersion: 0,
        bootstrap: true,
      };
    }
    if (!db) return null;
    const user = await db.adminUser.findUnique({ where: { id: payload.sub } });
    if (
      !user?.active ||
      user.sessionVersion !== payload.version ||
      !["OWNER", "OPERATOR"].includes(user.role)
    )
      return null;
    return {
      id: user.id,
      name: user.name,
      role: user.role as AdminIdentity["role"],
      sessionVersion: user.sessionVersion,
      bootstrap: false,
    };
  } catch {
    return null;
  }
}
export async function verifyAdminSession(token: string | undefined) {
  return !!(await adminIdentity(token));
}
export async function currentAdmin() {
  return adminIdentity(cookies().get(ADMIN_COOKIE)?.value);
}
export async function isAdmin() {
  return !!(await currentAdmin());
}
