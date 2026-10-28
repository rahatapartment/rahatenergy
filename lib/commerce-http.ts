import { NextResponse, NextRequest } from "next/server";
import { ZodError } from "zod";
import { CommerceError } from "./commerce-validation";
import { getDb } from "./db";
import { adminIdentity, ADMIN_COOKIE } from "./admin-auth";
import { sameOrigin } from "./security";
export function requireDb() {
  const db = getDb();
  if (!db)
    throw new CommerceError(
      "The independent Rahat Energy database is not configured.",
      503,
    );
  return db;
}
export function commerceFailure(error: unknown) {
  if (error instanceof CommerceError)
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  if (error instanceof ZodError)
    return NextResponse.json(
      {
        error:
          "Please check the required details, quantities and selected options.",
      },
      { status: 400 },
    );
  const code =
    error && typeof error === "object" && "code" in error
      ? error.code
      : undefined;
  if (code === "P2002")
    return NextResponse.json(
      {
        error:
          "A record with these unique details already exists. Check the email or reference before retrying.",
      },
      { status: 409 },
    );
  if (code === "P2025")
    return NextResponse.json(
      {
        error:
          "This record could not be found. Refresh the list before retrying.",
      },
      { status: 404 },
    );
  return NextResponse.json(
    {
      error:
        "The service is temporarily unavailable. Check the record’s current status before retrying.",
    },
    { status: 503 },
  );
}
export async function adminMutation(req: Request, ownerOnly = false) {
  const identity = await adminIdentity(
    new NextRequest(req.url, { headers: req.headers }).cookies.get(ADMIN_COOKIE)
      ?.value,
  );
  if (!identity) throw new CommerceError("Unauthorized.", 401);
  if (!sameOrigin(req)) throw new CommerceError("Invalid request origin.", 403);
  if (ownerOnly && identity.role !== "OWNER")
    throw new CommerceError("Owner access is required.", 403);
  return identity;
}
export async function smallJson(req: Request) {
  const raw = await req.text();
  if (raw.length > 30000) throw new CommerceError("Request is too large.", 413);
  try {
    return JSON.parse(raw);
  } catch {
    throw new CommerceError("Invalid request body.", 400);
  }
}
