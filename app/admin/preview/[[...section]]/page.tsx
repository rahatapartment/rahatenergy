import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { catalogue } from "@/lib/catalogue";
export const metadata = { title: "Read-only operations walkthrough" };
const labels: Record<string, string> = {
  overview: "Overview",
  products: "Products",
  inventory: "Inventory",
  orders: "Orders",
  deliveries: "Deliveries",
  customers: "Customers",
  quotations: "Quotations",
  settings: "Settings",
  monitoring: "Monitoring",
};
export default function Page({ params }: { params: { section?: string[] } }) {
  const section = params.section?.[0] || "overview";
  if (!labels[section] || (params.section?.length || 0) > 1) notFound();
  return (
    <AdminShell
      title={`${labels[section]} walkthrough`}
      authenticated={false}
      preview
    >
      <div className="walkthrough-banner">
        <span className="eyebrow">READ-ONLY SAMPLE WALKTHROUGH</span>
        <h2>Explore the workflow. No database needed.</h2>
        <p>
          Everything on this page is illustrative sample content. No real
          customers, sales, inventory or operational records are shown. Sample
          controls cannot write records or call payment services.
        </p>
        <Link href="/admin" className="text-link">
          Return to real operations →
        </Link>
      </div>
      {section === "overview" ? (
        <>
          <div className="preview-workflow">
            {[
              [
                "01",
                "Enquiries",
                "Review requirements, record staff notes and move an enquiry from NEW to CONTACTED, QUOTED or CLOSED.",
                "quotations",
              ],
              [
                "02",
                "Orders & reviews",
                "Inspect payment, delivery and history. Owner review is required for cancellations, stock reallocation and completed test refunds.",
                "orders",
              ],
              [
                "03",
                "Delivery",
                "Update dispatch, delivery progress or pickup readiness with a tracking reference and recorded reason.",
                "deliveries",
              ],
              [
                "04",
                "Accounts & monitoring",
                "Create named administrators, revoke sessions, and inspect actual worker and notification health once connected.",
                "settings",
              ],
            ].map(([n, title, copy, href]) => (
              <Link
                className="link-card"
                key={n}
                href={`/admin/preview/${href}`}
              >
                <span className="step-number">{n}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
                <span className="text-link">View sample screen →</span>
              </Link>
            ))}
          </div>
        </>
      ) : section === "quotations" ? (
        <>
          <section className="planning-panel">
            <div>
              <span className="eyebrow">SAMPLE ENQUIRY · EXAMPLE-ONLY</span>
              <h2>Sample project contact</h2>
              <p>
                sample@example.invalid
                <br />
                Example location · Not a customer record
              </p>
            </div>
            <div>
              <h2>CONTACTED</h2>
              <p>
                Illustrative requirement: discuss a home energy setup and
                confirm product specifications.
              </p>
            </div>
          </section>
          <form className="inventory-form form-grid">
            <h2 className="full">Example staff review</h2>
            <label>
              Status
              <select disabled defaultValue="CONTACTED">
                <option>NEW</option>
                <option>CONTACTED</option>
                <option>QUOTED</option>
                <option>CLOSED</option>
              </select>
            </label>
            <label className="full">
              Internal notes
              <textarea
                disabled
                defaultValue="Sample note: clarify the requirements before preparing a quote."
              />
            </label>
            <button className="button dark full" disabled>
              Sample only · saving disabled
            </button>
          </form>
        </>
      ) : section === "deliveries" ? (
        <>
          <section className="planning-panel">
            <div>
              <h2>Sample delivery</h2>
              <p>
                EXAMPLE-ORDER · No real shipment
                <br />
                Example recipient · Example address
              </p>
            </div>
            <div>
              <h2>OUT FOR DELIVERY</h2>
              <p>Illustrative tracking: EXAMPLE-TRACKING</p>
            </div>
          </section>
          <div className="status-track">
            {[
              "Pending",
              "Preparing",
              "Ready for dispatch",
              "Dispatched",
              "Out for delivery",
              "Delivered",
            ].map((s, i) => (
              <span key={s} className={i < 5 ? "complete" : ""}>
                {s}
              </span>
            ))}
          </div>
          <div className="inventory-form">
            <h2>Delivery controls</h2>
            <p>
              Actual updates require a paid order, a valid next state and a
              reason. Cancelled orders and unresolved payment reviews cannot be
              dispatched.
            </p>
            <button className="button dark" disabled>
              Sample only · updates disabled
            </button>
          </div>
        </>
      ) : section === "orders" ? (
        <>
          <div className="metric-grid">
            {[
              ["Reference", "EXAMPLE-ORDER"],
              ["Payment", "SAMPLE PAID STATE"],
              ["Fulfillment", "PROCESSING"],
              ["Sales amount", "Not displayed in sample"],
            ].map(([label, value]) => (
              <div className="metric" key={label}>
                <span>{label}</span>
                <strong style={{ fontSize: 18 }}>{value}</strong>
              </div>
            ))}
          </div>
          <div className="three-grid">
            {[
              [
                "Pre-dispatch cancellation",
                "An owner confirms the exact reference and reason. Holds or sold, unshipped stock are restored once; refund verification remains separate.",
              ],
              [
                "Late-payment review",
                "An owner can allocate available stock against a verified paid review, or cancel the order and request a refund.",
              ],
              [
                "Refund verification",
                "The server checks a completed refund against the original test transaction, currency and full order total. No refund is initiated by the panel.",
              ],
            ].map(([title, copy]) => (
              <article className="link-card" key={title}>
                <h3>{title}</h3>
                <p>{copy}</p>
                <button className="button outline" disabled>
                  Sample only
                </button>
              </article>
            ))}
          </div>
        </>
      ) : section === "products" || section === "inventory" ? (
        <>
          <p className="notice">
            The catalogue has exactly 15 provisional identities. Product
            creation and deletion are unavailable. No sample prices or
            quantities are presented as real inventory.
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>PRODUCT</th>
                  <th>PRICE / STOCK</th>
                </tr>
              </thead>
              <tbody>
                {catalogue.map((p) => (
                  <tr key={p.id}>
                    <td>{p.sku}</td>
                    <td>{p.name}</td>
                    <td>Not configured</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : section === "customers" ? (
        <div className="empty">
          <h2>Customer records stay private.</h2>
          <p>
            Actual customers appear only through authenticated operations after
            database setup. No customer data is imported into this walkthrough.
          </p>
        </div>
      ) : section === "settings" ? (
        <div className="three-grid">
          <article className="link-card">
            <h3>Owner</h3>
            <p>
              Manages administrator accounts, cancellation approval, stock
              review and verified test-refund records.
            </p>
          </article>
          <article className="link-card">
            <h3>Operator</h3>
            <p>
              Works with enquiries, inventory, orders and delivery progress.
              Owner-only actions are rejected by the API.
            </p>
          </article>
          <article className="link-card">
            <h3>Revocable sessions</h3>
            <p>
              Changing an account’s role, password or active state revokes its
              existing sessions. The shared setup password stops working after
              the first named owner is created.
            </p>
          </article>
        </div>
      ) : (
        <div className="three-grid">
          {[
            [
              "Worker health",
              "Recent successful or failed scheduler runs, with a warning when worker activity is stale.",
            ],
            [
              "Notification queue",
              "Queued, accepted and exhausted email jobs, without treating provider acceptance as guaranteed delivery.",
            ],
            [
              "Audit trail",
              "Who changed a record, what action occurred and when. Records come from the connected database.",
            ],
          ].map(([title, copy]) => (
            <article className="link-card" key={title}>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      )}
      <p className="notice" style={{ marginTop: 30 }}>
        Supabase setup is deferred. The real operational pages remain empty or
        unavailable until an independent database is connected. This walkthrough
        is separate from those pages.
      </p>
    </AdminShell>
  );
}
