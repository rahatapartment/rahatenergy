"use client";
import { useState } from "react";
import Image from "next/image";
import { Search, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { catalogue, categories, imageFor } from "@/lib/catalogue";
export function CatalogueTable() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const products = catalogue.filter(
    (p) =>
      `${p.name} ${p.sku} ${p.category}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()) &&
      (category === "All categories" || p.category === category),
  );
  return (
    <section aria-label="Controlled product catalogue">
      <div className="admin-catalogue-toolbar">
        <label>
          <Search size={17} />
          <span className="sr-only">Search catalogue</span>
          <input
            type="search"
            placeholder="Search product or SKU…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label>
          <span className="sr-only">Filter category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>All categories</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <span role="status">
          {products.length} of {catalogue.length} products
        </span>
      </div>
      <div
        className="table-wrap"
        tabIndex={0}
        role="region"
        aria-label="Products table, scroll horizontally for more columns"
      >
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Verification</th>
              <th>Storefront</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="admin-product-cell">
                    <Image
                      src={imageFor(p.category)}
                      alt=""
                      width={48}
                      height={48}
                    />
                    <strong>{p.name}</strong>
                  </div>
                </td>
                <td>
                  <span className="admin-sku">{p.sku}</span>
                </td>
                <td>{p.category}</td>
                <td>
                  <span className="admin-status-badge">Provisional</span>
                </td>
                <td>
                  <Link
                    className="admin-table-link"
                    href={`/shop/${p.slug}`}
                    aria-label={`View ${p.name} on storefront`}
                  >
                    View <ArrowUpRight size={14} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!products.length && (
          <div className="admin-search-empty">
            <h3>No products match.</h3>
            <p>Try another name, SKU or category.</p>
            <button
              className="button outline"
              onClick={() => {
                setQuery("");
                setCategory("All categories");
              }}
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
      <p className="admin-table-footnote">
        Images are illustrative. Product identities and content are managed in
        code; creation and deletion are unavailable.
      </p>
    </section>
  );
}
