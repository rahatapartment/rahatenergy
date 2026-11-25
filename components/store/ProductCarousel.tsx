"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { StoreProduct } from "@/lib/catalogue";
import { ProductCard } from "./ProductCard";

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
    <section id="frequently-bought" className="home-product-carousel" data-store-motion="lift" aria-labelledby="home-products-title" aria-roledescription="carousel">
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
            <ProductCard product={product} variant="carousel" />
          </li>
        ))}
      </ul>
    </section>
  );
}
