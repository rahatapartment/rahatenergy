"use client";
import { useState, useEffect, useRef, type FormEvent } from "react";
import { useCart } from "./CartProvider";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, LockKeyhole } from "lucide-react";
export function VerifyOrder({ reference }: { reference: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  async function verify() {
    setPending(true);
    setMessage("");
    try {
      const res = await fetch("/api/orders/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(
        data.paid ? "Payment verified." : "Payment is not confirmed yet.",
      );
      router.refresh();
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "Verification is temporarily unavailable.",
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <div>
      <button className="button dark" onClick={verify} disabled={pending}>
        {pending ? "Checking with Paystack…" : "Verify payment status"}
      </button>
      {message && (
        <p className="notice" role="status" style={{ marginTop: 15 }}>
          {message}
        </p>
      )}
    </div>
  );
}
export function OrderAccess() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [visible, setVisible] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setMessage("");
    const data = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/orders/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: String(data.get("reference")).trim().toUpperCase(),
          accessToken: String(data.get("accessToken")).trim(),
        }),
      });
      const result = await res.json();
      if (!res.ok)
        throw new Error(
          result.error || "Unable to access this order. Please try again.",
        );
      router.push(result.url);
      router.refresh();
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "Unable to access this order.",
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <form
      className="tracking-form"
      onSubmit={submit}
      aria-label="Private order access"
      aria-busy={pending}
    >
      <div className="tracking-field">
        <label htmlFor="order-reference">Order reference</label>
        <input
          id="order-reference"
          name="reference"
          required
          placeholder="RE-…"
          maxLength={30}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          aria-describedby="order-reference-hint"
        />
        <p id="order-reference-hint">
          The reference beginning with RE- from your order.
        </p>
      </div>
      <div className="tracking-field">
        <label htmlFor="order-access-code">Private order access code</label>
        <div className="tracking-code-input">
          <input
            id="order-access-code"
            name="accessToken"
            required
            minLength={43}
            maxLength={43}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            type={visible ? "text" : "password"}
            aria-describedby="order-code-hint"
          />
          <button
            type="button"
            aria-label={visible ? "Hide access code" : "Show access code"}
            aria-pressed={visible}
            aria-controls="order-access-code"
            onClick={() => setVisible(!visible)}
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <p id="order-code-hint">
          Your 43-character code is case-sensitive. Keep it private.
        </p>
      </div>
      <button className="tracking-submit" type="submit" disabled={pending}>
        {pending ? "Checking access…" : "View your order"}
        <ArrowRight size={17} aria-hidden="true" />
      </button>
      {message && (
        <p className="tracking-error" role="alert">
          {message}
        </p>
      )}
      <p className="tracking-form-note">
        <LockKeyhole size={14} aria-hidden="true" />
        <span>
          Both details are required. Your code is sent in the form request,
          never in the page address.
        </span>
      </p>
    </form>
  );
}

export function ClearPurchasedItems({
  checkoutKey,
  items,
}: {
  checkoutKey: string | null;
  items: { productId: string; quantity: number }[];
}) {
  const { lines, ready, update } = useCart();
  const done = useRef(false);
  useEffect(() => {
    if (!ready || done.current || !checkoutKey) return;
    try {
      const saved = JSON.parse(
        sessionStorage.getItem("energy-checkout-attempt") || "null",
      );
      if (saved?.checkoutKey !== checkoutKey) return;
      done.current = true;
      sessionStorage.removeItem("energy-checkout-attempt");
      for (const item of items) {
        const line = lines.find((l) => l.productId === item.productId);
        if (line)
          update(item.productId, Math.max(0, line.quantity - item.quantity));
      }
    } catch {
      done.current = true;
    }
  }, [ready, checkoutKey, items, lines, update]);
  return null;
}
