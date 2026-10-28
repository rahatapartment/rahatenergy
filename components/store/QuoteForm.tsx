"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { catalogue } from "@/lib/catalogue";
import { ArrowUpRight } from "lucide-react";
export function QuoteForm({
  selected = "",
  available,
  unavailableMessage,
}: {
  selected?: string;
  available: boolean;
  unavailableMessage?: string;
}) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setMessage("");
    const data = new FormData(e.currentTarget);
    try {
      const response = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          productId: data.get("productId"),
          quantity: Number(data.get("quantity")),
          location: data.get("location"),
          requirements: data.get("requirements"),
          notes: data.get("notes"),
          consent: data.get("consent") === "on",
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setSuccess(true);
      setMessage(
        `Your enquiry has been saved. Reference: ${result.reference}. Keep this reference. An email acknowledgement is sent when the email service is available.`,
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to save your enquiry. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }
  if (success)
    return (
      <div className="notice" role="status">
        <h2 style={{ fontSize: 28, marginBottom: 15 }}>
          A brighter conversation ahead.
        </h2>
        {message}
      </div>
    );
  return (
    <form onSubmit={submit} className="form-grid">
      {!available && (
        <div className="notice full">
          {unavailableMessage ||
            "The independent enquiry database is not connected. You can explore the form, but submissions are currently unavailable."}
        </div>
      )}
      <div className="full form-section-heading">
        <span className="eyebrow">01 / YOUR DETAILS</span>
        <h2>Let’s get acquainted.</h2>
        <p>Share the contact details you would like us to use.</p>
      </div>
      <label>
        Your name
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
      <label>
        Location
        <input
          name="location"
          autoComplete="address-level2"
          placeholder="City and state"
          required
          minLength={2}
          maxLength={200}
        />
      </label>
      <div className="full form-section-heading">
        <span className="eyebrow">02 / YOUR PROJECT</span>
        <h2>What are you planning?</h2>
        <p>
          A few details will help frame the conversation. Include appliances,
          usage and your preferred timeline.
        </p>
      </div>
      <label>
        Product of interest
        <select name="productId" defaultValue={selected}>
          <option value="">A project / help me choose</option>
          {catalogue.map((p) => (
            <option value={p.id} key={p.id}>
              {p.name} (provisional)
            </option>
          ))}
        </select>
      </label>
      <label>
        Quantity
        <input
          name="quantity"
          type="number"
          defaultValue={1}
          min={1}
          max={10000}
          required
        />
      </label>
      <label className="full">
        Tell us about your project
        <textarea
          name="requirements"
          rows={8}
          required
          minLength={10}
          maxLength={5000}
          placeholder="Your space, energy needs, timeline and questions…"
        />
      </label>
      <label className="full">
        Additional notes (optional)
        <textarea name="notes" maxLength={2000} rows={5} />
      </label>
      <label className="check-field full">
        <input name="consent" type="checkbox" required />
        <span>
          I agree to Rahat Energy using these details to respond to this
          enquiry. Details are stored in the independent enquiry database and
          accessible to authorised operations staff.
        </span>
      </label>
      <div className="full">
        <button
          className="button dark wide"
          type="submit"
          disabled={pending || !available}
        >
          {pending ? "Saving your enquiry…" : "Send your enquiry"}
          <ArrowUpRight size={17} />
        </button>
        <p className="small muted" style={{ marginTop: 14 }}>
          No payment is required. Product details and project arrangements will
          need confirmation. Read our{" "}
          <Link className="inline-link" href="/policies/privacy">
            draft privacy notice
          </Link>{" "}
          for details about enquiry information.
        </p>
      </div>
      {message && (
        <p className="notice error full" role="alert">
          {message}
        </p>
      )}
    </form>
  );
}
