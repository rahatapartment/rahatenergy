# Activate the updated admin

The existing Vercel/Supabase project is retained. No new database is required.
The local connection last returned a Supabase pooler tenant/user error. Variable
presence in Vercel does not independently verify connectivity or applied schema.
Do not apply migrations through a different database or bypass project checks.

## Prepared changes

- `202611170001_uploaded_catalogue`: extends the allowed identity set, inserts
  active product/inventory rows if missing, fills only NULL prices with the
  owner's supplied prices, and disables retired placeholders. Existing prices,
  quantities, reservations and historic order snapshots are preserved.
- `202611170002_product_management`: adds ProductContent and ProductImage with
  row-level security. It does not modify the immutable Product identity trigger.
- Owner-only editor, compressed durable uploads, image ordering, specification
  rows, SEO fields, conflict checks and audit history.
- Connected storefront and checkout use the same inventory prices. An explicitly
  unpriced inventory record stays unpriced in the storefront.

Review retired placeholder inventory before activation if it has stock or orders.
It is retained for history and disabled rather than deleted.

## Required release order

Run from the `rahat-energy` application directory (the directory containing
`prisma/schema.prisma`) with the existing Energy project's credentials available.

1. Run `npm run db:backup`. This verifies the database identity before exporting,
   uses the session/direct connection and never puts credentials in shell arguments.
   It writes a private, ignored `.backups/*.dump`, a SHA-256 manifest and applied
   migration names. A valid archive listing is checked automatically; restore it
   to a separate disposable database to rehearse recovery before production work.
   Retain a copy in the owner's private backup storage.
2. Run `npm run db:check` and confirm the independent Energy target passes.
3. Review the SQL migrations above, then run `npm run db:activate`. This applies
   pending migrations and seeds missing active identities without replacing stock
   or operational values. Do not continue if backup or migration fails.
4. Run `npm test`, `npm run typecheck`, `npm run verify:isolation`, and `npm run build`.
   Unit tests isolate local production secrets. Integration tests require the
   separate disposable loopback database ending in `_test`.
5. Deploy the reviewed checkout to the existing `rahatenergy` Vercel project.
   Use that project's established environment variables and domain. Deployment
   must follow the database migration so new routes can find their tables.
6. Sign in as an owner and perform the verification below.

## Owner verification

- `/admin/settings`: database is connected; catalogue count is 18.
- `/admin/products`: open an existing product; edit description and SEO, add a
  specification and save. Confirm the product page and homepage use the update.
- Upload a JPG/PNG/WebP. Confirm the compressed image appears; set it as cover,
  reorder gallery photos and save. Confirm shop, carousel and gallery covers.
- Open the same product in two tabs and save both; the stale tab must be rejected.
- Sign in as an operator; content editing and image uploads must be rejected.
- `/admin/inventory`: enter the real quantities and missing prices, then confirm
  the price displayed in the shop matches checkout. Do not invent stock.
- Run a Paystack TEST transaction through payment verification, customer email,
  admin fulfillment and customer tracking. Confirm scheduler runs in Monitoring.

## Remaining business/provider work

Six power-station prices, the garden pole-light price, real stock quantities,
delivery charges/areas and pickup arrangements require owner-supplied values.
Production provider delivery and scheduled worker execution still require actual
service verification. Live payments remain disabled in this release. MFA/account
recovery, partial refunds and post-dispatch returns remain separate unfinished work.

## Failure handling

If connectivity fails, stop before writes and obtain the exact current pooler
strings from the existing Supabase project's Connect dialog. Never publish secret
values in logs, issue bodies or chat. If deployment fails after the additive schema
migration, retain the new tables and roll back application code through the normal
Vercel deployment history. Do not drop tables containing uploaded assets/content.

## Current execution status

The backup command was attempted locally and failed at the initial database
connection with a tenant/user error. No backup archive, production migration or
new deployment is claimed. TypeScript and schema validation are local checks;
they do not prove a live database connection.

## Deployment guard and release branch

`vercel.json` now uses `npm run release:build`. This generates Prisma, runs a
read-only database release check, and builds only after that check succeeds.
The check requires every repository migration to be completed with a matching
checksum, verifies the active inventory identities, and verifies the new content
and image tables exist. It never runs migrations or edits production data.
`npm run build` remains available for credential-free local/CI compilation.

A GitHub Actions template is saved at `docs/release-checks.workflow-example`.
It is inactive because the current GitHub token cannot publish workflow files.
With an authorized token, move it to `.github/workflows/release-checks.yml` to
run tests, TypeScript, isolation checks and a normal production build in CI.
These checks do not replace
connected database/provider verification. A Vercel preview without the required
database access will stop at the release guard rather than publish broken admin
routes. Existing production credentials and domains are unchanged.

A separate release branch is used so pushing the reviewed changes does not
replace production main. Merge/deploy only after the backup and migrations are
confirmed in the existing working database environment.
