# Admin team and inventory

The workspace has one business owner. Initial setup in Settings creates that named owner and disables shared setup credentials. The owner uses **Team access** to invite staff by email, assign allowed actions, suspend access, or revoke invitations. Additional owners cannot be created.

Invitations use random, single-use links that expire after 48 hours. Only token hashes are stored in the invitation table. Sending a new invitation to an email invalidates older links. Invitation messages are queued in the existing notification outbox; provider acceptance is distinguished from inbox delivery. Configure `ENERGY_RESEND_API_KEY`, `ENERGY_EMAIL_FROM` and `NEXT_PUBLIC_APP_URL` in each deployment environment. Never put these secrets in client variables. Monitoring shows delivery attempts. Without email configuration the invitation control is disabled.

Permissions are enforced by server routes, independently of navigation. Increasing stock, reducing stock, changing prices, and adjusting availability/alerts are separate grants. Editing a resource also grants viewing that resource. Cancellation, refund review and allocation remain owner-only. Updating a staff account revokes its existing sessions.

Inventory is editable directly in Inventory and on a product's edit page. Saves use optimistic version checks and cannot reduce total stock below reservations. A typed reason is optional; every change records before/after values and the account email. The current browser shares confirmed inventory updates across admin routes and other tabs of the same account. Prefetched navigation avoids loading unrelated operational records.

Activity supports email/action filters and pagination. Successful sign-ins, failed sign-ins to known accounts, sign-outs, page visits, invitations, staff access updates, customer edits, product edits and stock changes are recorded. Passwords and invitation tokens are excluded from audit records. Historical system/setup events can have an actor identifier instead of an email.

## Verification

Run `npm test`, `npm run build`, and `npm run verify:isolation`. The integration suite requires `ENERGY_TEST_DATABASE_URL` to identify a **disposable loopback database ending in `_test`**. Run `npm run test:integration`; it applies migrations and clears test records. Never point it at a customer or production database.

Before releasing, back up the existing database and apply `202611170003_admin_team` with `npm run db:deploy`. The migration stops if multiple owners already exist; it never selects or removes an owner automatically. Existing operators keep their previous operational permissions. `npm run db:release-check` verifies the deployment's migration history.
