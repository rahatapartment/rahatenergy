import { z } from "zod";

export const environmentOwnerId = "energy-admin";

export function environmentOwnerEmail() {
  return process.env.ENERGY_ADMIN_EMAIL?.trim().toLowerCase();
}

export function environmentOwnerCredentials() {
  const email = environmentOwnerEmail();
  const password = process.env.ENERGY_ADMIN_PASSWORD;
  if (!email || !z.string().email().max(254).safeParse(email).success ||
      !password || password.length > 128) return null;
  return { email, password };
}
