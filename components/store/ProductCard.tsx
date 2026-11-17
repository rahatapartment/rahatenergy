import { ProductStockBadge } from "./ProductStockBadge";
import { QuickAdd } from "./QuickAdd";
import Image from "@/components/WebImage";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  productImage,
  money,
  availability,
  isOutOfStock,
  type StoreProduct,
} from "@/lib/catalogue";
export function ProductCard({
  product: p,
  variant = "default",
}: {
  product: StoreProduct;
  variant?: "default" | "collection" | "shop";
}) {
  return (
    <article
      className={
        variant === "collection"
          ? "product-card collection-product commerce-card"
          : variant === "shop" ? "product-card shop-product commerce-card" : "product-card commerce-card"
      }
    >
      <Link href={`/shop/${p.slug}`} className="product-art card-media">
        <ProductStockBadge product={p} />
        <Image
          src={productImage(p)}
          alt={p.name}
          sizes={
            variant === "shop"
              ? "(max-width: 767px) 92vw, (max-width: 1000px) 30vw, (max-width: 1440px) 23vw, 310px"
              : variant === "collection"
              ? "(max-width: 767px) 92vw, (max-width: 1100px) 45vw, 40vw"
              : "(max-width: 767px) 92vw, (max-width: 1100px) 45vw, 28vw"
          }
          width={600}
          height={600}
        />
      </Link>
      <div className="product-copy card-content">
        <span className="card-category">{p.category}</span>
        <h3>
          <Link href={`/shop/${p.slug}`}>{p.name}</Link>
        </h3>
        <p className="card-description">{p.description}</p>
        <div className="product-bottom">
          <strong>{money(p.priceKobo)}</strong>
          {!isOutOfStock(p) && <span className="stock">
            <i
              className={
                p.enabled && p.stock !== null && p.stock > p.reserved
                  ? "available"
                  : ""
              }
            />
            {availability(p)}
          </span>}
        </div>
        <div className="card-actions">
          <QuickAdd product={p} />
          <Link href={`/shop/${p.slug}`} className="card-explore" aria-label={`Explore ${p.name}`}>Explore <ArrowUpRight size={15} aria-hidden="true" /></Link>
        </div>
      </div>
    </article>
  );
}
