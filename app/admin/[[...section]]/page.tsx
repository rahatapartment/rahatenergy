import Link from "next/link";
import { CatalogueTable } from "@/components/admin/CatalogueTable";
import { OverviewWorkspace } from "@/components/admin/OverviewWorkspace";
import { OrdersTable } from "@/components/admin/OrderManager";
import { DeliveryOptions } from "@/components/admin/DeliveryOptions";
import { getDb } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { adminData } from "@/lib/admin-data";
import { storeData } from "@/lib/store-data";
import { catalogue, money, availability } from "@/lib/catalogue";
import { AdminShell } from "@/components/admin/AdminShell";
import { InventoryEditor } from "@/components/admin/InventoryEditor";
export const dynamic = "force-dynamic";
export const metadata = { title: "Operations" };
const titles: Record<string, string> = {
  overview: "Overview",
  products: "Products",
  inventory: "Inventory",
  orders: "Orders",
  deliveries: "Deliveries",
  customers: "Customers",
  quotations: "Quotations",
};
const date = (v: Date) =>
  new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeZone: "Africa/Lagos",
  }).format(v);
function Empty({ label }: { label: string }) {
  return (
    <div className="empty">
      <h2>No {label} yet.</h2>
      <p>
        Records will appear here when they are created in the independent
        database.
      </p>
    </div>
  );
}
export default async function Page({
  params,
}: {
  params: { section?: string[] };
}) {
  const section = params.section?.[0] || "overview";
  if (!titles[section] || (params.section?.length ?? 0) > 1) notFound();
  const authenticated = await isAdmin();
  const configured =
    !!getDb() ||
    (!!process.env.ENERGY_ADMIN_PASSWORD &&
      !!process.env.ENERGY_ADMIN_SESSION_SECRET);
  if (configured && !authenticated) redirect("/admin/login");
  const data = authenticated ? await adminData() : null;
  const store = authenticated ? await storeData() : null;
  const deliveryOptions =
    authenticated && data
      ? await getDb()!
          .deliveryOption.findMany({ orderBy: { label: "asc" } })
          .catch(() => [])
      : [];
  return (
    <AdminShell title={titles[section]} authenticated={authenticated}>
      {!authenticated && (
        <div className="notice">
          Preview foundation · Independent admin credentials are not configured.
          Private records and operational editing are locked.{" "}
          <Link className="inline-link" href="/admin/preview">
            Explore the read-only walkthrough →
          </Link>
        </div>
      )}
      {authenticated && !data && (
        <div className="notice">
          The independent database is unconfigured or unavailable. No
          operational records or metrics are being substituted.
        </div>
      )}
      {section === "overview" && (
        <>
          <div className="metric-grid">
            {[
              ["Total test payments", data ? money(data.metrics.sales) : "—"],
              ["Paid test orders", data?.metrics.paidOrders ?? "—"],
              ["Pending orders", data?.metrics.pendingOrders ?? "—"],
              ["Low-stock products", data?.metrics.lowStock ?? "—"],
              ["Pending deliveries", data?.metrics.pendingDeliveries ?? "—"],
              ["New quotations", data?.metrics.newQuotes ?? "—"],
            ].map(([label, value]) => (
              <div className="metric" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <OverviewWorkspace connected={!!data} />
          <div className="notice">
            Exactly 15 code-controlled product identities. Product creation and
            deletion are unavailable. Checkout uses Paystack test mode only.
            Paid test orders can be processed through controlled fulfillment
            states.
          </div>
        </>
      )}
      {section === "products" && (
        <>
          <p className="small muted">
            Read-only catalogue · Product names, identities and content are
            maintained in version control.
          </p>
          <CatalogueTable />
        </>
      )}
      {section === "inventory" && (
        <>
          <p className="small muted">
            Prices, stock, low-stock thresholds and purchase availability only.
            Reserved quantities cannot be edited.
          </p>
          {store?.status === "connected" ? (
            <>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>PRODUCT</th>
                      <th>PRICE</th>
                      <th>STOCK</th>
                      <th>RESERVED</th>
                      <th>AVAILABLE</th>
                      <th>THRESHOLD</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {store.products.map((p) => (
                      <tr key={p.id}>
                        <td>
                          {p.name}
                          <small>{p.sku}</small>
                        </td>
                        <td>{money(p.priceKobo)}</td>
                        <td>{p.stock ?? "Unseeded"}</td>
                        <td>{p.reserved}</td>
                        <td>{p.stock === null ? "—" : p.stock - p.reserved}</td>
                        <td>{p.lowStockThreshold}</td>
                        <td>
                          {availability(p)}
                          {p.stock !== null &&
                          p.stock - p.reserved <= p.lowStockThreshold
                            ? " · Low stock"
                            : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {store.products
                .filter((p) => p.stock !== null)
                .map((p) => (
                  <InventoryEditor key={p.id} product={p} />
                ))}
              <h2 style={{ fontSize: 28, marginTop: 40 }}>
                Recent stock history
              </h2>
              {data?.movements.length ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>DATE (WAT)</th>
                        <th>SKU</th>
                        <th>STOCK CHANGE</th>
                        <th>RESERVED CHANGE</th>
                        <th>REASON</th>
                        <th>ACTOR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.movements.map((m) => (
                        <tr key={m.id}>
                          <td>{date(m.createdAt)}</td>
                          <td>
                            {catalogue.find((p) => p.id === m.productId)?.sku}
                          </td>
                          <td>
                            {m.delta > 0 ? "+" : ""}
                            {m.delta}
                          </td>
                          <td>{m.reservedDelta}</td>
                          <td>{m.reason}</td>
                          <td>{m.actor}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Empty label="stock movements" />
              )}
            </>
          ) : (
            <Empty label="connected inventory records" />
          )}
        </>
      )}
      {section === "orders" &&
        (data ? (
          <OrdersTable
            orders={data.orders.map((o) => {
              const snapshot = o.customerSnapshot as {
                name: string;
                email: string;
              };
              return {
                id: o.id,
                reference: o.reference,
                name: snapshot.name,
                email: snapshot.email,
                totalKobo: o.totalKobo,
                paymentStatus: o.paymentStatus,
                fulfillmentStatus: o.fulfillmentStatus,
                createdAt: o.createdAt.toISOString(),
              };
            })}
          />
        ) : (
          <Empty label="connected orders" />
        ))}
      {section === "deliveries" &&
        (data?.deliveries.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ORDER</th>
                  <th>METHOD</th>
                  <th>FEE</th>
                  <th>STATUS</th>
                  <th>TRACKING</th>
                </tr>
              </thead>
              <tbody>
                {data.deliveries.map((d) => (
                  <tr key={d.id}>
                    <td>{d.order.reference}</td>
                    <td>{d.method}</td>
                    <td>{money(d.feeKobo)}</td>
                    <td>{d.status}</td>
                    <td>{d.trackingReference || "Not assigned"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty label="deliveries" />
        ))}
      {section === "deliveries" && authenticated && data && (
        <DeliveryOptions options={deliveryOptions} />
      )}
      {section === "customers" &&
        (data?.customers.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>NAME</th>
                  <th>EMAIL</th>
                  <th>PHONE</th>
                  <th>ORDERS</th>
                </tr>
              </thead>
              <tbody>
                {data.customers.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.email}</td>
                    <td>{c.phone || "—"}</td>
                    <td>{c._count.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty label="customers" />
        ))}
      {section === "quotations" &&
        (data?.quotations.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>CONTACT</th>
                  <th>PRODUCT / QTY</th>
                  <th>LOCATION</th>
                  <th>REQUIREMENTS</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {data.quotations.map((q) => (
                  <tr key={q.id}>
                    <td>
                      {q.name}
                      <small>
                        {q.email} · {q.phone}
                      </small>
                    </td>
                    <td>
                      {catalogue.find((p) => p.id === q.productId)?.name ||
                        "Project enquiry"}{" "}
                      × {q.quantity}
                    </td>
                    <td>{q.location}</td>
                    <td style={{ whiteSpace: "normal", minWidth: 220 }}>
                      {q.requirements}
                      {q.notes && <small>{q.notes}</small>}
                    </td>
                    <td>{q.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty label="quotations" />
        ))}
      {section !== "overview" && section !== "products" && (
        <p className="small muted" style={{ marginTop: 25 }}>
          Most recent 100 records shown; stock history shows 50. Transactions
          use test mode only.
        </p>
      )}
    </AdminShell>
  );
}
