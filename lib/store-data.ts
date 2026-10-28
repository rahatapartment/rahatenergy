import { catalogue, type StoreProduct } from "./catalogue";
import { getDb } from "./db";
export async function storeData(): Promise<{
  products: StoreProduct[];
  status: "connected" | "unconfigured" | "unavailable";
}> {
  const fallback = catalogue.map((p) => ({
    ...p,
    priceKobo: null,
    stock: null,
    reserved: 0,
    enabled: false,
    lowStockThreshold: 5,
    version: 0,
  }));
  const db = getDb();
  if (!db) return { products: fallback, status: "unconfigured" };
  try {
    const inventory = await db.inventory.findMany();
    return {
      products: fallback.map((p) => {
        const row = inventory.find((r) => r.productId === p.id);
        return row ? { ...p, ...row } : p;
      }),
      status: "connected",
    };
  } catch {
    return { products: fallback, status: "unavailable" };
  }
}
