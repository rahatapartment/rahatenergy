import { isOutOfStock, type StoreProduct } from "@/lib/catalogue";
export function ProductStockBadge({ product }: { product: StoreProduct }) {
  return isOutOfStock(product) ? <span className="commerce-stock-badge"><span aria-hidden="true" />Out of stock</span> : null;
}
