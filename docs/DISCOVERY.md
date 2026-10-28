# Discovery and implementation plan — 26 October 2026

## Brand and content audit

https://rahatenergy.bolt.host returned no readable content through web inspection. Local HTTP retrieval failed DNS resolution. No logo, palette, typography, products, prices, specifications, photographs, company description, contact details, delivery fees or service areas could be verified. The executive proposal was not supplied. Preserve the supplied name, Rahat Energy. Screenshots of all pages plus original logo/product assets, or a source export, are required before finalising brand decisions. No apartment imagery was copied. The catalogue contains exactly fifteen provisional identities from the brief, clearly marked placeholders.

## Apartment architecture audit

Next.js 14 App Router, React 18, TypeScript, Tailwind, Lucide, Framer Motion; PostgreSQL with Prisma 5. Existing entities: User, Apartment, ApartmentImage, Amenity, Booking, BookingHold, Payment, Review, BlockedDate, BookingEmail, PromoCode. Original schema history comprises additive SQL updates without baseline migrations. Start a new migration history for energy.

Authentication uses jose JWT cookies, middleware and an environment-configured shared admin password. Payments use Paystack initialization/verification, raw-body HMAC checks and shared idempotent booking confirmation. Notifications use a transactionally queued Resend outbox with leases, retry scheduling and provider idempotency keys. Media utilities support responsive local WebP variants. SEO helpers implement metadata, sitemap, robots and accommodation JSON-LD. README discusses Supabase/Netlify, but production deployment resources were not inspected.

## Reuse mapping

| Existing | Energy adaptation |
| --- | --- |
| Listing cards, detail layouts, navigation | Product catalogue and product details with verified assets |
| Checkout forms | Multi-item cart, delivery selection, server-calculated totals |
| Paystack wrappers and signature validation | Independent test merchant credentials, order references and verified totals |
| Admin shell, tables and customer views | Inventory, orders, deliveries, quotes and real record-based metrics |
| JWT helpers | Independent cookie/secrets, issuer/audience validation, admin identities and rate limiting |
| Email outbox | Independent sender, immutable order/quote payloads and notification events |
| Responsive media and SEO helpers | Energy assets and product-specific metadata without invented offers |

Replace date availability, room capacity, nightly pricing, stay discounts, caution deposits, booking states, apartment receipts and calendars. Do not activate preserved booking APIs. Remove apartment domains and sender defaults before reusing helpers.

## Isolation completed

The source-derived `rahat-energy/` workspace has no copied .env, Git history/remotes, node_modules, build output, deployment identity, apartment media, database contents or executable Prisma schema. The original schema is retained only as an inert documentation reference. Routes and middleware are quarantined outside Next.js routing; only an explicit development holding page is active. Preserved utility secret lookups use ENERGY-prefixed variables, and the admin cookie name is independent. No database or external service was contacted. Original source hashes are recorded for verification. The original application remains unchanged except for the added project directory.

## Proposed independent PostgreSQL/Prisma structure

| Entity | Responsibility |
| --- | --- |
| Product | Exactly fifteen permitted catalogue IDs/SKUs; definitions version controlled; no create/delete endpoint |
| Inventory | One row/product; integer price in kobo, stock, reserved, threshold, enabled; missing prices disable checkout |
| InventoryMovement | Immutable stock deltas, reason, actor and unique event key |
| InventoryReservation | Order/product quantity, expiry and lifecycle, unique order/product |
| Customer | New guest/customer details only; no imported apartment records |
| Order / OrderItem | Random reference, hashed access token, contact/address snapshots, immutable server prices/totals |
| Payment | Unique provider reference, expected amount/currency, verified status and time |
| Delivery / DeliveryZone | Configured supported zones/fees, address snapshot, separate progress and optional tracking |
| QuoteRequest | Contact, product, quantity, location, requirements, status and internal notes |
| Notification | Immutable event payload, unique key, lease, retry schedule, provider ID |
| AdminUser | Independent identity, password hash and role |
| AuditLog / OrderEvent | Actor, change and timestamp; retained operation history |

Anonymous carts can persist locally; all lines and totals must be revalidated on the server. Seed only the fifteen allowed identities with idempotent creates, never overwriting operational prices or stock.

## Commerce invariants and testing requirements

Lock inventory rows in deterministic product order inside transactions, check available stock, reserve quantities and create immutable order totals. Payment finalization and reservation expiry must share locking rules. Verify gateway reference, currency, successful status and expected total before a unique finalization converts reserved stock to sold stock. Duplicate events cannot deduct stock twice. Late captured payments after expiry require explicit resolution/refund handling. Release expired holds and process notifications via separately authenticated schedulers. Use unique movement keys for cancellation/restock. Track payment, fulfillment and delivery independently. Queue notifications with state changes; sending failures must not undo payments.

Tracking requires a high-entropy token stored hashed, not a reference alone. Rate-limit public forms, login and tracking. Protect admin mutations against cross-site requests and authorize in handlers. Do not invent delivery zones, stock, prices, merchant configuration or business claims.

Test against dedicated PostgreSQL: simultaneous checkouts, expiry/payment races, duplicate webhooks, amount/currency mismatch, failed payment initialization, cancellation idempotency, admin permissions, secure tracking and outbox retries. Then test real gateway/email staging integration and responsive accessibility. Existing booking tests do not substitute for these checks.

## Controlled stages and outstanding work

1. Discovery: technical audit complete; reference brand/content audit blocked by inaccessible site.
2. Isolation: sanitized source-derived workspace created; new service provisioning pending.
3. Storefront conversion: verify reference assets, adapt home/navigation/shop/product/cart views, confirm fifteen identities.
4. Commerce: implement new schema/migrations/seeds, inventory transactions, order checkout and test-mode verified payments.
5. Operations: independent authentication, controlled price/stock administration, orders, delivery, customers, quotes, real metrics.
6. Supporting features: outbox notifications, approved company/contact content, draft policies, SEO and image optimization.
7. Testing: critical database/payment/security workflows and mobile/accessibility review.
8. Launch: provision separate database/storage/auth/email/payment/hosting resources, set secrets and schedules, migrate/seed only the empty energy database and run staging payments. Do not replace the current energy site without explicit approval.

Needed next: screenshots or source/assets from the reference site; executive proposal if applicable; verified catalogue/operational data; new energy service accounts. No live commerce functionality is claimed complete, and no deployment has been made.

## Phase 2 follow-up

The storefront, cart, schema/migration and admin foundation are now implemented. See [PHASE-2.md](PHASE-2.md) for current status and provisional design decisions; the earlier stage descriptions above record the original discovery state. Database provisioning, migrations against PostgreSQL and payment/fulfillment workflows remain pending.
