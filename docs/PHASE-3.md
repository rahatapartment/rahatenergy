# Phase 3 — transaction infrastructure

## Provisioning status

The Rahat Energy Supabase project is **not activated**: no dedicated project credentials or Paystack merchant test key were available. No apartment environment or production resources were used. No production deployment or live payment was performed.

A disposable PostgreSQL instance on loopback was used for real migration, seed, read/write and concurrency validation. It is test infrastructure only, not the application's provisioned database. Synthetic product prices, addresses and customer data existed only in that disposable test database.

## Completed implementation

- Working checkout interface: multi-product review, contact/address entry, configured delivery or pickup, server-calculated prices and fees, reviewed-total checks and Paystack test redirect.
- Database-backed order creation with random references, immutable unit-price/contact/delivery snapshots, separate payment/fulfillment/delivery state, timestamps and a 15-minute reservation window.
- Transactional stock reservation with sorted row locks, reservation/release/sale movements, optimistic inventory version increments and prevention of overselling. Payment verification and expiry share order/inventory lock ordering.
- Retry-safe checkout keys bound to the request and private access code. Concurrent retries create one order. Payment initialization is claimed once; interrupted attempts can recover an existing order without creating another.
- Paystack wrapper adapted from the existing isolated source: test keys only, initialization in kobo, allowlisted hosted checkout URLs, verification of reference, domain, amount/currency and customer, raw-body HMAC SHA-512 webhooks and a server-verified browser callback.
- Duplicate paid events cannot deduct stock or enqueue a receipt twice. Failed/abandoned payments and expired holds release stock. A later captured payment is recorded as paid with `PAYMENT_REVIEW`, without deducting unavailable stock or permitting fulfillment. Staff must resolve that captured payment explicitly.
- Private confirmation/order pages with purchased products, historic totals, delivery details and event history. Reference-only access cannot expose personal data. A hashed private access code supports recovery; access cookies are HttpOnly. Tokens are not put in URLs.
- Admin order search/filtering across the latest 100 records, order details with immutable customer/item snapshots, controlled paid-order fulfillment transitions, audit records and delivery progress for dispatched/delivered orders.
- Admin configuration for business-approved delivery/pickup options. Nothing is preconfigured or guessed; unconfigured checkout stays unavailable.
- Order-confirmation outbox and leased Resend worker adapted from the earlier notification pattern, with stable provider idempotency keys and bounded retries. No sender fallback or apartment email identity is used. The cron endpoint also expires abandoned reservations.
- New additive migration for order attempt/expiry fields, payment initialization state, reservation movement deltas, DeliveryOption and Notification. RLS is enabled on application tables to deny unconfigured public Supabase Data API access. Server-side Prisma requires an appropriately authorised database role.
- Activation tooling validates both independent connection targets, refuses unrelated application tables, applies migrations, seeds twice, verifies exactly 15 products/inventory rows and verifies a rolled-back write. Product identity restrictions remain enforced in code and SQL.

## Important operational behavior

All amounts are integers in NGN kobo. The server reads prices and delivery fees from PostgreSQL; frontend amounts are review assertions only. A changed total prompts another review. Customer records are new to this application; each order keeps the submitted contact snapshot even when a guest reuses an email address.

Gateway calls occur outside inventory transactions. Initialization errors release the hold; because network outcomes can be ambiguous, a later successful charge is sent to payment review. Crashed initialization claims are not blindly reinitialized under the same reference; the reservation expiry job closes abandoned attempts.

The callback uses `NEXT_PUBLIC_APP_URL`; browse the same origin (including localhost versus 127.0.0.1) so the order-access cookie is available after redirect. Live keys and verified gateway responses with `domain: live` are always rejected; there is no live-mode switch.

Order fulfillment actions cannot mark payment paid, bypass payment review, or modify historic prices. Cancellation/refund automation and manual review resolution are intentionally not included in this phase.

## Configure the new Supabase project

1. Create a new project dedicated to Rahat Energy. Obtain its runtime and direct/session-pooler PostgreSQL URLs from that project's Connect dialog. Use the correct pooler options for Prisma 5 and your network. Do not infer a project host or copy the apartment connection strings.
2. Put `ENERGY_DATABASE_URL` and `ENERGY_DIRECT_URL` into this project's ignored `.env`. Optionally set the non-secret `ENERGY_SUPABASE_PROJECT_REF` guard. Both URLs must identify the same database/project. Do not paste secrets into chat.
3. Run `npm run db:check`, then `npm run db:activate`. The latter validates both targets, migrates, seeds twice and checks reads/write rollback. An unrelated public application table causes activation to abort.
4. Configure independent admin credentials, sign in and enter verified prices/stock. New inventory remains disabled/unpriced/zero until configured. Under Deliveries, create only approved delivery or pickup areas and fees.
5. Set `NEXT_PUBLIC_APP_URL` to the actual origin and `ENERGY_PAYSTACK_SECRET_KEY` to the independent merchant's **test** secret. No public gateway key is needed for hosted redirect checkout.
6. Configure the test account webhook as `https://YOUR-STAGING-ORIGIN/api/payments/webhook`. Public HTTPS staging or an approved tunnel is needed to receive Paystack webhooks; localhost cannot receive them directly. No public staging deployment was created here.
7. For customer confirmation email, set `ENERGY_RESEND_API_KEY` and a verified independent `ENERGY_EMAIL_FROM`. The sender is captured in queued receipt payloads. Missing email configuration must not be interpreted as sent mail.
8. Set a new random `ENERGY_CRON_SECRET` (at least 32 characters). Schedule `GET /api/cron/commerce` every minute with `Authorization: Bearer <secret>`. This is required for reservation expiry and email retry recovery.

Use a server-side role authorised for Prisma queries, and keep migration authority separate from runtime access. No Supabase service credentials or database URLs belong in `NEXT_PUBLIC_*` variables. Before exposure, replace process-local rate limits with shared infrastructure and finish per-admin identity, approved business content and policy review.

## Test boundaries

`npm test` exercises unit/API validation and security. `npm run test:integration` requires `ENERGY_TEST_DATABASE_URL`; it refuses external hosts and any database name not ending in `_test`. It runs migrations and resets records in that explicitly disposable database. Never point it at Supabase or an application database.

Paystack/Resend responses in automated tests are simulated. Real PostgreSQL transactions, constraints, locks and persisted order state are exercised. A successful simulated charge is **not** a real Paystack sandbox transaction. End-to-end merchant verification and real email delivery remain pending the dedicated credentials.

## Main changed files

- `prisma/schema.prisma`, `prisma/migrations/202610260002_commerce/`, `prisma/seed.ts`.
- `lib/commerce.ts`, `commerce-validation.ts`, `commerce-http.ts`, `paystack.ts`, `notifications.ts`, `database-safety.ts`, `seed-catalogue.ts`, `security.ts`.
- Checkout quote/create/recovery, payment callback/webhook, order access/verification, cron and admin order/delivery-option API routes under `app/api/`.
- Checkout, tracking, private order confirmation, admin order details and orders list pages.
- Checkout/order and admin order/delivery-option components; global responsive styles and supporting product/FAQ/policy text.
- `scripts/activate-database.ts`, new PostgreSQL integration/gateway tests, package scripts, `.env.example` and documentation.

## Recommended Phase 4

Activate and validate the new Supabase project and independent test merchant; run actual test charges, duplicate webhook deliveries and provider/email recovery checks. Add delivery operations, quotation processing, reviewed cancellation/refund handling, payment-review resolution, shared rate limits, individual admins, pagination and monitoring. Confirm catalogue/brand/business information and approved policies before any live-payment or production-launch request.

## Verification results

- TypeScript, ESLint and optimized Next.js production build passed. Transaction GET handlers are explicitly dynamic; callbacks and jobs are not frozen into build-time responses.
- 20 unit/API tests passed, covering fixed identities, cart/price input validation, independent sessions, same-origin checks, raw webhook signatures, test-key enforcement and connection-target safety.
- 18 real PostgreSQL integration tests passed: both migrations, fixed-catalogue SQL restrictions, repeated seeds preserving prices/stock, multi-item orders and immutable prices, stale-total rejection, stock concurrency, repeated checkout keys, one-time payment initialization, initialization failure, successful verification, duplicate webhook/deduction prevention, failed/abandoned payments, expiry/finalization races, late-payment review, admin authorization/fulfillment, refunded terminal-state protection and notification retry/idempotency.
- `db:activate` passed on the disposable database: runtime/direct validation, two applied migrations, exactly 15 products and inventory rows, repeat-seed preservation and transaction write/rollback checks. No Supabase project was activated.
- Local browser flow passed with real temporary PostgreSQL and a simulated gateway: two products → reviewed server total → simulated hosted checkout → server-verified confirmation → cart cleanup. Private code recovery and admin search/detail/fulfillment updates passed. The simulated charge total was ₦2,010, from explicitly synthetic fixture prices and delivery fees; it is not company pricing or a real provider transaction.
- 390px checkout, order confirmation and admin detail layouts passed. Automated WCAG A/AA checks reported zero violations on checkout, confirmation and admin order detail after contrast/layout corrections. No browser page errors were observed.
- Browser evidence is recorded in `docs/phase3-browser-qa.json`. The test order screenshot is `docs/phase3-order-preview.png`; its private access code is hidden.
- Isolation verification confirms all 145 recorded parent source files remain unchanged.
- The temporary QA server and PostgreSQL process were stopped. The normal Energy preview was restored without fixture credentials or gateway simulation.

External checks still pending: the new Supabase project's real connection/migration/seed test, a genuine Paystack sandbox charge and actual webhook delivery, verified-sender email delivery and an installed reservation/email scheduler. Receipt jobs are not backfilled automatically for payments made before an email sender was configured. Shared rate limiting, individual admin identities and operational monitoring remain prerequisites for public production exposure.

Reference documentation: [Supabase with Prisma](https://supabase.com/docs/guides/database/prisma), [Paystack verification](https://paystack.com/docs/payments/verify-payments/), [Paystack webhook signatures](https://paystack.com/docs/payments/webhooks/).
