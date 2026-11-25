import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { operationsAccess } from "@/lib/operations-access";
import { storeData } from "@/lib/store-data";
import { inventoryReadiness, workerReadiness } from "@/lib/launch-readiness";
import { money } from "@/lib/catalogue";
import { paymentModeLabel, paymentsReady } from "@/lib/paystack";
export const dynamic = "force-dynamic";
export const metadata = { title: "Launch readiness" };
export default async function Page() {
  const { actor, db } = await operationsAccess("owner");
  if (!actor)
    return (
      <AdminShell title="Launch readiness" authenticated={false}>
        <p className="notice">Sign in to review operational readiness.</p>
      </AdminShell>
    );
  const { products, status } = await storeData();
  const connected = status === "connected";
  const operational =
    db && connected
      ? await Promise.all([
          db.deliveryOption.count({ where: { enabled: true } }),
          db.adminUser.count({ where: { active: true, role: "OPERATOR" } }),
          db.jobRun.findFirst({
            where: { job: "commerce", status: "SUCCEEDED" },
            orderBy: { startedAt: "desc" },
            select: { finishedAt: true },
          }),
        ]).catch(() => null)
      : null;
  const inventory = inventoryReadiness(products, connected);
  const missingPrices = inventory.filter((p) => p.price === null).length;
  const saleReady = inventory.filter((p) => p.issues.length === 0).length;
  const checks = [
    [
      "Product management",
      connected
        ? "Connected catalogue available"
        : "Unavailable in this environment",
      "/admin/products",
      "Review products",
    ],
    [
      "Prices",
      missingPrices
        ? `${missingPrices} products need prices`
        : "All active products have prices",
      "/admin/inventory",
      "Manage prices",
    ],
    [
      "Purchasable stock",
      connected
        ? `${saleReady} of ${products.length} products ready for purchase`
        : "Stock has not been verified",
      "/admin/inventory",
      "Manage stock",
    ],
    [
      "Delivery & pickup",
      operational
        ? `${operational[0]} enabled options`
        : "Options have not been verified",
      "/admin/deliveries",
      "Review delivery",
    ],
    [
      "Owner access",
      operational
        ? `Environment owner · ${operational[1]} active team members`
        : "Environment owner signed in. Team status unavailable.",
      "/admin/settings",
      "Manage accounts",
    ],
    [
      "Background worker",
      workerReadiness(operational?.[2]?.finishedAt ?? null),
      "/admin/monitoring",
      "Review activity",
    ],
    [
      "Payments",
      paymentsReady()
        ? `${paymentModeLabel()} configured. Verify a completed Paystack transaction.`
        : `${paymentModeLabel()}. Paystack credentials or callback URL need configuration.`,
      "/admin/orders",
      "Review orders",
    ],
    [
      "Email",
      process.env.ENERGY_RESEND_API_KEY && process.env.ENERGY_EMAIL_FROM
        ? "Sender configured. Confirm order and fulfilment emails in a customer inbox."
        : "Customer emails are queued. Configure the Resend API key and a verified sender to send them.",
      "/admin/monitoring",
      "Review notifications",
    ],
  ];
  return (
    <AdminShell title="Launch readiness" authenticated>
      <p className="notice">
        A checklist of operational work, not a declaration that the store is
        ready to launch. This page does not change settings, stock or external
        services.
      </p>
      <div className="readiness-grid">
        {checks.map(([title, detail, href, label]) => (
          <article className="readiness-card" key={title}>
            <h2>{title}</h2>
            <p>{detail}</p>
            <Link className="admin-table-link" href={href}>
              {label} ↗
            </Link>
          </article>
        ))}
      </div>
      <div className="admin-section-heading">
        <h2>Product checklist</h2>
        <span className="small muted">{products.length} active products</span>
      </div>
      <div
        className="table-wrap"
        role="region"
        aria-label="Product readiness"
        tabIndex={0}
      >
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Available stock</th>
              <th>Needs attention</th>
              <th>Manage</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{money(p.price)}</td>
                <td>{p.stock === null ? "Unverified" : p.stock}</td>
                <td>{p.issues.join(" · ") || "Price and stock ready"}</td>
                <td>
                  <Link
                    className="admin-table-link"
                    href={`/admin/products/${p.id}`}
                  >
                    Product ↗
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="notice">
        Before live sales: approve delivery, returns and warranty terms;
        complete account recovery/MFA; test payment, confirmation email,
        fulfilment and customer tracking.
      </p>
    </AdminShell>
  );
}
