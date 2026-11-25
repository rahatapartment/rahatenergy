import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import Image from "@/components/WebImage";
import { QuoteForm } from "@/components/store/QuoteForm";
import { storeData } from "@/lib/store-data";

export const metadata = {
  title: "Request a quote",
  description: "Request a quote for Rahat Energy products or tell us about your home or business energy project.",
};
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: { product?: string } }) {
  const { products, status } = await storeData();
  const selected = products.find(product => product.id === searchParams.product);

  return (
    <main id="main" className="quote-experience">
      <section className="quote-hero cinematic-hero" aria-labelledby="quote-title">
        <div className="quote-hero-image solutions-scene" aria-hidden="true">
          <Image src="/images/panels.webp" alt="" fill priority sizes="(max-width: 760px) 100vw, 57vw" />
        </div>
        <div className="solutions-hero-copy quote-hero-copy">
          <span className="cinematic-eyebrow"><span /> REQUEST A QUOTE</span>
          <h1 id="quote-title">
            <span data-motion-line>Your project.</span>
            <em data-motion-line>Let’s talk energy.</em>
          </h1>
          <p>Tell us what you’re planning. Our sales team will follow up with pricing and options for your space.</p>
          <a className="solutions-hero-enter" href="#quote-form">
            <span>Start your enquiry</span>
            <span><ArrowDown size={19} strokeWidth={1.4} aria-hidden="true" /></span>
          </a>
        </div>
      </section>

      <section className="quote-surface" data-header-surface data-store-motion="glide" aria-labelledby="quote-brief-title">
        <div className="quote-brief">
          <aside className="quote-guidance">
            <h2 id="quote-brief-title">
              <span data-motion-line>Start with</span>
              <em data-motion-line>what you need.</em>
            </h2>
            <p>Request pricing for a specific product or describe the equipment, appliances, and timing you have in mind.</p>
            {selected && (
              <div className="quote-selection">
                <span>Product selected</span>
                <Link href={`/shop/${selected.slug}`}>{selected.name} <ArrowUpRight size={15} aria-hidden="true" /></Link>
              </div>
            )}
            <div className="quote-next">
              <h3>What happens next?</h3>
              <p>You’ll get a reference when you submit. Our sales team will review your enquiry and contact you about the quote.</p>
              <Link href="/how-to-order" className="contact-inline-link">How to order <ArrowUpRight size={15} aria-hidden="true" /></Link>
            </div>
          </aside>
          <div id="quote-form" className="contact-enquiry-form quote-form-card">
            <QuoteForm
              selected={selected?.id}
              productOptions={products.map(({ id, name }) => ({ id, name }))}
              available={status === "connected"}
              unavailableMessage="Enquiry submissions are temporarily unavailable. Please try again shortly."
            />
          </div>
        </div>
      </section>
    </main>
  );
}
