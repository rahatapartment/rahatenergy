# Rahat Energy

**Current stage: Phase 4 operations. Supabase provisioning is deferred.** Review the database-free, read-only walkthrough at `/admin/preview`. See [Phase 4 report](docs/PHASE-4.md).

Independent Next.js 14 storefront converted from the isolated source. Phase 3 adds server-authoritative test checkout, stock reservations, verified payments, private order confirmation and order operations to the existing storefront. No live payments or production deployment.

## Run locally

```sh
npm ci
npm run db:generate
npm run dev
```

Open http://localhost:3001. Run commands from this **nested `rahat-energy` directory**; the parent folder is the preserved apartment source.

The storefront works without credentials. Checkout becomes available only when the independent database, verified operational inventory, delivery options and Paystack test credentials are configured. See [Phase 3 setup and status](docs/PHASE-3.md). Live payments are rejected in code.

## Independent database setup

Provision a **new, empty PostgreSQL database** dedicated to Rahat Energy. Do not copy the parent environment or connect to the apartment database. Copy this project's `.env.example` to `.env` and set only new `ENERGY_DATABASE_URL` and `ENERGY_DIRECT_URL` values. The latter is a direct connection used for migrations.

```sh
npm run db:check
npm run db:activate
```

The migration creates the energy schema and constraints; the seed inserts exactly 15 code-controlled identities and default inventory rows. Repeated seeding uses `ON CONFLICT DO NOTHING`, preserving prices, stock and availability. Initial inventory is zero, disabled and unpriced; this is a safe initialization, not verified business inventory. Product definitions live in `catalogue/products.json`. The API has no product create/delete methods; database checks restrict IDs/SKUs and a trigger prevents product identity updates/deletes. Future identity changes require a reviewed migration.

**Supabase status:** not provisioned or activated. Migrations, idempotent seeding and transactional reads/writes have been validated against a disposable local PostgreSQL instance only. No successful external Paystack transaction is claimed.

## Independent admin access

Set a new `ENERGY_ADMIN_PASSWORD` (at least 16 characters) and `ENERGY_ADMIN_SESSION_SECRET` (at least 32 random characters), then restart. Open `/admin/login`. Shared-password access is for initial setup only. Once the first named owner is created, named OWNER/OPERATOR accounts replace it, with hashed passwords, independent sessions, version-based revocation and server-enforced permissions. Unconfigured admin pages expose only the foundation and public catalogue; private records and editing remain locked. With configured credentials, all operations pages require sign-in.

Inventory changes are validated and written transactionally with optimistic version checks, movement history and audit records. Reserved stock cannot be edited; stock cannot fall below reservations. Unpriced products cannot be enabled. Quotes save to the new database and appear in admin; customer order-confirmation notifications use an independently configured Resend outbox. Orders have searchable views, private detail pages and controlled fulfillment actions. Delivery/pickup options can be configured in operations.

Connected deployments use shared PostgreSQL route counters; disconnected development uses the memory fallback. Finer per-client abuse controls, account recovery/MFA and approved privacy/policy content remain production-hardening work. Use a least-privilege runtime database role; keep migration credentials separate in deployment.

## Pages

- `/` — home
- `/shop` — search, categories, sorting and stock filter
- `/shop/[slug]` — fifteen dedicated product pages
- `/cart` — persistent multi-product cart
- `/checkout` — server-authoritative test checkout (configuration required)
- `/orders/[reference]` — private verified order confirmation and status
- `/about`, `/contact`, `/request-quote`
- `/solutions`, `/solutions/home`, `/solutions/business`, `/solutions/bulk-projects`
- `/categories/solar-panels`, `/categories/solar-inverters`, `/categories/battery-storage`, `/categories/solar-lighting`, `/categories/energy-accessories`
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
