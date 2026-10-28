import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowUpRight,
  MoveHorizontal,
  Sun,
  Cable,
  BatteryCharging,
  Lightbulb,
  PlugZap,
} from "lucide-react";
import { categoryContent } from "@/lib/content";
import { storeData } from "@/lib/store-data";
import { ProductCard } from "@/components/store/ProductCard";
import { CategoryHero } from "@/components/store/CategoryHero";
export const dynamic = "force-dynamic";
const icons = [Sun, Cable, BatteryCharging, Lightbulb, PlugZap];
export function generateMetadata({ params }: { params: { slug: string } }) {
  const c = categoryContent.find((c) => c.slug === params.slug);
  return { title: c?.category || "Category not found", description: c?.intro };
}
export default async function Page({ params }: { params: { slug: string } }) {
  const c = categoryContent.find((c) => c.slug === params.slug);
  if (!c) notFound();
  const { products, status } = await storeData();
  const selection = products.filter((p) => p.category === c.category);
  const next =
    categoryContent[(categoryContent.indexOf(c) + 1) % categoryContent.length];
  return (
    <main id="main" className="category-experience">
      <CategoryHero
        slug={c.slug}
        category={c.category}
        intro={c.intro}
        count={selection.length}
      />
      <div className="solutions-content-surface category-content-surface">
        <section
          id="category-collection"
          className="category-collection"
          data-header-surface
          aria-labelledby="category-collection-title"
        >
          <nav className="category-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/shop">Shop</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{c.category}</span>
          </nav>
          <div className="category-introduction">
            <span className="eyebrow">01 / YOUR CATEGORY EDIT</span>
            <h2 id="category-collection-title">
              {c.title}
              <br />
              <em>Find your next essential.</em>
            </h2>
            <p>{c.description}</p>
          </div>
          <nav className="category-switcher" aria-label="Shop categories">
            {categoryContent.map((item, index) => {
              const Icon = icons[index];
              return (
                <Link
                  href={`/categories/${item.slug}`}
                  key={item.slug}
                  aria-current={item.slug === c.slug ? "page" : undefined}
                >
                  <Icon size={18} strokeWidth={1.5} />
                  <span>{item.category}</span>
                </Link>
              );
            })}
          </nav>
          <span className="category-switcher-hint">
            <MoveHorizontal size={17} />
            Swipe to explore categories
          </span>
          <div className="category-products-heading" id="category-products">
            <div>
              <span className="eyebrow">
                THE COLLECTION / {String(selection.length).padStart(2, "0")}{" "}
                PRODUCTS
              </span>
              <h3>Shop {c.category.toLowerCase()}.</h3>
            </div>
            <Link href={`/shop?category=${encodeURIComponent(c.category)}`}>
              Filter & sort <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="category-stock-note">
            <span aria-hidden="true" />
            <p>
              Provisional catalogue · Images are illustrative.{" "}
              {status === "connected"
                ? "Prices and availability are shown where confirmed."
                : status === "unavailable"
                  ? "Inventory is temporarily unavailable. Request a quote for confirmed details."
                  : "Prices and availability require confirmation. Save products to your shortlist."}
            </p>
          </div>
          {selection.length ? (
            <div className="category-product-grid">
              {selection.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="category-empty">
              <h3>No products in this category yet.</h3>
              <p>Explore the full collection or ask about your project.</p>
              <Link href="/shop">
                Shop all products <ArrowUpRight size={17} />
              </Link>
            </div>
          )}
        </section>
        <section
          className="category-planning"
          aria-labelledby="category-planning-title"
        >
          <div>
            <span className="eyebrow">02 / CHOOSING WITH CONTEXT</span>
            <h2 id="category-planning-title">
              The right questions.
              <br />
              <em>A better starting point.</em>
            </h2>
            <p>{c.description}</p>
            <Link href="/request-quote">
              Discuss your requirements <ArrowUpRight size={17} />
            </Link>
          </div>
          <ol>
            {c.checks.map((check, index) => (
              <li key={check}>
                <span>0{index + 1}</span>
                <p>{check}</p>
              </li>
            ))}
          </ol>
        </section>
        <section
          className="category-closing"
          aria-labelledby="category-closing-title"
        >
          <div>
            <span className="eyebrow">03 / COMPLETE THE PICTURE</span>
            <h2 id="category-closing-title">
              A product question?
              <br />
              <em>Let’s find your next step.</em>
            </h2>
            <p>
              Confirm exact models, compatibility, specifications and
              availability before purchasing. Share your space, existing
              equipment and priorities in your enquiry.
            </p>
            <Link className="category-quote-link" href={`/request-quote`}>
              Request a quote <ArrowUpRight size={18} />
            </Link>
          </div>
          <Link className="category-next" href={`/categories/${next.slug}`}>
            <span>EXPLORE ANOTHER CATEGORY</span>
            <strong>{next.category}</strong>
            <span>
              View the collection <ArrowUpRight size={19} />
            </span>
          </Link>
        </section>
      </div>
    </main>
  );
}
