import Link from "next/link";
import { ArrowUpRight, ArrowDown, LockKeyhole } from "lucide-react";
import { ContactHero } from "@/components/store/ContactHero";
import { QuoteForm } from "@/components/store/QuoteForm";
import { FAQList } from "@/components/store/Content";
import { faqs } from "@/lib/content";
import { storeData } from "@/lib/store-data";
export const metadata = {
  title: "Contact & support",
  description:
    "Find a clear route for your energy project, product questions and private order access.",
};
export const dynamic = "force-dynamic";
export default async function Page() {
  const { status } = await storeData();
  const routes = [
    {
      number: "01",
      eyebrow: "PROJECT ENQUIRIES",
      title: "Your next project.",
      copy: "Share your space, energy priorities and the questions you want to resolve.",
      href: "#contact-enquiry",
      label: "Start a project enquiry",
    },
    {
      number: "02",
      eyebrow: "PRODUCT QUESTIONS",
      title: "The right equipment.",
      copy: "Explore the collection and ask about exact specifications, pricing and availability.",
      href: "/shop",
      label: "Explore the collection",
    },
    {
      number: "03",
      eyebrow: "EXISTING ORDERS",
      title: "An order in progress.",
      copy: "Use your order reference and private access code to open your order information.",
      href: "/track-order",
      label: "Access your order",
    },
  ];
  return (
    <main id="main" className="contact-experience">
      <ContactHero />
      <div className="solutions-content-surface contact-content-surface">
        <section
          className="solutions-introduction contact-introduction"
          id="contact-start"
          data-header-surface
          aria-labelledby="contact-introduction-title"
        >
          <div className="solutions-reveal-mark" aria-hidden="true">
            <span />R / E<span />
          </div>
          <span className="eyebrow">01 / THE RIGHT PLACE TO BEGIN</span>
          <h2 id="contact-introduction-title">
            Every question.
            <br />
            <em>A useful starting point.</em>
          </h2>
          <p>
            Choose the route that suits what you need. Bring context to a
            project, explore your product options or revisit a confirmed order.
          </p>
          <div className="solutions-intro-rule">
            <span>CLARITY AT EVERY STEP.</span>
            <a href="#contact-routes">
              Explore your options <ArrowDown size={15} />
            </a>
          </div>
        </section>
        <section
          className="contact-routes"
          id="contact-routes"
          aria-label="Ways to get started"
        >
          {routes.map((route) => (
            <article key={route.number} className="contact-route">
              <span className="contact-route-number">{route.number}</span>
              <div>
                <span className="eyebrow">{route.eyebrow}</span>
                <h3>{route.title}</h3>
                <p>{route.copy}</p>
              </div>
              <Link href={route.href}>
                {route.label}
                <span>
                  <ArrowUpRight size={22} strokeWidth={1.2} />
                </span>
              </Link>
            </article>
          ))}
        </section>
        <section
          className="contact-enquiry-section"
          id="contact-enquiry"
          aria-labelledby="contact-enquiry-title"
        >
          <div className="contact-enquiry-introduction">
            <span className="eyebrow">02 / YOUR PROJECT, IN CONTEXT</span>
            <h2 id="contact-enquiry-title">
              A little context.
              <br />
              <em>A clearer conversation.</em>
            </h2>
            <p>
              Tell us about your space, existing equipment and priorities.
              Include what you would like to understand.
            </p>
            <div className="contact-before-you-begin">
              <h3>Before you begin</h3>
              <ul>
                <li>Your preferred contact details</li>
                <li>The equipment or project you are considering</li>
                <li>Your location, priorities and any timing to discuss</li>
              </ul>
            </div>
            <p className="contact-enquiry-service" role="status">
              {status === "connected"
                ? "The form confirms when your enquiry reference has been saved."
                : status === "unavailable"
                  ? "Enquiry submissions are temporarily unavailable. Keep a copy of your project notes."
                  : "Enquiry submissions are not available yet. You can explore the form and prepare your project details."}
            </p>
            <Link className="contact-inline-link" href="/how-to-order">
              Understand the next steps <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="contact-enquiry-form">
            <QuoteForm
              available={status === "connected"}
              unavailableMessage={
                status === "unavailable"
                  ? "The enquiry service is temporarily unavailable. You can explore the form, but submissions are currently paused."
                  : "Enquiry submissions are not open yet. You can explore the form and prepare the details for your project."
              }
            />
          </div>
        </section>
        <section
          className="contact-details-section"
          aria-labelledby="contact-details-title"
        >
          <div className="contact-confirmed-channels">
            <span className="eyebrow">
              03 / CLEAR ROUTES. CONFIRMED DETAILS.
            </span>
            <h2 id="contact-details-title">
              Direct details.
              <br />
              <em>Carefully confirmed.</em>
            </h2>
            <p>
              Business phone, email, visiting address and opening hours will
              appear here once approved.
            </p>
            <p>
              For now, the project enquiry form shows whether submissions are
              available. For an existing order, use your private order access.
            </p>
            <div className="contact-channel-status">
              <span aria-hidden="true" />
              Verified contact channels are being confirmed.
            </div>
          </div>
          <div className="contact-private-order">
            <div className="contact-private-heading">
              <LockKeyhole size={25} strokeWidth={1.2} />
              <span>PRIVATE ORDER ACCESS</span>
            </div>
            <h3>
              Already have
              <br />
              <em>an order?</em>
            </h3>
            <p>
              Keep your reference and private access code together. Use them to
              view your order information securely.
            </p>
            <Link href="/track-order">
              Open your order <ArrowUpRight size={19} />
            </Link>
            <span className="contact-private-note">
              Use the contact channel on your written order confirmation for
              order-specific questions.
            </span>
          </div>
        </section>
        <section
          className="contact-answers"
          aria-labelledby="contact-answers-title"
        >
          <div>
            <span className="eyebrow">04 / A LITTLE MORE UNDERSTANDING</span>
            <h2 id="contact-answers-title">
              Before you
              <br />
              <em>reach out.</em>
            </h2>
            <p>A few useful answers to help you find your next step.</p>
            <Link href="/faq" className="contact-inline-link">
              Explore all questions <ArrowUpRight size={17} />
            </Link>
          </div>
          <FAQList
            items={faqs.filter((_, index) => [4, 6, 10, 11].includes(index))}
          />
        </section>
        <section
          className="contact-closing"
          aria-labelledby="contact-closing-title"
        >
          <div className="contact-closing-topline">
            <span className="eyebrow">YOUR NEXT CHAPTER</span>
            <span>START WITH WHAT MATTERS.</span>
          </div>
          <div className="contact-closing-composition">
            <div>
              <span className="eyebrow">
                A QUESTION. A PROJECT. A CLEARER DIRECTION.
              </span>
              <h2 id="contact-closing-title">
                Possibility starts
                <br />
                <em>with a question.</em>
              </h2>
              <p>Bring what you know. Make room for what comes next.</p>
              <Link href="/solutions" className="contact-closing-secondary">
                Explore a starting point <ArrowUpRight size={16} />
              </Link>
            </div>
            <a href="#contact-enquiry" className="contact-closing-circle">
              <ArrowUpRight size={34} strokeWidth={1} />
              <span>
                Begin an
                <br />
                enquiry.
              </span>
            </a>
          </div>
          <div className="contact-closing-endline">
            <span>ENERGY, BEAUTIFULLY ENGINEERED.</span>
            <Link href="/shop">
              Discover the collection <ArrowUpRight size={16} />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
