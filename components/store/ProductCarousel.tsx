"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "@/components/WebImage";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { money, productImage, type StoreProduct } from "@/lib/catalogue";
import { ProductStockBadge } from "./ProductStockBadge";
import { QuickAdd } from "./QuickAdd";

const descriptions: Record<string, string> = {
  "Solar Panels": "Solar panels for your energy system.",
  "Solar Inverters": "An inverter for your solar and battery setup.",
  "Battery Storage": "Lithium battery storage for your energy system.",
  "Solar Lighting": "Garden lighting for your outdoor space.",
  "Power Stations": "Portable power for home and on the move.",
};

export function ProductCarousel({ products }: { products: StoreProduct[] }) {
  const rail = useRef<HTMLUListElement>(null);
  const [canBack, setCanBack] = useState(false);
  const [canForward, setCanForward] = useState(products.length > 4);
  useEffect(() => {
    const node = rail.current;
    if (!node) return;
    function update() {
      if (!node) return;
      setCanBack(node.scrollLeft > 2);
      setCanForward(node.scrollLeft + node.clientWidth < node.scrollWidth - 2);
    }
    const observer = new ResizeObserver(update);
    observer.observe(node);
    node.addEventListener("scroll", update, { passive: true });
    update();
    return () => { observer.disconnect(); node.removeEventListener("scroll", update); };
  }, [products.length]);
  function move(direction: number) {
    const node = rail.current;
    if (!node) return;
    const gap = parseFloat(getComputedStyle(node).columnGap) || 0;
    node.scrollBy({ left: direction * (node.clientWidth + gap), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }
  return (
    <section id="frequently-bought" className="home-product-carousel" aria-labelledby="home-products-title" aria-roledescription="carousel">
      <div className="home-products-heading">
        <h2 id="home-products-title">Explore our products</h2>
        <div className="home-products-navigation" role="group" aria-label="Product navigation">
          <button aria-label="Previous products" aria-controls="home-products-rail" disabled={!canBack} onClick={() => move(-1)}><ArrowLeft size={20} /></button>
          <button aria-label="Next products" aria-controls="home-products-rail" disabled={!canForward} onClick={() => move(1)}><ArrowRight size={20} /></button>
        </div>
      </div>
      <ul id="home-products-rail" className="home-products-rail" ref={rail} tabIndex={0} aria-label="Browse all products" onKeyDown={event => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); move(event.key === "ArrowLeft" ? -1 : 1); }
      }}>
        {products.map(product => (
          <li className="home-product-item" key={product.id}>
            <article className="home-product-link commerce-card">
              <Link href={`/shop/${product.slug}`} className="home-product-image card-media">
                <ProductStockBadge product={product} />
                <Image src={productImage(product)} alt={product.name} width={600} height={600} sizes="(max-width: 600px) 44vw, (max-width: 900px) 45vw, (max-width: 1440px) 22vw, 310px" />
              </Link>
              <div className="home-product-details card-content">
                <span className="card-category">{product.category}</span>
                <h3><Link href={`/shop/${product.slug}`}>{product.name}</Link></h3>
                <p>{product.contentVersion ? product.description : descriptions[product.category] ?? (product.name.includes("Fan") ? "A hybrid fan for everyday comfort." : "A massage chair for relaxing at home.")}</p>
                <strong>{money(product.priceKobo)}</strong>
                <div className="home-product-actions card-actions">
                  <QuickAdd product={product} label="Add to cart" />
                  <Link href={`/shop/${product.slug}`} className="home-product-explore card-explore" aria-label={`Explore ${product.name}`}>Explore</Link>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
