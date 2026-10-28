import { notFound } from "next/navigation";
import Link from "next/link";
import { categoryContent } from "@/lib/content";
import { storeData } from "@/lib/store-data";
import { ProductCard } from "@/components/store/ProductCard";
import { PageIntro, EnquiryCTA } from "@/components/store/Content";
export const dynamic = "force-dynamic";
export function generateMetadata({ params }: { params: { slug: string } }) {
  const c = categoryContent.find((c) => c.slug === params.slug);
  return { title: c?.category || "Category not found", description: c?.intro };
}
export default async function Page({ params }: { params: { slug: string } }) {
  const c = categoryContent.find((c) => c.slug === params.slug);
  if (!c) notFound();
  const { products } = await storeData();
  return (
    <main id="main" className="page-wrap">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/shop">Shop</Link>
        <span>/</span>
        <span>{c.category}</span>
      </nav>
      <PageIntro eyebrow={c.category} title={c.title} description={c.intro} />
      <div className="notice">
        Provisional catalogue · Confirm exact models, specifications, prices and
        availability before purchase. Images are illustrative photographs.
      </div>
      <section className="content-section">
        <div className="section-heading">
          <h2>Explore {c.category.toLowerCase()}.</h2>
          <Link
            href={`/shop?category=${encodeURIComponent(c.category)}`}
            className="text-link"
          >
            Filter & sort this category
          </Link>
        </div>
        <div className="product-grid">
          {products
            .filter((p) => p.category === c.category)
            .map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
        </div>
      </section>
      <section className="planning-panel">
        <div>
          <span className="eyebrow">CHOOSING WITH CONTEXT</span>
          <h2>The right questions come first.</h2>
          <p>{c.description}</p>
        </div>
        <ul>
          {c.checks.map((check) => (
            <li key={check}>{check}</li>
          ))}
        </ul>
      </section>
      <EnquiryCTA title={`Let’s discuss your ${c.category.toLowerCase()}.`} />
    </main>
  );
}
