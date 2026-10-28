import { AdminShell } from "@/components/admin/AdminShell";
import { operationsAccess } from "@/lib/operations-access";
import { Disconnected } from "@/components/admin/OperationsViews";
export const dynamic = "force-dynamic";
export const metadata = { title: "Operations monitoring" };
const format = (d: Date) =>
  new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(d);
export default async function Page() {
  const { actor, db } = await operationsAccess();
  const data = db
    ? await Promise.all([
        db.jobRun.findMany({ take: 20, orderBy: { startedAt: "desc" } }),
        db.notification.findMany({
          take: 50,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            eventKey: true,
            attempts: true,
            sentAt: true,
            lastError: true,
            nextAttemptAt: true,
          },
        }),
        db.auditLog.findMany({
          take: 50,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            actor: true,
            action: true,
            subject: true,
            createdAt: true,
          },
        }),
        db.notification.count({
          where: { sentAt: null, attempts: { lt: 12 } },
        }),
        db.notification.count({
          where: { sentAt: null, attempts: { gte: 12 } },
        }),
        db.refund.count({ where: { status: "REQUESTED" } }),
      ]).catch(() => null)
    : null;
  const last = data?.[0][0];
  return (
    <AdminShell title="Monitoring" authenticated={!!actor}>
      {!data ? (
        <Disconnected />
      ) : (
        <>
          <div className="metric-grid">
            {[
              ["Queued emails", data[3]],
              ["Email review required", data[4]],
              ["Pending test refunds", data[5]],
              ["Last worker result", last?.status || "Not observed"],
            ].map(([label, value]) => (
              <div className="metric" key={label}>
                <span>{label}</span>
                <strong style={{ fontSize: 22 }}>{value}</strong>
              </div>
            ))}
          </div>
          <p
            className={
              last &&
              last.status === "SUCCEEDED" &&
              Date.now() - (last.finishedAt?.getTime() || 0) < 5 * 60000
                ? "notice"
                : "notice error"
            }
          >
            {!last
              ? "No authenticated worker run has been observed. Configure the scheduler later to process expiry and notification retries."
              : `Last worker run: ${format(last.startedAt)} WAT · ${last.status}. ${last.status === "SUCCEEDED" && Date.now() - (last.finishedAt?.getTime() || 0) >= 5 * 60000 ? "Worker activity is stale; check the external scheduler." : ""}`}
          </p>
          <section className="content-section">
            <h2>Recent worker runs</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>STARTED (WAT)</th>
                    <th>STATUS</th>
                    <th>FINISHED (WAT)</th>
                  </tr>
                </thead>
                <tbody>
                  {data[0].map((j) => (
                    <tr key={j.id}>
                      <td>{format(j.startedAt)}</td>
                      <td>{j.status}</td>
                      <td>{j.finishedAt ? format(j.finishedAt) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!data[0].length && (
                <p className="empty">No worker runs recorded.</p>
              )}
            </div>
          </section>
          <section>
            <h2>Email queue</h2>
            <p className="small muted">
              Successful means accepted by the provider, not guaranteed inbox
              delivery. Exhausted or ambiguous sends need provider-log review
              before any manual resend.
            </p>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>EVENT</th>
                    <th>ATTEMPTS</th>
                    <th>RESULT</th>
                    <th>RETRY (WAT)</th>
                  </tr>
                </thead>
                <tbody>
                  {data[1].map((n) => (
                    <tr key={n.id}>
                      <td>{n.eventKey}</td>
                      <td>{n.attempts}</td>
                      <td>
                        {n.sentAt
                          ? "Provider accepted"
                          : n.attempts >= 12
                            ? "Review required"
                            : n.lastError || "Queued"}
                      </td>
                      <td>{n.sentAt ? "—" : format(n.nextAttemptAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!data[1].length && (
                <p className="empty">No email jobs recorded.</p>
              )}
            </div>
          </section>
          <section className="content-section">
            <h2>Recent audit activity</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>DATE (WAT)</th>
                    <th>ACTOR</th>
                    <th>ACTION</th>
                    <th>RECORD</th>
                  </tr>
                </thead>
                <tbody>
                  {data[2].map((a) => (
                    <tr key={a.id}>
                      <td>{format(a.createdAt)}</td>
                      <td>{a.actor}</td>
                      <td>{a.action}</td>
                      <td>{a.subject}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="small muted">
              Latest 20 runs, 50 email jobs and 50 audit entries. Private audit
              payloads are omitted from this overview.
            </p>
          </section>
        </>
      )}
    </AdminShell>
  );
}
