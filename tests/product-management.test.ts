import test from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { catalogue } from "../lib/catalogue";
import { productContentSchema, withProductContent } from "../lib/product-content";
import { prepareProductImage } from "../lib/product-images";
import { PATCH as editProduct } from "../app/api/admin/products/[id]/route";
import { POST as uploadProductImage } from "../app/api/admin/product-images/route";
import { GET as productImage } from "../app/api/product-images/[id]/route";

const p = catalogue[0];
const input = { name: p.name, description: p.description, category: p.category, images: p.images, specifications: {}, seoTitle: p.name, seoDescription: p.description, version: 0, reason: "Updated product information" };
test("product editor rejects arbitrary image URLs, duplicate images and identity changes", () => {
  assert.ok(productContentSchema.safeParse(input).success);
  for (const images of [[], ["https://example.com/photo.jpg"], ["/../../.env"], [p.images[0], p.images[0]]])
    assert.equal(productContentSchema.safeParse({ ...input, images }).success, false);
  assert.equal(productContentSchema.safeParse({ ...input, id: "other" }).success, false);
  assert.equal(productContentSchema.safeParse({ ...input, category: "Unknown" }).success, false);
  assert.equal(productContentSchema.safeParse({ ...input, version: -1 }).success, false);
  assert.equal(withProductContent(p), p);
});
test("product edit and upload endpoints reject anonymous requests", async () => {
  const req = new Request("http://localhost:3001/api/admin/products/re-001", { method: "PATCH", headers: { origin: "http://localhost:3001", "content-type": "application/json" }, body: JSON.stringify(input) });
  assert.equal((await editProduct(req, { params: { id: p.id } })).status, 401);
  assert.equal((await uploadProductImage(new Request("http://localhost:3001/api/admin/product-images", { method: "POST", body: "invalid" }))).status, 401);
  assert.equal((await productImage(new Request("http://localhost:3001/api/product-images/bad"), { params: { id: "bad" } })).status, 404);
});
test("image uploads resize, strip metadata, generate responsive WebP, and deduplicate", async () => {
  const source = await sharp({ create: { width: 2200, height: 1800, channels: 4, background: "#00a86b" } }).png().toBuffer();
  const image = await prepareProductImage(source);
  assert.match(image.id, /^[a-f0-9]{64}$/);
  assert.ok(image.width <= 1600 && image.height <= 1600);
  assert.equal((await sharp(image.data).metadata()).format, "webp");
  assert.ok(((await sharp(image.thumbnail).metadata()).width ?? 0) <= 160);
  assert.ok(((await sharp(image.medium).metadata()).width ?? 0) <= 640);
  assert.equal((await prepareProductImage(source)).id, image.id);
  assert.ok(image.data.length < source.length);
  await assert.rejects(prepareProductImage(Buffer.from("<svg><script>bad</script></svg>")), /valid|non-animated/);
  await assert.rejects(prepareProductImage(Buffer.alloc(11 * 1024 * 1024)), /10 MB/);
});
