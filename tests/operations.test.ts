import test from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword } from "../lib/passwords";
import { deliveryChoices, fulfilmentChoices } from "../lib/operation-rules";
import { hasPermission, teamAccessPresets } from "../lib/admin-permissions";
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
    "DELIVERED",
  ]);
  assert.deepEqual(deliveryChoices("PREPARING", "DELIVERY"), [
    "READY_FOR_DISPATCH",
    "DISPATCHED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ]);
  assert.deepEqual(deliveryChoices("DELIVERED", "DELIVERY"), []);
  assert.deepEqual(deliveryChoices("CANCELLED", "PICKUP"), []);
  assert.deepEqual(fulfilmentChoices("PENDING", "DELIVERY"), ["PROCESSING", "DISPATCHED", "DELIVERED"]);
  assert.deepEqual(fulfilmentChoices("PENDING", "PICKUP"), ["PROCESSING", "READY_FOR_PICKUP", "DELIVERED"]);
  assert.deepEqual(fulfilmentChoices("PAYMENT_REVIEW", "DELIVERY"), []);
});
test("team access presets distinguish routine fulfilment from management", () => {
  const team = { role: "OPERATOR", permissions: [...teamAccessPresets["team-member"].permissions] };
  const manager = { role: "OPERATOR", permissions: [...teamAccessPresets.manager.permissions] };
  assert.ok(hasPermission(team, "orders.manage"));
  assert.ok(!hasPermission(team, "inventory.price"));
  assert.ok(hasPermission(manager, "inventory.price"));
  assert.ok(hasPermission(manager, "deliveries.manage"));
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
