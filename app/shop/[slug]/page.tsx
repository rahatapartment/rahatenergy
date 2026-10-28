import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ChevronRight, ArrowDown, Check } from "lucide-react";
import { catalogue, imageFor, money, availability } from "@/lib/catalogue";
import { storeData } from "@/lib/store-data";
import { ProductGallery } from "@/components/store/ProductGallery";
import { ProductPurchase } from "@/components/store/ProductPurchase";
import { categoryContent } from "@/lib/content";
import { ProductCard } from "@/components/store/ProductCard";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const product = catalogue.find((item) => item.slug === params.slug);
  return {
    title: product?.name || "Product not found",
    description: product
      ? `Explore ${product.name}. Request verified specifications and pricing from Rahat Energy.`
      : undefined,
  };
}
export default async function Page({ params }: { params: { slug: string } }) {
  const { products } = await storeData();
  const p = products.find((product) => product.slug === params.slug);
  if (!p) notFound();
  const content = categoryContent.find(
    (category) => category.category === p.category,
  )!;
  const related = products.filter(
    (product) => product.category === p.category && product.id !== p.id,
  );
  const specifications = Object.entries(p.specifications);
  return (
    <main id="main" className="product-experience">
      <nav className="product-breadcrumbs" aria-label="Breadcrumb">
        <Link href="/shop">The collection</Link>
        <ChevronRight size={12} aria-hidden="true" />
        <Link href={`/categories/${content.slug}`}>{p.category}</Link>
        <ChevronRight size={12} aria-hidden="true" />
        <span>{p.sku}</span>
      </nav>
      <section className="product-showcase" aria-labelledby="product-title">
        <ProductGallery product={p} />
        <div className="product-introduction">
          <div className="product-edition-line">
            <span className="eyebrow">{p.category}</span>
            <span>{p.sku} / THE CONSIDERED COLLECTION</span>
          </div>
          <h1 id="product-title">{p.name}</h1>
          <p>{content.productDescription}</p>
          <div className="product-identity-note">
            <span aria-hidden="true" />
            Provisional catalogue identity · Exact model awaits verification
          </div>
        </div>
        <div className="product-decision">
          <div className="product-price-block">
            <div>
              <span>PRICE & AVAILABILITY</span>
              <strong>{money(p.priceKobo)}</strong>
            </div>
            <span className="product-availability">
              <i
                className={
                  p.enabled && p.stock !== null && p.stock > p.reserved
                    ? "is-available"
                    : ""
                }
              />
              {availability(p)}
            </span>
          </div>
          <ProductPurchase product={p} />
        </div>
        <div className="product-confidence">
          <div>
            <span>THE EXACT EQUIPMENT</span>
            <p>Confirm model & specifications</p>
          </div>
          <div>
            <span>DELIVERY & INSTALLATION</span>
            <p>Arrangements require confirmation</p>
          </div>
          <a href="#product-specifications">
            Know the details <ArrowDown size={14} />
          </a>
        </div>
      </section>
      <nav className="product-section-nav" aria-label="Product information">
        <span>{p.sku} / IN FOCUS</span>
        <div>
          <a href="#product-overview">Overview</a>
          <a href="#product-specifications">Specifications</a>
          <a href="#product-suitability">Before you choose</a>
          <a href="#related-products">Keep exploring</a>
        </div>
      </nav>
      <section
        className="product-overview"
        id="product-overview"
        aria-labelledby="overview-title"
      >
        <div className="product-overview-art">
          <Image
            src={imageFor(p.category)}
            alt={`Illustrative ${p.category.toLowerCase()} composition; exact product photo pending`}
            fill
            sizes="(max-width: 800px) 100vw, 48vw"
          />
          <span>01 / EQUIPMENT, IN CONTEXT</span>
        </div>
        <div className="product-overview-copy">
          <span className="eyebrow">SEE THE BIGGER PICTURE</span>
          <h2 id="overview-title">{content.title}</h2>
          <p>{content.description}</p>
          <p>
            A product name is the beginning of the conversation. Consider the
            complete system, your space and the details that need confirming.
          </p>
          <Link href={`/request-quote?product=${p.id}`}>
            Explore the right fit <ArrowUpRight size={20} strokeWidth={1.2} />
          </Link>
          <span className="overview-image-note">
            Photography represents the category, not an exact model.
          </span>
        </div>
      </section>
      <section
        className="product-specifications"
        id="product-specifications"
        aria-labelledby="specifications-title"
      >
        <div className="product-specification-heading">
          <span className="eyebrow">02 / CLARITY IN THE DETAILS</span>
          <h2 id="specifications-title">
            Know what
            <br />
            <em>you’re choosing.</em>
          </h2>
          <p>
            Good decisions start with verified information. Ask for the exact
            manufacturer, model and technical datasheet.
          </p>
          <Link
            href={`/request-quote?product=${p.id}`}
            className="product-editorial-link"
          >
            Request verified specifications <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="product-specification-data">
          <div className="specification-caption">
            <span>PRODUCT INFORMATION</span>
            <span>{p.sku}</span>
          </div>
          <dl>
            <div>
              <dt>Catalogue reference</dt>
              <dd>{p.sku}</dd>
            </div>
            <div>
              <dt>Category</dt>
              <dd>{p.category}</dd>
            </div>
            <div>
              <dt>Manufacturer & exact model</dt>
              <dd>Awaiting verification</dd>
            </div>
            {specifications.length ? (
              specifications.map(([name, value]) => (
                <div key={name}>
                  <dt>{name}</dt>
                  <dd>{String(value)}</dd>
                </div>
              ))
            ) : (
              <div>
                <dt>Technical specifications</dt>
                <dd>Request a verified specification sheet</dd>
              </div>
            )}
            <div>
              <dt>Warranty terms</dt>
              <dd>Confirm with your written quotation</dd>
            </div>
            <div>
              <dt>Delivery & installation</dt>
              <dd>Confirm availability, scope and arrangements</dd>
            </div>
          </dl>
          <p>
            <Check size={14} />
            No unverified performance or warranty claims are presented as
            confirmed specifications.
          </p>
        </div>
      </section>
      <section
        className="product-suitability"
        id="product-suitability"
        aria-labelledby="suitability-title"
      >
        <div className="product-suitability-heading">
          <span className="eyebrow">03 / THE RIGHT QUESTIONS</span>
          <h2 id="suitability-title">
            The right fit.
            <br />
            <em>It starts with you.</em>
          </h2>
          <p>
            A little context helps frame a useful enquiry. Share what you know,
            and include what you would like to understand.
          </p>
          <Link
            href={`/request-quote?product=${p.id}`}
            className="product-editorial-link"
          >
            Give your project some context <ArrowUpRight size={18} />
          </Link>
        </div>
        <ol className="product-fit-checks">
          {content.checks.map((check, index) => (
            <li key={check}>
              <span>0{index + 1}</span>
              <p>{check}</p>
              <ArrowUpRight size={17} strokeWidth={1} aria-hidden="true" />
            </li>
          ))}
        </ol>
      </section>
      <section
        className="product-related"
        id="related-products"
        aria-labelledby="related-title"
      >
        <div className="product-related-heading">
          <div>
            <span className="eyebrow">04 / ANOTHER PERSPECTIVE</span>
            <h2 id="related-title">
              Other starting points.
              <br />
              <em>The same considered approach.</em>
            </h2>
          </div>
          <Link
            href={`/shop?category=${encodeURIComponent(p.category)}`}
            className="product-editorial-link"
          >
            Explore {p.category.toLowerCase()} <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="product-related-grid">
          {related.map((product) => (
            <ProductCard
              product={product}
              variant="collection"
              key={product.id}
            />
          ))}
        </div>
        <div className="product-related-endnote">
          <p>
            Other provisional options in this category. Confirm specifications
            and suitability before choosing.
          </p>
          <Link href="/shop">
            Return to the collection <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}
