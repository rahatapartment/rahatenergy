BEGIN;
ALTER TABLE "AdminUser" ADD COLUMN "permissions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
-- Preserve existing operator privileges without granting new product/customer editing rights.
UPDATE "AdminUser" SET "permissions" = ARRAY['products.view','inventory.view','inventory.increase','inventory.decrease','inventory.price','inventory.settings','customers.view','orders.view','orders.manage','deliveries.view','deliveries.manage','quotations.view','quotations.manage','activity.view'] WHERE "role"='OPERATOR';
DO $$ BEGIN
  IF (SELECT count(*) FROM "AdminUser" WHERE "role"='OWNER') > 1 THEN
    RAISE EXCEPTION 'Multiple owners exist. Select the one business owner before applying this migration.';
  END IF;
END $$;
CREATE UNIQUE INDEX "one_business_owner" ON "AdminUser" ("role") WHERE "role"='OWNER';
ALTER TABLE "AuditLog" ADD COLUMN "actorEmail" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN "eventId" TEXT;
CREATE UNIQUE INDEX "AuditLog_eventId_key" ON "AuditLog" ("eventId");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog" ("createdAt");
CREATE INDEX "AuditLog_actorEmail_createdAt_idx" ON "AuditLog" ("actorEmail", "createdAt");
UPDATE "AuditLog" a SET "actorEmail"=u.email FROM "AdminUser" u WHERE a.actor=u.id;
CREATE TABLE "AdminInvitation" (
 "id" TEXT PRIMARY KEY, "email" TEXT NOT NULL, "roleLabel" TEXT NOT NULL DEFAULT 'Team member',
 "permissions" TEXT[] NOT NULL, "tokenHash" TEXT UNIQUE NOT NULL, "invitedBy" TEXT NOT NULL,
 "expiresAt" TIMESTAMP(3) NOT NULL, "acceptedAt" TIMESTAMP(3), "revokedAt" TIMESTAMP(3),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "AdminInvitation_email_createdAt_idx" ON "AdminInvitation" ("email", "createdAt");
ALTER TABLE "AdminInvitation" ENABLE ROW LEVEL SECURITY;
COMMIT;
