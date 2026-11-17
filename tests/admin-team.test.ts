import { test } from "node:test";
import assert from "node:assert/strict";
import {
  hasPermission,
  permissionKeys,
  inventoryPermissionErrors,
} from "../lib/admin-permissions";
import { invitationHash, invitationUsable } from "../lib/admin-invitations";
import { inventorySchema } from "../lib/validation";
test("owner has all scopes; members receive only known explicit scopes and implied group viewing", () => {
  for (const scope of permissionKeys)
    assert.equal(hasPermission({ role: "OWNER" }, scope), true);
  const worker = {
    role: "OPERATOR",
    permissions: ["inventory.increase", "customers.manage"],
  };
  assert.ok(hasPermission(worker, "inventory.view"));
  assert.ok(hasPermission(worker, "customers.view"));
  assert.equal(hasPermission(worker, "inventory.decrease"), false);
  assert.equal(hasPermission(worker, "products.edit"), false);
  assert.equal(
    hasPermission(
      { role: "OPERATOR", permissions: ["inventory.unknown"] },
      "inventory.view",
    ),
    false,
  );
  assert.equal(hasPermission(null, "activity.view"), false);
});
test("stock direction, pricing and availability each require their own permission", () => {
  const before = {
    stock: 10,
    priceKobo: 10000,
    enabled: false,
    lowStockThreshold: 5,
  };
  const actor = { role: "OPERATOR", permissions: ["inventory.increase"] };
  assert.deepEqual(
    inventoryPermissionErrors(actor, before, { ...before, stock: 11 }),
    [],
  );
  assert.deepEqual(
    inventoryPermissionErrors(actor, before, { ...before, stock: 9 }),
    ["inventory.decrease"],
  );
  assert.deepEqual(
    inventoryPermissionErrors(actor, before, {
      ...before,
      priceKobo: 20000,
      enabled: true,
    }),
    ["inventory.price", "inventory.settings"],
  );
});
test("inventory can save without a manually typed reason and still rejects invalid totals", () => {
  const row = {
    stock: 2,
    priceKobo: 100,
    enabled: true,
    lowStockThreshold: 3,
    version: 0,
  };
  assert.ok(inventorySchema.safeParse(row).success);
  assert.equal(inventorySchema.safeParse({ ...row, stock: -1 }).success, false);
});
test("invitations expire and cannot be reused after acceptance or revocation", () => {
  const now = new Date();
  const row = {
    acceptedAt: null,
    revokedAt: null,
    expiresAt: new Date(now.getTime() + 1000),
  };
  assert.ok(invitationUsable(row, now));
  assert.equal(invitationUsable({ ...row, expiresAt: now }, now), false);
  assert.equal(invitationUsable({ ...row, acceptedAt: now }, now), false);
  assert.equal(invitationUsable({ ...row, revokedAt: now }, now), false);
  assert.equal(invitationHash("a").length, 64);
  assert.notEqual(invitationHash("a"), invitationHash("b"));
});
