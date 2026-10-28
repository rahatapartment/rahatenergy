import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { normalizeCart, cartSummary } from "../lib/cart";
import {
  catalogue,
  availability,
  money,
  type StoreProduct,
} from "../lib/catalogue";
import { inventorySchema, quoteSchema } from "../lib/validation";
import { sameOrigin, rateLimit } from "../lib/security";
import { createAdminSession, verifyAdminSession } from "../lib/admin-auth";
import { SignJWT } from "jose";
const product: StoreProduct = {
  ...catalogue[0],
  priceKobo: 12345,
  stock: 10,
  reserved: 2,
  enabled: true,
  lowStockThreshold: 5,
  version: 0,
};
test("catalogue contains exactly 15 unique provisional identities without commercial claims", () => {
  assert.equal(catalogue.length, 15);
  for (const k of ["id", "sku", "slug"] as const)
    assert.equal(new Set(catalogue.map((p) => p[k])).size, 15);
  assert.ok(
    catalogue.every(
      (p) =>
        p.verification === "placeholder" &&
        p.images.length === 0 &&
        Object.keys(p.specifications).length === 0,
    ),
  );
});
test("persisted cart rejects corruption, unknown identities, fractional and negative quantities; merges duplicates", () => {
  assert.deepEqual(normalizeCart(null), []);
  assert.deepEqual(
    normalizeCart([
      { productId: "bad", quantity: 1 },
      { productId: product.id, quantity: -1 },
      { productId: product.id, quantity: 1.5 },
    ]),
    [],
  );
  assert.deepEqual(
    normalizeCart([
      { productId: product.id, quantity: 80 },
      { productId: product.id, quantity: 40 },
    ]),
    [{ productId: product.id, quantity: 99 }],
  );
});
test("cart totals use integer kobo and refuse to fabricate totals for unpriced products", () => {
  assert.deepEqual(
    cartSummary([{ productId: product.id, quantity: 3 }], [product]),
    { subtotal: 37035, count: 3 },
  );
  assert.equal(
    cartSummary(
      [{ productId: product.id, quantity: 2 }],
      [{ ...product, priceKobo: null }],
    ).subtotal,
    null,
  );
});
test("availability distinguishes unconfirmed stock, disabled purchases and reserved stock", () => {
  assert.equal(
    availability({ ...product, stock: null }),
    "Availability unconfirmed",
  );
  assert.equal(
    availability({ ...product, enabled: false }),
    "Purchases paused",
  );
  assert.equal(availability({ ...product, stock: 2 }), "Out of stock");
  assert.equal(availability(product), "In stock");
  assert.equal(money(null), "Price on request");
});
test("operational mutations reject product definitions and invalid inventory values", () => {
  const valid = {
    priceKobo: 100,
    stock: 4,
    lowStockThreshold: 2,
    enabled: true,
    version: 0,
    reason: "Stock receipt",
  };
  assert.ok(inventorySchema.safeParse(valid).success);
  assert.ok(!inventorySchema.safeParse({ ...valid, name: "changed" }).success);
  assert.ok(!inventorySchema.safeParse({ ...valid, stock: -1 }).success);
  assert.ok(!inventorySchema.safeParse({ ...valid, priceKobo: 1.2 }).success);
});
test("quotations require known product identity, contact details and explicit consent", () => {
  const valid = {
    name: "Example Customer",
    email: "customer@example.com",
    phone: "08000000000",
    productId: product.id,
    quantity: 1,
    location: "Example city",
    requirements: "Please confirm specifications.",
    consent: true,
  };
  assert.ok(quoteSchema.safeParse(valid).success);
  assert.ok(!quoteSchema.safeParse({ ...valid, productId: "unknown" }).success);
  assert.ok(!quoteSchema.safeParse({ ...valid, consent: false }).success);
  assert.ok(!quoteSchema.safeParse({ ...valid, quantity: 0 }).success);
});
test("state mutations require same origin and enforce request limits", () => {
  assert.ok(
    sameOrigin(
      new Request("http://localhost:3001/api", {
        headers: { origin: "http://localhost:3001" },
      }),
    ),
  );
  assert.ok(
    !sameOrigin(
      new Request("http://localhost:3001/api", {
        headers: { origin: "https://other.example" },
      }),
    ),
  );
  assert.ok(!sameOrigin(new Request("http://localhost:3001/api")));
  const key = `test-${Date.now()}`;
  assert.ok(rateLimit(key, 1, 10000));
  assert.ok(!rateLimit(key, 1, 10000));
});
test("independent sessions reject unsigned, wrong audience and legacy tokens", async () => {
  process.env.ENERGY_ADMIN_SESSION_SECRET =
    "independent-test-secret-at-least-32-characters";
  assert.ok(await verifyAdminSession(await createAdminSession()));
  assert.ok(!(await verifyAdminSession(undefined)));
  assert.ok(!(await verifyAdminSession("invalid")));
  const legacy = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode(process.env.ENERGY_ADMIN_SESSION_SECRET));
  assert.ok(!(await verifyAdminSession(legacy)));
});
test("initial migration enforces fixed identities, stock reservations and amount constraints", () => {
  const sql = readFileSync(
    "prisma/migrations/202610260001_energy_foundation/migration.sql",
    "utf8",
  );
  assert.match(sql, /fixed_catalogue_identity/);
  assert.match(sql, /fixed_catalogue_no_delete/);
  assert.match(sql, /"reserved" <= "stock"/);
  assert.match(sql, /order_totals/);
});

test("origin checks support a loopback Host when Next uses an internal request URL", () => {
  const saved = process.env.NEXT_PUBLIC_APP_URL;
  delete process.env.NEXT_PUBLIC_APP_URL;
  assert.ok(
    sameOrigin(
      new Request("http://localhost:3013/api", {
        headers: { host: "127.0.0.1:3013", origin: "http://127.0.0.1:3013" },
      }),
    ),
  );
  assert.ok(
    !sameOrigin(
      new Request("http://localhost:3013/api", {
        headers: { host: "127.0.0.1:3013", origin: "https://attacker.example" },
      }),
    ),
  );
  if (saved !== undefined) process.env.NEXT_PUBLIC_APP_URL = saved;
});
