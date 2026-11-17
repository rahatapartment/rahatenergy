import type { Prisma } from "@prisma/client";
export async function auditCreate(
  tx: Prisma.TransactionClient,
  input: { data: Prisma.AuditLogUncheckedCreateInput },
) {
  const actor = await tx.adminUser.findUnique({
    where: { id: input.data.actor },
    select: { email: true },
  });
  return tx.auditLog.create({
    data: { ...input.data, actorEmail: actor?.email ?? null },
  });
}
