import { auditCreate } from "@/lib/audit";
import type { PrismaClient } from "@prisma/client";
import { hashPassword } from "./passwords";
import { CommerceError } from "./commerce-validation";
import type { AdminIdentity } from "./admin-auth";
import { environmentOwnerCredentials, environmentOwnerId } from "./admin-owner";

export async function editAdminUser(
  db: PrismaClient,
  actor: AdminIdentity,
  id: string,
  input: {
    role: string;
    active: boolean;
    password?: string;
    permissions?: string[];
    roleLabel?: string;
  },
) {
  if (actor.role !== "OWNER" || actor.id !== environmentOwnerId || !environmentOwnerCredentials())
    throw new CommerceError("Owner access is required.", 403);
  if (id === actor.id)
    throw new CommerceError(
      "The business owner account cannot be reassigned here.",
    );
  const passwordHash = input.password
    ? await hashPassword(input.password)
    : undefined;
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext('energy-admin-management'))::text`;
    const current = await tx.adminUser.findUniqueOrThrow({ where: { id } });
    if (current.role === "OWNER" || input.role === "OWNER")
      throw new CommerceError(
        "The business owner cannot be reassigned here.",
        403,
      );
    await tx.adminUser.update({
      where: { id },
      data: {
        active: input.active,
        permissions: input.permissions,
        role: input.role,
        roleLabel: input.roleLabel,
        passwordHash,
        sessionVersion: { increment: 1 },
      },
    });
    await auditCreate(tx, {
      data: {
        actor: actor.id,
        action: "ADMIN_UPDATED_SESSIONS_REVOKED",
        subject: id,
        data: {
          active: input.active,
          role: input.role,
          roleLabel: input.roleLabel ?? current.roleLabel,
          passwordChanged: !!passwordHash,
          permissions: input.permissions ?? current.permissions,
          before: { active: current.active, permissions: current.permissions },
        },
      },
    });
  });
}
