import { CartTrigger } from "@/components/store/CartTrigger";
import Link from "next/link";
import { ArrowUpRight, LockKeyhole } from "lucide-react";
import { OrderAccess } from "@/components/store/OrderActions";
import { TrackOrderHero } from "@/components/store/TrackOrderHero";
export const metadata = {
  title: "Private order access",
  referrer: "no-referrer",
};
export default function Page() {
  return (
    <main id="main" className="tracking-experience">
      <TrackOrderHero />
      <div className="solutions-content-surface tracking-content-surface">
        <section
          className="tracking-access"
          id="order-access"
          data-header-surface
          aria-labelledby="tracking-access-title"
        >
          <div className="tracking-introduction">
            <span className="eyebrow">01 / A PRIVATE PERSPECTIVE</span>
            <h2 id="tracking-access-title">
              <span data-motion-line>The details.</span>
              <em data-motion-line>Only for you.</em>
            </h2>
            <p>
              Bring your reference and private access code together to view your
              order. A reference alone cannot reveal your contact or purchase
              details.
            </p>
            <div className="tracking-privacy">
              <LockKeyhole size={21} strokeWidth={1.2} />
              <p>
                Keep your access code private. Enter it only in the form, and
                avoid sharing it in messages or public screenshots.
              </p>
            </div>
            <Link href="/faq">
              A question before you continue? <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="tracking-form-panel">
            <div className="tracking-form-heading">
              <span className="eyebrow">YOUR ORDER, IN VIEW</span>
              <span aria-hidden="true">R / E</span>
            </div>
            <h3>
              <span data-motion-line>A little closer</span>
              <em data-motion-line>to clarity.</em>
            </h3>
            <p>
              Enter the details saved during checkout or from your order page.
            </p>
            <OrderAccess />
          </div>
        </section>
        <section
          className="tracking-perspectives"
          aria-labelledby="tracking-perspectives-title"
        >
          <div className="tracking-section-heading">
            <span className="eyebrow">02 / WHAT YOU CAN REVIEW</span>
            <h2 id="tracking-perspectives-title">
              <span data-motion-line>One order.</span>
              <em data-motion-line>Three perspectives.</em>
            </h2>
            <p>
              After access is verified, your order page separates payment,
              fulfilment and delivery so each update has its own context.
            </p>
          </div>
          <div className="tracking-perspective-grid">
            <article>
              <span>01 / PAYMENT</span>
              <h3>Verified status.</h3>
              <p>
                Review the recorded payment status. A return from a payment page
                alone does not confirm a successful payment.
              </p>
            </article>
            <article>
              <span>02 / FULFILMENT</span>
              <h3>The next step.</h3>
              <p>
                See the recorded fulfilment status and order history, including
                any steps that require staff review.
              </p>
            </article>
            <article>
              <span>03 / DELIVERY</span>
              <h3>The arrangements.</h3>
              <p>
                Review the recorded delivery status and arrangements. This is
                not a live location or courier tracking map.
              </p>
            </article>
          </div>
        </section>
        <section
          className="tracking-assistance"
          aria-labelledby="tracking-assistance-title"
        >
          <div>
            <span className="eyebrow">03 / FIND YOUR WAY</span>
            <h2 id="tracking-assistance-title">
              <span data-motion-line>A little help.</span>
              <em data-motion-line>A clearer direction.</em>
            </h2>
          </div>
          <div className="tracking-assistance-answers">
            <article>
              <h3>Where is my access code?</h3>
              <p>
                It is shown during checkout and on your order page. If you can
                still access that page on your original device, open the private
                order access code section and save it securely.
              </p>
            </article>
            <article>
              <h3>Can’t access an order?</h3>
              <p>
                Check that both details are complete and copied without extra
                spaces. For a separately confirmed order, use the contact
                channel on your written confirmation.
              </p>
            </article>
            <article>
              <h3>Still exploring?</h3>
              <p>
                A saved cart or quote request is not a placed order. Use your
                cart to review your selection, or the enquiry route to discuss
                your project.
              </p>
              <div>
                <CartTrigger className="tracking-cart-trigger">
                  Your cart <ArrowUpRight size={15} />
                </CartTrigger>
                <Link href="/request-quote">
                  Project enquiries <ArrowUpRight size={15} />
                </Link>
              </div>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
