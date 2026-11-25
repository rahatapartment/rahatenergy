import { notFound, redirect } from "next/navigation";
import { currentAdmin } from "@/lib/admin-auth";
import { operationsAccess } from "@/lib/operations-access";
import { hasPermission, type AdminPermission } from "@/lib/admin-permissions";
import { adminData } from "@/lib/admin-data";
import { storeData } from "@/lib/store-data";
import { money, catalogue } from "@/lib/catalogue";
import { AdminShell } from "@/components/admin/AdminShell";
import { CatalogueTable } from "@/components/admin/CatalogueTable";
import { InventoryWorkspace } from "@/components/admin/InventoryWorkspace";
import { OverviewWorkspace } from "@/components/admin/OverviewWorkspace";
export const dynamic = "force-dynamic";
export const metadata = { title: "Operations" };
export default async function Page({
  params,
}: {
  params: { section?: string[] };
}) {
  const section = params.section?.[0] || "overview";
  if (
    !["overview", "products", "inventory"].includes(section) ||
    (params.section?.length ?? 0) > 1
  )
    notFound();
  const { actor, db } = await operationsAccess(
    section === "overview" ? undefined : (`${section}.view` as AdminPermission),
  );
  const store = actor && section !== "overview" ? await storeData() : null;
  const data =
    actor?.role === "OWNER" && section === "overview"
      ? await adminData()
      : null;
  const movements =
    actor && db && section === "inventory"
      ? await db.inventoryMovement.findMany({
          orderBy: { createdAt: "desc" },
          take: 50,
        })
      : [];
  const title = {
    overview: "Overview",
    products: "Products",
    inventory: "Inventory",
  }[section]!;
  return (
    <AdminShell title={title} authenticated={!!actor}>
      {!actor && <p className="notice">Sign in to manage your workspace.</p>}
      {section === "overview" && (
        <>
          {data ? (
            <>
              <div className="metric-grid">
                {[
                  [data.mode === "live" ? "Live sales" : "Test sales", money(data.metrics.sales)],
                  ["Paid orders", data.metrics.paidOrders],
                  ["Pending orders", data.metrics.pendingOrders],
                  ["Low stock", data.metrics.lowStock],
                  ["Pending deliveries", data.metrics.pendingDeliveries],
                  ["New enquiries", data.metrics.newQuotes],
                ].map(([label, value]) => (
                  <div className="metric" key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
              <OverviewWorkspace connected={true} />
            </>
          ) : (
            <p className="notice">
              Welcome back. Choose a section from the navigation to begin. Your
              owner manages your access.
            </p>
          )}
        </>
      )}
      {section === "products" && (
        <>
          <p className="small muted">
            Open a product to manage its presentation, images, pricing and
            stock.
          </p>
          <CatalogueTable
            sourceProducts={store?.products}
            editable={!!actor && store?.status === "connected"}
          />
        </>
      )}
      {section === "inventory" && (
        <>
          <p className="small muted">
            Update stock and pricing below. Every save records the change and
            your account automatically. Reserved stock cannot be removed.
          </p>
          {store?.status === "connected" ? (
            <InventoryWorkspace products={store.products} />
          ) : (
            <p className="notice">Inventory is currently unavailable.</p>
          )}
          <h2>Recent stock history</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Time (WAT)</th>
                  <th>Product</th>
                  <th>Stock change</th>
                  <th>Reserved change</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id}>
                    <td>
                      {m.createdAt.toLocaleString("en-GB", {
                        timeZone: "Africa/Lagos",
                      })}
                    </td>
                    <td>{catalogue.find((p) => p.id === m.productId)?.name}</td>
                    <td>{m.delta}</td>
                    <td>{m.reservedDelta}</td>
                    <td>{m.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AdminShell>
  );
}
