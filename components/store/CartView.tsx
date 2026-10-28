"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  Trash2,
  ArrowRight,
  ArrowUpRight,
  ShoppingBag,
  Minus,
  Plus,
} from "lucide-react";
import {
  type StoreProduct,
  money,
  imageFor,
  availability,
} from "@/lib/catalogue";
import { cartSummary } from "@/lib/cart";
import { useCart } from "./CartProvider";
export function CartView({ products }: { products: StoreProduct[] }) {
  const { lines, update, ready, notice } = useCart();
  const [feedback, setFeedback] = useState("");
  const summary = cartSummary(lines, products);
  function change(id: string, quantity: number, name: string) {
    update(id, quantity);
    setFeedback(
      quantity
        ? `${name}: quantity ${quantity}.`
        : `${name} removed from your cart.`,
    );
  }
  return (
    <div className="cart-workspace">
      <p className="cart-feedback" role="status" aria-live="polite">
        {feedback || notice}
      </p>
      {!ready ? (
        <div className="cart-restoring" role="status">
          <ShoppingBag size={26} strokeWidth={1} />
          <h3>Bringing your edit together.</h3>
          <p>Restoring your saved selection…</p>
        </div>
      ) : !lines.length ? (
        <div className="cart-empty-state">
          <span className="cart-empty-symbol">
            <ShoppingBag size={38} strokeWidth={1} />
          </span>
          <span className="eyebrow">AN OPEN CANVAS</span>
          <h3>
            Your next possibility
            <br />
            <em>is waiting.</em>
          </h3>
          <p>
            Your cart is empty. Explore the collection and gather the products
            you would like to consider.
          </p>
          <Link href="/shop" className="cart-primary-action">
            Explore the collection <ArrowUpRight size={18} />
          </Link>
          <Link href="/request-quote" className="cart-secondary-action">
            Planning a complete system? Request a quote{" "}
            <ArrowUpRight size={15} />
          </Link>
        </div>
      ) : (
        <div className="cart-editorial-layout">
          <div className="cart-selection">
            <div className="cart-selection-heading">
              <span>
                {lines.length} {lines.length === 1 ? "product" : "products"} /{" "}
                {summary.count} {summary.count === 1 ? "item" : "items"}
              </span>
              <span>YOUR CONSIDERED COLLECTION</span>
            </div>
            {lines.map((line, index) => {
              const p = products.find((p) => p.id === line.productId);
              if (!p) return null;
              return (
                <article
                  className="cart-product"
                  key={p.id}
                  aria-labelledby={`cart-product-${p.id}`}
                >
                  <Link
                    className="cart-product-image"
                    href={`/shop/${p.slug}`}
                    aria-label={`View ${p.name}`}
                  >
                    <Image
                      src={imageFor(p.category)}
                      width={440}
                      height={440}
                      sizes="(max-width: 600px) 105px, (max-width: 1000px) 180px, 220px"
                      alt={`${p.name}: illustrative category photograph`}
                    />
                    <span>{String(index + 1).padStart(2, "0")}</span>
                  </Link>
                  <div className="cart-product-details">
                    <span className="eyebrow">{p.category}</span>
                    <h3 id={`cart-product-${p.id}`}>
                      <Link href={`/shop/${p.slug}`}>{p.name}</Link>
                    </h3>
                    <p className="cart-product-availability">
                      {availability(p)}
                    </p>
                    <p className="cart-product-price">
                      {money(p.priceKobo)}
                      {p.priceKobo !== null && <span> / each</span>}
                    </p>
                    <div className="cart-product-controls">
                      <div
                        className="cart-quantity"
                        role="group"
                        aria-label={`Quantity for ${p.name}`}
                      >
                        <button
                          type="button"
                          disabled={line.quantity <= 1}
                          onClick={() =>
                            change(p.id, line.quantity - 1, p.name)
                          }
                          aria-label={`Decrease quantity for ${p.name}`}
                        >
                          <Minus size={14} />
                        </button>
                        <input
                          aria-label={`Quantity for ${p.name}`}
                          type="number"
                          inputMode="numeric"
                          min={1}
                          max={99}
                          value={line.quantity}
                          onChange={(e) =>
                            change(
                              p.id,
                              Math.max(
                                1,
                                Math.min(
                                  99,
                                  Math.trunc(Number(e.target.value) || 1),
                                ),
                              ),
                              p.name,
                            )
                          }
                        />
                        <button
                          type="button"
                          disabled={line.quantity >= 99}
                          onClick={() =>
                            change(p.id, line.quantity + 1, p.name)
                          }
                          aria-label={`Increase quantity for ${p.name}`}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        className="cart-remove"
                        type="button"
                        onClick={() => change(p.id, 0, p.name)}
                        aria-label={`Remove ${p.name}`}
                      >
                        <Trash2 size={14} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                  <div className="cart-line-total">
                    <span>LINE TOTAL</span>
                    <strong>
                      {p.priceKobo === null
                        ? "Quote required"
                        : money(p.priceKobo * line.quantity)}
                    </strong>
                  </div>
                </article>
              );
            })}
            <div className="cart-selection-footer">
              <Link href="/shop">
                Continue exploring <ArrowUpRight size={17} />
              </Link>
              <p>
                Category photographs are illustrative. Exact models and
                specifications require confirmation.
              </p>
            </div>
          </div>
          <aside className="cart-summary" aria-labelledby="cart-summary-title">
            <span className="eyebrow">YOUR NEXT STEP</span>
            <h3 id="cart-summary-title">
              The finer <em>details.</em>
            </h3>
            <dl>
              <div>
                <dt>Items in your edit</dt>
                <dd>{summary.count}</dd>
              </div>
              <div>
                <dt>Product subtotal</dt>
                <dd>
                  {summary.subtotal === null
                    ? "Quote required"
                    : money(summary.subtotal)}
                </dd>
              </div>
              <div>
                <dt>Delivery</dt>
                <dd>To be confirmed</dd>
              </div>
            </dl>
            <div className="cart-estimate">
              <span>Estimated total</span>
              <strong>
                {summary.subtotal === null
                  ? "Let’s confirm it."
                  : money(summary.subtotal)}
              </strong>
              <p>
                {summary.subtotal === null
                  ? "Your selection includes products without confirmed prices. A complete total is not yet available."
                  : "Excludes delivery. Final prices and availability are verified before an order can be placed."}
              </p>
            </div>
            <Link className="cart-primary-action" href="/checkout">
              Review checkout <ArrowRight size={17} />
            </Link>
            <Link className="cart-quote-action" href="/request-quote">
              Request a quote <ArrowUpRight size={16} />
            </Link>
            <p className="cart-summary-note">
              Checkout availability depends on configured pricing, delivery and
              test payment services. Your cart does not reserve stock.
            </p>
            <Link className="cart-help-link" href="/faq">
              A question before you continue? <ArrowUpRight size={14} />
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
