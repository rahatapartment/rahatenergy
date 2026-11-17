import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import manifest from "../lib/image-manifest.json";

function rasterFiles(directory: string): string[] {
  return readdirSync(directory).flatMap(name => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? rasterFiles(path)
      : /\.(jpe?g|png|webp)$/i.test(name) ? [path] : [];
  });
}

test("every uploaded raster has valid responsive WebP assets and a tiny preview", () => {
  const sources = ["images", "products"].flatMap(folder => rasterFiles(`public/${folder}`));
  assert.equal(Object.keys(manifest).length, sources.length);
  let originalBytes = 0;
  let webBytes = 0;
  for (const source of sources) {
    const entry = manifest[source.slice("public".length) as keyof typeof manifest];
    assert.ok(entry, `Missing optimized asset for ${source}`);
    assert.match(entry.blurDataURL, /^data:image\/webp;base64,/);
    assert.ok(entry.blurDataURL.length < 4096, "Preview must remain small");
    let previousWidth = 0;
    for (const variant of entry.variants) {
      assert.ok(variant.width > previousWidth && variant.width <= entry.width);
      previousWidth = variant.width;
      assert.match(variant.src, /-[a-f0-9]{16}-\d+\.webp$/);
      const bytes = readFileSync(`public${variant.src}`);
      assert.equal(bytes.toString("ascii", 0, 4), "RIFF");
      assert.equal(bytes.toString("ascii", 8, 12), "WEBP");
      assert.equal(bytes.length, variant.bytes);
    }
    originalBytes += statSync(source).size;
    webBytes += entry.variants[entry.variants.length - 1].bytes;
  }
  assert.ok(webBytes < originalBytes * 0.1, "Web image set should be at least 90% smaller");
});
