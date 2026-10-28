import { AdminShell } from "@/components/admin/AdminShell";
import { AdminAccountForms } from "@/components/admin/OperationForms";
import { operationsAccess } from "@/lib/operations-access";
import { Disconnected } from "@/components/admin/OperationsViews";
export const dynamic = "force-dynamic";
export const metadata = { title: "Operations settings" };
export default async function Page() {
  const { actor, db } = await operationsAccess();
  const connected = db
    ? await db.$queryRaw`SELECT 1`.then(() => true).catch(() => false)
    : false;
  const users =
    actor?.role === "OWNER" && connected
      ? await db!.adminUser.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            active: true,
          },
          orderBy: { createdAt: "asc" },
        })
      : [];
  const flags = [
    [
      "Independent database",
      connected ? "Connected" : "Deferred / unavailable",
    ],
    ["Payment mode", "Test only · live keys rejected"],
    [
      "Paystack test configuration",
      process.env.ENERGY_PAYSTACK_SECRET_KEY?.startsWith("sk_test_")
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
    ["Product catalogue", "15 fixed identities · no add/delete controls"],
  ];
  return (
    <AdminShell title="Settings" authenticated={!!actor}>
      <p className="notice">
        Supabase provisioning is deferred. This page never displays passwords,
        API keys or connection strings.
      </p>
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
            {actor?.bootstrap
              ? "Initial setup session: create your first named OWNER account. Existing setup sessions and the shared password stop working once a named account exists."
              : "Named accounts use hashed passwords and revocable sessions. Owner actions and changes are recorded in audit history."}
          </p>
          <AdminAccountForms
            users={users}
            self={actor!.id}
            owner={actor!.role === "OWNER"}
          />
        </>
      )}
    </AdminShell>
  );
}
