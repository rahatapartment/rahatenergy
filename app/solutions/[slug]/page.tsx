import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { solutionContent, categoryContent } from "@/lib/content";
import { imageFor } from "@/lib/catalogue";
import { SolutionsHero } from "@/components/store/SolutionsHero";
import { SolutionsClosing } from "@/components/store/SolutionsClosing";
export function generateStaticParams() {
  return solutionContent.map((solution) => ({ slug: solution.slug }));
}
export function generateMetadata({ params }: { params: { slug: string } }) {
  const solution = solutionContent.find((item) => item.slug === params.slug);
  return {
    title: solution?.label || "Solution not found",
    description: solution?.intro,
  };
}
export default function Page({ params }: { params: { slug: string } }) {
  const solution = solutionContent.find((item) => item.slug === params.slug);
  if (!solution) notFound();
  return (
    <main id="main" className="solutions-experience solution-detail-experience">
      <SolutionsHero perspective={solution.slug} description={solution.intro} />
      <div className="solutions-content-surface">
        <section
          className="solutions-introduction"
          id="solution-content"
          data-header-surface
          aria-labelledby="perspective-introduction-title"
        >
          <div className="solutions-reveal-mark" aria-hidden="true">
            <span />R / E<span />
          </div>
          <span className="eyebrow">01 / {solution.audience}</span>
          <h2 id="perspective-introduction-title">{solution.title}</h2>
          <p>
            A practical starting point. Share what you know, ask what matters
            and confirm the details before committing.
          </p>
          <div className="solutions-intro-rule">
            <Link href="/solutions">
              All perspectives <ArrowUpRight size={15} />
            </Link>
            <span>{solution.label}</span>
          </div>
        </section>
        <section
          className="perspective-steps"
          aria-label="A considered way forward"
        >
          {solution.steps.map(([title, copy], index) => (
            <article key={title}>
              <span>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </section>
        <section
          className="perspective-context"
          aria-labelledby="context-title"
        >
          <div className="perspective-context-photo">
            <Image
              src={
                solution.image === "solar-home"
                  ? "/images/hero.webp"
                  : `/images/${solution.image}.webp`
              }
              alt="Illustrative architecture or equipment; not a verified Rahat Energy project"
              fill
              sizes="(max-width:800px) 100vw, 46vw"
            />
            <span>YOUR CONTEXT MAKES A DIFFERENCE.</span>
          </div>
          <div className="perspective-context-copy">
            <span className="eyebrow">02 / MAKE THE CONVERSATION COUNT</span>
            <h2 id="context-title">
              Start with
              <br />
              <em>your perspective.</em>
            </h2>
            <p>
              You do not need to know every answer. Share what you can, and
              include the questions you would like to resolve.
            </p>
            <ol>
              {solution.prompts.map((prompt, index) => (
                <li key={prompt}>
                  <span>0{index + 1}</span>
                  <p>{prompt}</p>
                </li>
              ))}
            </ol>
            <Link href="/request-quote">
              Bring your project into focus <ArrowUpRight size={18} />
            </Link>
          </div>
        </section>
        <section
          className="perspective-building-blocks"
          aria-labelledby="building-blocks-title"
        >
          <div className="building-blocks-heading">
            <div>
              <span className="eyebrow">03 / THE ELEMENTS TO EXPLORE</span>
              <h2 id="building-blocks-title">
                The pieces.
                <br />
                <em>The bigger picture.</em>
              </h2>
            </div>
            <Link href="/shop" className="solutions-editorial-link">
              Explore the collection <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="building-blocks-grid">
            {solution.categories.map((category, index) => {
              const content = categoryContent.find(
                (item) => item.category === category,
              )!;
              return (
                <Link
                  href={`/categories/${content.slug}`}
                  className="building-block"
                  key={category}
                >
                  <div className="building-block-photo">
                    <Image
                      src={imageFor(category)}
                      alt={`Illustrative ${category.toLowerCase()} photography; not exact equipment`}
                      fill
                      sizes="(max-width:600px) 88vw, (max-width:1000px) 44vw, 29vw"
                    />
                    <span>
                      <ArrowUpRight size={20} />
                    </span>
                  </div>
                  <span className="eyebrow">
                    0{index + 1} / EXPLORE THE CATEGORY
                  </span>
                  <h3>{category}</h3>
                  <p>{content.description}</p>
                </Link>
              );
            })}
          </div>
          <p className="building-blocks-note">
            Explore the categories, then confirm the exact equipment, ratings
            and compatibility for your project.
          </p>
        </section>
        <nav
          className="perspective-other-directions"
          aria-label="Other solution perspectives"
        >
          <span className="eyebrow">ANOTHER DIRECTION</span>
          {solutionContent
            .filter((item) => item.slug !== solution.slug)
            .map((item) => (
              <Link href={`/solutions/${item.slug}`} key={item.slug}>
                {item.label}
                <ArrowUpRight size={20} />
              </Link>
            ))}
        </nav>
        <SolutionsClosing />
      </div>
    </main>
  );
}
