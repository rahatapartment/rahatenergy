"use client";
import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { deliveryChoices, quoteTransitions } from "@/lib/operation-rules";
function useMutation() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const router = useRouter();
  async function save(url: string, body: unknown, method = "PATCH") {
    setPending(true);
    setMessage("");
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFailed(false);
      setMessage("Saved. The operation and history have been updated.");
      router.refresh();
    } catch (e) {
      setFailed(true);
      setMessage(e instanceof Error ? e.message : "Unable to save.");
    } finally {
      setPending(false);
    }
  }
  return {
    pending,
    save,
    feedback: message ? (
      <p
        className={failed ? "notice error" : "notice"}
        role={failed ? "alert" : "status"}
        style={{ marginTop: 16 }}
      >
        {message}
      </p>
    ) : null,
  };
}
export function QuoteEditor({
  id,
  status,
  notes,
  version,
}: {
  id: string;
  status: string;
  notes: string;
  version: number;
}) {
  const mutation = useMutation();
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    mutation.save(`/api/admin/quotations/${id}`, {
      status: data.get("status"),
      internalNotes: data.get("notes"),
      version,
      reason: data.get("reason"),
    });
  }
  return (
    <form onSubmit={submit} className="inventory-form">
      <h2>Manage enquiry</h2>
      <div className="form-grid">
        <label>
          Status
          <select
            aria-label="Status"
            key={status}
            name="status"
            defaultValue={status}
          >
            {[status, ...(quoteTransitions[status] || [])].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="full">
          Internal notes
          <textarea
            key={version}
            name="notes"
            defaultValue={notes}
            maxLength={5000}
          />
        </label>
        <label className="full">
          Reason for update
          <input name="reason" required minLength={5} maxLength={500} />
        </label>
      </div>
      <p className="small muted">
        Internal notes and update reasons are visible to authorised staff only.
      </p>
      <button className="button dark" disabled={mutation.pending}>
        {mutation.pending ? "Saving…" : "Save enquiry"}
      </button>
      {mutation.feedback}
    </form>
  );
}
export function DeliveryEditor({
  orderId,
  status,
  tracking,
  version,
  method,
  eligible,
}: {
  orderId: string;
  status: string;
  tracking: string;
  version: number;
  method: string;
  eligible: boolean;
}) {
  const mutation = useMutation();
  const choices = [status, ...deliveryChoices(status, method)];
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    mutation.save(`/api/admin/deliveries/${orderId}`, {
      status: data.get("status"),
      trackingReference: data.get("trackingReference"),
      version,
      reason: data.get("reason"),
    });
  }
  if (!eligible)
    return (
      <p className="notice">
        Delivery updates are unavailable for this payment or order state.
      </p>
    );
  return (
    <form onSubmit={submit} className="inventory-form">
      <h2>Delivery progress</h2>
      <div className="form-grid">
        <label>
          Status
          <select
            aria-label="Status"
            key={status}
            name="status"
            defaultValue={status}
          >
            {choices.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          Tracking reference
          <input
            key={version}
            name="trackingReference"
            defaultValue={tracking}
            maxLength={120}
          />
        </label>
        <label className="full">
          Reason / delivery update
          <input name="reason" required minLength={5} maxLength={500} />
        </label>
      </div>
      <button className="button dark" disabled={mutation.pending}>
        {mutation.pending ? "Saving…" : "Update delivery"}
      </button>
      {mutation.feedback}
    </form>
  );
}
export function OrderResolution({
  id,
  reference,
  review,
  cancellable,
  refundStatus,
  amount,
}: {
  id: string;
  reference: string;
  review: boolean;
  cancellable: boolean;
  refundStatus: string | null;
  amount: string;
}) {
  const mutation = useMutation();
  const [action, setAction] = useState("cancel");
  useEffect(() => setAction("cancel"), [id]);
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    mutation.save(
      `/api/admin/orders/${id}/${action}`,
      {
        referenceConfirmation: data.get("reference"),
        reason: data.get("reason"),
      },
      "POST",
    );
  }
  function refund(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    mutation.save(
      `/api/admin/orders/${id}/refund`,
      { providerRefundId: data.get("providerRefundId") },
      "POST",
    );
  }
  return (
    <section className="resolution-panel">
      <span className="eyebrow">OWNER REVIEW</span>
      <h2>Cancellations & payment review</h2>
      {cancellable && (
        <form onSubmit={submit} className="inventory-form">
          <label className="field-label">
            Action
            <select
              aria-label="Action"
              value={action}
              onChange={(e) => setAction(e.target.value)}
            >
              <option value="cancel">Approve pre-dispatch cancellation</option>
              {review && (
                <option value="allocate">
                  Allocate available stock to this paid review
                </option>
              )}
            </select>
          </label>
          <p className="small muted">
            Cancellation releases holds or restores unshipped sold stock once. A
            paid cancellation creates a refund request; it does not mark funds
            refunded.
          </p>
          <label className="field-label">
            Type the exact reference
            <input
              name="reference"
              required
              placeholder={reference}
              maxLength={100}
            />
          </label>
          <label className="field-label">
            Reason for owner approval
            <textarea name="reason" required minLength={10} maxLength={1000} />
          </label>
          <button className="button dark" disabled={mutation.pending}>
            {mutation.pending ? "Recording…" : "Record approved action"}
          </button>
        </form>
      )}
      {!cancellable && !refundStatus && (
        <p className="notice">
          Cancellation is unavailable for this state. Dispatched or delivered
          goods need a separate returns review.
        </p>
      )}
      {refundStatus && (
        <div className="inventory-form">
          <h3>Refund request · {amount}</h3>
          <p className="small muted">
            Status: {refundStatus}. This panel checks a refund already completed
            through the independent Paystack test account. It does not initiate
            a transfer or refund.
          </p>
          {refundStatus !== "VERIFIED" && (
            <form onSubmit={refund}>
              <label className="field-label">
                Paystack test refund ID
                <input
                  name="providerRefundId"
                  inputMode="numeric"
                  pattern="[1-9][0-9]{0,14}"
                  required
                  maxLength={15}
                />
              </label>
              <button className="button dark" disabled={mutation.pending}>
                {mutation.pending
                  ? "Verifying with provider…"
                  : "Verify completed test refund"}
              </button>
            </form>
          )}
        </div>
      )}
      {mutation.feedback}
    </section>
  );
}
export function AdminAccountForms({
  users,
  self,
  owner,
}: {
  users: {
    id: string;
    name: string;
    email: string;
    role: string;
    active: boolean;
  }[];
  self: string;
  owner: boolean;
}) {
  const mutation = useMutation();
  function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    mutation.save(
      "/api/admin/users",
      {
        name: d.get("name"),
        email: d.get("email"),
        role: d.get("role"),
        password: d.get("password"),
      },
      "POST",
    );
  }
  function change(e: FormEvent<HTMLFormElement>, id: string) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    mutation.save("/api/admin/users", {
      id,
      role: d.get("role"),
      active: d.get("active") === "on",
      ...(d.get("password") ? { password: d.get("password") } : {}),
    });
  }
  if (!owner)
    return (
      <p className="notice">
        Owner access is required to manage administrator accounts.
      </p>
    );
  return (
    <section className="content-section">
      <h2>Administrator accounts</h2>
      <p className="small muted">
        Owners manage accounts and financial review. Operators handle catalogue
        operations, enquiries and deliveries. Account changes revoke existing
        sessions.
      </p>
      {users.map((user) => (
        <details
          className="inventory-form"
          key={`${user.id}-${user.active}-${user.role}`}
        >
          <summary>
            {user.name} · {user.email} · {user.role}
            {!user.active ? " · Disabled" : ""}
          </summary>
          <form
            onSubmit={(e) => change(e, user.id)}
            className="form-grid"
            style={{ marginTop: 20 }}
          >
            <label>
              Role
              <select
                name="role"
                aria-label="Role"
                defaultValue={user.role}
                disabled={user.id === self}
              >
                <option>OWNER</option>
                <option>OPERATOR</option>
              </select>
            </label>
            <label>
              New password (optional)
              <input
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={16}
                maxLength={128}
                disabled={user.id === self}
              />
            </label>
            <label className="check-field">
              <input
                name="active"
                type="checkbox"
                defaultChecked={user.active}
                disabled={user.id === self}
              />
              Active account
            </label>
            <button
              className="button dark"
              disabled={mutation.pending || user.id === self}
            >
              Save account & revoke sessions
            </button>
            {user.id === self && (
              <p className="small muted full">
                Ask another owner to change your own account.
              </p>
            )}
          </form>
        </details>
      ))}
      <form className="inventory-form form-grid" onSubmit={create}>
        <h3 className="full">Create a named administrator</h3>
        <label>
          Name
          <input name="name" required minLength={2} maxLength={100} />
        </label>
        <label>
          Email
          <input name="email" type="email" required maxLength={254} />
        </label>
        <label>
          Role
          <select
            name="role"
            aria-label="Role"
            defaultValue={users.length ? "OPERATOR" : "OWNER"}
          >
            <option>OWNER</option>
            <option>OPERATOR</option>
          </select>
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={16}
            maxLength={128}
          />
        </label>
        <button className="button dark full" disabled={mutation.pending}>
          Create administrator
        </button>
      </form>
      {mutation.feedback}
    </section>
  );
}
