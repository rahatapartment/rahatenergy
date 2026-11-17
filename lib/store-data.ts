import { catalogue, type StoreProduct } from "./catalogue";
import { withProductContent } from "./product-content";
import { getDb } from "./db";
export async function storeData(): Promise<{
  products: StoreProduct[];
  status: "connected" | "unconfigured" | "unavailable";
}> {
  const fallback = catalogue.map((p) => ({
    ...p,
    priceKobo: p.priceKobo,
    stock: null,
    reserved: 0,
    enabled: false,
    lowStockThreshold: 5,
    version: 0,
  }));
  const db = getDb();
  if (!db) return { products: fallback, status: "unconfigured" };
  try {
    const [inventory, content] = await Promise.all([db.inventory.findMany(), db.productContent.findMany()]);
    return {
      products: fallback.map((p) => {
        const row = inventory.find((r) => r.productId === p.id);
        const details = content.find(c => c.productId === p.id);
        const presentation = { ...p, ...withProductContent(p, details), contentVersion: details?.version ?? 0 };
        return row ? { ...presentation, ...row } : { ...presentation, priceKobo: null };
      }),
      status: "connected",
    };
  } catch {
    return { products: fallback, status: "unavailable" };
  }
}
