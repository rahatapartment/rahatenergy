import Link from "next/link";
import { ArrowUpRight, ArrowDown } from "lucide-react";
import { HelpHero } from "@/components/store/HelpHero";
import { HelpExplorer } from "@/components/store/HelpExplorer";
export const metadata = {
  title: "Help & answers",
  description:
    "Find clear answers about products, quotations, your shortlist, ordering, delivery and private order access.",
};
export default function Page() {
  return (
    <main id="main" className="help-experience">
      <HelpHero />
      <div className="solutions-content-surface help-content-surface">
        <section
          className="solutions-introduction help-introduction"
          id="help-centre"
          data-header-surface
          aria-labelledby="help-introduction-title"
        >
          <div className="solutions-reveal-mark" aria-hidden="true">
            <span />R / E<span />
          </div>
          <span className="eyebrow">01 / A LITTLE MORE CLARITY</span>
          <h2 id="help-introduction-title">
            A useful answer.
            <br />
            <em>A clearer next step.</em>
          </h2>
          <p>
            Explore the current shopping experience, understand what needs
            confirmation and prepare the questions that matter to you.
          </p>
          <div className="solutions-intro-rule">
            <span>GOOD QUESTIONS ARE A PLACE TO BEGIN.</span>
            <a href="#help-search">
              Search the answers <ArrowDown size={15} />
            </a>
          </div>
        </section>
        <section className="help-library" aria-label="Browse help and answers">
          <HelpExplorer />
        </section>
        <section className="help-journey" aria-labelledby="help-journey-title">
          <div>
            <span className="eyebrow">
              02 / FROM A QUESTION TO A CLEARER BRIEF
            </span>
            <h2 id="help-journey-title">
              A little context.
              <br />
              <em>A useful direction.</em>
            </h2>
            <p>
              Explore your options, keep your choices together and confirm the
              details before committing.
            </p>
            <Link href="/how-to-order">
              See the ordering guide <ArrowUpRight size={18} />
            </Link>
          </div>
          <ol>
            {[
              [
                "Explore the collection",
                "Browse the categories and review the provisional product options.",
                "/shop",
                "Meet the collection",
              ],
              [
                "Build your shortlist",
                "Save products and quantities in your browser. A shortlist does not reserve stock.",
                "/cart",
                "View your shortlist",
              ],
              [
                "Confirm the details",
                "Request exact specifications, pricing and project arrangements in your enquiry.",
                "/request-quote",
                "Prepare an enquiry",
              ],
            ].map(([title, copy, href, label], index) => (
              <li key={title}>
                <span>0{index + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                  <Link href={href}>
                    {label}
                    <ArrowUpRight size={16} />
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <section className="help-closing" aria-labelledby="help-closing-title">
          <div className="help-closing-topline">
            <span className="eyebrow">03 / ANOTHER CONVERSATION</span>
            <span>START WITH WHAT MATTERS.</span>
          </div>
          <div className="help-closing-composition">
            <div>
              <span className="eyebrow">
                A QUESTION. A SPACE. A NEW POSSIBILITY.
              </span>
              <h2 id="help-closing-title">
                Still curious?
                <br />
                <em>Find a starting point.</em>
              </h2>
              <p>
                Bring your project questions, explore your options or find the
                right route for an existing order.
              </p>
              <Link href="/solutions">
                Explore energy solutions <ArrowUpRight size={16} />
              </Link>
            </div>
            <Link className="help-contact-circle" href="/contact">
              <ArrowUpRight size={34} strokeWidth={1} />
              <span>
                Find your
                <br />
                next step.
              </span>
            </Link>
          </div>
          <div className="help-closing-endline">
            <span>ENERGY, BEAUTIFULLY ENGINEERED.</span>
            <Link href="/track-order">
              Private order access <ArrowUpRight size={16} />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
