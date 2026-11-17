"use client";
import { useState } from "react";
import { ShoppingBag, Check, PackageX } from "lucide-react";
import { useCart } from "./CartProvider";
import { isOutOfStock, type StoreProduct } from "@/lib/catalogue";
export function QuickAdd({ product, label }: { product: StoreProduct; label?: string }) {
  const { add, ready } = useCart();
  const [added, setAdded] = useState(false);
  const outOfStock = isOutOfStock(product);
  const paused = product.stock !== null && !product.enabled && !outOfStock;
  const buttonText = outOfStock ? "Out of stock" : paused ? "Unavailable" : added ? "Added to cart" : label ?? (product.priceKobo === null ? "Save to shortlist" : "Add to cart");
  const disabled =
    !ready ||
    (product.stock !== null &&
      (!product.enabled || product.stock <= product.reserved));
  return (
    <button
      className="quick-add"
      disabled={disabled}
      aria-label={outOfStock || paused ? `${product.name}: ${buttonText}` : `${added ? "Add another" : "Add"} ${product.name} to cart`}
      onClick={() => {
        if (disabled) return;
        add(product.id, 1);
        setAdded(true);
      }}
    >
      {outOfStock ? <PackageX size={16} aria-hidden="true" /> : added ? <Check size={16} aria-hidden="true" /> : <ShoppingBag size={16} aria-hidden="true" />}
      <span aria-live="polite">{buttonText}</span>
    </button>
  );
}
