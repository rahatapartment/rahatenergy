import Link from "next/link";
import {
  ArrowUpRight,
  ClipboardList,
  Layers,
  MessageSquare,
  Truck,
} from "lucide-react";
export function OverviewWorkspace({ connected }: { connected: boolean }) {
  return (
    <section
      className="admin-overview-workspace"
      aria-labelledby="workspace-title"
    >
      <div className="admin-section-heading">
        <div>
          <span className="eyebrow">YOUR WORKSPACE</span>
          <h2 id="workspace-title">Make the next move clear.</h2>
        </div>
        <span className="admin-record-label">
          {connected ? "Database records available" : "No connected records"}
        </span>
      </div>
      <div className="admin-quick-routes">
        {(
          [
            [
              "Orders",
              "Review payments and fulfilment.",
              "/admin/orders",
              ClipboardList,
            ],
            [
              "Inventory",
              "Review prices and stock levels.",
              "/admin/inventory",
              Layers,
            ],
            [
              "Quotations",
              "Follow up on project enquiries.",
              "/admin/quotations",
              MessageSquare,
            ],
            [
              "Deliveries",
              "Review dispatch and collection.",
              "/admin/deliveries",
              Truck,
            ],
          ] as const
        ).map(([title, copy, href, Icon]) => (
          <Link href={href as string} key={title as string}>
            <Icon size={21} strokeWidth={1.4} />
            <ArrowUpRight size={16} />
            <h3>{title as string}</h3>
            <p>{copy as string}</p>
          </Link>
        ))}
      </div>
      <div className="admin-operating-note">
        <div>
          <span className="eyebrow">A CONSIDERED FOUNDATION</span>
          <h3>Clarity before activity.</h3>
          <p>
            {connected
              ? "Metrics above come from the independent database. Review individual records before taking an operational action."
              : "Database setup is deferred. Unavailable metrics remain blank; no sales, stock or customer activity is simulated."}
          </p>
        </div>
        <Link href={connected ? "/admin/monitoring" : "/admin/preview"}>
          {connected ? "Inspect monitoring" : "Explore read-only walkthrough"}
          <ArrowUpRight size={17} />
        </Link>
      </div>
    </section>
  );
}
