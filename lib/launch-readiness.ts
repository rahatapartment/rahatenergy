import type { StoreProduct } from "./catalogue";
export function inventoryReadiness(products: StoreProduct[], connected: boolean) {
  return products.map(product => ({
    id: product.id, name: product.name, category: product.category,
    price: product.priceKobo, stock: connected && product.stock !== null ? Math.max(0, product.stock - product.reserved) : null,
    issues: [
      ...(product.priceKobo === null ? ["Price needed"] : []),
      ...(!connected || product.stock === null ? ["Stock unverified"] : product.stock - product.reserved <= 0 ? ["No available stock"] : []),
      ...(connected && !product.enabled ? ["Purchases paused"] : []),
    ],
  }));
}
export function workerReadiness(lastSuccess: Date | null, now = Date.now()) {
  if (!lastSuccess) return "No successful run verified";
  return now - lastSuccess.getTime() > 15 * 60_000 ? "Last successful run is over 15 minutes old" : "Recent successful run recorded";
}
