import Link from "next/link";
import { operationsAccess } from "@/lib/operations-access";
import { AdminShell } from "@/components/admin/AdminShell";
export const dynamic = "force-dynamic";
export default async function Page({
  searchParams,
}: {
  searchParams: { email?: string; action?: string; page?: string };
}) {
  const { actor, db } = await operationsAccess("activity.view");
  const email = (searchParams.email || "").slice(0, 254),
    action = (searchParams.action || "").slice(0, 80),
    page = Math.max(
      1,
      Math.min(10000, Math.floor(Number(searchParams.page) || 1)),
    );
  const rows = db
    ? await db.auditLog.findMany({
        where: {
          ...(email
            ? { actorEmail: { contains: email, mode: "insensitive" as const } }
            : {}),
          ...(action
            ? { action: { contains: action, mode: "insensitive" as const } }
            : {}),
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 51,
        skip: (page - 1) * 50,
      })
    : [];
  const href = (n: number) =>
    `/admin/activity?${new URLSearchParams({ email, action, page: String(n) })}`;
  return (
    <AdminShell title="Activity" authenticated={!!actor}>
      <p className="small muted">
        Sign-ins, page visits and saved changes, attributed to each account.
        Times are shown in Lagos time.
      </p>
      <form className="inventory-inputs" method="get">
        <label>
          Email
          <input
            name="email"
            defaultValue={email}
            placeholder="Filter by email"
          />
        </label>
        <label>
          Activity
          <input
            name="action"
            defaultValue={action}
            placeholder="e.g. INVENTORY_UPDATE"
          />
        </label>
        <button className="button dark">Filter activity</button>
      </form>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Time (WAT)</th>
              <th>Person</th>
              <th>Activity</th>
              <th>Record</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 50).map((r) => (
              <tr key={r.id}>
                <td>
                  {r.createdAt.toLocaleString("en-GB", {
                    timeZone: "Africa/Lagos",
                  })}
                </td>
                <td>{r.actorEmail || r.actor}</td>
                <td>{r.action.replaceAll("_", " ")}</td>
                <td>{r.subject}</td>
                <td>
                  {r.data && (
                    <details>
                      <summary>View change</summary>
                      <pre style={{ maxWidth: 480, whiteSpace: "pre-wrap" }}>
                        {JSON.stringify(r.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p className="notice">No matching activity.</p>}
      </div>
      <div className="button-row">
        {page > 1 && (
          <Link className="button outline" href={href(page - 1)}>
            Previous
          </Link>
        )}
        <span>Page {page}</span>
        {rows.length > 50 && (
          <Link className="button outline" href={href(page + 1)}>
            Next
          </Link>
        )}
      </div>
    </AdminShell>
  );
}
