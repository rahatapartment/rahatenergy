"use client";
import { useState } from "react";
import type { StoreProduct } from "@/lib/catalogue";
import { InventoryEditor } from "./InventoryEditor";
export function InventoryWorkspace({ products }: { products: StoreProduct[] }) {
  const [query, setQuery] = useState("");
  const filtered = products.filter((p) =>
    `${p.name} ${p.sku}`.toLowerCase().includes(query.toLowerCase().trim()),
  );
  return (
    <>
      <label className="inventory-search">
        Find a product
        <input
          type="search"
          placeholder="Search name or SKU…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <p className="small muted" role="status">
        {filtered.length} products
      </p>
      {filtered.map((p) => (
        <InventoryEditor key={p.id} product={p} />
      ))}
    </>
  );
}
