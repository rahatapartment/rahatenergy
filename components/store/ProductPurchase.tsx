"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, ArrowUpRight, Check } from "lucide-react";
import { money, type StoreProduct } from "@/lib/catalogue";
import { useCart } from "./CartProvider";

export function ProductPurchase({ product: p }: { product: StoreProduct }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [actionsVisible, setActionsVisible] = useState(true);
  const actions = useRef<HTMLDivElement>(null);
  const { add, ready } = useCart();
  const router = useRouter();
  const max =
    p.stock === null ? 99 : Math.min(99, Math.max(0, p.stock - p.reserved));
  const disabled = !ready || (p.stock !== null && (!p.enabled || max === 0));
  const unpriced = p.priceKobo === null;
  useEffect(() => {
    if (!actions.current || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      ([entry]) => setActionsVisible(entry.isIntersecting),
      { threshold: 0, rootMargin: "-85px 0px 0px" },
    );
    observer.observe(actions.current);
    return () => observer.disconnect();
  }, []);
  function change(value: number) {
    setQuantity(Math.max(1, Math.min(max || 1, Math.trunc(value || 1))));
    setAdded(false);
  }
  function put(buy = false) {
    if (disabled || (buy && unpriced)) return;
    add(p.id, quantity);
    setAdded(true);
    if (buy) router.push("/checkout");
  }
  return (
    <>
      <div
        className="product-purchase-panel"
        ref={actions}
        id="product-purchase"
      >
        <div className="purchase-caption">
          <span>MAKE ROOM IN YOUR PLAN</span>
          <span>{unpriced ? "SHORTLIST & ENQUIRE" : "YOUR SELECTION"}</span>
        </div>
        <label className="purchase-quantity-label" htmlFor="product-quantity">
          Quantity
        </label>
        <div className="product-primary-actions">
          <div className="product-quantity-stepper">
            <button
              aria-label="Decrease quantity"
              disabled={quantity <= 1}
              onClick={() => change(quantity - 1)}
            >
              <Minus size={16} />
            </button>
            <input
              id="product-quantity"
              type="number"
              min={1}
              max={max || 1}
              value={quantity}
              onChange={(event) => change(Number(event.target.value))}
            />
            <button
              aria-label="Increase quantity"
              disabled={quantity >= max}
              onClick={() => change(quantity + 1)}
            >
              <Plus size={16} />
            </button>
          </div>
          <button
            className="product-add-button"
            disabled={disabled}
            onClick={() => put()}
          >
            {added ? <Check size={17} /> : <ShoppingBag size={17} />}
            <span>
              {added
                ? "Saved · add another"
                : unpriced
                  ? "Save to your shortlist"
                  : "Add to cart"}
            </span>
            <ArrowUpRight size={17} />
          </button>
        </div>
        <Link
          className="product-quote-button"
          href={`/request-quote?product=${p.id}`}
        >
          Request a personal quote <ArrowUpRight size={18} />
        </Link>
        <div className="product-checkout-line">
          <button disabled={disabled || unpriced} onClick={() => put(true)}>
            Buy now · test checkout <ArrowUpRight size={15} />
          </button>
          <Link href="/cart">
            View your {unpriced ? "shortlist" : "cart"}{" "}
            <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="product-purchase-feedback" role="status">
          {added ? (
            <p>
              <Check size={14} />
              {quantity} {quantity === 1 ? "item" : "items"} added. Your
              selection is saved in this browser.
            </p>
          ) : (
            <p>
              {unpriced
                ? "Save your selection now. Pricing, availability and the exact equipment need confirmation before purchase."
                : "Final prices, availability and delivery are checked again at test checkout."}
            </p>
          )}
        </div>
      </div>
      {!actionsVisible && (
        <div className="product-mobile-purchase">
          <div>
            <span>{p.name}</span>
            <strong>{money(p.priceKobo)}</strong>
          </div>
          <button
            disabled={disabled}
            aria-label={`Add ${p.name} from the quick selection bar`}
            onClick={() => put()}
          >
            {added ? <Check size={18} /> : <ShoppingBag size={17} />}
            <span>
              {added ? "Saved" : unpriced ? "Shortlist" : "Add to cart"}
            </span>
          </button>
        </div>
      )}
    </>
  );
}
