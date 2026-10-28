"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useCart } from "./CartProvider";
import { money, type StoreProduct } from "@/lib/catalogue";
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
    if (!ready || !lines.length || !optionId || !available) return;
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
    if (!quote || !option) return;
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
  if (!ready) return <p role="status">Restoring your selection…</p>;
  if (!lines.length)
    return (
      <div className="empty">
        <h2>Start with your energy shortlist.</h2>
        <Link href="/shop" className="button dark">
          Explore products
        </Link>
      </div>
    );
  return (
    <div className="cart-layout">
      <form onSubmit={submit}>
        <div className="notice">
          TEST CHECKOUT · Only Paystack test payments are supported. No live
          payment credentials are accepted.
        </div>
        {!available && (
          <p className="notice error" style={{ marginTop: 16 }}>
            Test checkout is not available yet. Your cart remains saved while
            product and delivery arrangements are being confirmed.
          </p>
        )}
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
        <section className="checkout-form-section">
          <h2>Your contact details</h2>
          <div className="form-grid">
            <label>
              Full name
              <input
                name="name"
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
                type="tel"
                autoComplete="tel"
                required
                minLength={7}
                maxLength={30}
              />
            </label>
          </div>
        </section>
        <section className="checkout-form-section">
          <h2>Delivery or collection</h2>
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
            <div className="notice">
              <strong>Collection location</strong>
              <br />
              {option.pickupAddress}
            </div>
          ) : (
            <div className="form-grid">
              <label className="full">
                Street address
                <input
                  name="line1"
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
          className="button dark wide"
          disabled={!available || !quote || pending || reviewing}
        >
          {pending
            ? "Preparing secure test payment…"
            : reviewing
              ? "Checking current prices…"
              : "Continue to Paystack test checkout"}
        </button>
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
      <aside className="order-summary">
        <span className="eyebrow">SERVER-VERIFIED REVIEW</span>
        <h2>Your test order</h2>
        {lines.map((line) => {
          const p = products.find((p) => p.id === line.productId);
          const item = quote?.items.find((i) => i.productId === line.productId);
          return (
            <div className="checkout-line" key={line.productId}>
              <span>
                {line.quantity} × {p?.name}
              </span>
              <strong>
                {item
                  ? money(item.unitPriceKobo * line.quantity)
                  : "Awaiting review"}
              </strong>
            </div>
          );
        })}
        {quote ? (
          <>
            <dl>
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
          <p className="small muted" role="status">
            {reviewing
              ? "Checking database prices and stock…"
              : "Choose a configured option to calculate your total."}
          </p>
        )}
        <p className="small muted">
          Prices and stock are checked again when submitting. Stock is held for
          15 minutes after an order is created.
        </p>
        <Link href="/cart" className="text-link">
          Edit your cart →
        </Link>
      </aside>
    </div>
  );
}
