import test from "node:test";
import assert from "node:assert/strict";
import { catalogue, type StoreProduct } from "../lib/catalogue";
import { inventoryReadiness, workerReadiness } from "../lib/launch-readiness";
const p: StoreProduct = { ...catalogue[0], priceKobo: 10000, stock: 5, reserved: 5, enabled: true, version: 0, lowStockThreshold: 1 };
test("readiness never calls disconnected or fully reserved inventory ready", () => {
  assert.deepEqual(inventoryReadiness([p], false)[0].issues, ["Stock unverified"]);
  assert.equal(inventoryReadiness([p], true)[0].stock, 0);
  assert.deepEqual(inventoryReadiness([p], true)[0].issues, ["No available stock"]);
  assert.deepEqual(inventoryReadiness([{ ...p, reserved: 0 }], true)[0].issues, []);
  assert.deepEqual(inventoryReadiness([{ ...p, reserved: 0, priceKobo: null, enabled: false }], true)[0].issues, ["Price needed", "Purchases paused"]);
});
test("worker readiness distinguishes missing, stale and recent successful runs", () => {
  const now = Date.now();
  assert.match(workerReadiness(null, now), /No successful/);
  assert.match(workerReadiness(new Date(now - 16 * 60_000), now), /over 15 minutes/);
  assert.match(workerReadiness(new Date(now - 60_000), now), /Recent/);
});
