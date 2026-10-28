import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { AboutHero } from "@/components/store/AboutHero";
import { categories, imageFor } from "@/lib/catalogue";
import { categoryContent } from "@/lib/content";
export const metadata = {
  title: "About Rahat Energy",
  description:
    "Meet Rahat Energy. A considered starting point for solar, storage and your next energy conversation.",
};
export default function Page() {
  return (
    <main id="main" className="about-experience">
      <AboutHero />
      <div className="solutions-content-surface about-content-surface">
        <section
          className="solutions-introduction about-introduction"
          id="about-story"
          data-header-surface
          aria-labelledby="about-introduction-title"
        >
          <div className="solutions-reveal-mark" aria-hidden="true">
            <span />R / E<span />
          </div>
          <span className="eyebrow">01 / A LITTLE MORE PERSPECTIVE</span>
          <h2 id="about-introduction-title">
            A clearer starting point.
            <br />
            <em>A more considered journey.</em>
          </h2>
          <p>
            Rahat Energy brings solar panels, inverters, battery storage,
            lighting and energy essentials into one focused collection.
          </p>
          <p>
            Explore your options. Ask the useful questions. Bring your next
            energy project into focus.
          </p>
          <div className="solutions-intro-rule">
            <span>ENERGY, BEAUTIFULLY ENGINEERED.</span>
            <Link href="/shop">
              Meet the collection <ArrowUpRight size={16} />
            </Link>
          </div>
        </section>
        <section
          className="about-perspective"
          aria-labelledby="about-perspective-title"
        >
          <div className="about-perspective-photo">
            <Image
              src="/images/hero.webp"
              alt="Illustrative architecture with solar panels; not a completed Rahat Energy installation"
              fill
              sizes="(max-width:800px) 100vw, 52vw"
            />
            <span>EVERY SPACE STARTS WITH A POSSIBILITY.</span>
          </div>
          <div className="about-perspective-copy">
            <span className="eyebrow">
              02 / SOLAR, STORAGE & THE BIGGER PICTURE
            </span>
            <h2 id="about-perspective-title">
              Start with
              <br />
              your space.
              <br />
              <em>See the whole picture.</em>
            </h2>
            <p>
              A product for an existing setup. An energy plan for your home. A
              larger idea taking shape.
            </p>
            <p>
              Whatever brings you here, the experience is designed to make the
              options easier to understand and your requirements easier to
              share.
            </p>
            <Link href="/solutions">
              Find your perspective <ArrowUpRight size={20} strokeWidth={1.2} />
            </Link>
            <span className="about-image-note">
              Architectural imagery represents a concept, rather than a
              completed installation.
            </span>
          </div>
        </section>
        <section
          className="about-principles"
          aria-labelledby="about-principles-title"
        >
          <div className="about-principles-heading">
            <span className="eyebrow">03 / WHAT GUIDES THE EXPERIENCE</span>
            <h2 id="about-principles-title">
              Clarity.
              <br />
              Context.
              <br />
              <em>Conversation.</em>
            </h2>
            <p>
              Useful information. Clear next steps.
              <br />
              Room for the questions that matter.
            </p>
          </div>
          <div className="about-principle-list">
            {[
              [
                "A focused collection",
                "Solar, storage, lighting and the essentials that connect them. Browse the categories, explore the provisional options and save a shortlist.",
              ],
              [
                "Context before commitment",
                "Start with your space, your existing equipment and your priorities. Dedicated home, business and project perspectives help frame the conversation.",
              ],
              [
                "Clarity about what’s confirmed",
                "Unverified equipment details, prices and availability are identified. Ask for the exact specifications and written arrangements before deciding.",
              ],
            ].map(([title, copy], index) => (
              <article key={title}>
                <span>0{index + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section
          className="about-collection"
          aria-labelledby="about-collection-title"
        >
          <div className="about-collection-heading">
            <div>
              <span className="eyebrow">04 / THE ELEMENTS OF YOUR ENERGY</span>
              <h2 id="about-collection-title">
                Different pieces.
                <br />
                <em>A connected perspective.</em>
              </h2>
            </div>
            <p>
              Explore the five categories.
              <br />
              Find a useful place to begin.
            </p>
          </div>
          <div className="about-category-grid">
            {categories.map((category, index) => (
              <Link
                className="about-category"
                href={`/categories/${categoryContent[index].slug}`}
                key={category}
              >
                <div className="about-category-photo">
                  <Image
                    src={imageFor(category)}
                    alt={`Illustrative ${category.toLowerCase()} photography; exact model requires confirmation`}
                    fill
                    sizes="(max-width:600px) 45vw, (max-width:1000px) 29vw, 18vw"
                  />
                  <span>
                    <ArrowUpRight size={19} strokeWidth={1.2} />
                  </span>
                </div>
                <span className="eyebrow">0{index + 1} / EXPLORE</span>
                <h3>{category}</h3>
              </Link>
            ))}
          </div>
          <p className="about-disclosure">
            Product identities and images are provisional. Company history,
            credentials and service commitments await business confirmation.
            Architecture and equipment imagery is illustrative.
          </p>
        </section>
        <section
          className="about-conversation"
          aria-labelledby="about-conversation-title"
        >
          <div className="about-conversation-topline">
            <span className="eyebrow">05 / YOUR NEXT CHAPTER</span>
            <span>LET’S FIND A STARTING POINT.</span>
          </div>
          <div className="about-conversation-composition">
            <div>
              <span className="eyebrow">
                A PRODUCT QUESTION. A PROJECT. A BIGGER IDEA.
              </span>
              <h2 id="about-conversation-title">
                A little curiosity.
                <br />
                <em>A world of possibility.</em>
              </h2>
              <p>
                Bring your questions, your shortlist or the plans taking shape
                in your mind.
              </p>
              <Link className="about-contact-link" href="/contact">
                Find your next step <ArrowUpRight size={16} />
              </Link>
            </div>
            <Link className="about-enquiry-circle" href="/request-quote">
              <ArrowUpRight size={34} strokeWidth={1} />
              <span>
                Let’s talk
                <br />
                energy.
              </span>
            </Link>
          </div>
          <div className="about-conversation-endline">
            <span>ENERGY, BEAUTIFULLY ENGINEERED.</span>
            <Link href="/how-to-order">
              Explore how to choose <ArrowUpRight size={16} />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
