import definitions from "@/catalogue/products.json";
export const categories = [
  "Solar Panels",
  "Solar Inverters",
  "Battery Storage",
  "Solar Lighting",
  "Energy Accessories",
  "Power Stations",
  "Fans",
  "Massage Chairs",
] as const;
export type ProductDefinition = Omit<(typeof definitions)[number], "priceKobo" | "specifications"> & { priceKobo: number | null; specifications: Record<string, string> };
export type StoreProduct = ProductDefinition & {
  priceKobo: number | null;
  stock: number | null;
  reserved: number;
  enabled: boolean;
  lowStockThreshold: number;
  version: number;
  contentVersion?: number;
};
export const catalogue = definitions as ProductDefinition[];
export { imageFor } from "./placeholder-images";
export function money(kobo: number | null) {
  return kobo === null
    ? "Price on request"
    : new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 2,
      }).format(kobo / 100);
}
export function isOutOfStock(p: StoreProduct) {
  return p.stock !== null && p.stock - p.reserved <= 0;
}
export function availability(p: StoreProduct) {
  if (p.stock === null) return "Availability unconfirmed";
  if (isOutOfStock(p)) return "Out of stock";
  if (!p.enabled) return "Purchases paused";
  return p.stock - p.reserved > 0 ? "In stock" : "Out of stock";
}

export function productImage(p: ProductDefinition) {
  return p.images[0] ? encodeURI(p.images[0]) : "/images/panels.webp";
}
