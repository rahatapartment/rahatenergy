"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, Eye, EyeOff, Package, ClipboardList, Users } from "lucide-react";
export function Login() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);
  const router = useRouter();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (pending) return;
    const form = new FormData(event.currentTarget);
    setPending(true); setError("");
    try {
      const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: form.get("password"), email: form.get("email") }) });
      const result = await res.json(); if (!res.ok) throw new Error(result.error);
      router.push("/admin"); router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to sign in. Please try again."); }
    finally { setPending(false); }
  }
  return <main id="main" className="admin-signin-page">
    <div className="admin-signin-container">
      <section className="admin-signin-intro" aria-labelledby="signin-story">
        <span className="signin-eyebrow">RAHAT ENERGY / YOUR WORKSPACE</span>
        <h2 id="signin-story">Good energy.<br /><em>Great organisation.</em></h2>
        <p>Everything behind your business, thoughtfully brought together.</p>
        <div className="signin-capabilities">
          <div><Package size={20} /><span><strong>Your collection</strong><span>Keep products, photos and stock up to date.</span></span></div>
          <div><ClipboardList size={20} /><span><strong>Your orders</strong><span>Follow each order from payment to delivery.</span></span></div>
          <div><Users size={20} /><span><strong>Your customers</strong><span>Manage enquiries and support your customers.</span></span></div>
        </div>
        <Link href="/shop">Explore the storefront <ArrowRight size={16} /></Link>
      </section>
      <section className="admin-signin-card" aria-labelledby="signin-title">
        <span className="signin-lock"><LockKeyhole size={22} /></span>
        <span className="signin-eyebrow">PRIVATE ADMIN ACCESS</span>
        <h1 id="signin-title">Welcome back.</h1>
        <p>Sign in to manage your Rahat Energy store.</p>
        <form onSubmit={submit}>
          <label htmlFor="admin-email">Email address<input id="admin-email" name="email" type="email" autoComplete="username" required maxLength={254} placeholder="you@example.com" disabled={pending} /></label>
          <label htmlFor="admin-password">Password</label>
          <div className="signin-password"><input id="admin-password" name="password" type={visible ? "text" : "password"} autoComplete="current-password" required maxLength={128} disabled={pending} /><button type="button" aria-label={visible ? "Hide password" : "Show password"} aria-controls="admin-password" aria-pressed={visible} onClick={() => setVisible(v => !v)}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
          <button className="signin-submit" disabled={pending}>{pending ? "Signing in…" : "Sign in"}<ArrowRight size={18} /></button>
          {error && <p className="signin-error" role="alert">{error}</p>}
        </form>
        <div className="signin-card-note"><LockKeyhole size={14} /><p>Access is limited to the store owner and invited team members.</p></div>
        <Link className="signin-help" href="/contact">Need help accessing your account?</Link>
      </section>
    </div>
  </main>;
}
