import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, Check, ChevronRight } from "lucide-react";
import { money, availability, isOutOfStock } from "@/lib/catalogue";
import { storeData } from "@/lib/store-data";
import { detailsFor } from "@/lib/product-details";
import { ProductGallery } from "@/components/store/ProductGallery";
import { ProductPurchase } from "@/components/store/ProductPurchase";
import { ProductCard } from "@/components/store/ProductCard";
import { categoryContent } from "@/lib/content";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { products } = await storeData();
  const product = products.find(p => p.slug === params.slug);
  return { title: product?.seo.title || "Product not found", description: product?.seo.description };
}
export default async function Page({ params }: { params: { slug: string } }) {
  const { products } = await storeData();
  const product = products.find(p => p.slug === params.slug);
  if (!product) notFound();
  const details = detailsFor(product);
  if (!details) {
    return <main id="main" className="page-wrap">
      <section className="pdp-buying-panel" aria-labelledby="product-title">
        <h1 id="product-title">{product.name}</h1>
        <p>{product.description}</p>
        <div className="pdp-price">
          <strong>{money(product.priceKobo)}</strong>
          <span>{availability(product)}</span>
        </div>
        <ProductPurchase product={product} />
      </section>
    </main>;
  }
  const category = categoryContent.find(c => c.category === product.category)!;
  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  const specs = { ...details.specifications, ...product.specifications };
  return <main id="main" className="product-detail-page">
    <div className="pdp-container">
      <nav className="pdp-breadcrumbs" aria-label="Breadcrumb"><Link href="/shop">Shop</Link><ChevronRight size={12} /><Link href={`/categories/${category.slug}`}>{product.category}</Link><ChevronRight size={12} /><span>{product.name}</span></nav>
      <section className="pdp-showcase" aria-labelledby="product-title">
        <ProductGallery key={product.id} product={product} />
        <div className="pdp-buying-panel">
          <span className="pdp-eyebrow">{product.category}</span>
          <h1 id="product-title">{product.name}</h1>
          <p className="pdp-intro">{details.intro}</p>
          <ul className="pdp-highlights">{details.features.slice(0, 3).map(feature => <li key={feature.title}><Check size={16} aria-hidden="true" /><span>{feature.title}</span></li>)}</ul>
          <div className="pdp-price"><strong>{money(product.priceKobo)}</strong><span className={isOutOfStock(product) ? "pdp-stock is-out" : "pdp-stock"}><i />{availability(product)}</span></div>
          <ProductPurchase product={product} />
          <div className="pdp-order-help"><span>Need help choosing?</span><Link href={`/request-quote?product=${product.id}`}>Ask about this product <ArrowUpRight size={16} /></Link></div>
        </div>
      </section>
      <nav className="pdp-section-links" aria-label="Product information"><a href="#product-description">Description</a><a href="#product-features">Features & benefits</a><a href="#product-specifications">Specifications</a><a href="#product-questions">Questions</a></nav>
      <section id="product-description" className="pdp-description pdp-section" aria-labelledby="description-title">
        <div><span className="pdp-eyebrow">MEET YOUR NEXT ESSENTIAL</span><h2 id="description-title">{details.headline}</h2></div>
        <div className="pdp-description-copy">{product.contentVersion ? <p>{product.description}</p> : null}{details.overview.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
      </section>
      <section id="product-features" className="pdp-section" aria-labelledby="features-title"><div className="pdp-section-heading"><span className="pdp-eyebrow">A CLOSER LOOK</span><h2 id="features-title">Features that matter.</h2></div>
        <div className="pdp-feature-grid">{details.features.map((feature, index) => <article key={feature.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{feature.title}</h3><p>{feature.description}</p></article>)}</div>
        <div className="pdp-benefits-uses"><div><h3>What this means for you</h3><ul>{details.benefits.map(benefit => <li key={benefit}><Check size={16} /><span>{benefit}</span></li>)}</ul></div><div><h3>Where it fits</h3><ul>{details.uses.map(use => <li key={use}><Check size={16} /><span>{use}</span></li>)}</ul></div></div>
      </section>
      <section id="product-specifications" className="pdp-section pdp-specs" aria-labelledby="specs-title"><div><span className="pdp-eyebrow">THE PRACTICAL DETAILS</span><h2 id="specs-title">Know your product.</h2><p>Product ratings and details below come from the supplied product information. Your quotation confirms the exact variant and what is included.</p><Link className="pdp-text-link" href={`/request-quote?product=${product.id}`}>Request a specification sheet <ArrowUpRight size={16} /></Link></div><dl>{Object.entries(specs).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}<div><dt>Brand</dt><dd>Rahat Energy</dd></div><div><dt>Warranty & delivery</dt><dd>Confirm terms and arrangements with your quotation</dd></div></dl></section>
      <section className="pdp-section pdp-before-order" aria-labelledby="before-order-title"><div><span className="pdp-eyebrow">CHOOSE WITH CONFIDENCE</span><h2 id="before-order-title">Before you order.</h2><p>A few details help us recommend the right fit and avoid surprises.</p></div><ol>{details.checks.map(check => <li key={check}>{check}</li>)}</ol></section>
      <section id="product-questions" className="pdp-section pdp-faq" aria-labelledby="questions-title"><div><span className="pdp-eyebrow">GOOD QUESTIONS. CLEAR ANSWERS.</span><h2 id="questions-title">A little more clarity.</h2></div><div>{details.faq.map(item => <details key={item.question}><summary>{item.question}<span aria-hidden="true">+</span></summary><p>{item.answer}</p></details>)}</div></section>
      <div className="pdp-advice"><div><h2>Let’s find the right fit.</h2><p>Tell us what you need. We’ll help you compare your options and confirm the details.</p></div><Link href={`/request-quote?product=${product.id}`}>Talk to our team <ArrowUpRight size={18} /></Link></div>
      {related.length > 0 && <section id="related-products" className="pdp-section pdp-related" aria-labelledby="related-title"><div className="pdp-related-heading"><h2 id="related-title">You may also like</h2><Link href={`/shop?category=${encodeURIComponent(product.category)}`}>View the collection <ArrowUpRight size={16} /></Link></div><div className="product-related-grid">{related.map(p => <ProductCard key={p.id} product={p} variant="collection" />)}</div></section>}
    </div>
  </main>;
}
