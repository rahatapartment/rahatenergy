import Link from "next/link";
import { catalogue } from "@/lib/catalogue";
import { AdminShell } from "@/components/admin/AdminShell";
import { operationsAccess } from "@/lib/operations-access";
import { Disconnected } from "@/components/admin/OperationsViews";
import { paymentModeLabel, paymentsReady } from "@/lib/paystack";
export const dynamic = "force-dynamic";
export const metadata = { title: "Operations settings" };
export default async function Page() {
  const { actor, db } = await operationsAccess("owner");
  const connected = db
    ? await db.$queryRaw`SELECT 1`.then(() => true).catch(() => false)
    : false;
  const flags = [
    [
      "Independent database",
      connected ? "Connected" : "Connection unavailable",
    ],
    ["Payment mode", paymentModeLabel()],
    [
      "Paystack configuration",
      paymentsReady()
        ? "Configured"
        : "Not configured",
    ],
    [
      "Customer email",
      process.env.ENERGY_EMAIL_FROM && process.env.ENERGY_RESEND_API_KEY
        ? "Configured · provider delivery requires validation"
        : "Not configured",
    ],
    [
      "Scheduler authentication",
      process.env.ENERGY_CRON_SECRET &&
      process.env.ENERGY_CRON_SECRET.length >= 32
        ? "Secret configured · see Monitoring for job runs"
        : "Not configured",
    ],
    [
      "Rate limiting",
      connected ? "Shared PostgreSQL counters" : "Process-local fallback",
    ],
    [
      "Product catalogue",
      `${catalogue.length} products · names, details and images editable by owners`,
    ],
  ];
  return (
    <AdminShell title="Settings" authenticated={!!actor}>
      <p className="notice">
        This page shows connection and setup status without displaying
        passwords, API keys or connection strings.
      </p>
      <Link className="admin-table-link" href="/admin/readiness">
        Review launch readiness ↗
      </Link>
      <dl className="settings-list">
        {flags.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>
              {actor ||
              label === "Product catalogue" ||
              label === "Payment mode"
                ? value
                : "Sign in to inspect configuration"}
            </dd>
          </div>
        ))}
      </dl>
      {!connected ? (
        <Disconnected />
      ) : (
        <>
          <p className="notice">
            The store owner signs in with the email and password configured in the environment.
            Invite other team members from Team access.
          </p>
          <Link className="button dark" href="/admin/team">
            Manage team access →
          </Link>
        </>
      )}
    </AdminShell>
  );
}
