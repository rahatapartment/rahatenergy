import Link from "next/link";
import { PageIntro, EnquiryCTA, FAQList } from "@/components/store/Content";
import { faqs } from "@/lib/content";
export const metadata = {
  title: "How to order",
  description: "Browse, shortlist and prepare an enquiry with Rahat Energy.",
};
export default function Page() {
  return (
    <main id="main" className="page-wrap">
      <PageIntro
        eyebrow="FROM BROWSING TO A CLEARER BRIEF"
        title="Your energy journey, step by step."
        description="Explore the collection and build a useful shortlist before confirming the details of a purchase."
      />
      <div className="notice">
        Your cart is a shortlist. Submitting a configured test checkout creates
        an order and reserves stock for 15 minutes. Live payments are disabled.
      </div>
      <section className="content-section">
        <div className="ordering-steps">
          {[
            [
              "Explore the collection",
              "Browse the five categories. Use search and filters to find the products you want to discuss.",
              "Browse products",
              "/shop",
            ],
            [
              "Build your shortlist",
              "Add products to the cart, adjust quantities and return to the list in the same browser.",
              "View your cart",
              "/cart",
            ],
            [
              "Share your requirements",
              "Use the quote form to describe your location, quantities, existing equipment and project priorities.",
              "Request a quote",
              "/request-quote",
            ],
            [
              "Confirm before you commit",
              "Request verified specifications, itemised pricing, availability, delivery and the applicable terms in writing.",
              "Read the FAQs",
              "/faq",
            ],
          ].map(([title, copy, label, href], i) => (
            <article className="ordering-step" key={title}>
              <span className="step-number">0{i + 1}</span>
              <div>
                <h2>{title}</h2>
                <p>{copy}</p>
                <Link href={href} className="text-link">
                  {label} →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="planning-panel">
        <div>
          <span className="eyebrow">KEEP THE DETAILS TOGETHER</span>
          <h2>A useful enquiry includes…</h2>
        </div>
        <ul>
          <li>Product names or categories and quantities</li>
          <li>Your city and state, with any delivery questions</li>
          <li>The equipment or appliances involved</li>
          <li>Existing system details and your project timeline</li>
        </ul>
      </section>
      <section className="content-section">
        <h2>Before you get started.</h2>
        <FAQList items={faqs.filter((_, i) => [2, 3, 9, 10].includes(i))} />
      </section>
      <EnquiryCTA />
    </main>
  );
}
