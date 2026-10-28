import definitions from "@/catalogue/products.json";
export const categories = [
  "Solar Panels",
  "Solar Inverters",
  "Battery Storage",
  "Solar Lighting",
  "Energy Accessories",
] as const;
export type ProductDefinition = (typeof definitions)[number];
export type StoreProduct = ProductDefinition & {
  priceKobo: number | null;
  stock: number | null;
  reserved: number;
  enabled: boolean;
  lowStockThreshold: number;
  version: number;
};
export const catalogue = definitions;
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
export function availability(p: StoreProduct) {
  if (p.stock === null) return "Availability unconfirmed";
  if (!p.enabled) return "Purchases paused";
  return p.stock - p.reserved > 0 ? "In stock" : "Out of stock";
}
