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
  products.length !== 15 ||
  ["id", "sku", "slug"].some(
    (key) => new Set(products.map((p) => p[key])).size !== 15,
  )
)
  failures.push("Catalogue identity constraint failed");
if (
  products.some(
    (p) =>
      p.verification !== "placeholder" ||
      p.images.length ||
      Object.keys(p.specifications).length ||
      "price" in p,
  )
)
  failures.push("Unverified catalogue claims");
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(
  `Verified standalone Energy workspace; 15 explicit placeholders; no active inherited booking routes.`,
);
