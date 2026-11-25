import type { Prisma } from "@prisma/client";
import { environmentOwnerEmail, environmentOwnerId } from "./admin-owner";
export async function auditCreate(
  tx: Prisma.TransactionClient,
  input: { data: Prisma.AuditLogUncheckedCreateInput },
) {
  const actor = input.data.actor === environmentOwnerId ? null : await tx.adminUser.findUnique({
    where: { id: input.data.actor },
    select: { email: true },
  });
  return tx.auditLog.create({
    data: { ...input.data, actorEmail: input.data.actor === environmentOwnerId ? environmentOwnerEmail() ?? null : actor?.email ?? null },
  });
}
