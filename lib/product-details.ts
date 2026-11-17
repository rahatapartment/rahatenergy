import details from "@/catalogue/product-details.json";
import type { ProductDefinition } from "./catalogue";
export type ProductDetails = {
  headline: string; intro: string; overview: string[];
  features: { title: string; description: string }[];
  benefits: string[]; uses: string[]; checks: string[];
  specifications: Record<string, string>;
  faq: { question: string; answer: string }[];
};
export function detailsFor(product: ProductDefinition): ProductDetails {
  return (details as Record<string, ProductDetails>)[product.id];
}
