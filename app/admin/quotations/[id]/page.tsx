import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { QuoteEditor } from "@/components/admin/OperationForms";
import { operationsAccess } from "@/lib/operations-access";
import { Disconnected } from "@/components/admin/OperationsViews";
import { catalogue } from "@/lib/catalogue";
export const dynamic = "force-dynamic";
export const metadata = { title: "Enquiry details" };
export default async function Page({ params }: { params: { id: string } }) {
  const { actor, db } = await operationsAccess();
  if (!db)
    return (
      <AdminShell title="Enquiry details" authenticated={!!actor}>
        <Disconnected />
      </AdminShell>
    );
  const quotation = await db.quotation.findUnique({ where: { id: params.id } });
  if (!quotation) notFound();
  const history = await db.auditLog.findMany({
    where: { subject: quotation.id, action: "QUOTATION_UPDATED" },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return (
    <AdminShell title={`Enquiry ${quotation.id.slice(-8)}`} authenticated>
      <Link className="text-link" href="/admin/quotations">
        ← All enquiries
      </Link>
      <section className="planning-panel">
        <div>
          <h2>{quotation.name}</h2>
          <p>
            {quotation.email}
            <br />
            {quotation.phone}
            <br />
            {quotation.location}
          </p>
        </div>
        <div>
          <h2>{quotation.status}</h2>
          <p>
            {catalogue.find((p) => p.id === quotation.productId)?.name ||
              "Project enquiry"}{" "}
            · Quantity {quotation.quantity}
          </p>
        </div>
      </section>
      <section className="content-section">
        <h2>Project requirements</h2>
        <p className="preserve-lines">{quotation.requirements}</p>
        {quotation.notes && (
          <>
            <h3>Customer notes</h3>
            <p className="preserve-lines">{quotation.notes}</p>
          </>
        )}
      </section>
      <QuoteEditor
        id={quotation.id}
        version={quotation.version}
        notes={quotation.internalNotes || ""}
        status={quotation.status}
      />
      <section className="content-section">
        <h2>Staff history</h2>
        {history.length ? (
          <ol className="order-history">
            {history.map((e) => {
              const d = e.data as {
                from: string;
                to: string;
                reason: string;
                internalNotes: string;
              };
              return (
                <li key={e.id}>
                  <strong>
                    {d.from} → {d.to}
                  </strong>
                  <p>{d.reason}</p>
                  <p className="preserve-lines">{d.internalNotes}</p>
                  <time>
                    {new Intl.DateTimeFormat("en-NG", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "Africa/Lagos",
                    }).format(e.createdAt)}{" "}
                    WAT · {e.actor}
                  </time>
                </li>
              );
            })}
          </ol>
        ) : (
          <p>No staff updates yet.</p>
        )}
      </section>
    </AdminShell>
  );
}
