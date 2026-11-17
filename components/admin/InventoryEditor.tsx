"use client";
import { useAdmin } from "./AdminProvider";
import { hasPermission } from "@/lib/admin-permissions";
import { useState, type FormEvent } from "react";
import { type StoreProduct } from "@/lib/catalogue";
export function InventoryEditor({
  product: initial,
}: {
  product: StoreProduct;
}) {
  const { actor, inventory, publish } = useAdmin();
  const row = inventory[initial.id];
  const p =
    row && row.version >= initial.version ? { ...initial, ...row } : initial;
  const allowed = (scope: Parameters<typeof hasPermission>[1]) =>
    !!actor && hasPermission(actor, scope);
  const increase = allowed("inventory.increase"),
    decrease = allowed("inventory.decrease");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
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
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      publish(data.inventory);
      setError(false);
      setMessage(
        "Operational values saved. Stock history and audit record updated.",
      );
    } catch (err) {
      setError(true);
      setMessage(err instanceof Error ? err.message : "Unable to save.");
    } finally {
      setPending(false);
    }
  }
  return (
    <section className="inventory-form inventory-inline">
      <h3>
        {p.sku} · {p.name}
      </h3>
      <div>
        <form key={p.version} onSubmit={submit}>
          <div className="inventory-inputs">
            <label>
              Price (NGN, blank = unpriced)
              <input
                name="price"
                readOnly={!allowed("inventory.price")}
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
                min={decrease ? p.reserved : (p.stock ?? 0)}
                max={increase ? 1000000 : (p.stock ?? 0)}
              />
            </label>
            <label>
              Low-stock threshold
              <input
                name="threshold"
                readOnly={!allowed("inventory.settings")}
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
            <input
              name="enabled"
              type="checkbox"
              onClick={(e) => {
                if (!allowed("inventory.settings")) e.preventDefault();
              }}
              aria-disabled={!allowed("inventory.settings")}
              defaultChecked={p.enabled}
            />{" "}
            Enable purchases
          </label>
          <button
            className="button dark"
            disabled={
              pending ||
              !(
                increase ||
                decrease ||
                allowed("inventory.price") ||
                allowed("inventory.settings")
              )
            }
          >
            {pending ? "Saving…" : "Save changes"}
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
    </section>
  );
}
