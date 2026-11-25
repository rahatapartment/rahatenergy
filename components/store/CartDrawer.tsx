"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag, X } from "lucide-react";
import Image from "@/components/WebImage";
import { catalogue, money, productImage } from "@/lib/catalogue";
import { cartSummary } from "@/lib/cart";
import { useCart } from "./CartProvider";

type PreviewProduct = {
  id: string;
  slug: string;
  name: string;
  image: string;
  priceKobo: number | null;
  maxQuantity: number;
  availability: string;
};
const fallbackProducts: PreviewProduct[] = catalogue.map(product => ({
  id: product.id,
  slug: product.slug,
  name: product.name,
  image: productImage(product),
  priceKobo: null,
  maxQuantity: 99,
  availability: "",
}));

export function CartDrawer() {
  const { lines, ready, update, cartOpen, closeCart } = useCart();
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const [products, setProducts] = useState(fallbackProducts);
  const [pricing, setPricing] = useState<"loading" | "ready" | "unavailable">("loading");
  const path = usePathname();
  const hasItems = lines.length > 0;

  useEffect(() => { closeCart(); }, [path, closeCart]);

  useEffect(() => {
    const panel = dialog.current;
    if (!panel) return;
    if (cartOpen) {
      if (!panel.open) {
        panel.showModal();
        closeButton.current?.focus({ preventScroll: true });
      }
    } else if (panel.open) {
      const delay = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 260;
      const timer = window.setTimeout(() => panel.close(), delay);
      return () => window.clearTimeout(timer);
    }
  }, [cartOpen]);

  useEffect(() => {
    if (!cartOpen || !hasItems) return;
    const controller = new AbortController();
    setPricing("loading");
    fetch("/api/cart", { signal: controller.signal, cache: "no-store" })
      .then(async response => {
        if (!response.ok) throw new Error("Could not load cart prices");
        const preview: { status: string; products: PreviewProduct[] } = await response.json();
        if (controller.signal.aborted) return;
        setProducts(preview.products);
        setPricing(preview.status === "connected" ? "ready" : "unavailable");
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setProducts(fallbackProducts);
        setPricing("unavailable");
      });
    return () => controller.abort();
  }, [cartOpen, hasItems]);

  const summary = cartSummary(lines, products);
  const subtotal = pricing === "loading"
    ? "Checking prices…"
    : pricing === "unavailable" ? "Confirmed at checkout" : money(summary.subtotal);
  return (
    <dialog
      ref={dialog}
      className={`cart-drawer${cartOpen ? " cart-drawer-open" : ""}`}
      id="cart-drawer"
      aria-labelledby="cart-drawer-title"
      onCancel={event => { event.preventDefault(); closeCart(); }}
      onKeyDown={event => {
        if (event.key !== "Escape") return;
        event.preventDefault();
        closeCart();
      }}
      onClick={event => { if (event.target === event.currentTarget) closeCart(); }}
    >
      <div className="cart-drawer-content">
        <header className="cart-drawer-header">
          <div>
            <h2 id="cart-drawer-title">Your cart</h2>
            {ready && <p>{summary.count} {summary.count === 1 ? "item" : "items"}</p>}
          </div>
          <button type="button" ref={closeButton} className="cart-drawer-close" onClick={closeCart} aria-label="Close cart">
            <X size={20} aria-hidden="true" />
          </button>
        </header>
        <div className="cart-drawer-scroll">
          {!ready ? <p role="status">Loading your cart…</p> : lines.length ? (
            <ul className="cart-drawer-list">
              {lines.map(line => {
                const product = products.find(item => item.id === line.productId);
                if (!product) return null;
                const { id, slug, name, image, priceKobo, maxQuantity } = product;
                return (
                  <li key={id} className="cart-drawer-item">
                    <Link className="cart-drawer-image" href={`/shop/${slug}`} onClick={closeCart} aria-label={`View ${name}`}>
                      <Image src={image} alt="" width={96} height={96} sizes="82px" />
                    </Link>
                    <div className="cart-drawer-item-content">
                      <div className="cart-drawer-item-heading">
                        <Link href={`/shop/${slug}`} onClick={closeCart}>{name}</Link>
                        <span>{pricing === "ready" ? money(priceKobo === null ? null : priceKobo * line.quantity) : ""}</span>
                      </div>
                      {pricing === "ready" && maxQuantity < line.quantity && (
                        <p className="cart-drawer-stock">{maxQuantity ? `Only ${maxQuantity} available` : product.availability}</p>
                      )}
                      <div className="cart-drawer-controls">
                        <div className="cart-drawer-quantity" role="group" aria-label={`Quantity for ${name}`}>
                          <button type="button" aria-label={`Decrease quantity for ${name}`} disabled={line.quantity <= 1} onClick={() => update(id, line.quantity - 1)}>
                            <Minus size={14} aria-hidden="true" />
                          </button>
                          <span aria-live="polite">{line.quantity}</span>
                          <button type="button" aria-label={`Increase quantity for ${name}`} disabled={line.quantity >= maxQuantity} onClick={() => update(id, line.quantity + 1)}>
                            <Plus size={14} aria-hidden="true" />
                          </button>
                        </div>
                        <button
                          type="button"
                          className="cart-drawer-remove"
                          aria-label={`Remove ${name}`}
                          onClick={() => {
                            closeButton.current?.focus({ preventScroll: true });
                            update(id, 0);
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="cart-drawer-empty">
              <ShoppingBag size={26} strokeWidth={1.4} aria-hidden="true" />
              <p>Your cart is empty.</p>
              <Link href="/shop" onClick={closeCart}>Explore the shop <ArrowRight size={15} aria-hidden="true" /></Link>
            </div>
          )}
        </div>
        {ready && lines.length > 0 && (
          <div className="cart-drawer-summary">
            <div className="cart-drawer-total" aria-live="polite">
              <span>Subtotal</span>
              <strong>{subtotal}</strong>
            </div>
            <p>Pickup or delivery is selected at checkout.</p>
            <Link className="cart-drawer-checkout" href="/checkout" onClick={closeCart}>
              Proceed to checkout <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <button type="button" className="cart-drawer-continue" onClick={closeCart}>Continue shopping</button>
          </div>
        )}
      </div>
    </dialog>
  );
}
