"use client";
import { fulfilmentStatuses, statusLabel } from "@/lib/operation-rules";
import Link from "next/link";
import { useState, useEffect } from "react";
import { money } from "@/lib/catalogue";
import { useRouter } from "next/navigation";
type Row = {
  id: string;
  reference: string;
  name: string;
  email: string;
  totalKobo: number;
  paymentStatus: string;
  fulfillmentStatus: string;
  createdAt: string;
};
export function OrdersTable({
  orders,
  pageMode = false,
}: {
  orders: Row[];
  pageMode?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [fulfillment, setFulfillment] = useState("ALL");
  const filtered = orders.filter(
    (o) =>
      `${o.reference} ${o.name} ${o.email}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (status === "ALL" || o.paymentStatus === status) &&
      (fulfillment === "ALL" || o.fulfillmentStatus === fulfillment),
  );
  return (
    <>
      {!pageMode && (
        <>
          <div className="shop-toolbar">
            <label className="search-field">
              <span className="sr-only">Search orders</span>
              <input
                placeholder="Reference, customer or email"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <label className="sort-field">
              Payment
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {[
                  "ALL",
                  "PENDING",
                  "PAID",
                  "FAILED",
                  "CANCELLED",
                  "REFUNDED",
                ].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="sort-field">
              Fulfillment
              <select
                value={fulfillment}
                onChange={(e) => setFulfillment(e.target.value)}
              >
                {[
                  "ALL",
                  "PENDING",
                  "PROCESSING",
                  "READY_FOR_PICKUP",
                  "DISPATCHED",
                  "DELIVERED",
                  "PAYMENT_REVIEW",
                  "CANCELLED",
                ].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>
        </>
      )}
      <p className="small muted" role="status">
        {pageMode
          ? `${filtered.length} orders on this page`
          : `${filtered.length} matching orders in the latest ${orders.length} records`}
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>REFERENCE</th>
              <th>CUSTOMER</th>
              <th>TOTAL</th>
              <th>PAYMENT</th>
              <th>FULFILLMENT</th>
              <th>DETAILS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id}>
                <td>
                  {o.reference}
                  <small>
                    {new Intl.DateTimeFormat("en-NG", {
                      dateStyle: "medium",
                      timeZone: "Africa/Lagos",
                    }).format(new Date(o.createdAt))}
                  </small>
                </td>
                <td>
                  {o.name}
                  <small>{o.email}</small>
                </td>
                <td>{money(o.totalKobo)}</td>
                <td>{o.paymentStatus}</td>
                <td>{o.fulfillmentStatus}</td>
                <td>
                  <Link className="inline-link" href={`/admin/orders/${o.id}`}>
                    Open order →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && <p className="empty">No matching orders.</p>}
      </div>
    </>
  );
}
export function FulfillmentControl({
  id,
  allowed,
  current,
  method,
}: {
  id: string;
  allowed: string[];
  current: string;
  method: string;
}) {
  const [status, setStatus] = useState(current);
  useEffect(() => setStatus(current), [current]);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  async function save() {
    setPending(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setMessage("Fulfillment updated and recorded in order history.");
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unable to update.");
    } finally {
      setPending(false);
    }
  }
  if (!allowed.length)
    return (
      <p className="notice">
        No fulfillment action is available in this state.
      </p>
    );
  return (
    <div className="inventory-form">
      <label className="field-label">
        Fulfilment status
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          {fulfilmentStatuses(method).map((choice) => (
            <option key={choice} value={choice} disabled={choice !== current && !allowed.includes(choice)}>
              {statusLabel(choice, method)}
            </option>
          ))}
        </select>
      </label>
      {status === "DELIVERED" && <p className="small">Saving this status queues the customer’s completion email.</p>}
      <button className="button dark" disabled={pending || !allowed.includes(status)} onClick={save}>
        {pending ? "Saving…" : "Update fulfillment"}
      </button>
      {message && (
        <p className="notice" role="status" style={{ marginTop: 15 }}>
          {message}
        </p>
      )}
    </div>
  );
}
