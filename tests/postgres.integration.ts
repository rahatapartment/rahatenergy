import { describe, it, before, beforeEach, after, mock } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomBytes, randomUUID, createHmac } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import {
  createCheckout,
  checkoutQuote,
  beginPayment,
  finalizePayment,
  closeUnpaidOrder,
  expireReservations,
  updateFulfillment,
} from "../lib/commerce";
import { checkoutSchema, type CheckoutInput } from "../lib/commerce-validation";
import { seedCatalogue } from "../lib/seed-catalogue";
import { processNotifications } from "../lib/notifications";
import { POST as webhook } from "../app/api/payments/webhook/route";
import { PATCH as orderPatch } from "../app/api/admin/orders/[id]/route";
import { createAdminSession, ADMIN_COOKIE } from "../lib/admin-auth";
import {
  updateQuotation,
  updateDelivery,
  cancelOrder,
  allocateReviewedOrder,
  verifyCompletedRefund,
} from "../lib/operations";
import { createAdminUser, editAdminUser } from "../lib/admin-users";
import { verifyPassword } from "../lib/passwords";
import { limitRequest } from "../lib/security";
import { verifyAdminSession, type AdminIdentity } from "../lib/admin-auth";
import { POST as cancelApi } from "../app/api/admin/orders/[id]/cancel/route";
import { POST as loginApi } from "../app/api/admin/login/route";
import { GET as cronApi } from "../app/api/cron/commerce/route";
import { getDb } from "../lib/db";
import type { VerifiedPayment } from "../lib/paystack";
const testUrl = process.env.ENERGY_TEST_DATABASE_URL;
if (!testUrl)
  throw new Error(
    "ENERGY_TEST_DATABASE_URL is required and must identify a disposable loopback database ending in _test.",
  );
if (testUrl) {
  const u = new URL(testUrl);
  if (
    !["localhost", "127.0.0.1"].includes(u.hostname) ||
    !u.pathname.endsWith("_test")
  )
    throw new Error(
      "Integration tests require a disposable loopback database ending in _test.",
    );
}
const db = testUrl
  ? new PrismaClient({ datasources: { db: { url: testUrl } } })
  : null;
let optionId = "";
function input(overrides: Partial<CheckoutInput> = {}): CheckoutInput {
  return {
    checkoutKey: randomUUID(),
    accessToken: randomBytes(32).toString("base64url"),
    lines: [
      { productId: "re-001", quantity: 1 },
      { productId: "re-004", quantity: 1 },
    ],
    deliveryOptionId: optionId,
    expectedTotalKobo: 201000,
    customer: {
      name: "Test Customer",
      email: `test-${randomUUID()}@example.test`,
      phone: "08000000000",
    },
    address: {
      line1: "Fixture address",
      city: "Test City",
      state: "Test State",
    },
    consent: true,
    ...overrides,
  };
}
async function verified(orderId: string): Promise<VerifiedPayment> {
  const payment = await db!.payment.findFirstOrThrow({ where: { orderId } });
  const order = await db!.order.findUniqueOrThrow({ where: { id: orderId } });
  return {
    reference: payment.reference,
    domain: "test",
    status: "success",
    amount: payment.amountKobo,
    currency: "NGN",
    paid_at: new Date().toISOString(),
    customer: { email: (order.customerSnapshot as { email: string }).email },
  };
}
describe(
  "Real disposable PostgreSQL commerce integration",
  { skip: !testUrl, concurrency: false },
  () => {
    before(async () => {
      process.env.ENERGY_DATABASE_URL = testUrl;
      process.env.ENERGY_DIRECT_URL = testUrl;
      process.env.ENERGY_PAYSTACK_SECRET_KEY = "sk_test_integration_fixture";
      process.env.ENERGY_ADMIN_SESSION_SECRET =
        "integration-fixture-secret-at-least-32-characters";
      process.env.ENERGY_EMAIL_FROM =
        "Rahat Energy Test <noreply@example.test>";
      process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3001";
      execFileSync(
        process.execPath,
        ["scripts/prisma.mjs", "migrate", "deploy"],
        { env: process.env, stdio: "pipe" },
      );
      await seedCatalogue(db!);
    });
    beforeEach(async () => {
      mock.restoreAll();
      await db!.$transaction(async (tx) => {
        await tx.adminUser.deleteMany();
        await tx.rateLimitBucket.deleteMany();
        await tx.jobRun.deleteMany();
        await tx.refund.deleteMany();
        await tx.quotation.deleteMany();
        await tx.notification.deleteMany();
        await tx.orderEvent.deleteMany();
        await tx.payment.deleteMany();
        await tx.delivery.deleteMany();
        await tx.inventoryReservation.deleteMany();
        await tx.orderItem.deleteMany();
        await tx.order.deleteMany();
        await tx.customer.deleteMany();
        await tx.inventoryMovement.deleteMany();
        await tx.auditLog.deleteMany();
        await tx.deliveryOption.deleteMany();
        await tx.inventory.updateMany({
          data: {
            stock: 10,
            reserved: 0,
            priceKobo: 100000,
            enabled: true,
            lowStockThreshold: 2,
            version: 0,
          },
        });
      });
      optionId = (
        await db!.deliveryOption.create({
          data: {
            label: "TEST ONLY delivery",
            method: "DELIVERY",
            state: "Test State",
            city: "Test City",
            feeKobo: 1000,
            enabled: true,
          },
        })
      ).id;
    });
    after(async () => {
      mock.restoreAll();
      await db!.$disconnect();
      await getDb()?.$disconnect();
    });
    it("applies all migrations and preserves edited operational values on repeat seed", async () => {
      const migrations = await db!.$queryRaw<
        { n: bigint }[]
      >`SELECT count(*) AS n FROM "_prisma_migrations" WHERE finished_at IS NOT NULL`;
      assert.equal(Number(migrations[0].n), 3);
      await db!.inventory.update({
        where: { productId: "re-001" },
        data: { priceKobo: 123456, stock: 7 },
      });
      await seedCatalogue(db!);
      await seedCatalogue(db!);
      assert.equal(await db!.product.count(), 15);
      assert.equal(await db!.inventory.count(), 15);
      const row = await db!.inventory.findUniqueOrThrow({
        where: { productId: "re-001" },
      });
      assert.equal(row.stock, 7);
      assert.equal(row.priceKobo, 123456);
    });
    it("enforces fixed catalogue identities and prevents product deletion at database level", async () => {
      await assert.rejects(
        db!.product.create({ data: { id: "unapproved", sku: "bad" } }),
      );
      await assert.rejects(db!.product.delete({ where: { id: "re-001" } }));
      assert.equal(await db!.product.count(), 15);
    });
    it("calculates server totals, snapshots multiple items and reserves inventory atomically", async () => {
      const data = input();
      const quote = await checkoutQuote(db!, data.lines, optionId);
      assert.equal(quote.totalKobo, 201000);
      const order = await createCheckout(db!, data);
      assert.equal(order.items.length, 2);
      assert.equal(order.totalKobo, 201000);
      assert.equal(
        (
          await db!.inventory.findUniqueOrThrow({
            where: { productId: "re-001" },
          })
        ).reserved,
        1,
      );
      await db!.inventory.update({
        where: { productId: "re-001" },
        data: { priceKobo: 999999 },
      });
      assert.equal(
        (
          await db!.orderItem.findFirstOrThrow({
            where: { orderId: order.id, productId: "re-001" },
          })
        ).unitPriceKobo,
        100000,
      );
    });
    it("rejects client price fields, stale reviewed totals, unsupported addresses and disabled delivery", async () => {
      assert.ok(
        !checkoutSchema.safeParse({ ...input(), priceKobo: 1 }).success,
      );
      await assert.rejects(
        createCheckout(db!, input({ expectedTotalKobo: 1 })),
      );
      await assert.rejects(
        createCheckout(
          db!,
          input({
            address: {
              line1: "Fixture",
              city: "Other city",
              state: "Other state",
            },
          }),
        ),
      );
      await db!.deliveryOption.update({
        where: { id: optionId },
        data: { enabled: false },
      });
      await assert.rejects(createCheckout(db!, input()));
      assert.equal(await db!.order.count(), 0);
    });
    it("serializes competing checkout attempts so one remaining item cannot be oversold", async () => {
      await db!.inventory.update({
        where: { productId: "re-001" },
        data: { stock: 1 },
      });
      const data = {
        lines: [{ productId: "re-001", quantity: 1 }],
        expectedTotalKobo: 101000,
      };
      const results = await Promise.allSettled([
        createCheckout(db!, input(data)),
        createCheckout(db!, input(data)),
      ]);
      assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
      const inventory = await db!.inventory.findUniqueOrThrow({
        where: { productId: "re-001" },
      });
      assert.equal(inventory.reserved, 1);
      assert.equal(inventory.stock, 1);
    });
    it("serializes retry keys and creates only one order and reservation set", async () => {
      const data = input();
      const [a, b] = await Promise.all([
        createCheckout(db!, data),
        createCheckout(db!, data),
      ]);
      assert.equal(a.id, b.id);
      assert.equal(await db!.order.count(), 1);
      assert.equal(await db!.inventoryReservation.count(), 2);
      await assert.rejects(
        createCheckout(db!, {
          ...data,
          customer: { ...data.customer, name: "Changed" },
        }),
      );
    });
    it("initializes a shared payment once under simultaneous retries", async () => {
      const order = await createCheckout(db!, input());
      let calls = 0;
      const gateway = async (p: { reference: string }) => {
        calls++;
        return {
          reference: p.reference,
          authorization_url: "https://checkout.paystack.com/test-fixture",
        };
      };
      await Promise.allSettled([
        beginPayment(db!, order.id, gateway),
        beginPayment(db!, order.id, gateway),
      ]);
      assert.equal(calls, 1);
      assert.equal(
        (
          await db!.inventory.findUniqueOrThrow({
            where: { productId: "re-001" },
          })
        ).reserved,
        1,
      );
      assert.equal(
        await beginPayment(db!, order.id, gateway),
        "https://checkout.paystack.com/test-fixture",
      );
      assert.equal(calls, 1);
    });
    it("releases stock when gateway initialization fails and does not create a paid order", async () => {
      const order = await createCheckout(db!, input());
      await assert.rejects(
        beginPayment(db!, order.id, async () => {
          throw new Error("simulated network failure");
        }),
      );
      assert.equal(
        (await db!.order.findUniqueOrThrow({ where: { id: order.id } }))
          .paymentStatus,
        "FAILED",
      );
      assert.equal(
        (
          await db!.inventory.findUniqueOrThrow({
            where: { productId: "re-001" },
          })
        ).reserved,
        0,
      );
    });
    it("converts reservations once for repeated concurrent verified payments and queues one receipt", async () => {
      const order = await createCheckout(db!, input());
      const charge = await verified(order.id);
      await Promise.all([
        finalizePayment(db!, charge),
        finalizePayment(db!, charge),
      ]);
      const inventory = await db!.inventory.findUniqueOrThrow({
        where: { productId: "re-001" },
      });
      assert.equal(inventory.stock, 9);
      assert.equal(inventory.reserved, 0);
      assert.equal(
        await db!.inventoryMovement.count({ where: { delta: { lt: 0 } } }),
        2,
      );
      assert.equal(await db!.notification.count(), 1);
      assert.equal(
        (await db!.order.findUniqueOrThrow({ where: { id: order.id } }))
          .paymentStatus,
        "PAID",
      );
    });
    it("rejects wrong currency, amount, customer and live-domain verification", async () => {
      const order = await createCheckout(db!, input());
      const charge = await verified(order.id);
      for (const invalid of [
        { ...charge, amount: 1 },
        { ...charge, currency: "USD" },
        { ...charge, domain: "live" },
        { ...charge, customer: { email: "other@example.test" } },
      ])
        await assert.rejects(finalizePayment(db!, invalid));
      assert.equal(
        (
          await db!.inventory.findUniqueOrThrow({
            where: { productId: "re-001" },
          })
        ).stock,
        10,
      );
    });
    it("handles failed and abandoned payments without duplicate releases or paid-state downgrade", async () => {
      for (const status of ["failed", "abandoned"]) {
        const order = await createCheckout(db!, input());
        const charge = { ...(await verified(order.id)), status, paid_at: null };
        await finalizePayment(db!, charge);
        await finalizePayment(db!, charge);
        assert.equal(
          (await db!.order.findUniqueOrThrow({ where: { id: order.id } }))
            .paymentStatus,
          "FAILED",
        );
      }
      const order = await createCheckout(db!, input());
      const charge = await verified(order.id);
      await finalizePayment(db!, charge);
      await finalizePayment(db!, {
        ...charge,
        status: "failed",
        paid_at: null,
      });
      assert.equal(
        (await db!.order.findUniqueOrThrow({ where: { id: order.id } }))
          .paymentStatus,
        "PAID",
      );
    });
    it("expires abandoned holds and flags late captured payments without taking unavailable stock", async () => {
      const order = await createCheckout(db!, input());
      await db!.order.update({
        where: { id: order.id },
        data: { expiresAt: new Date(0) },
      });
      await db!.inventoryReservation.updateMany({
        where: { orderId: order.id },
        data: { expiresAt: new Date(0) },
      });
      assert.equal(await expireReservations(db!), 1);
      await expireReservations(db!);
      assert.equal(
        (
          await db!.inventory.findUniqueOrThrow({
            where: { productId: "re-001" },
          })
        ).reserved,
        0,
      );
      const result = await finalizePayment(db!, await verified(order.id));
      assert.equal(result.review, true);
      const row = await db!.order.findUniqueOrThrow({
        where: { id: order.id },
      });
      assert.equal(row.paymentStatus, "PAID");
      assert.equal(row.fulfillmentStatus, "PAYMENT_REVIEW");
      assert.equal(
        (
          await db!.inventory.findUniqueOrThrow({
            where: { productId: "re-001" },
          })
        ).stock,
        10,
      );
      await assert.rejects(updateFulfillment(db!, order.id, "PROCESSING"));
    });
    it("serializes expiry against finalization without negative stock or duplicate movements", async () => {
      const order = await createCheckout(db!, input());
      await db!.order.update({
        where: { id: order.id },
        data: { expiresAt: new Date(0) },
      });
      await db!.inventoryReservation.updateMany({
        where: { orderId: order.id },
        data: { expiresAt: new Date(0) },
      });
      await Promise.all([
        closeUnpaidOrder(db!, order.id, "EXPIRED"),
        finalizePayment(db!, await verified(order.id)),
      ]);
      const row = await db!.inventory.findUniqueOrThrow({
        where: { productId: "re-001" },
      });
      assert.equal(row.stock, 10);
      assert.equal(row.reserved, 0);
      assert.equal(
        await db!.inventoryMovement.count({
          where: { productId: "re-001", reservedDelta: -1 },
        }),
        1,
      );
    });
    it("processes repeated signed webhooks against real order data without duplicate deductions", async () => {
      const order = await createCheckout(db!, input());
      const charge = await verified(order.id);
      mock.method(
        globalThis,
        "fetch",
        async () =>
          new Response(JSON.stringify({ status: true, data: charge }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
      );
      const raw = JSON.stringify({
        event: "charge.success",
        data: { reference: charge.reference },
      });
      const signature = createHmac(
        "sha512",
        process.env.ENERGY_PAYSTACK_SECRET_KEY!,
      )
        .update(raw)
        .digest("hex");
      const request = () =>
        new Request("http://localhost:3001/api/payments/webhook", {
          method: "POST",
          headers: { "x-paystack-signature": signature },
          body: raw,
        });
      assert.equal((await webhook(request())).status, 200);
      assert.equal((await webhook(request())).status, 200);
      assert.equal(
        (
          await db!.inventory.findUniqueOrThrow({
            where: { productId: "re-001" },
          })
        ).stock,
        9,
      );
      assert.equal(await db!.notification.count(), 1);
      assert.equal(
        (
          await webhook(
            new Request("http://localhost/api/payments/webhook", {
              method: "POST",
              body: raw,
            }),
          )
        ).status,
        401,
      );
    });
    it("protects admin order mutations and records permitted fulfillment history", async () => {
      const order = await createCheckout(db!, input());
      const request = (cookie?: string, status = "PROCESSING") =>
        new Request("http://localhost:3001/api/admin/orders/" + order.id, {
          method: "PATCH",
          headers: {
            origin: "http://localhost:3001",
            "Content-Type": "application/json",
            ...(cookie ? { cookie } : {}),
          },
          body: JSON.stringify({ status }),
        });
      assert.equal(
        (await orderPatch(request(), { params: { id: order.id } })).status,
        401,
      );
      const cookie = `${ADMIN_COOKIE}=${await createAdminSession()}`;
      assert.equal(
        (await orderPatch(request(cookie), { params: { id: order.id } }))
          .status,
        409,
      );
      await finalizePayment(db!, await verified(order.id));
      assert.equal(
        (await orderPatch(request(cookie), { params: { id: order.id } }))
          .status,
        200,
      );
      assert.equal(
        (
          await orderPatch(request(cookie, "DISPATCHED"), {
            params: { id: order.id },
          })
        ).status,
        200,
      );
      assert.equal(
        (
          await orderPatch(request(cookie, "DELIVERED"), {
            params: { id: order.id },
          })
        ).status,
        200,
      );
      assert.equal(
        (await db!.delivery.findUniqueOrThrow({ where: { orderId: order.id } }))
          .status,
        "DELIVERED",
      );
      assert.equal(
        await db!.auditLog.count({ where: { subject: order.id } }),
        3,
      );
    });
    it("leases and sends a confirmation once through a mocked email provider", async () => {
      const order = await createCheckout(db!, input());
      await finalizePayment(db!, await verified(order.id));
      process.env.ENERGY_RESEND_API_KEY = "fixture-only";
      let sends = 0;
      mock.method(globalThis, "fetch", async () => {
        sends++;
        return new Response(JSON.stringify({ id: "fixture-email" }), {
          status: 200,
        });
      });
      await Promise.all([processNotifications(db!), processNotifications(db!)]);
      await processNotifications(db!);
      assert.equal(sends, 1);
      assert.equal(
        await db!.notification.count({ where: { sentAt: { not: null } } }),
        1,
      );
      delete process.env.ENERGY_RESEND_API_KEY;
    });
    it("preserves refunded terminal states under repeated gateway events", async () => {
      const order = await createCheckout(db!, input());
      const charge = await verified(order.id);
      await finalizePayment(db!, charge);
      await db!.order.update({
        where: { id: order.id },
        data: { paymentStatus: "REFUNDED" },
      });
      await db!.payment.updateMany({
        where: { orderId: order.id },
        data: { status: "REFUNDED" },
      });
      await finalizePayment(db!, charge);
      await closeUnpaidOrder(db!, order.id, "FAILED");
      await assert.rejects(beginPayment(db!, order.id));
      assert.equal(
        (await db!.order.findUniqueOrThrow({ where: { id: order.id } }))
          .paymentStatus,
        "REFUNDED",
      );
      assert.equal(
        (
          await db!.inventory.findUniqueOrThrow({
            where: { productId: "re-001" },
          })
        ).stock,
        9,
      );
    });
    it("keeps payment paid when the email provider fails and schedules a bounded retry", async () => {
      const order = await createCheckout(db!, input());
      await finalizePayment(db!, await verified(order.id));
      process.env.ENERGY_RESEND_API_KEY = "fixture-only";
      let attempts = 0;
      mock.method(globalThis, "fetch", async () => {
        attempts++;
        return new Response("{}", { status: 500 });
      });
      try {
        await processNotifications(db!);
        await processNotifications(db!);
        assert.equal(attempts, 1);
        const job = await db!.notification.findFirstOrThrow();
        assert.equal(job.sentAt, null);
        assert.equal(job.attempts, 1);
        assert.ok(job.nextAttemptAt.getTime() > Date.now());
        assert.equal(
          (await db!.order.findUniqueOrThrow({ where: { id: order.id } }))
            .paymentStatus,
          "PAID",
        );
      } finally {
        delete process.env.ENERGY_RESEND_API_KEY;
      }
    });
    it("persists quotation notes and history with stale-write protection", async () => {
      const quote = await db!.quotation.create({
        data: {
          name: "Fixture contact",
          email: "quote@example.test",
          phone: "08000000000",
          location: "Fixture city",
          requirements: "Fixture project requirements",
        },
      });
      await updateQuotation(
        db!,
        quote.id,
        {
          status: "CONTACTED",
          internalNotes: "Staff-only fixture note",
          version: 0,
          reason: "Initial contact recorded",
        },
        "operator-fixture",
      );
      await assert.rejects(
        updateQuotation(
          db!,
          quote.id,
          {
            status: "QUOTED",
            internalNotes: "stale",
            version: 0,
            reason: "Stale update rejected",
          },
          "operator-fixture",
        ),
      );
      const current = await db!.quotation.findUniqueOrThrow({
        where: { id: quote.id },
      });
      assert.equal(current.version, 1);
      assert.equal(current.internalNotes, "Staff-only fixture note");
      assert.equal(
        await db!.auditLog.count({ where: { subject: quote.id } }),
        1,
      );
    });
    it("requires payment and valid delivery transitions; failed dispatch cannot be restocked as a new cancellation", async () => {
      const order = await createCheckout(db!, input());
      const raw = {
        status: "PREPARING",
        trackingReference: "FIXTURE-TRACK",
        version: 0,
        reason: "Fixture preparation",
      };
      await assert.rejects(
        updateDelivery(db!, order.id, raw, "operator-fixture"),
      );
      await finalizePayment(db!, await verified(order.id));
      await assert.rejects(
        updateDelivery(
          db!,
          order.id,
          { ...raw, status: "DELIVERED" },
          "operator-fixture",
        ),
      );
      await updateDelivery(db!, order.id, raw, "operator-fixture");
      await assert.rejects(
        updateDelivery(db!, order.id, raw, "operator-fixture"),
      );
      await updateDelivery(
        db!,
        order.id,
        { ...raw, status: "READY_FOR_DISPATCH", version: 1 },
        "operator-fixture",
      );
      await updateDelivery(
        db!,
        order.id,
        { ...raw, status: "DISPATCHED", version: 2 },
        "operator-fixture",
      );
      await updateDelivery(
        db!,
        order.id,
        { ...raw, status: "FAILED_DELIVERY", version: 3 },
        "operator-fixture",
      );
      await updateDelivery(
        db!,
        order.id,
        { ...raw, status: "READY_FOR_DISPATCH", version: 4 },
        "operator-fixture",
      );
      assert.equal(
        (await db!.order.findUniqueOrThrow({ where: { id: order.id } }))
          .fulfillmentStatus,
        "DISPATCHED",
      );
      await assert.rejects(
        cancelOrder(
          db!,
          order.id,
          order.reference,
          "Cancellation after courier custody",
          "owner-fixture",
        ),
      );
      assert.equal(
        (
          await db!.inventory.findUniqueOrThrow({
            where: { productId: "re-001" },
          })
        ).stock,
        9,
      );
    });
    it("supports pickup readiness and completion without dispatch states", async () => {
      await db!.deliveryOption.update({
        where: { id: optionId },
        data: {
          method: "PICKUP",
          state: null,
          city: null,
          pickupAddress: "Fixture collection location",
          feeKobo: 0,
        },
      });
      const order = await createCheckout(
        db!,
        input({ expectedTotalKobo: 200000 }),
      );
      await finalizePayment(db!, await verified(order.id));
      const raw = { trackingReference: "", reason: "Fixture pickup progress" };
      await updateDelivery(
        db!,
        order.id,
        { ...raw, status: "PREPARING", version: 0 },
        "operator-fixture",
      );
      await assert.rejects(
        updateDelivery(
          db!,
          order.id,
          { ...raw, status: "DISPATCHED", version: 1 },
          "operator-fixture",
        ),
      );
      await updateDelivery(
        db!,
        order.id,
        { ...raw, status: "READY_FOR_PICKUP", version: 1 },
        "operator-fixture",
      );
      await updateDelivery(
        db!,
        order.id,
        { ...raw, status: "DELIVERED", version: 2 },
        "operator-fixture",
      );
      assert.equal(
        (await db!.order.findUniqueOrThrow({ where: { id: order.id } }))
          .fulfillmentStatus,
        "DELIVERED",
      );
    });
    it("cancels unpaid holds once without claiming a refund", async () => {
      const order = await createCheckout(db!, input());
      await Promise.all([
        cancelOrder(
          db!,
          order.id,
          order.reference,
          "Customer requested fixture cancellation",
          "owner-fixture",
        ),
        cancelOrder(
          db!,
          order.id,
          order.reference,
          "Customer requested fixture cancellation",
          "owner-fixture",
        ),
      ]);
      const stock = await db!.inventory.findUniqueOrThrow({
        where: { productId: "re-001" },
      });
      assert.equal(stock.stock, 10);
      assert.equal(stock.reserved, 0);
      assert.equal(await db!.refund.count(), 0);
    });
    it("restores paid unshipped stock once while retaining paid status until refund verification", async () => {
      const order = await createCheckout(db!, input());
      await finalizePayment(db!, await verified(order.id));
      await Promise.all([
        cancelOrder(
          db!,
          order.id,
          order.reference,
          "Reviewed pre-dispatch cancellation",
          "owner-fixture",
        ),
        cancelOrder(
          db!,
          order.id,
          order.reference,
          "Reviewed pre-dispatch cancellation",
          "owner-fixture",
        ),
      ]);
      const current = await db!.order.findUniqueOrThrow({
        where: { id: order.id },
      });
      assert.equal(current.paymentStatus, "PAID");
      assert.equal(current.fulfillmentStatus, "CANCELLED");
      assert.ok(current.stockRestoredAt);
      assert.equal(
        (
          await db!.inventory.findUniqueOrThrow({
            where: { productId: "re-001" },
          })
        ).stock,
        10,
      );
      assert.equal(await db!.refund.count(), 1);
      assert.equal(
        await db!.inventoryMovement.count({ where: { delta: { gt: 0 } } }),
        2,
      );
    });
    it("records a late capture after explicit cancellation as refund-required, never dispatchable", async () => {
      const order = await createCheckout(db!, input());
      await cancelOrder(
        db!,
        order.id,
        order.reference,
        "Fixture customer cancellation before payment",
        "owner-fixture",
      );
      await finalizePayment(db!, await verified(order.id));
      const current = await db!.order.findUniqueOrThrow({
        where: { id: order.id },
      });
      assert.equal(current.paymentStatus, "PAID");
      assert.equal(current.fulfillmentStatus, "CANCELLED");
      assert.equal(await db!.refund.count(), 1);
      await assert.rejects(
        allocateReviewedOrder(
          db!,
          order.id,
          order.reference,
          "Do not allocate cancelled order",
          "owner-fixture",
        ),
      );
    });
    it("allocates a paid review once against available stock and supports later cancellation", async () => {
      const order = await createCheckout(db!, input());
      await db!.order.update({
        where: { id: order.id },
        data: { expiresAt: new Date(0) },
      });
      await db!.inventoryReservation.updateMany({
        where: { orderId: order.id },
        data: { expiresAt: new Date(0) },
      });
      await finalizePayment(db!, await verified(order.id));
      await allocateReviewedOrder(
        db!,
        order.id,
        order.reference,
        "Approved fixture stock reallocation",
        "owner-fixture",
      );
      await assert.rejects(
        allocateReviewedOrder(
          db!,
          order.id,
          order.reference,
          "Duplicate allocation rejected",
          "owner-fixture",
        ),
      );
      assert.equal(
        (
          await db!.inventory.findUniqueOrThrow({
            where: { productId: "re-001" },
          })
        ).stock,
        9,
      );
      await cancelOrder(
        db!,
        order.id,
        order.reference,
        "Reviewed fixture cancellation after allocation",
        "owner-fixture",
      );
      assert.equal(
        (
          await db!.inventory.findUniqueOrThrow({
            where: { productId: "re-001" },
          })
        ).stock,
        10,
      );
    });
    it("verifies only a completed matching full test refund and preserves financial history", async () => {
      const order = await createCheckout(db!, input());
      const charge = { ...(await verified(order.id)), id: 42 };
      await finalizePayment(db!, charge);
      await cancelOrder(
        db!,
        order.id,
        order.reference,
        "Reviewed cancellation for fixture refund",
        "owner-fixture",
      );
      const refund = {
        id: 77,
        transaction: 42,
        domain: "test",
        amount: order.totalKobo,
        currency: "NGN",
        status: "processed",
        refunded_at: new Date().toISOString(),
      };
      for (const wrong of [
        { ...refund, domain: "live" },
        { ...refund, amount: 1 },
        { ...refund, status: "pending" },
        { ...refund, transaction: 99 },
      ])
        await assert.rejects(
          verifyCompletedRefund(db!, order.id, "77", "owner-fixture", {
            payment: async () => charge,
            refund: async () => wrong,
          }),
        );
      await Promise.all([
        verifyCompletedRefund(db!, order.id, "77", "owner-fixture", {
          payment: async () => charge,
          refund: async () => refund,
        }),
        verifyCompletedRefund(db!, order.id, "77", "owner-fixture", {
          payment: async () => charge,
          refund: async () => refund,
        }),
      ]);
      const current = await db!.order.findUniqueOrThrow({
        where: { id: order.id },
      });
      assert.equal(current.paymentStatus, "REFUNDED");
      assert.equal(current.totalKobo, 201000);
      assert.equal(
        await db!.auditLog.count({
          where: { subject: order.id, action: "TEST_REFUND_VERIFIED" },
        }),
        1,
      );
      assert.equal(
        (
          await db!.inventory.findUniqueOrThrow({
            where: { productId: "re-001" },
          })
        ).stock,
        10,
      );
    });
    it("disables setup sessions after named accounts exist and revokes disabled named sessions", async () => {
      const bootstrap = await createAdminSession();
      const actor: AdminIdentity = {
        id: "energy-admin",
        name: "Fixture owner",
        role: "OWNER",
        sessionVersion: 0,
        bootstrap: true,
      };
      const owner = await createAdminUser(db!, actor, {
        name: "Fixture Owner",
        email: "owner@example.test",
        password: "fixture-owner-password-123",
        role: "OWNER",
      });
      assert.ok(!(await verifyAdminSession(bootstrap)));
      const ownerIdentity: AdminIdentity = {
        ...owner,
        role: "OWNER",
        bootstrap: false,
      };
      const ownerToken = await createAdminSession(owner);
      assert.ok(await verifyAdminSession(ownerToken));
      const operator = await createAdminUser(db!, ownerIdentity, {
        name: "Fixture Operator",
        email: "operator@example.test",
        password: "fixture-operator-password-123",
        role: "OPERATOR",
      });
      const operatorToken = await createAdminSession(operator);
      assert.ok(await verifyAdminSession(operatorToken));
      const row = await db!.adminUser.findUniqueOrThrow({
        where: { id: operator.id },
      });
      assert.ok(
        await verifyPassword("fixture-operator-password-123", row.passwordHash),
      );
      assert.ok(!row.passwordHash.includes("fixture-operator-password"));
      await editAdminUser(db!, ownerIdentity, operator.id, {
        active: false,
        role: "OPERATOR",
      });
      assert.ok(!(await verifyAdminSession(operatorToken)));
      await assert.rejects(
        editAdminUser(db!, ownerIdentity, owner.id, {
          active: false,
          role: "OPERATOR",
        }),
      );
    });
    it("rejects operator financial actions at the API and accepts named sign-in only after setup", async () => {
      const actor: AdminIdentity = {
        id: "energy-admin",
        name: "Fixture",
        role: "OWNER",
        sessionVersion: 0,
        bootstrap: true,
      };
      const owner = await createAdminUser(db!, actor, {
        name: "Fixture Owner",
        email: "owner@example.test",
        password: "fixture-owner-password-123",
        role: "OWNER",
      });
      const operator = await createAdminUser(
        db!,
        { ...owner, role: "OWNER", bootstrap: false },
        {
          name: "Fixture Operator",
          email: "operator@example.test",
          password: "fixture-operator-password-123",
          role: "OPERATOR",
        },
      );
      const order = await createCheckout(db!, input());
      const cookie = `${ADMIN_COOKIE}=${await createAdminSession(operator)}`;
      const response = await cancelApi(
        new Request(
          "http://localhost:3001/api/admin/orders/" + order.id + "/cancel",
          {
            method: "POST",
            headers: {
              origin: "http://localhost:3001",
              cookie,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              referenceConfirmation: order.reference,
              reason: "Operator cannot approve financial cancellation",
            }),
          },
        ),
        { params: { id: order.id } },
      );
      assert.equal(response.status, 403);
      const request = (email: string, password: string) =>
        new Request("http://localhost:3001/api/admin/login", {
          method: "POST",
          headers: {
            origin: "http://localhost:3001",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });
      process.env.ENERGY_ADMIN_PASSWORD = "fixture-bootstrap-password";
      assert.equal(
        (await loginApi(request("", "fixture-bootstrap-password"))).status,
        401,
      );
      assert.equal(
        (
          await loginApi(
            request("owner@example.test", "fixture-owner-password-123"),
          )
        ).status,
        200,
      );
    });
    it("uses shared atomic database rate limits and records authenticated worker runs", async () => {
      const results = await Promise.all(
        Array.from({ length: 10 }, () =>
          limitRequest("fixture-shared-limit", 4, 60000),
        ),
      );
      assert.equal(results.filter(Boolean).length, 4);
      assert.equal(
        (await cronApi(new Request("http://localhost:3001/api/cron/commerce")))
          .status,
        401,
      );
      process.env.ENERGY_CRON_SECRET =
        "fixture-cron-secret-at-least-32-characters";
      const response = await cronApi(
        new Request("http://localhost:3001/api/cron/commerce", {
          headers: {
            authorization: `Bearer ${process.env.ENERGY_CRON_SECRET}`,
          },
        }),
      );
      assert.equal(response.status, 200);
      assert.equal(
        await db!.jobRun.count({ where: { status: "SUCCEEDED" } }),
        1,
      );
    });
    it("serializes cancellation against dispatch without restocking goods in courier custody", async () => {
      let shipped = 0;
      for (let i = 0; i < 2; i++) {
        const order = await createCheckout(db!, input());
        await finalizePayment(db!, await verified(order.id));
        const raw = {
          trackingReference: "FIXTURE-RACE",
          reason: "Fixture dispatch race",
        };
        await updateDelivery(
          db!,
          order.id,
          { ...raw, status: "PREPARING", version: 0 },
          "operator-fixture",
        );
        await updateDelivery(
          db!,
          order.id,
          { ...raw, status: "READY_FOR_DISPATCH", version: 1 },
          "operator-fixture",
        );
        const cancel = () =>
          cancelOrder(
            db!,
            order.id,
            order.reference,
            "Owner approved cancellation during dispatch race",
            "owner-fixture",
          );
        const dispatch = () =>
          updateDelivery(
            db!,
            order.id,
            { ...raw, status: "DISPATCHED", version: 2 },
            "operator-fixture",
          );
        const results = await Promise.allSettled(
          i === 0 ? [cancel(), dispatch()] : [dispatch(), cancel()],
        );
        assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
        const state = (
          await db!.order.findUniqueOrThrow({ where: { id: order.id } })
        ).fulfillmentStatus;
        assert.ok(["DISPATCHED", "CANCELLED"].includes(state));
        if (state === "DISPATCHED") shipped++;
      }
      assert.equal(
        (
          await db!.inventory.findUniqueOrThrow({
            where: { productId: "re-001" },
          })
        ).stock,
        10 - shipped,
      );
    });
  },
);
