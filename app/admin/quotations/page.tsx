import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { operationsAccess } from "@/lib/operations-access";
import {
  Disconnected,
  ListFilters,
  Pagination,
  listParams,
} from "@/components/admin/OperationsViews";
import { quoteStatuses } from "@/lib/operation-rules";
import { catalogue } from "@/lib/catalogue";
export const dynamic = "force-dynamic";
export const metadata = { title: "Quotation management" };
export default async function Page({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; page?: string };
}) {
  const { actor, db } = await operationsAccess();
  const p = listParams(searchParams, quoteStatuses);
  const where = {
    ...(p.status === "ALL" ? {} : { status: p.status }),
    ...(p.q
      ? {
          OR: [
            { name: { contains: p.q, mode: "insensitive" as const } },
            { email: { contains: p.q, mode: "insensitive" as const } },
            { id: { contains: p.q } },
          ],
        }
      : {}),
  };
  const data = db
    ? await Promise.all([
        db.quotation.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (p.page - 1) * 20,
          take: 20,
        }),
        db.quotation.count({ where }),
      ]).catch(() => null)
    : null;
  return (
    <AdminShell title="Quotations" authenticated={!!actor}>
      {!data ? (
        <Disconnected />
      ) : (
        <>
          <ListFilters
            query={p.q}
            status={p.status}
            statuses={[...quoteStatuses]}
          />
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ENQUIRY</th>
                  <th>CONTACT</th>
                  <th>PRODUCT / QTY</th>
                  <th>LOCATION</th>
                  <th>STATUS</th>
                  <th>DETAILS</th>
                </tr>
              </thead>
              <tbody>
                {data[0].map((q) => (
                  <tr key={q.id}>
                    <td>
                      {q.id.slice(-8)}
                      <small>
                        {new Intl.DateTimeFormat("en-NG", {
                          dateStyle: "medium",
                          timeZone: "Africa/Lagos",
                        }).format(q.createdAt)}
                      </small>
                    </td>
                    <td>
                      {q.name}
                      <small>{q.email}</small>
                    </td>
                    <td>
                      {catalogue.find((p) => p.id === q.productId)?.name ||
                        "Project enquiry"}{" "}
                      × {q.quantity}
                    </td>
                    <td>{q.location}</td>
                    <td>{q.status}</td>
                    <td>
                      <Link
                        className="inline-link"
                        href={`/admin/quotations/${q.id}`}
                      >
                        Open enquiry →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data[1] && (
              <p className="empty">No enquiries match these filters.</p>
            )}
          </div>
          <Pagination
            page={p.page}
            total={data[1]}
            query={p.q}
            status={p.status}
          />
        </>
      )}
    </AdminShell>
  );
}
