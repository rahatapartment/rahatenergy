import { QuickAdd } from "./QuickAdd";
import Image from "@/components/WebImage";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  productImage,
  money,
  availability,
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
          ? "product-card collection-product"
          : variant === "shop" ? "product-card shop-product" : "product-card"
      }
    >
      {variant === "collection" && (
        <div className="collection-card-index">
          <span>{p.sku}</span>
          <span>{p.category}</span>
        </div>
      )}
      <Link href={`/shop/${p.slug}`} className="product-art">
        <span className="product-tag">{p.category}</span>
        <Image
          src={productImage(p)}
          alt={p.name}
          sizes={
            variant === "shop"
              ? "(max-width: 600px) 44vw, (max-width: 1000px) 30vw, (max-width: 1440px) 23vw, 310px"
              : variant === "collection"
              ? "(max-width: 600px) 88vw, (max-width: 1100px) 45vw, 40vw"
              : "(max-width: 540px) 90vw, (max-width: 1100px) 45vw, 28vw"
          }
          width={600}
          height={600}
        />
        <span className="product-arrow">
          <ArrowUpRight size={19} />
        </span>
      </Link>
      <div className="product-copy">
        {variant !== "shop" && <span className="micro">RAHAT PRODUCT PHOTOGRAPHY</span>}
        <h3>
          <Link href={`/shop/${p.slug}`}>{p.name}</Link>
        </h3>
        <div className="product-bottom">
          <strong>{money(p.priceKobo)}</strong>
          <span className="stock">
            <i
              className={
                p.enabled && p.stock !== null && p.stock > p.reserved
                  ? "available"
                  : ""
              }
            />
            {availability(p)}
          </span>
        </div>
        <QuickAdd product={p} />
      </div>
    </article>
  );
}
