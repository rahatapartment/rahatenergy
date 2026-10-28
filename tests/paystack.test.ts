import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { testKey, validSignature, validPaymentUrl } from "../lib/paystack";
import { checkoutSchema } from "../lib/commerce-validation";
test("payment credentials enforce test mode with no live override", () => {
  delete process.env.ENERGY_PAYSTACK_SECRET_KEY;
  assert.throws(testKey);
  process.env.ENERGY_PAYSTACK_SECRET_KEY = "sk_live_fixture";
  assert.throws(testKey);
  process.env.ENERGY_PAYSTACK_SECRET_KEY = "sk_test_fixture";
  assert.equal(testKey(), "sk_test_fixture");
});
test("webhook signature requires the raw signed body and rejects tampering", () => {
  process.env.ENERGY_PAYSTACK_SECRET_KEY = "sk_test_fixture";
  const raw = '{"event":"charge.success"}';
  const sig = createHmac("sha512", "sk_test_fixture").update(raw).digest("hex");
  assert.ok(validSignature(raw, sig));
  assert.ok(!validSignature(raw + " ", sig));
  assert.ok(!validSignature(raw, null));
  assert.ok(!validSignature(raw, "invalid"));
});
test("payment redirect rejects untrusted hosts and non-HTTPS URLs", () => {
  assert.ok(validPaymentUrl("https://checkout.paystack.com/fixture"));
  assert.ok(!validPaymentUrl("http://checkout.paystack.com/fixture"));
  assert.ok(
    !validPaymentUrl("https://checkout.paystack.com.attacker.example/fixture"),
  );
});
test("checkout rejects unknown product identities and frontend price injection", () => {
  assert.ok(
    !checkoutSchema.safeParse({
      lines: [{ productId: "unknown", quantity: 1 }],
      total: 1,
    }).success,
  );
});
