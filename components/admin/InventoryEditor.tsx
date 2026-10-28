"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { type StoreProduct } from "@/lib/catalogue";
export function InventoryEditor({ product: p }: { product: StoreProduct }) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const price = String(f.get("price") || "");
    setPending(true);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/inventory/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceKobo: price === "" ? null : Math.round(Number(price) * 100),
          stock: Number(f.get("stock")),
          lowStockThreshold: Number(f.get("threshold")),
          enabled: f.get("enabled") === "on",
          version: p.version,
          reason: f.get("reason"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setError(false);
      setMessage(
        "Operational values saved. Stock history and audit record updated.",
      );
      router.refresh();
    } catch (err) {
      setError(true);
      setMessage(err instanceof Error ? err.message : "Unable to save.");
    } finally {
      setPending(false);
    }
  }
  return (
    <details className="inventory-form">
      <summary>
        {p.sku} · {p.name}
      </summary>
      <div>
        <form key={p.version} onSubmit={submit}>
          <div className="inventory-inputs">
            <label>
              Price (NGN, blank = unpriced)
              <input
                name="price"
                type="number"
                defaultValue={p.priceKobo === null ? "" : p.priceKobo / 100}
                min="0.01"
                max="20000000"
                step="0.01"
              />
            </label>
            <label>
              Total stock
              <input
                name="stock"
                type="number"
                required
                defaultValue={p.stock ?? 0}
                min={p.reserved}
                max={1000000}
              />
            </label>
            <label>
              Low-stock threshold
              <input
                name="threshold"
                type="number"
                required
                defaultValue={p.lowStockThreshold}
                min={0}
                max={1000000}
              />
            </label>
            <label>
              Reserved (read only)
              <input disabled value={p.reserved} />
            </label>
          </div>
          <label className="check-field">
            <input name="enabled" type="checkbox" defaultChecked={p.enabled} />{" "}
            Enable purchases when checkout becomes available
          </label>
          <label>
            Reason for this change
            <input
              name="reason"
              required
              minLength={5}
              maxLength={500}
              placeholder="Receipt of stock, correction, pricing review…"
            />
          </label>
          <button className="button dark" disabled={pending}>
            {pending ? "Saving…" : "Save operational changes"}
          </button>
          {message && (
            <p
              className={error ? "notice error" : "notice"}
              role={error ? "alert" : "status"}
              style={{ marginTop: 15 }}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </details>
  );
}
