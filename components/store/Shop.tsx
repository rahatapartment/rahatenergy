"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  X,
  ArrowUpRight,
  Grid2X2,
  Grid3X3,
  Check,
} from "lucide-react";
import { categories, type StoreProduct } from "@/lib/catalogue";
import { ProductCard } from "./ProductCard";

function knownCategory(value: string) {
  return categories.some((category) => category === value)
    ? value
    : "All products";
}
export function Shop({
  products,
  initialCategory = "All products",
  initialQuery = "",
}: {
  products: StoreProduct[];
  initialCategory?: string;
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(knownCategory(initialCategory));
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sort, setSort] = useState("featured");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [onlyPriced, setOnlyPriced] = useState(false);
  const [view, setView] = useState<"grid" | "gallery">("grid");
  useEffect(() => {
    setCategory(knownCategory(initialCategory));
  }, [initialCategory]);
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);
  const groups = categories.map((c) =>
    products.filter((p) => p.category === c),
  );
  const curated = Array.from(
    { length: Math.max(0, ...groups.map((group) => group.length)) },
    (_, index) =>
      groups.flatMap((group) => (group[index] ? [group[index]] : [])),
  ).flat();
  const filtered = curated
    .filter(
      (p) =>
        (category === "All products" || p.category === category) &&
        `${p.name} ${p.category} ${p.sku}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()) &&
        (!onlyAvailable ||
          (p.enabled && p.stock !== null && p.stock > p.reserved)) &&
        (!onlyPriced || p.priceKobo !== null),
    )
    .sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort !== "low" && sort !== "high") return 0;
      if (a.priceKobo === null) return b.priceKobo === null ? 0 : 1;
      if (b.priceKobo === null) return -1;
      return sort === "low"
        ? a.priceKobo - b.priceKobo
        : b.priceKobo - a.priceKobo;
    });
  const activeCount =
    Number(category !== "All products") +
    Number(Boolean(query.trim())) +
    Number(onlyAvailable) +
    Number(onlyPriced);
  function reset() {
    setQuery("");
    setCategory("All products");
    setOnlyAvailable(false);
    setOnlyPriced(false);
    setSort("featured");
  }
  return (
    <div className="discovery-store">
      <div
        className="discovery-categories"
        role="group"
        aria-label="Product categories"
      >
        {["All products", ...categories].map((name, index) => (
          <button
            key={name}
            className={
              category === name
                ? "discovery-category is-selected"
                : "discovery-category"
            }
            aria-pressed={category === name}
            onClick={() => setCategory(name)}
          >
            <span className="discovery-category-name">{name}</span>
            <span className="discovery-category-count">
              {String(
                index === 0 ? products.length : groups[index - 1].length,
              ).padStart(2, "0")}
            </span>
          </button>
        ))}
      </div>
      <div className="discovery-controls">
        <label className="discovery-search">
          <Search size={19} strokeWidth={1.5} />
          <span className="sr-only">Search products</span>
          <input
            id="product-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find a product, category or SKU"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear product search"
              onClick={() => setQuery("")}
            >
              <X size={16} />
            </button>
          )}
        </label>
        <button
          className="discovery-filter-toggle"
          aria-expanded={filtersOpen}
          aria-controls="shop-refinements"
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          <SlidersHorizontal size={17} /> Refine{" "}
          {activeCount > 0 && <span>{activeCount}</span>}
          <span>{filtersOpen ? "−" : "+"}</span>
        </button>
        <label className="discovery-sort">
          <span>Arrange by</span>
          <select
            aria-label="Sort products"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="featured">Curated order</option>
            <option value="name">Name A–Z</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
          </select>
        </label>
      </div>
      <div className="discovery-layout">
        <aside
          id="shop-refinements"
          className={`discovery-refinements ${filtersOpen ? "refinements-open" : ""}`}
          aria-label="Refine products"
        >
          <div className="refinement-heading">
            <span className="eyebrow">REFINE YOUR EDIT</span>
            <button
              aria-label="Close product refinements"
              onClick={() => setFiltersOpen(false)}
            >
              <X size={17} />
            </button>
          </div>
          <fieldset>
            <legend>Availability</legend>
            <label className="refinement-check">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(event) => setOnlyAvailable(event.target.checked)}
              />
              <span>In stock only</span>
            </label>
            <p>Show products confirmed available for purchase.</p>
          </fieldset>
          <fieldset>
            <legend>Pricing</legend>
            <label className="refinement-check">
              <input
                type="checkbox"
                checked={onlyPriced}
                onChange={(event) => setOnlyPriced(event.target.checked)}
              />
              <span>Confirmed prices only</span>
            </label>
            <p>Unpriced equipment can still be saved to your shortlist.</p>
          </fieldset>
          <div className="refinement-help">
            <span className="refinement-help-mark" aria-hidden="true">
              R / E
            </span>
            <h3>
              A considered
              <br />
              <em>choice.</em>
            </h3>
            <p>
              Need a starting point? Tell us about your space and what matters
              most.
            </p>
            <Link href="/request-quote">
              Find your direction <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="refinement-assurance">
            <Check size={14} />
            <span>Exact models and specifications require confirmation.</span>
          </div>
        </aside>
        <div className="discovery-results">
          <div className="discovery-result-heading">
            <p role="status" aria-live="polite">
              <strong>{String(filtered.length).padStart(2, "0")}</strong>{" "}
              {filtered.length === 1 ? "piece" : "pieces"} to explore{" "}
              <span>
                {category === "All products" ? "The full collection" : category}
              </span>
            </p>
            <div
              className="discovery-view"
              role="group"
              aria-label="Product display"
            >
              <button
                aria-label="Grid view"
                aria-pressed={view === "grid"}
                onClick={() => setView("grid")}
              >
                <Grid3X3 size={18} strokeWidth={1.3} />
              </button>
              <button
                aria-label="Gallery view"
                aria-pressed={view === "gallery"}
                onClick={() => setView("gallery")}
              >
                <Grid2X2 size={18} strokeWidth={1.3} />
              </button>
            </div>
          </div>
          {activeCount > 0 && (
            <div className="discovery-active" aria-label="Active filters">
              {category !== "All products" && (
                <button
                  onClick={() => setCategory("All products")}
                  aria-label={`Clear category ${category}`}
                >
                  {category}
                  <X size={12} />
                </button>
              )}
              {query.trim() && (
                <button
                  onClick={() => setQuery("")}
                  aria-label="Clear search filter"
                >
                  “{query.trim()}”<X size={12} />
                </button>
              )}
              {onlyAvailable && (
                <button
                  onClick={() => setOnlyAvailable(false)}
                  aria-label="Clear availability filter"
                >
                  In stock
                  <X size={12} />
                </button>
              )}
              {onlyPriced && (
                <button
                  onClick={() => setOnlyPriced(false)}
                  aria-label="Clear pricing filter"
                >
                  Confirmed prices
                  <X size={12} />
                </button>
              )}
              <button className="discovery-clear" onClick={reset}>
                Clear all
              </button>
            </div>
          )}
          {filtered.length ? (
            <div className={`discovery-products view-${view}`}>
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant="collection"
                />
              ))}
            </div>
          ) : (
            <div className="discovery-empty">
              <span className="eyebrow">A DIFFERENT PERSPECTIVE</span>
              <h3>No products found</h3>
              <p>
                Try another search or remove a filter. If pricing is not listed,
                you can still build a shortlist and ask about your options.
              </p>
              <button className="button dark" onClick={reset}>
                Reset filters <ArrowUpRight size={17} />
              </button>
              <Link href="/request-quote">
                Or start a conversation <ArrowUpRight size={15} />
              </Link>
            </div>
          )}
          <div className="discovery-endline">
            <span>
              ILLUSTRATIVE PHOTOGRAPHY · PROVISIONAL PRODUCT IDENTITIES
            </span>
            <p>
              Your shortlist is a starting point. Confirm the details before
              making a purchase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
