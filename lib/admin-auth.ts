import { createHmac } from "node:crypto";
import { cache } from "react";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getDb } from "./db";
import { environmentOwnerCredentials, environmentOwnerId } from "./admin-owner";
export const ADMIN_COOKIE = "rahat_energy_admin_session";
const issuer = "rahat-energy",
  audience = "rahat-energy-operations";
export type AdminIdentity = {
  id: string;
  name: string;
  role: "OWNER" | "OPERATOR";
  sessionVersion: number;
  email?: string;
  permissions?: string[];
};
function secret() {
  const value = process.env.ENERGY_ADMIN_SESSION_SECRET;
  if (!value || value.length < 32)
    throw new Error(
      "Independent session secret must be at least 32 characters.",
    );
  return new TextEncoder().encode(value);
}
function ownerCredentialTag(owner: NonNullable<ReturnType<typeof environmentOwnerCredentials>>) {
  return createHmac("sha256", secret()).update(JSON.stringify([owner.email, owner.password])).digest("base64url");
}
export async function createAdminSession(user?: {
  id: string;
  role: string;
  sessionVersion: number;
}) {
  const owner = user ? null : environmentOwnerCredentials();
  if (!user && !owner) throw new Error("Environment owner is not configured.");
  return new SignJWT({
    role: "admin",
    version: user?.sessionVersion ?? 0,
    ...(owner ? { ownerCredential: ownerCredentialTag(owner) } : {}),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user?.id ?? environmentOwnerId)
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
    if (payload.sub === environmentOwnerId) {
      const owner = environmentOwnerCredentials();
      if (!owner || payload.ownerCredential !== ownerCredentialTag(owner)) return null;
      return {
        id: environmentOwnerId,
        name: "Store owner",
        role: "OWNER",
        sessionVersion: 0,
        email: owner.email,
      };
    }
    const db = getDb();
    if (!db) return null;
    const user = await db.adminUser.findUnique({ where: { id: payload.sub } });
    if (
      !user?.active ||
      user.sessionVersion !== payload.version ||
      user.role !== "OPERATOR"
    )
      return null;
    return {
      id: user.id,
      name: user.name,
      role: "OPERATOR",
      sessionVersion: user.sessionVersion,
      email: user.email,
      permissions: user.permissions,
    };
  } catch {
    return null;
  }
}
export async function verifyAdminSession(token: string | undefined) {
  return !!(await adminIdentity(token));
}
const readCurrentAdmin = async () =>
  adminIdentity(cookies().get(ADMIN_COOKIE)?.value);
export const currentAdmin =
  typeof cache === "function" ? cache(readCurrentAdmin) : readCurrentAdmin;
export async function isAdmin() {
  return !!(await currentAdmin());
}
