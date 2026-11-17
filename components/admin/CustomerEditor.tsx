"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
export function CustomerEditor({
  customer,
}: {
  customer?: { id: string; name: string; email: string; phone: string | null };
}) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: customer?.id,
          name: f.get("name"),
          email: f.get("email"),
          phone: f.get("phone"),
        }),
      });
      const d = await res.json();
      if (!res.ok) throw Error(d.error);
      setMessage("Customer saved.");
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unable to save.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="inventory-form">
      <h3>{customer ? "Edit customer" : "Add a customer"}</h3>
      <div className="inventory-inputs">
        <label>
          Name
          <input
            name="name"
            required
            minLength={2}
            defaultValue={customer?.name}
          />
        </label>
        <label>
          Email
          <input
            name="email"
            type="email"
            required
            defaultValue={customer?.email}
          />
        </label>
        <label>
          Phone
          <input name="phone" defaultValue={customer?.phone || ""} />
        </label>
      </div>
      <button className="button dark" disabled={busy}>
        {busy ? "Saving…" : "Save customer"}
      </button>
      <p role="status">{message}</p>
    </form>
  );
}
