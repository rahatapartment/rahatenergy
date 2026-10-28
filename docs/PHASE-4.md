# Phase 4 — operations without Supabase provisioning

Supabase creation and activation remain deliberately deferred. No external database, merchant account, live payment, refund or production deployment was created or activated. Work continued inside the existing independent Energy project; the apartment application remains outside this scope.

## Review the new screens now

Open `/admin/preview`. This separate read-only walkthrough requires no credentials or database. Nine sections show explicitly labelled examples of the workflows, with disabled operational controls. It contains no real sales totals, customers, inventory or order records and never calls write APIs. The real admin screens remain disconnected until a database is configured.

## Completed operations

- **Quotations:** server-side search, status filters and 20-record pagination; dedicated enquiry details; controlled status changes, private staff notes, stale-write protection and staff history. Closed enquiries can be deliberately reopened to CONTACTED.
- **Deliveries:** searchable/paginated records; delivery/pickup configuration; paid-order progress, tracking references, recorded reasons and customer notification jobs. Pickup uses its own readiness state. Failed deliveries can be prepared for another dispatch; an order that already entered courier custody stays in dispatched fulfillment and cannot be cancelled/restocked as an unshipped order.
- **Orders:** paginated database search across references and immutable customer snapshots, payment/fulfillment filters and details. Existing fulfillment controls remain available.
- **Cancellations:** owner approval requires the exact reference and a reason. Unpaid holds are released once. Sold, unshipped quantities are restored once through immutable stock movements. Paid cancellation creates a refund request while retaining PAID financial status until separate provider verification. Cancellation and dispatch serialize on the same order lock.
- **Late payments:** an owner can allocate enabled, available stock to a paid payment-review order, preserving its historic prices. Explicitly cancelled orders cannot be reallocated. A later charge after cancellation stays cancelled and creates a refund request rather than becoming dispatchable.
- **Refund records:** owner-only verification reads a refund already completed in the independent Paystack test account. It matches the original transaction ID/reference, test domain, currency, full order total, processed status and timestamp. Only then are the order/payment marked REFUNDED. Duplicate verification cannot restore stock or rewrite financial history twice. The panel does not initiate refunds or transfers. Partial refunds and post-dispatch return handling remain outside this implementation.
- **Named administrators:** OWNER and OPERATOR accounts, salted scrypt password hashes, independent JWTs and per-account revocable sessions. Owners manage accounts and financial review. Operators handle enquiries, inventory, orders and deliveries. The first named owner replaces shared-password setup access; old setup sessions stop working. Role/password/active-state changes revoke old sessions. Account management serializes and rechecks owner authority; the last active owner cannot be removed through these controls. An owner asks another owner to change their own account.
- **Settings:** configuration presence/status only, never secret values. Named-account management becomes available when connected.
- **Monitoring:** recent worker runs, stale-worker warnings, queued/exhausted/provider-accepted email jobs and recent audit activity. Provider acceptance is not reported as guaranteed inbox delivery. Private audit payloads are omitted from the overview.
- **Shared rate limits:** public checkout, enquiry and order-access/verification endpoints and administrator sign-in use atomic PostgreSQL counters when connected. Without a database the process-local limiter remains the development fallback. These are route-level aggregate limits, not a complete per-client abuse-prevention system.
- **Notifications:** enquiry acknowledgement and optional admin enquiry alerts; delivery, cancellation and verified-test-refund notifications use the existing leased outbox. No message is sent without the independently configured sender/provider and worker infrastructure. Private staff notes and cancellation reasons are not included in customer notices.

## Data changes

The third additive migration, `202610260003_operations`, adds:

- `Refund`, `AdminUser`, `RateLimitBucket`, `JobRun`.
- Order cancellation/restock timestamps and reason.
- Delivery and quotation versions, plus enquiry update timestamps.
- Delivery pickup/cancellation states, role/refund/job constraints and RLS on all new tables.

The migration was prepared and exercised only on disposable loopback PostgreSQL. No Supabase migration was run. The 15-product catalogue and no-create/no-delete restriction are unchanged. Normal seeds do not create accounts, delivery rates, prices or synthetic operational records.

## Permissions

| Action | Operator | Owner |
| --- | --- | --- |
| Enquiries, inventory, orders, delivery progress | Yes | Yes |
| Approve cancellation / stock review allocation | No | Yes |
| Verify completed test refund | No | Yes |
| Manage administrators | No | Yes |
| Inspect operational monitoring | Yes | Yes |

Roles are checked by the API, not just hidden in the interface. Bootstrap access is disabled once any named account exists; it is not a password-recovery bypass. MFA, self-service password changes and a recovery process still need a later production-hardening pass.

## Main source changes

`lib/operations.ts`, `operation-rules.ts`, `operations-validation.ts`, `admin-users.ts`, `passwords.ts`, `operations-access.ts`; updated authentication, shared limits, commerce and notification routes; new order action, quotation, delivery and account APIs; dedicated operations pages and `components/admin/OperationForms.tsx`; the read-only preview route; schema/migration, tests and documentation.

`tests/phase4-fixtures.ts` is a browser-test helper restricted to a loopback database ending in `_test`. It is never imported by application routes or the normal seed command. Synthetic fixture prices/accounts live only in that disposable test environment. Provider responses used for automated refund checks are test doubles, not real Paystack transactions.

## Later, when you choose to connect services

The existing setup remains documented in `docs/PHASE-3.md`. No setup is required to use the walkthrough now. Eventually apply all three migrations to the separate Energy database, configure verified prices/delivery options, create the first named owner, and validate real test-merchant and notification behavior. `ENERGY_ADMIN_EMAIL` is an optional plain recipient address for enquiry alerts. Existing independent secrets and fixed-catalogue controls continue to apply.

Production work still outstanding: real provider validation, approved catalogue/contact/brand/policy content, post-dispatch returns and partial refunds, account recovery/MFA, finer abuse protection, operational retention/alerting, and a separately approved deployment. No live-payment switch was introduced.

References: [Paystack refund retrieval](https://paystack.com/docs/api/refund/), [OWASP password storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).

## Verification

- TypeScript and ESLint passed.
- 23 unit/API tests passed, including salted-password verification, independent sessions, test-key enforcement, input restrictions and separate pickup/delivery progressions.
- 30 real PostgreSQL integration tests passed against disposable loopback data. They include all Phase 3 regressions and the new quotation/version checks, delivery retry rules, pickup completion, unpaid/paid cancellation idempotency, late-capture refund requirements, reviewed stock allocation, strict refund evidence matching, account/session revocation, owner/operator permissions, shared counters, worker telemetry and cancellation-versus-dispatch races.
- The third migration was applied only to the disposable test database. The normal seeds still preserved operational values and exactly 15 identities.
- Nine database-free walkthrough sections passed desktop/mobile browser checks. No write requests were made. Automated accessibility checks found zero violations on the tested walkthrough and disconnected operations pages.
- Connected local browser flows passed enquiry pagination (20+5 fixtures), staff notes/history, delivery tracking, first-owner setup and setup-session invalidation, operator creation, cancellation/restocking, simulated completed test-refund verification, paid-review allocation, role rejection, session revocation and worker monitoring.
- Connected operations pages passed 390px layout checks and automated accessibility checks with zero violations on the tested enquiry, order, settings, monitoring and order-list screens. No page errors were observed.
- Provider data in browser tests was simulated read-only evidence. No external payment, refund, email or Supabase request occurred.
- Evidence: `docs/phase4-preview-qa.json`, `docs/phase4-operations-qa.json`, `docs/phase4-walkthrough-desktop.png`, `docs/phase4-walkthrough-mobile.png`.
- Original-project checksums remained unchanged. Supabase and live services remain unconfigured.

The optimized production build passed, including the dedicated operations and walkthrough routes. Isolation verification confirmed all 145 recorded parent source files remain unchanged. Temporary PostgreSQL and the connected QA server were stopped after testing; the normal port-3001 preview was restored without fixture credentials or a provider simulation. No production deployment was made.
