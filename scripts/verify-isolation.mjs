import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
const root = process.cwd();
const failures = [];
for (const name of [
  "legacy-app",
  "legacy-source",
  "legacy-middleware.ts",
  "app/api/bookings",
  "app/api/apartments",
  "middleware.ts",
]) {
  if (existsSync(resolve(root, name)))
    failures.push(`Unexpected active resource: ${name}`);
}
const products = JSON.parse(
  readFileSync(resolve(root, "catalogue/products.json"), "utf8"),
);
if (
  products.length !== 18 ||
  ["id", "sku", "slug"].some(
    (key) => new Set(products.map((p) => p[key])).size !== products.length,
  )
)
  failures.push("Catalogue identity constraint failed");
for (const p of products) {
  if (p.verification !== "owner-confirmed" || !p.images.length ||
      p.images.some(image => !existsSync(resolve(root, "public", image.slice(1)))))
    failures.push(`Missing product photography: ${p.name}`);
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(
  `Verified standalone Energy workspace; 18 products with uploaded photography; no active inherited booking routes.`,
);
