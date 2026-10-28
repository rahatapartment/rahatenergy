import test from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword } from "../lib/passwords";
import { deliveryChoices } from "../lib/operation-rules";
import { quoteUpdateSchema, cancelSchema } from "../lib/operations-validation";
test("named admin password hashes use distinct salts and reject wrong passwords", async () => {
  const [a, b] = await Promise.all([
    hashPassword("fixture-long-password"),
    hashPassword("fixture-long-password"),
  ]);
  assert.notEqual(a, b);
  assert.ok(await verifyPassword("fixture-long-password", a));
  assert.ok(!(await verifyPassword("wrong-password", a)));
  assert.ok(!(await verifyPassword("fixture-long-password", "malformed")));
});
test("pickup and delivery have separate permitted progressions and terminal states", () => {
  assert.deepEqual(deliveryChoices("PREPARING", "PICKUP"), [
    "READY_FOR_PICKUP",
  ]);
  assert.deepEqual(deliveryChoices("PREPARING", "DELIVERY"), [
    "READY_FOR_DISPATCH",
  ]);
  assert.deepEqual(deliveryChoices("DELIVERED", "DELIVERY"), []);
  assert.deepEqual(deliveryChoices("CANCELLED", "PICKUP"), []);
});
test("operation inputs reject definition edits and require a cancellation reason", () => {
  assert.ok(
    !quoteUpdateSchema.safeParse({
      status: "QUOTED",
      internalNotes: "notes",
      version: 0,
      reason: "valid reason",
      price: 1,
    }).success,
  );
  assert.ok(
    !cancelSchema.safeParse({
      referenceConfirmation: "EXAMPLE",
      reason: "short",
    }).success,
  );
});
