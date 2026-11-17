import { createHash, randomBytes } from "node:crypto";
import type { PrismaClient } from "@prisma/client";
import type { AdminIdentity } from "./admin-auth";
import { CommerceError } from "./commerce-validation";
import { hashPassword } from "./passwords";
import { auditCreate } from "./audit";
export const invitationHash = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export function invitationUsable(
  invite: { acceptedAt: Date | null; revokedAt: Date | null; expiresAt: Date },
  now = new Date(),
) {
  return !invite.acceptedAt && !invite.revokedAt && invite.expiresAt > now;
}
export async function inviteAdmin(
  db: PrismaClient,
  actor: AdminIdentity,
  input: { email: string; roleLabel: string; permissions: string[] },
) {
  if (actor.role !== "OWNER" || actor.bootstrap)
    throw new CommerceError(
      "Create your named owner account in Settings first.",
      403,
    );
  if (
    !process.env.ENERGY_RESEND_API_KEY ||
    !process.env.ENERGY_EMAIL_FROM ||
    !process.env.NEXT_PUBLIC_APP_URL
  )
    throw new CommerceError(
      "Configure the email sender, Resend API key and application URL before sending invitations.",
      503,
    );
  const token = randomBytes(32).toString("base64url");
  const url = new URL("/admin/accept-invite", process.env.NEXT_PUBLIC_APP_URL);
  url.searchParams.set("token", token);
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext('energy-admin-management'))::text`;
    if (await tx.adminUser.findUnique({ where: { email: input.email } }))
      throw new CommerceError(
        "This email already has an account. Update its access below.",
        409,
      );
    const prior = await tx.adminInvitation.findMany({
      where: { email: input.email, acceptedAt: null, revokedAt: null },
    });
    await tx.adminInvitation.updateMany({
      where: { id: { in: prior.map((i) => i.id) } },
      data: { revokedAt: new Date() },
    });
    await tx.notification.updateMany({
      where: {
        eventKey: { in: prior.map((i) => `admin-invite:${i.id}`) },
        sentAt: null,
      },
      data: { attempts: 12, lastError: "Invitation replaced." },
    });
    const invite = await tx.adminInvitation.create({
      data: {
        ...input,
        tokenHash: invitationHash(token),
        invitedBy: actor.id,
        expiresAt: new Date(Date.now() + 48 * 3600000),
      },
    });
    await tx.notification.create({
      data: {
        eventKey: `admin-invite:${invite.id}`,
        payload: {
          from: process.env.ENERGY_EMAIL_FROM!,
          to: [input.email],
          subject: "Your Rahat Energy team invitation",
          text: `You have been invited to manage Rahat Energy as ${input.roleLabel}. Set your name and password using this single-use link within 48 hours: ${url.toString()}\nIf you did not expect this invitation, ignore this email.`,
        },
      },
    });
    await auditCreate(tx, {
      data: {
        actor: actor.id,
        action: "TEAM_INVITED",
        subject: invite.id,
        data: {
          email: input.email,
          permissions: input.permissions,
          roleLabel: input.roleLabel,
        },
      },
    });
    return invite.id;
  });
}
export async function acceptAdminInvitation(
  db: PrismaClient,
  input: { token: string; name: string; password: string },
) {
  const passwordHash = await hashPassword(input.password);
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext('energy-admin-management'))::text`;
    const invite = await tx.adminInvitation.findUnique({
      where: { tokenHash: invitationHash(input.token) },
    });
    if (!invite || !invitationUsable(invite))
      throw new CommerceError(
        "This invitation has expired or is no longer available. Ask the owner for a new invitation.",
        410,
      );
    const user = await tx.adminUser.create({
      data: {
        email: invite.email,
        name: input.name,
        passwordHash,
        role: "OPERATOR",
        permissions: invite.permissions,
      },
    });
    await tx.adminInvitation.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    });
    await auditCreate(tx, {
      data: {
        actor: user.id,
        action: "INVITATION_ACCEPTED",
        subject: user.id,
        data: { permissions: invite.permissions },
      },
    });
    return user;
  });
}
