/** Illustrative AI photography, never the exact product or a completed installation. */
export const placeholderImages: Record<string, string> = {
  "Solar Panels": "/images/panels.webp",
  "Solar Inverters": "/images/inverters.webp",
  "Battery Storage": "/images/batteries.webp",
  "Solar Lighting": "/images/lighting.webp",
  "Energy Accessories": "/images/accessories.webp",
};
export const imageFor = (category: string) =>
  placeholderImages[category] || placeholderImages["Solar Panels"];
export const architecturalImage = "/images/hero.webp";
