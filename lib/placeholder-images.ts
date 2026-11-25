/** Illustrative AI photography, never the exact product or a completed installation. */
import definitions from "@/catalogue/products.json";
export const placeholderImages: Record<string, string> = Object.fromEntries(
  definitions.filter(p => p.images[0] !== "/images/logo.webp").map(p => [p.category, encodeURI(p.images[0])]),
);
export const imageFor = (category: string) => placeholderImages[category] || "/images/panels.webp";
export const architecturalImage = "/images/hero.webp";
