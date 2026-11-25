"use client";

import type { ReactNode } from "react";
import { useCart } from "./CartProvider";

export function CartTrigger({ className, children }: { className: string; children: ReactNode }) {
  const { openCart } = useCart();
  return (
    <button type="button" className={className} aria-haspopup="dialog" onClick={openCart}>
      {children}
    </button>
  );
}
