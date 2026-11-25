import { availability, isOutOfStock, type StoreProduct } from "@/lib/catalogue";
export function ProductStockBadge({ product }: { product: StoreProduct }) {
  return (
    <span className="commerce-stock-badge" data-state={isOutOfStock(product) ? "sold-out" : undefined}>
      {availability(product)}
    </span>
  );
}
