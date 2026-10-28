import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { solutionContent } from "@/lib/content";
import { SolutionsHero } from "@/components/store/SolutionsHero";
import { SolutionPlanner } from "@/components/store/SolutionPlanner";
import { SolutionsClosing } from "@/components/store/SolutionsClosing";
export const metadata = {
  title: "Energy solutions",
  description:
    "Explore considered energy planning for your home, business or larger project.",
};
export default function Page() {
  return (
    <main id="main" className="solutions-experience">
      <SolutionsHero />
      <div className="solutions-content-surface">
        <section
          className="solutions-introduction"
          id="solution-content"
          data-header-surface
          aria-labelledby="solutions-introduction-title"
        >
          <div className="solutions-reveal-mark" aria-hidden="true">
            <span />R / E<span />
          </div>
          <span className="eyebrow">
            01 / DIFFERENT SPACES. SHARED POSSIBILITY.
          </span>
          <h2 id="solutions-introduction-title">
            A world that’s yours.
            <br />
            <em>An energy conversation to match.</em>
          </h2>
          <p>
            Every space has its own rhythm. Start with how you live, what you
            are building and the questions you want to resolve.
          </p>
          <div className="solutions-intro-rule">
            <span>THREE PERSPECTIVES. ONE CONSIDERED APPROACH.</span>
            <a href="#solutions-perspectives">
              Explore the perspectives <ArrowUpRight size={15} />
            </a>
          </div>
        </section>
        <section
          className="solutions-perspectives"
          id="solutions-perspectives"
          aria-labelledby="perspectives-title"
        >
          <div className="solutions-perspectives-heading">
            <span className="eyebrow">02 / FIND YOUR ELEMENT</span>
            <h2 id="perspectives-title">
              Where would you
              <br />
              <em>like to begin?</em>
            </h2>
            <p>
              A starting point for your space.
              <br />
              Room to think about the bigger picture.
            </p>
          </div>
          <div className="perspective-editorial-grid">
            {solutionContent.map((solution, index) => (
              <article
                className="perspective-editorial-card"
                key={solution.slug}
              >
                <div className="perspective-index">
                  <span>0{index + 1}</span>
                  <span>
                    {["LIVING", "WORKING", "IMAGINING BIGGER"][index]}
                  </span>
                </div>
                <Link
                  href={`/solutions/${solution.slug}`}
                  className="perspective-photo"
                  aria-label={`Explore ${solution.label.toLowerCase()}`}
                >
                  <Image
                    src={
                      solution.image === "solar-home"
                        ? "/images/hero.webp"
                        : `/images/${solution.image}.webp`
                    }
                    alt={`${solution.label}: illustrative ${solution.image === "solar-home" ? "solar architecture, not a completed Rahat installation" : "equipment photography, not a verified project"}`}
                    fill
                    sizes="(max-width:600px) 88vw, (max-width:1000px) 44vw, 29vw"
                  />
                  <span>
                    <ArrowUpRight size={23} strokeWidth={1.2} />
                  </span>
                </Link>
                <div className="perspective-caption">
                  <span className="eyebrow">{solution.audience}</span>
                  <h3>
                    <Link href={`/solutions/${solution.slug}`}>
                      {
                        [
                          "For the everyday.",
                          "For what you’re building.",
                          "For the bigger picture.",
                        ][index]
                      }
                    </Link>
                  </h3>
                  <p>{solution.intro}</p>
                  <Link
                    className="solutions-editorial-link"
                    href={`/solutions/${solution.slug}`}
                  >
                    Explore this perspective <ArrowUpRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <p className="perspectives-image-note">
            Architectural and equipment imagery is illustrative. Exact equipment
            and project arrangements require confirmation.
          </p>
        </section>
        <SolutionPlanner />
        <section
          className="solutions-approach"
          aria-labelledby="solutions-approach-title"
        >
          <div>
            <span className="eyebrow">04 / THE COMPLETE PICTURE</span>
            <h2 id="solutions-approach-title">
              Good questions.
              <br />
              <em>A clearer direction.</em>
            </h2>
            <p>
              A useful enquiry connects your priorities, your existing setup and
              the details that need agreeing.
            </p>
          </div>
          <ol>
            {[
              [
                "Your priorities",
                "Explain which appliances, equipment or spaces matter most, and when you need them.",
              ],
              [
                "Your existing setup",
                "Share the equipment already in place so compatibility can be considered.",
              ],
              [
                "Your written proposal",
                "Confirm specifications, scope, pricing and arrangements before making a commitment.",
              ],
            ].map(([title, copy], index) => (
              <li key={title}>
                <span>0{index + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <SolutionsClosing />
      </div>
    </main>
  );
}
