"use client";
import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { categories, type StoreProduct } from "@/lib/catalogue";
import { ProductCard } from "./ProductCard";

function knownCategory(value: string) {
  return categories.some(category => category === value) ? value : "All products";
}
export function Shop({ products, initialCategory = "All products", initialQuery = "" }: {
  products: StoreProduct[]; initialCategory?: string; initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(knownCategory(initialCategory));
  const [sort, setSort] = useState("featured");
  useEffect(() => { setCategory(knownCategory(initialCategory)); }, [initialCategory]);
  useEffect(() => { setQuery(initialQuery); }, [initialQuery]);
  const filtered = products.filter(p =>
    (category === "All products" || p.category === category) &&
    `${p.name} ${p.category} ${p.sku}`.toLowerCase().includes(query.trim().toLowerCase()),
  ).sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort !== "low" && sort !== "high") return 0;
    if (a.priceKobo === null) return b.priceKobo === null ? 0 : 1;
    if (b.priceKobo === null) return -1;
    return sort === "low" ? a.priceKobo - b.priceKobo : b.priceKobo - a.priceKobo;
  });
  const hasFilters = category !== "All products" || Boolean(query.trim());
  function reset() { setQuery(""); setCategory("All products"); setSort("featured"); }
  return (
    <div className="shop-browser">
      <div className="shop-categories" role="group" aria-label="Product categories">
        {["All products", ...categories].map(name => (
          <button key={name} aria-pressed={category === name} onClick={() => setCategory(name)}>
            {name}<span>{name === "All products" ? products.length : products.filter(p => p.category === name).length}</span>
          </button>
        ))}
      </div>
      <div className="shop-toolbar">
        <label className="shop-search">
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">Search products</span>
          <input id="product-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search products…" />
          {query && <button aria-label="Clear search" onClick={() => setQuery("")}><X size={16} /></button>}
        </label>
        <label className="shop-sort">
          <span>Sort by</span>
          <select value={sort} onChange={event => setSort(event.target.value)}>
            <option value="featured">Featured</option>
            <option value="name">Name: A–Z</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
          </select>
        </label>
      </div>
      <div className="shop-results-heading">
        <p role="status" aria-live="polite">{filtered.length} {filtered.length === 1 ? "product" : "products"}{category !== "All products" ? ` in ${category}` : ""}</p>
        {hasFilters && <button onClick={reset}>Clear filters <X size={14} /></button>}
      </div>
      {filtered.length ? (
        <div className="shop-product-grid">
          {filtered.map(product => <ProductCard key={product.id} product={product} variant="shop" />)}
        </div>
      ) : (
        <div className="shop-empty">
          <Search size={28} aria-hidden="true" />
          <h2>No products found</h2>
          <p>Try a different search or choose another category.</p>
          <button className="button dark" onClick={reset}>Show all products</button>
        </div>
      )}
    </div>
  );
}
