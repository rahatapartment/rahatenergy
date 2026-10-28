import Link from "next/link";
import { QuoteForm } from "@/components/store/QuoteForm";
import { storeData } from "@/lib/store-data";
import { catalogue } from "@/lib/catalogue";
export const metadata = { title: "Request a quote" };
export const dynamic = "force-dynamic";
export default async function Page({
  searchParams,
}: {
  searchParams: { product?: string };
}) {
  const { status } = await storeData();
  const selected = catalogue.some((p) => p.id === searchParams.product)
    ? searchParams.product
    : "";
  return (
    <main id="main" className="page-wrap">
      <div className="page-heading">
        <span className="eyebrow">LET’S FIND YOUR WAY FORWARD</span>
        <h1>
          Your project.
          <br />
          <em>Our next conversation.</em>
        </h1>
        <p>
          From a single product to a bigger idea. Tell us what you have in mind.
        </p>
      </div>
      <div className="quote-layout">
        <aside className="quote-intro">
          <span className="eyebrow">A THOUGHTFUL FIRST STEP</span>
          <h2>
            Good questions.
            <br />
            Better possibilities.
          </h2>
          <p>
            Share a little about your needs so your enquiry has the right
            starting point.
          </p>
          <ol>
            <li>Tell us about your space and energy needs.</li>
            <li>Choose a product, or ask for help choosing.</li>
            <li>
              Request confirmation of pricing, specifications and arrangements.
            </li>
          </ol>
          <p className="small muted">
            Your enquiry is the starting point for confirming scope,
            specifications and pricing. Keep the reference shown after a
            successful submission.
          </p>
          <Link className="text-link" href="/how-to-order">
            What happens next? →
          </Link>
        </aside>
        <QuoteForm selected={selected} available={status === "connected"} />
      </div>
    </main>
  );
}
