"use client";
import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { useCart } from "./CartProvider";
import type { StoreProduct } from "@/lib/catalogue";
export function QuickAdd({ product }: { product: StoreProduct }) {
  const { add, ready } = useCart();
  const [added, setAdded] = useState(false);
  const disabled =
    !ready ||
    (product.stock !== null &&
      (!product.enabled || product.stock <= product.reserved));
  return (
    <button
      className="quick-add"
      disabled={disabled}
      aria-label={`${added ? "Add another" : "Add"} ${product.name} to cart`}
      onClick={() => {
        add(product.id, 1);
        setAdded(true);
      }}
    >
      {added
        ? "Added · add another"
        : product.priceKobo === null
          ? "Save to your shortlist"
          : "Add to cart"}
      {added ? <Check size={17} /> : <Plus size={17} />}
    </button>
  );
}
