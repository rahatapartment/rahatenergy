import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="page-heading editorial-intro">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      {description.split(/\n\s*\n/).map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
    </header>
  );
}
export function EnquiryCTA({
  title = "Let’s plan your next step.",
  description = "Bring your questions, shortlist or project requirements.",
  href = "/request-quote",
  label = "Request a quote",
}: {
  title?: string;
  description?: string;
  href?: string;
  label?: string;
}) {
  return (
    <section className="content-cta">
      <div>
        <span className="eyebrow">A CONVERSATION WORTH STARTING</span>
        <h2>{title}</h2>
        {description.split(/\n\s*\n/).map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
      <Link href={href} className="button lime">
        {label}
        <ArrowUpRight size={17} />
      </Link>
    </section>
  );
}
export function FAQList({
  items,
}: {
  items: { question: string; answer: string }[];
}) {
  return (
    <div className="faq-list">
      {items.map((item) => (
        <details key={item.question}>
          <summary>
            {item.question}
            <span aria-hidden="true">+</span>
          </summary>
          {item.answer.split(/\n\s*\n/).map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </details>
      ))}
    </div>
  );
}
