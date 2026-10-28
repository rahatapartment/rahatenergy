"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  ArrowRight,
  LockKeyhole,
  Eye,
  EyeOff,
} from "lucide-react";
import { Brand } from "@/components/store/Chrome";
export function Login() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);
  const router = useRouter();
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    const form = new FormData(e.currentTarget);
    setPending(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: form.get("password"),
          email: form.get("email"),
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setPending(false);
    }
  }
  return (
    <main id="main" className="login-wrap admin-login-premium">
      <section
        className="admin-login-story"
        aria-labelledby="login-story-title"
      >
        <Link href="/" aria-label="Rahat Energy home">
          <Brand />
        </Link>
        <div>
          <span className="eyebrow">RAHAT ENERGY / OPERATIONS</span>
          <h2 id="login-story-title">
            Considered energy.
            <br />
            <em>Clearer operations.</em>
          </h2>
          <p>
            A dedicated workspace for your collection, customer conversations
            and the details behind every order.
          </p>
        </div>
        <span className="admin-login-signature">
          R / E <span>INDEPENDENT BY DESIGN</span>
        </span>
      </section>
      <form className="login-form" onSubmit={submit}>
        <span className="admin-login-lock">
          <LockKeyhole size={23} strokeWidth={1.2} />
        </span>
        <span className="eyebrow">PRIVATE WORKSPACE</span>
        <h1>
          Welcome <em>back.</em>
        </h1>
        <p>
          Sign in with your independent Rahat Energy administrator credentials.
        </p>
        <label>
          Admin email (named accounts)
          <input
            name="email"
            type="email"
            autoComplete="username"
            maxLength={254}
            placeholder="Leave blank for initial setup"
          />
        </label>
        <label>
          Admin password
          <span className="admin-password-field">
            <input
              name="password"
              type={visible ? "text" : "password"}
              autoComplete="current-password"
              required
              maxLength={256}
              id="admin-password"
            />
            <button
              type="button"
              aria-label={visible ? "Hide password" : "Show password"}
              aria-controls="admin-password"
              aria-pressed={visible}
              onClick={() => setVisible(!visible)}
            >
              {visible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
        </label>
        <button className="button dark wide" disabled={pending}>
          {pending ? "Signing in…" : "Sign in securely"}
          <ArrowRight size={17} />
        </button>
        {error && (
          <p className="notice error" role="alert" style={{ marginTop: 20 }}>
            {error}
          </p>
        )}
        <Link className="text-link" href="/">
          Return to storefront <ArrowUpRight size={15} />
        </Link>
        <p className="admin-login-note">
          Use your named administrator account, or leave email blank only for
          the initial setup credentials. Server permissions determine the
          actions available to you.
        </p>
      </form>
    </main>
  );
}
