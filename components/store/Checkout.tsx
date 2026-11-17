"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useCart } from "./CartProvider";
import Image from "@/components/WebImage";
import { ArrowLeft, ArrowRight, LockKeyhole, ShoppingBag, Truck, ShieldCheck, MapPin } from "lucide-react";
import { money, productImage, type StoreProduct } from "@/lib/catalogue";
type Option = {
  id: string;
  label: string;
  method: string;
  state: string | null;
  city: string | null;
  pickupAddress: string | null;
  feeKobo: number;
};
type Quote = {
  items: {
    productId: string;
    name: string;
    quantity: number;
    unitPriceKobo: number;
  }[];
  subtotalKobo: number;
  deliveryFeeKobo: number;
  totalKobo: number;
};
type Attempt = { checkoutKey: string; accessToken: string };
function newAttempt(): Attempt {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return {
    checkoutKey: crypto.randomUUID(),
    accessToken: btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, ""),
  };
}
export function Checkout({
  products,
  options,
  available,
}: {
  products: StoreProduct[];
  options: Option[];
  available: boolean;
}) {
  const { lines, ready } = useCart();
  const [optionId, setOptionId] = useState(options[0]?.id || "");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [orderUrl, setOrderUrl] = useState("");
  const attempt = useRef<Attempt | null>(null);
  const [reviewAgain, setReviewAgain] = useState(0);
  const [recovery, setRecovery] = useState("");
  useEffect(() => {
    try {
      const saved = JSON.parse(
        sessionStorage.getItem("energy-checkout-attempt") || "null",
      );
      if (saved?.checkoutKey && saved?.accessToken) {
        attempt.current = saved;
        setRecovery(saved.accessToken);
      }
    } catch {
      /* A new attempt can be generated when submitting. */
    }
  }, []);
  const option = options.find((o) => o.id === optionId);
  const linesKey = JSON.stringify(lines);
  useEffect(() => {
    setQuote(null);
    if (!ready || !lines.length || !optionId || !available) { setReviewing(false); return; }
    const controller = new AbortController();
    setReviewing(true);
    setError("");
    fetch("/api/checkout/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lines: JSON.parse(linesKey),
        deliveryOptionId: optionId,
      }),
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setQuote(data);
      })
      .catch((e) => {
        if (e.name !== "AbortError")
          setError(e.message || "Unable to review prices.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setReviewing(false);
      });
    return () => controller.abort();
  }, [ready, linesKey, lines.length, optionId, available, reviewAgain]);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!quote || !option || pending || reviewing || !available) return;
    setPending(true);
    setError("");
    const form = new FormData(e.currentTarget);
    if (!attempt.current) attempt.current = newAttempt();
    setRecovery(attempt.current.accessToken);
    try {
      sessionStorage.setItem(
        "energy-checkout-attempt",
        JSON.stringify(attempt.current),
      );
    } catch {
      /* Order cookie remains available on this device. */
    }
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...attempt.current,
          lines,
          deliveryOptionId: optionId,
          expectedTotalKobo: quote.totalKobo,
          customer: {
            name: form.get("name"),
            email: form.get("email"),
            phone: form.get("phone"),
          },
          address: {
            line1: form.get("line1") || "",
            city: form.get("city") || "",
            state: form.get("state") || "",
          },
          consent: form.get("consent") === "on",
        }),
      });
      const data = await res.json();
      if (data.orderUrl) setOrderUrl(data.orderUrl);
      if (!res.ok)
        throw new Error(data.error || "Unable to prepare your payment.");
      window.location.assign(data.redirectUrl);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Connection interrupted. Retry the same attempt or check your order.",
      );
    } finally {
      setPending(false);
    }
  }
  async function resume() {
    if (!attempt.current) return;
    setPending(true);
    try {
      const res = await fetch("/api/checkout/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attempt.current),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.location.assign(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to resume.");
    } finally {
      setPending(false);
    }
  }
  function restart() {
    attempt.current = null;
    setRecovery("");
    setOrderUrl("");
    try {
      sessionStorage.removeItem("energy-checkout-attempt");
    } catch {}
    setReviewAgain((n) => n + 1);
  }
  if (!ready) return <div className="checkout-restoring" role="status"><span /><p>Preparing your checkout…</p></div>;
  if (!lines.length) return (
    <section className="checkout-empty" aria-labelledby="empty-cart-title">
      <span className="checkout-empty-icon"><ShoppingBag size={30} strokeWidth={1.4} /></span>
      <span className="checkout-kicker">YOUR NEXT ESSENTIAL</span>
      <h2 id="empty-cart-title">Your cart is waiting.</h2>
      <p>Explore our collection of solar, storage and everyday essentials, then come back here to review your selection.</p>
      <Link href="/shop" className="checkout-primary-link">Explore the collection <ArrowRight size={18} /></Link>
      <Link href="/request-quote" className="checkout-secondary-link">Need help choosing? Talk to our team</Link>
    </section>
  );
  return (
    <div className="checkout-grid">
      <form onSubmit={submit} className="checkout-main-form">
        <div className="checkout-test-notice"><ShieldCheck size={18} /><p><strong>Test checkout</strong><span>This checkout supports test payments only. Real payments are not enabled.</span></p></div>
        {!available && <div className="checkout-unavailable" role="status"><p>Online checkout isn’t available right now. Your items are saved, and our team can help you with pricing and delivery.</p><Link href="/request-quote">Request a quote <ArrowRight size={15} /></Link></div>}
        {recovery && (
          <div className="notice" style={{ marginTop: 16 }}>
            An earlier checkout attempt is saved on this device.{" "}
            <button
              type="button"
              className="text-link"
              disabled={pending}
              onClick={resume}
            >
              Open that order
            </button>{" "}
            <button type="button" className="text-link" onClick={restart}>
              Start a new attempt
            </button>
          </div>
        )}
        <section className="checkout-form-section checkout-panel">
          <div className="checkout-panel-heading"><span>01</span><div><h2>Your details</h2><p>We’ll use these to confirm your order and keep you updated.</p></div></div>
          <div className="form-grid">
            <label>
              Full name
              <input
                name="name"
                placeholder="Your full name"
                autoComplete="name"
                required
                minLength={2}
                maxLength={120}
              />
            </label>
            <label>
              Email address
              <input
                name="email"
                placeholder="you@example.com"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
              />
            </label>
            <label>
              Phone number
              <input
                name="phone"
                placeholder="Your phone number"
                type="tel"
                autoComplete="tel"
                required
                minLength={7}
                maxLength={30}
              />
            </label>
          </div>
        </section>
        <section className="checkout-form-section checkout-panel">
          <div className="checkout-panel-heading"><span>02</span><div><h2>How would you like to receive it?</h2><p>Choose delivery or collection from the available options.</p></div></div>
          <label className="field-label">
            Choose an available option
            <select
              value={optionId}
              onChange={(e) => setOptionId(e.target.value)}
              required
              disabled={!options.length}
            >
              {!options.length && (
                <option value="">No confirmed options yet</option>
              )}
              {options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label} · {money(o.feeKobo)}
                </option>
              ))}
            </select>
          </label>
          {option?.method === "PICKUP" ? (
            <div className="checkout-pickup"><MapPin size={18} />
              <div><strong>Collection location</strong>
              <br />
              {option.pickupAddress}
              </div></div>
          ) : (
            <div className="form-grid">
              <label className="full">
                Street address
                <input
                  name="line1"
                  placeholder="Street address and building number"
                  autoComplete="street-address"
                  required
                  maxLength={250}
                />
              </label>
              <label>
                City
                <input
                  name="city"
                  autoComplete="address-level2"
                  required
                  defaultValue={option?.city || ""}
                  key={`city-${optionId}`}
                  maxLength={100}
                />
              </label>
              <label>
                State
                <input
                  name="state"
                  autoComplete="address-level1"
                  required
                  defaultValue={option?.state || ""}
                  key={`state-${optionId}`}
                  maxLength={100}
                />
              </label>
            </div>
          )}
        </section>
        <div className="checkout-payment-panel checkout-panel">
        <div className="checkout-panel-heading"><span>03</span><div><h2>Review & continue</h2><p>You’ll complete your test payment on Paystack.</p></div></div>
        <label className="check-field">
          <input name="consent" type="checkbox" required />
          <span>
            I have reviewed this test order and agree to these details being
            used to process it.{" "}
            <Link className="inline-link" href="/policies/privacy">
              Privacy notice
            </Link>
          </span>
        </label>
        <button
          type="submit"
          className="checkout-submit"
          disabled={!available || !quote || pending || reviewing}
        >
          {pending
            ? "Preparing secure test payment…"
            : reviewing
              ? "Checking current prices…"
              : "Continue to Paystack test checkout"}
          <ArrowRight size={18} aria-hidden="true" />
        </button>
        <p className="checkout-payment-note"><LockKeyhole size={13} />Card details are entered on Paystack, not on this website.</p>
        </div>
        {error && (
          <div className="notice error" role="alert" style={{ marginTop: 16 }}>
            {error}
            {orderUrl && (
              <p>
                <Link className="inline-link" href={orderUrl}>
                  Check this order’s status
                </Link>
              </p>
            )}
            <button type="button" className="text-link" onClick={restart}>
              Review again / start a new attempt
            </button>
          </div>
        )}
        {recovery && (
          <details className="recovery-code">
            <summary>Save your private order access code</summary>
            <p>
              Keep this code private. It can restore order access on another
              device.
            </p>
            <code>{recovery}</code>
          </details>
        )}
      </form>
      <aside className="checkout-summary" aria-labelledby="checkout-summary-title">
        <div className="checkout-summary-heading"><h2 id="checkout-summary-title">Your order</h2><span>{lines.reduce((sum, line) => sum + line.quantity, 0)} {lines.reduce((sum, line) => sum + line.quantity, 0) === 1 ? "item" : "items"}</span></div>
        <div className="checkout-summary-items">
        {lines.map((line) => {
          const p = products.find((p) => p.id === line.productId);
          const item = quote?.items.find((i) => i.productId === line.productId);
          return (
            <div className="checkout-summary-item" key={line.productId}>
              <div className="checkout-item-image">{p && <Image src={productImage(p)} alt={p.name} width={76} height={76} sizes="76px" />}</div>
              <div className="checkout-item-details"><Link href={p ? `/shop/${p.slug}` : "/shop"}>{p?.name || "Product unavailable"}</Link><span>Quantity: {line.quantity}</span>
              <strong>
                {item
                  ? money(item.unitPriceKobo * line.quantity)
                  : p?.priceKobo != null ? money(p.priceKobo * line.quantity) : "Price on request"}
              </strong></div>
            </div>
          );
        })}
        </div>
        {quote ? (
          <>
            <dl className="checkout-totals">
              <div>
                <dt>Subtotal</dt>
                <dd>{money(quote.subtotalKobo)}</dd>
              </div>
              <div>
                <dt>Delivery / collection</dt>
                <dd>{money(quote.deliveryFeeKobo)}</dd>
              </div>
            </dl>
            <div className="summary-total">
              <span>Total (NGN)</span>
              <strong>{money(quote.totalKobo)}</strong>
            </div>
          </>
        ) : (
          <div className="checkout-total-pending" role="status"><div><span>Total</span><strong>Pending review</strong></div><p>{reviewing ? "Confirming current prices and availability…" : "Your final total will appear once prices, stock and your delivery option have been confirmed."}</p></div>
        )}
        <Link href="/cart" className="checkout-edit-cart"><ArrowLeft size={14} />Edit your cart</Link>
        <div className="checkout-summary-assurance"><div><ShieldCheck size={17} /><span>Prices and stock confirmed before payment</span></div><div><Truck size={17} /><span>Delivery or collection, arranged around you</span></div></div>
        <div className="checkout-summary-help"><span>Need a hand with your order?</span><Link href="/contact">Contact our team <ArrowRight size={14} /></Link></div>
      </aside>
    </div>
  );
}
