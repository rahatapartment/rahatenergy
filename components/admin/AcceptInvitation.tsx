"use client";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
export function AcceptInvitation() {
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();
  useEffect(() => {
    setToken(new URLSearchParams(location.search).get("token") || "");
    history.replaceState(null, "", "/admin/accept-invite");
  }, []);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const f = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/admin/accept-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          name: f.get("name"),
          password: f.get("password"),
        }),
      });
      const d = await res.json();
      if (!res.ok) throw Error(d.error);
      router.replace("/admin");
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unable to join.");
    } finally {
      setPending(false);
    }
  }
  return (
    <main
      className="section"
      style={{ maxWidth: 600, margin: "60px auto", padding: 30 }}
    >
      <span className="eyebrow">RAHAT ENERGY / TEAM</span>
      <h1>Welcome to the team.</h1>
      <p>Choose your name and a secure password to accept your invitation.</p>
      <form onSubmit={submit} className="inventory-form">
        <label>
          Your name
          <input name="name" autoComplete="name" required minLength={2} />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={16}
            maxLength={128}
          />
          <small>Use at least 16 characters.</small>
        </label>
        <button className="button dark" disabled={pending || !token}>
          {pending ? "Joining…" : "Accept invitation"}
        </button>
        <p role="alert">{message}</p>
      </form>
    </main>
  );
}
