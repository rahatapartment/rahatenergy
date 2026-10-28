import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ArrowDown } from "lucide-react";
import { storeData } from "@/lib/store-data";
import { faqs } from "@/lib/content";
import { FAQList } from "@/components/store/Content";
import { CategoryExperience } from "@/components/store/CategoryExperience";
import { HomeMotion } from "@/components/store/HomeMotion";
import { HeroExperience } from "@/components/store/HeroExperience";
import { ProductCard } from "@/components/store/ProductCard";
export const dynamic = "force-dynamic";
export default async function Home() {
  const { products } = await storeData();
  return (
    <main id="main">
      <HeroExperience />
      <div className="home-content">
        <HomeMotion>
          <section
            className="energy-introduction"
            id="energy-introduction"
            data-header-surface
            aria-labelledby="introduction-title"
          >
            <div className="introduction-horizon" aria-hidden="true">
              <span />R / E<span />
            </div>
            <span className="eyebrow">THE ART OF EVERYDAY ENERGY</span>
            <h2 id="introduction-title">
              A quieter kind of power.
              <br />
              <em>A greater sense of possibility.</em>
            </h2>
            <div className="introduction-bottom">
              <span className="introduction-index">01 / A NEW PERSPECTIVE</span>
              <div>
                <p>
                  Morning light. An idea taking shape. A space that feels like
                  yours. Energy is part of every moment. Choosing it should feel
                  just as considered.
                </p>
                <p>
                  Explore solar, storage and the essentials that connect them.
                  Start with your space. Build toward what matters.
                </p>
                <Link href="/about" className="introduction-link">
                  The Rahat Energy approach <ArrowUpRight size={18} />
                </Link>
              </div>
            </div>
            <div className="introduction-footnote">
              <span>CONSIDERED CHOICES. CONNECTED POSSIBILITIES.</span>
              <Link href="/shop">
                Explore the collection <ArrowDown size={15} />
              </Link>
            </div>
          </section>
          <CategoryExperience />
          <section className="curated-edit" aria-labelledby="curated-title">
            <div className="curated-heading" data-reveal>
              <div>
                <span className="eyebrow">03 / THE CONSIDERED EDIT</span>
                <h2 id="curated-title">
                  Good energy.
                  <br />
                  <em>Down to the detail.</em>
                </h2>
              </div>
              <div className="curated-intro">
                <p>
                  Three starting points. A closer look at solar, conversion and
                  storage.
                </p>
                <Link href="/shop" className="editorial-inline-link">
                  Explore all products <ArrowUpRight size={18} />
                </Link>
              </div>
            </div>
            <div className="curated-products">
              {[products[1], products[4], products[7]].map((product, index) => (
                <div className="curated-product" key={product.id} data-reveal>
                  <div className="curated-product-index">
                    <span>0{index + 1}</span>
                    <span>
                      {
                        [
                          "CAPTURE THE LIGHT",
                          "MAKE THE CONNECTION",
                          "SAVE THE POSSIBILITY",
                        ][index]
                      }
                    </span>
                  </div>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
            <p className="curated-disclosure">
              A provisional collection. Confirm exact models, specifications and
              availability before purchasing.
            </p>
          </section>
          <section className="living-energy" aria-labelledby="living-title">
            <Image
              src="/images/hero.webp"
              alt="Illustrative solar-powered architecture; not a completed Rahat Energy project"
              fill
              sizes="100vw"
            />
            <div className="living-shade" />
            <div className="living-topline">
              <span className="eyebrow">04 / ENERGY, IN YOUR ELEMENT</span>
              <span>ILLUSTRATIVE ARCHITECTURE</span>
            </div>
            <div className="living-heading" data-reveal>
              <span className="living-preface">
                IT STARTS WITH HOW YOU LIVE.
              </span>
              <h2 id="living-title">
                Your world.
                <br />
                <em>Beautifully considered.</em>
              </h2>
              <p>
                A home. A growing business. A bigger idea.
                <br />
                Every space brings a different energy story.
              </p>
            </div>
            <div className="living-paths">
              {[
                [
                  "01",
                  "For the everyday.",
                  "Home",
                  "Explore solar and storage around the moments that matter to you.",
                  "home",
                ],
                [
                  "02",
                  "For what you’re building.",
                  "Business",
                  "Give your workspace and equipment the context they deserve.",
                  "business",
                ],
                [
                  "03",
                  "For the bigger picture.",
                  "Projects",
                  "Bring your scope, priorities and project questions into focus.",
                  "bulk-projects",
                ],
              ].map(([number, line, label, copy, slug]) => (
                <Link
                  className="living-path"
                  href={`/solutions/${slug}`}
                  key={slug}
                >
                  <span className="living-path-top">
                    <span>
                      {number} / {label}
                    </span>
                    <ArrowUpRight size={23} strokeWidth={1.2} />
                  </span>
                  <h3>{line}</h3>
                  <p>{copy}</p>
                </Link>
              ))}
            </div>
          </section>
          <section
            className="considered-journey"
            aria-labelledby="journey-title"
          >
            <div className="journey-heading">
              <span className="eyebrow">05 / A MORE CONSIDERED APPROACH</span>
              <h2 id="journey-title">
                Clarity.
                <br />
                At every
                <br />
                <em>turn.</em>
              </h2>
              <p>
                Choosing energy equipment is a series of decisions. Make room
                for the right questions.
              </p>
              <Link href="/how-to-order" className="editorial-inline-link">
                Your guide to getting started <ArrowUpRight size={18} />
              </Link>
              <div className="journey-mark" aria-hidden="true">
                <span />
                <i />
                <span />
              </div>
            </div>
            <div className="journey-steps">
              {[
                [
                  "01",
                  "Start with your world.",
                  "What matters most in your space?",
                  "Think about your appliances, the way you use them and your priorities. A clear picture of your needs makes a useful starting point.",
                  "Explore your solution",
                  "/solutions",
                ],
                [
                  "02",
                  "Consider the pieces.",
                  "See the detail. Ask the questions.",
                  "Browse the collection and build a shortlist. Confirm the exact equipment, compatibility and specifications before making a decision.",
                  "Meet the collection",
                  "/shop",
                ],
                [
                  "03",
                  "Make it a conversation.",
                  "Bring your next chapter into focus.",
                  "Share your shortlist, location and project plans. Request the pricing, availability and arrangements that need confirmation.",
                  "Start your enquiry",
                  "/request-quote",
                ],
              ].map(([number, title, subtitle, copy, label, href]) => (
                <article className="journey-step" key={number} data-reveal>
                  <span className="journey-number">{number}</span>
                  <div>
                    <span className="journey-subtitle">{subtitle}</span>
                    <h3>{title}</h3>
                    <p>{copy}</p>
                    <Link href={href} className="editorial-inline-link">
                      {label}
                      <ArrowUpRight size={17} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
          <section className="answers-section" aria-labelledby="answers-title">
            <div className="answers-heading" data-reveal>
              <span className="eyebrow">06 / BEFORE YOUR NEXT STEP</span>
              <h2 id="answers-title">
                A little more
                <br />
                <em>understanding.</em>
              </h2>
              <p>Good questions lead to clearer choices.</p>
              <Link href="/faq" className="editorial-inline-link">
                Visit the help centre <ArrowUpRight size={18} />
              </Link>
            </div>
            <div className="answers-list" data-reveal>
              <FAQList
                items={faqs.filter((_, index) => [0, 2, 3, 6].includes(index))}
              />
            </div>
          </section>
          <section className="next-chapter" aria-labelledby="chapter-title">
            <div className="chapter-watermark" aria-hidden="true" />
            <div className="chapter-topline">
              <span className="eyebrow">07 / YOUR NEXT CHAPTER</span>
              <span>LET’S MAKE A START.</span>
            </div>
            <div className="chapter-composition" data-reveal>
              <div>
                <span className="chapter-preface">
                  A PRODUCT QUESTION. A NEW PROJECT. A BIGGER IDEA.
                </span>
                <h2 id="chapter-title">
                  Possibility begins
                  <br />
                  <em>with a conversation.</em>
                </h2>
                <p>
                  Bring your questions. Tell us what matters.
                  <br />
                  Give your energy plans a considered starting point.
                </p>
              </div>
              <Link href="/request-quote" className="chapter-action">
                <ArrowUpRight size={39} strokeWidth={1} />
                <span>
                  Let’s talk
                  <br />
                  energy.
                </span>
              </Link>
            </div>
            <div className="chapter-bottomline">
              <span>ENERGY, BEAUTIFULLY ENGINEERED.</span>
              <Link href="/contact">
                Find your next step <ArrowUpRight size={16} />
              </Link>
            </div>
          </section>
        </HomeMotion>
      </div>
    </main>
  );
}
