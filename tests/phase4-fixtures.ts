// Disposable browser-QA fixtures only. Never used by application seeds or routes.
import { PrismaClient } from "@prisma/client";
import { randomBytes, randomUUID } from "node:crypto";
import { writeFileSync } from "node:fs";
import { seedCatalogue } from "../lib/seed-catalogue";
import { createCheckout, finalizePayment } from "../lib/commerce";
const url = process.env.ENERGY_TEST_DATABASE_URL;
if (!url) throw new Error("Disposable test database required.");
const target = new URL(url);
if (
  !["127.0.0.1", "localhost"].includes(target.hostname) ||
  !target.pathname.endsWith("_test")
)
  throw new Error("Fixture setup refuses application or external databases.");
const db = new PrismaClient({ datasources: { db: { url } } });
async function main() {
  await seedCatalogue(db);
  await db.$transaction(async (tx) => {
    await tx.adminUser.deleteMany();
    await tx.refund.deleteMany();
    await tx.orderEvent.deleteMany();
    await tx.notification.deleteMany();
    await tx.payment.deleteMany();
    await tx.delivery.deleteMany();
    await tx.inventoryReservation.deleteMany();
    await tx.orderItem.deleteMany();
    await tx.order.deleteMany();
    await tx.customer.deleteMany();
    await tx.quotation.deleteMany();
    await tx.auditLog.deleteMany();
    await tx.inventoryMovement.deleteMany();
    await tx.deliveryOption.deleteMany();
    await tx.rateLimitBucket.deleteMany();
    await tx.jobRun.deleteMany();
    await tx.inventory.updateMany({
      data: {
        stock: 50,
        reserved: 0,
        priceKobo: 100000,
        enabled: true,
        version: 0,
      },
    });
  });
  const option = await db.deliveryOption.create({
    data: {
      label: "FIXTURE ONLY delivery",
      method: "DELIVERY",
      state: "Fixture State",
      city: "Fixture City",
      feeKobo: 1000,
      enabled: true,
    },
  });
  const orders = [];
  const charges: Record<string, unknown> = {};
  for (let i = 0; i < 3; i++) {
    const input = {
      checkoutKey: randomUUID(),
      accessToken: randomBytes(32).toString("base64url"),
      expectedTotalKobo: 201000,
      lines: [
        { productId: "re-001", quantity: 1 },
        { productId: "re-004", quantity: 1 },
      ],
      deliveryOptionId: option.id,
      customer: {
        name: `Fixture Customer ${i}`,
        email: `customer${i}@example.test`,
        phone: "08000000000",
      },
      address: {
        line1: "Fixture street",
        city: "Fixture City",
        state: "Fixture State",
      },
      consent: true as const,
    };
    const order = await createCheckout(db, input);
    const charge = {
      id: 501 + i,
      reference: order.payments[0].reference,
      domain: "test",
      status: "success",
      amount: order.totalKobo,
      currency: "NGN",
      paid_at: new Date().toISOString(),
      customer: { email: input.customer.email },
    };
    if (i === 2) {
      await db.order.update({
        where: { id: order.id },
        data: { expiresAt: new Date(0) },
      });
      await db.inventoryReservation.updateMany({
        where: { orderId: order.id },
        data: { expiresAt: new Date(0) },
      });
    }
    await finalizePayment(db, charge);
    orders.push({ id: order.id, reference: order.reference });
    charges[charge.reference] = charge;
  }
  let enquiryId = "";
  for (let i = 0; i < 25; i++) {
    const quote = await db.quotation.create({
      data: {
        name: `Fixture Contact ${i}`,
        email: `quote${i}@example.test`,
        phone: "08000000000",
        location: "Fixture City",
        requirements: "Fixture project requirements for browser testing only.",
      },
    });
    if (i === 0) enquiryId = quote.id;
  }
  writeFileSync(
    "/tmp/energy-phase4-fixtures.json",
    JSON.stringify(
      {
        orders,
        enquiryId,
        charges,
        refund: {
          id: 77,
          transaction: 501,
          domain: "test",
          amount: 201000,
          currency: "NGN",
          status: "processed",
          refunded_at: new Date().toISOString(),
        },
      },
      null,
      2,
    ),
  );
  console.log(
    "Disposable browser fixtures prepared; no application or Supabase data was used.",
  );
}
main().finally(() => db.$disconnect());
