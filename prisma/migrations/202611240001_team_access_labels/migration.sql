ALTER TABLE "AdminUser" ADD COLUMN "roleLabel" TEXT;

UPDATE "AdminUser" AS member
SET "roleLabel" = (
  SELECT invitation."roleLabel"
  FROM "AdminInvitation" AS invitation
  WHERE invitation."email" = member."email" AND invitation."acceptedAt" IS NOT NULL
  ORDER BY invitation."acceptedAt" DESC, invitation."createdAt" DESC, invitation."id" DESC
  LIMIT 1
)
WHERE member."role" = 'OPERATOR';
