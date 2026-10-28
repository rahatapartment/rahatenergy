import type { PrismaClient, Prisma } from "@prisma/client";
import { hashPassword } from "./passwords";
import { CommerceError } from "./commerce-validation";
import type { AdminIdentity } from "./admin-auth";

async function ownerAuthority(
  tx: Prisma.TransactionClient,
  actor: AdminIdentity,
) {
  if (actor.bootstrap) {
    if ((await tx.adminUser.count()) === 0) return;
    throw new CommerceError("Initial setup access has ended.", 403);
  }
  const current = await tx.adminUser.findUnique({ where: { id: actor.id } });
  if (
    !current?.active ||
    current.role !== "OWNER" ||
    current.sessionVersion !== actor.sessionVersion
  )
    throw new CommerceError("Owner session is no longer valid.", 403);
}
export async function createAdminUser(
  db: PrismaClient,
  actor: AdminIdentity,
  input: { name: string; email: string; password: string; role: string },
) {
  if (actor.role !== "OWNER")
    throw new CommerceError("Owner access is required.", 403);
  const passwordHash = await hashPassword(input.password);
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext('energy-admin-management'))::text`;
    await ownerAuthority(tx, actor);
    if ((await tx.adminUser.count()) === 0 && input.role !== "OWNER")
      throw new CommerceError(
        "The first named administrator must be an owner.",
      );
    const user = await tx.adminUser.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        role: input.role,
      },
    });
    await tx.auditLog.create({
      data: {
        actor: actor.id,
        action: "ADMIN_CREATED",
        subject: user.id,
        data: { email: user.email, role: user.role },
      },
    });
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      sessionVersion: user.sessionVersion,
    };
  });
}
export async function editAdminUser(
  db: PrismaClient,
  actor: AdminIdentity,
  id: string,
  input: { role: string; active: boolean; password?: string },
) {
  if (actor.role !== "OWNER")
    throw new CommerceError("Owner access is required.", 403);
  if (id === actor.id)
    throw new CommerceError("Ask another owner to change your own account.");
  const passwordHash = input.password
    ? await hashPassword(input.password)
    : undefined;
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext('energy-admin-management'))::text`;
    await ownerAuthority(tx, actor);
    const current = await tx.adminUser.findUniqueOrThrow({ where: { id } });
    if (
      current.active &&
      current.role === "OWNER" &&
      (!input.active || input.role !== "OWNER") &&
      (await tx.adminUser.count({ where: { active: true, role: "OWNER" } })) <=
        1
    )
      throw new CommerceError("At least one active owner must remain.");
    await tx.adminUser.update({
      where: { id },
      data: {
        active: input.active,
        role: input.role,
        passwordHash,
        sessionVersion: { increment: 1 },
      },
    });
    await tx.auditLog.create({
      data: {
        actor: actor.id,
        action: "ADMIN_UPDATED_SESSIONS_REVOKED",
        subject: id,
        data: {
          active: input.active,
          role: input.role,
          passwordChanged: !!passwordHash,
        },
      },
    });
  });
}
