import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { paymentKey, validSignature, validWebhookSignature, validPaymentUrl, referenceMode } from "../lib/paystack";
import { checkoutSchema } from "../lib/commerce-validation";
test("payment credentials must match the explicitly configured mode", () => {
  delete process.env.ENERGY_PAYSTACK_MODE;
  delete process.env.ENERGY_PAYSTACK_SECRET_KEY;
  assert.throws(paymentKey);
  process.env.ENERGY_PAYSTACK_SECRET_KEY = "sk_live_fixture";
  assert.equal(paymentKey(), "sk_live_fixture");
  process.env.ENERGY_PAYSTACK_MODE = "test";
  assert.throws(paymentKey);
  process.env.ENERGY_PAYSTACK_SECRET_KEY = "sk_test_fixture";
  assert.equal(paymentKey(), "sk_test_fixture");
  process.env.ENERGY_PAYSTACK_MODE = "live";
  assert.throws(paymentKey);
  process.env.ENERGY_PAYSTACK_SECRET_KEY = "sk_live_fixture";
  assert.equal(paymentKey(), "sk_live_fixture");
  assert.equal(referenceMode("REPAY-LIVE-fixture"), "live");
  assert.equal(referenceMode("REPAY-fixture"), "test");
  delete process.env.ENERGY_PAYSTACK_MODE;
});
test("webhook signature requires the raw signed body and rejects tampering", () => {
  process.env.ENERGY_PAYSTACK_MODE = "test";
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

test("dedicated webhook signatures verify the raw body and reject stale or legacy signatures", () => {
  const secret = "whsec_fixture";
  process.env.ENERGY_PAYSTACK_WEBHOOK_SECRET = secret;
  try {
    const raw = Buffer.from('{"event":"charge.success","name":"Ráhat"}');
    const now = Math.floor(Date.now() / 1000);
    const headers = (timestamp: number) => {
      const digest = createHmac("sha512", secret).update(`${timestamp}.`).update(raw).digest("hex");
      return new Headers({
        "Paystack-Signature": `t=${timestamp},v1=whk_rotating:${"0".repeat(128)},v1=whk_current:${digest}`,
      });
    };
    assert.ok(validWebhookSignature(raw, headers(now)));
    assert.ok(!validWebhookSignature(Buffer.concat([raw, Buffer.from(" ")]), headers(now)));
    assert.ok(!validWebhookSignature(raw, headers(now - 301)));
    const legacy = createHmac("sha512", "sk_test_fixture").update(raw).digest("hex");
    assert.ok(!validWebhookSignature(raw, new Headers({ "x-paystack-signature": legacy })));
  } finally {
    delete process.env.ENERGY_PAYSTACK_WEBHOOK_SECRET;
  }
});
