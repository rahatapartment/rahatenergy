import { operationsAccess } from "@/lib/operations-access";
import { hasPermission } from "@/lib/admin-permissions";
import { AdminShell } from "@/components/admin/AdminShell";
import { CustomerEditor } from "@/components/admin/CustomerEditor";
export const dynamic = "force-dynamic";
export default async function Page({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const { actor, db } = await operationsAccess("customers.view");
  const q = (searchParams.q || "").slice(0, 254),
    page = Math.max(1, Math.floor(Number(searchParams.page) || 1));
  const customers = db
    ? await db.customer.findMany({
        where: q
          ? {
              OR: [
                { email: { contains: q, mode: "insensitive" } },
                { name: { contains: q, mode: "insensitive" } },
              ],
            }
          : {},
        orderBy: { createdAt: "desc" },
        take: 101,
        skip: (page - 1) * 100,
        include: { _count: { select: { orders: true } } },
      })
    : [];
  const manage = hasPermission(actor, "customers.manage");
  return (
    <AdminShell title="Customers" authenticated={!!actor}>
      {manage && <CustomerEditor />}
      <form className="inventory-inputs">
        <label>
          Find a customer
          <input type="search" name="q" defaultValue={q} />
        </label>
        <button className="button outline">Search</button>
      </form>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Orders</th>
              {manage && <th>Edit</th>}
            </tr>
          </thead>
          <tbody>
            {customers.slice(0, 100).map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.phone || "—"}</td>
                <td>{c._count.orders}</td>
                {manage && (
                  <td>
                    <details>
                      <summary>Edit customer</summary>
                      <CustomerEditor customer={c} />
                    </details>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {customers.length > 100 && (
        <a
          className="button outline"
          href={`?q=${encodeURIComponent(q)}&page=${page + 1}`}
        >
          Next page
        </a>
      )}
    </AdminShell>
  );
}
