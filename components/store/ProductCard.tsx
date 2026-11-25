import { ProductStockBadge } from "./ProductStockBadge";
import { QuickAdd } from "./QuickAdd";
import Image from "@/components/WebImage";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  productImage,
  money,
  isOutOfStock,
  type StoreProduct,
} from "@/lib/catalogue";
export function ProductCard({
  product: p,
  variant = "default",
}: {
  product: StoreProduct;
  variant?: "default" | "collection" | "shop" | "carousel";
}) {
  const href = `/shop/${p.slug}`;
  const canAdd = !isOutOfStock(p) && (p.enabled || p.stock === null);
  return (
    <article
      className={`product-card commerce-card ${variant === "collection" ? "collection-product" : variant === "shop" ? "shop-product" : ""}`}
    >
      <Link href={href} className="product-art card-media" aria-label={`View ${p.name}`}>
        <Image
          src={productImage(p)}
          alt={p.name}
          sizes={
            variant === "shop" || variant === "carousel"
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
          <Link href={href}>{p.name}</Link>
        </h3>
        <div className="product-bottom">
          <strong className={p.priceKobo === null ? "card-price-on-request" : undefined}>{money(p.priceKobo)}</strong>
          <ProductStockBadge product={p} />
        </div>
        <div className="card-actions">
          {canAdd ? <QuickAdd product={p} /> : (
            <Link href={href} className="card-explore" aria-label={`View details for ${p.name}`}>
              View details <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
