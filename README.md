# Rahat Energy

**Current stage: operations and connected product management.** Review the database-free, read-only walkthrough at `/admin/preview`. See [Phase 4 report](docs/PHASE-4.md).

Independent Next.js 14 storefront converted from the isolated source. Phase 3 adds server-authoritative test checkout, stock reservations, verified payments, private order confirmation and order operations to the existing storefront. No live payments or production deployment.

## Run locally

```sh
npm ci
npm run db:generate
npm run dev
```

`npm run dev` reuses an existing Rahat Energy preview on port 3001. Port 3000 is an optional redirect; if another app uses it, Energy still starts on 3001. Unrelated processes are never stopped automatically.

Open http://localhost:3001. Run commands from this **nested `rahat-energy` directory**; the parent folder is the preserved apartment source.

The storefront works without credentials. Checkout requires the independent database, verified inventory, delivery options and matching Paystack credentials. See [Paystack setup](docs/PHASE-3.md#configure-paystack).

## Independent database setup

Provision a **new, empty PostgreSQL database** dedicated to Rahat Energy. Do not copy the parent environment or connect to the apartment database. Copy this project's `.env.example` to `.env` and set only new `ENERGY_DATABASE_URL` and `ENERGY_DIRECT_URL` values. The latter is a direct connection used for migrations.

```sh
npm run db:check
npm run db:activate
```

The migration creates the energy schema and constraints; the seed inserts the active code-controlled identities and default inventory rows. Repeated seeding uses `ON CONFLICT DO NOTHING`, preserving prices, stock and availability. Initial inventory is zero and disabled, with owner-supplied catalogue prices where available; this is a safe initialization, not verified business inventory. Product definitions live in `catalogue/products.json`. The API has no product create/delete methods; database checks restrict IDs/SKUs and a trigger prevents product identity updates/deletes. Future identity changes require a reviewed migration.

**Service status:** the owner has an existing Vercel/Supabase setup. Production configuration was shown in Vercel, and local settings were restored from the owner’s Desktop file. The last local read-only connection check returned a pooler tenant error; production connectivity has not been independently verified in this update. No production migrations or provider transactions were performed.

## Independent admin access

Set `ENERGY_ADMIN_EMAIL`, `ENERGY_ADMIN_PASSWORD` (16–128 characters) and `ENERGY_ADMIN_SESSION_SECRET` (at least 32 random characters), then restart or redeploy. The store owner uses that email and password on `/admin/login` and lands directly in the admin workspace. Invite staff from **Team access**. Invited users create their own passwords and receive only the permissions you select. Changing the owner credentials invalidates existing owner sessions.

Inventory changes are validated and written transactionally with optimistic version checks, movement history and audit records. Reserved stock cannot be edited; stock cannot fall below reservations. Unpriced products cannot be enabled. Quotes save to the new database and appear in admin; customer order-confirmation notifications use an independently configured Resend outbox. Orders have searchable views, private detail pages and controlled fulfillment actions. Delivery/pickup options can be configured in operations.

Connected deployments use shared PostgreSQL route counters; disconnected development uses the memory fallback. Finer per-client abuse controls, account recovery/MFA and approved privacy/policy content remain production-hardening work. Use a least-privilege runtime database role; keep migration credentials separate in deployment.

## Pages

- `/` — home
- `/shop` — search, categories and sorting
- `/shop/[slug]` — 18 dedicated product pages
- `/cart` — persistent multi-product cart
- `/checkout` — server-authoritative test checkout (configuration required)
- `/orders/[reference]` — private verified order confirmation and status
- `/about`, `/contact`, `/request-quote`
- `/solutions`, `/solutions/home`, `/solutions/business`, `/solutions/bulk-projects`
- `/categories/solar-panels`, `/categories/solar-inverters`, `/categories/battery-storage`, `/categories/solar-lighting`, `/categories/energy-accessories`, `/categories/power-stations`, `/categories/fans`, `/categories/massage-chairs`
- `/faq`, `/how-to-order`, `/track-order` (reference and private-code order access)
- `/policies/delivery`, `/policies/returns`, `/policies/privacy`, `/policies/terms` (drafts for approval)
- `/admin/preview` — read-only walkthrough with labelled sample screens; no database required
- `/admin/settings`, `/admin/monitoring` — account/configuration and operational health
- `/admin/quotations/[id]`, `/admin/orders/[id]` — managed enquiry and order details
- `/admin`, `/admin/products`, `/admin/inventory`, `/admin/orders`, `/admin/deliveries`, `/admin/customers`, `/admin/quotations`, `/admin/login`

## Validation

```sh
npm run typecheck
npm run lint
npm test
npm run verify:isolation
npm run build
```

Prisma tooling prefers this project's installed engine binaries rather than writing to a shared user cache. A normal `npm ci` installs the engines for your platform. No validation command migrates a database automatically. Schema validation requires the two energy connection variables, but does not connect.

See [Phase 2 report](docs/PHASE-2.md) for provisional content and verification limits. [Discovery](docs/DISCOVERY.md) records the starting architecture. Historical apartment source was removed from the Energy workspace on 28 October 2026. The isolation check rejects reintroduced legacy folders and does not depend on files in the parent project. No inherited payment, scheduling or booking handler is active.

Current implementation, activation instructions, changed files, verification results and pending provider checks: [Phase 3 report](docs/PHASE-3.md).

## Open the correct workspace

Open `Rahat Energy.code-workspace` in your editor, or open this `rahat-energy` directory directly. The containing folder holds the original apartment project and is not the Energy application root. Never edit its environment file for Energy configuration.

The November 2026 catalogue uses all 65 uploaded product photos across 18 listings. Apply migration `202611170001_uploaded_catalogue` to add the new identities and supplied prices to an existing database. Retired placeholder rows remain for historical references and are disabled. Stock and enabled status are not inferred from photos. Power station and garden pole light prices remain on request.

## Product management update

Owners can edit product names, descriptions, categories, specifications, SEO and gallery order at `/admin/products/[id]`. The first photo becomes the cover. Slugs, IDs and SKUs remain fixed to preserve order references. Price and stock remain in Inventory.

Apply migrations through `npm run db:activate` against the existing dedicated Energy project before using the editor. Migration `202611170002_product_management` adds editable presentation records and compressed image storage. The preceding uploaded-catalogue migration sets supplied prices and disables retired placeholders: review it before applying to operational data. No production migration is run by builds or tests.

New uploads are decoded and validated with Sharp, limited to 10 MB/24 megapixels, stripped of metadata, resized within 1600px and converted to WebP. Database-backed 160px and 640px variants support thumbnails and mobile delivery. Content hashes support deduplication and immutable caching. Uploads require an owner session; content edits are audited and reject stale versions. Removing a gallery image does not delete the stored asset.

Connected storefront prices come directly from Inventory, including an explicitly unpriced value. Product names in new checkout snapshots use the edited presentation data. Historic order snapshots stay unchanged.

`npm test` isolates unit/API tests from local production secrets. `npm run test:integration` still requires a disposable loopback database ending in `_test`; it must never use the production database. Current production connection and provider status must be checked separately; no successful external connection or deployment is claimed by this update.

## Launch readiness

`/admin/readiness` gives signed-in staff a read-only product, price, stock, delivery, owner-account and worker checklist. It never changes environment variables, calls payment/email providers or marks configured services as externally verified. `/admin/preview/readiness` offers a database-free explanation of these checks. Missing connection data is shown as unverified rather than replaced with invented inventory.
