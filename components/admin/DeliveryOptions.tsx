"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { money } from "@/lib/catalogue";
type Option = {
  id: string;
  label: string;
  method: string;
  feeKobo: number;
  state: string | null;
  city: string | null;
  pickupAddress: string | null;
  enabled: boolean;
};
function Editor({ option }: { option?: Option }) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setPending(true);
    try {
      const res = await fetch("/api/admin/delivery-options", {
        method: option ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(option ? { id: option.id } : {}),
          label: data.get("label"),
          method: data.get("method"),
          state: data.get("state") || null,
          city: data.get("city") || null,
          pickupAddress: data.get("pickupAddress") || null,
          feeKobo: Math.round(Number(data.get("fee")) * 100),
          enabled: data.get("enabled") === "on",
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setMessage("Confirmed option saved.");
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unable to save.");
    } finally {
      setPending(false);
    }
  }
  return (
    <details className="inventory-form">
      <summary>
        {option
          ? `${option.label} · ${money(option.feeKobo)} · ${option.enabled ? "Enabled" : "Disabled"}`
          : "Configure a delivery or pickup option"}
      </summary>
      <form onSubmit={save} className="form-grid" style={{ marginTop: 20 }}>
        <label>
          Customer-facing label
          <input
            name="label"
            defaultValue={option?.label}
            required
            minLength={3}
            maxLength={100}
          />
        </label>
        <label>
          Method
          <select name="method" defaultValue={option?.method || "DELIVERY"}>
            <option>DELIVERY</option>
            <option>PICKUP</option>
          </select>
        </label>
        <label>
          Delivery state
          <input
            name="state"
            defaultValue={option?.state || ""}
            maxLength={100}
          />
        </label>
        <label>
          City (blank = all cities in state)
          <input
            name="city"
            defaultValue={option?.city || ""}
            maxLength={100}
          />
        </label>
        <label className="full">
          Pickup location (required for pickup)
          <input
            name="pickupAddress"
            defaultValue={option?.pickupAddress || ""}
            maxLength={250}
          />
        </label>
        <label>
          Confirmed fee (NGN)
          <input
            name="fee"
            type="number"
            min={0}
            max={1000000}
            step="0.01"
            required
            defaultValue={option ? option.feeKobo / 100 : ""}
          />
        </label>
        <label className="check-field">
          <input
            name="enabled"
            type="checkbox"
            defaultChecked={option?.enabled}
          />
          Enable this confirmed option
        </label>
        <button className="button dark full" disabled={pending}>
          {pending ? "Saving…" : "Save option"}
        </button>
        {message && (
          <p className="notice full" role="status">
            {message}
          </p>
        )}
      </form>
    </details>
  );
}
export function DeliveryOptions({ options }: { options: Option[] }) {
  return (
    <section className="content-section">
      <h2>Delivery & pickup configuration</h2>
      <p className="small muted">
        Only enter business-approved areas, locations and fees. No delivery
        options are seeded automatically.
      </p>
      {options.map((option) => (
        <Editor
          key={`${option.id}-${option.enabled}-${option.feeKobo}-${option.label}`}
          option={option}
        />
      ))}
      <Editor />
    </section>
  );
}
