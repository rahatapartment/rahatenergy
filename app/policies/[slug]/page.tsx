import { notFound } from "next/navigation";
import Link from "next/link";
import { policies } from "@/lib/content";
import { PageIntro } from "@/components/store/Content";
export function generateStaticParams() {
  return Object.keys(policies).map((slug) => ({ slug }));
}
function getPolicy(slug: string) {
  return Object.prototype.hasOwnProperty.call(policies, slug)
    ? policies[slug as keyof typeof policies]
    : null;
}
export function generateMetadata({ params }: { params: { slug: string } }) {
  const p = getPolicy(params.slug);
  return { title: p?.title || "Policy not found", description: p?.intro };
}
export default function Page({ params }: { params: { slug: string } }) {
  const p = getPolicy(params.slug);
  if (!p) notFound();
  return (
    <main id="main" className="page-wrap policy-wrap">
      <PageIntro
        eyebrow="INFORMATION & POLICIES"
        title={p.title}
        description={p.intro}
      />
      <div className="notice">
        <strong>Draft for business approval.</strong> This page describes the
        current preview and items awaiting confirmation. It is not a final
        approved policy or a substitute for confirmed purchase terms.
      </div>
      <div className="policy-sections">
        {p.sections.map(([title, copy]) => (
          <section key={title}>
            <h2>{title}</h2>
            <p>{copy}</p>
          </section>
        ))}
      </div>
      <nav className="policy-nav" aria-label="Policies">
        {Object.entries(policies).map(([slug, policy]) => (
          <Link
            key={slug}
            href={`/policies/${slug}`}
            aria-current={slug === params.slug ? "page" : undefined}
          >
            {policy.title}
          </Link>
        ))}
      </nav>
      <Link href="/contact" className="text-link">
        Questions? Find the right next step →
      </Link>
    </main>
  );
}
