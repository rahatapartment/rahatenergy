import { Prisma, PrismaClient } from "@prisma/client";
import { createHash, randomBytes } from "node:crypto";
import { catalogue } from "./catalogue";
import {
  CommerceError,
  hashToken,
  type CheckoutInput,
  linesSchema,
  checkoutSchema,
} from "./commerce-validation";
import {
  initializePayment,
  type VerifiedPayment,
  validPaymentUrl,
} from "./paystack";
export const orderCookie = (reference: string) => `energy_order_${reference}`;
const txOptions = { maxWait: 10_000, timeout: 15_000 };
export const lockOrder = async (tx: Prisma.TransactionClient, id: string) => {
  await tx.$queryRaw`SELECT "id" FROM "Order" WHERE "id"=${id} FOR UPDATE`;
};
export async function lockInventory(
  tx: Prisma.TransactionClient,
  ids: string[],
) {
  await tx.$queryRaw(
    Prisma.sql`SELECT "productId" FROM "Inventory" WHERE "productId" IN (${Prisma.join([...ids].sort())}) ORDER BY "productId" FOR UPDATE`,
  );
}
async function priced(
  tx: Prisma.TransactionClient,
  lines: CheckoutInput["lines"],
  deliveryOptionId: string,
) {
  const option = await tx.deliveryOption.findUnique({
    where: { id: deliveryOptionId },
  });
  if (!option?.enabled)
    throw new CommerceError("Select an available delivery or pickup option.");
  const inventory = await tx.inventory.findMany({
    where: { productId: { in: lines.map((l) => l.productId) } },
  });
  const items = lines.map((line) => {
    const p = inventory.find((i) => i.productId === line.productId);
    const definition = catalogue.find((d) => d.id === line.productId);
    if (!p || !definition || !p.enabled || p.priceKobo === null)
      throw new CommerceError(
        "A selected product is not available for purchase.",
      );
    if (p.stock - p.reserved < line.quantity)
      throw new CommerceError(
        `Insufficient available stock for ${definition.name}.`,
      );
    return {
      productId: p.productId,
      name: definition.name,
      sku: definition.sku,
      quantity: line.quantity,
      unitPriceKobo: p.priceKobo,
    };
  });
  const subtotalKobo = items.reduce(
    (sum, i) => sum + i.quantity * i.unitPriceKobo,
    0,
  );
  const totalKobo = subtotalKobo + option.feeKobo;
  if (
    !Number.isSafeInteger(totalKobo) ||
    totalKobo < 1 ||
    totalKobo > 2_000_000_000
  )
    throw new CommerceError("This order requires a quotation.");
  return {
    items,
    option,
    subtotalKobo,
    deliveryFeeKobo: option.feeKobo,
    totalKobo,
  };
}
export async function checkoutQuote(
  db: PrismaClient,
  lines: CheckoutInput["lines"],
  optionId: string,
) {
  linesSchema.parse(lines);
  await expireReservations(db);
  return db.$transaction((tx) => priced(tx, lines, optionId), txOptions);
}
export async function createCheckout(db: PrismaClient, input: CheckoutInput) {
  input = checkoutSchema.parse(input);
  await expireReservations(db);
  const tokenHash = hashToken(input.accessToken);
  const hash = createHash("sha256")
    .update(
      JSON.stringify({
        ...input,
        lines: [...input.lines].sort((a, b) =>
          a.productId.localeCompare(b.productId),
        ),
        accessToken: tokenHash,
      }),
    )
    .digest("hex");
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${input.checkoutKey}))::text`;
    const existing = await tx.order.findUnique({
      where: { checkoutKey: input.checkoutKey },
      include: { payments: true, items: true, delivery: true },
    });
    if (existing) {
      if (
        existing.accessTokenHash !== tokenHash ||
        existing.checkoutHash !== hash
      )
        throw new CommerceError(
          "Checkout attempt details changed. Start a new attempt.",
        );
      return existing;
    }
    await tx.$queryRaw`SELECT "id" FROM "DeliveryOption" WHERE "id"=${input.deliveryOptionId} FOR SHARE`;
    await lockInventory(
      tx,
      input.lines.map((l) => l.productId),
    );
    const quote = await priced(tx, input.lines, input.deliveryOptionId);
    if (quote.totalKobo !== input.expectedTotalKobo)
      throw new CommerceError(
        "Prices or delivery charges changed. Review your total again.",
      );
    if (
      quote.option.method === "DELIVERY" &&
      (!input.address.line1 ||
        !input.address.city ||
        !input.address.state ||
        quote.option.state?.toLowerCase() !==
          input.address.state.toLowerCase() ||
        (quote.option.city &&
          quote.option.city.toLowerCase() !== input.address.city.toLowerCase()))
    )
      throw new CommerceError(
        "The address must match the selected delivery area.",
        400,
      );
    const customer = await tx.customer.upsert({
      where: { email: input.customer.email },
      create: input.customer,
      update: {},
    });
    const reference = `RE-${randomBytes(10).toString("hex").toUpperCase()}`;
    const paymentReference = `REPAY-${randomBytes(16).toString("hex")}`;
    const expiresAt = new Date(Date.now() + 15 * 60_000);
    const order = await tx.order.create({
      data: {
        reference,
        accessTokenHash: tokenHash,
        checkoutKey: input.checkoutKey,
        checkoutHash: hash,
        expiresAt,
        customerId: customer.id,
        customerSnapshot: input.customer,
        subtotalKobo: quote.subtotalKobo,
        deliveryFeeKobo: quote.deliveryFeeKobo,
        totalKobo: quote.totalKobo,
        items: { create: quote.items },
        delivery: {
          create: {
            method: quote.option.method,
            feeKobo: quote.deliveryFeeKobo,
            address: {
              ...input.address,
              optionLabel: quote.option.label,
              pickupAddress: quote.option.pickupAddress,
            },
          },
        },
        payments: {
          create: { reference: paymentReference, amountKobo: quote.totalKobo },
        },
        reservations: {
          create: quote.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            expiresAt,
          })),
        },
        events: {
          create: { actor: "customer", event: "ORDER_CREATED_STOCK_RESERVED" },
        },
      },
      include: { payments: true, items: true, delivery: true },
    });
    for (const i of quote.items) {
      await tx.inventory.update({
        where: { productId: i.productId },
        data: {
          reserved: { increment: i.quantity },
          version: { increment: 1 },
        },
      });
      await tx.inventoryMovement.create({
        data: {
          productId: i.productId,
          delta: 0,
          reservedDelta: i.quantity,
          reason: "Checkout stock reservation",
          actor: "checkout",
          eventKey: `reserve:${order.id}:${i.productId}`,
        },
      });
    }
    return order;
  }, txOptions);
}
export async function releaseInTransaction(
  tx: Prisma.TransactionClient,
  orderId: string,
  reason: string,
) {
  const active = await tx.inventoryReservation.findMany({
    where: { orderId, status: "ACTIVE" },
    orderBy: { productId: "asc" },
  });
  if (!active.length) return;
  await lockInventory(
    tx,
    active.map((r) => r.productId),
  );
  for (const r of active) {
    await tx.inventory.update({
      where: { productId: r.productId },
      data: { reserved: { decrement: r.quantity }, version: { increment: 1 } },
    });
    await tx.inventoryReservation.update({
      where: { id: r.id },
      data: { status: reason === "EXPIRED" ? "EXPIRED" : "RELEASED" },
    });
    await tx.inventoryMovement.create({
      data: {
        productId: r.productId,
        delta: 0,
        reservedDelta: -r.quantity,
        reason,
        actor: "commerce",
        eventKey: `release:${r.id}`,
      },
    });
  }
}
export async function closeUnpaidOrder(
  db: PrismaClient,
  id: string,
  reason: "EXPIRED" | "FAILED",
) {
  return db.$transaction(async (tx) => {
    await lockOrder(tx, id);
    const order = await tx.order.findUniqueOrThrow({ where: { id } });
    if (["PAID", "REFUNDED"].includes(order.paymentStatus)) return;
    if (reason === "EXPIRED" && order.expiresAt.getTime() > Date.now()) return;
    await releaseInTransaction(tx, id, reason);
    if (["FAILED", "CANCELLED", "REFUNDED"].includes(order.paymentStatus))
      return;
    await tx.order.update({
      where: { id },
      data: {
        paymentStatus: reason === "FAILED" ? "FAILED" : "CANCELLED",
        fulfillmentStatus: "CANCELLED",
      },
    });
    await tx.payment.updateMany({
      where: { orderId: id, status: { not: "PAID" } },
      data: {
        status: reason === "FAILED" ? "FAILED" : "CANCELLED",
        initializationState: "FAILED",
      },
    });
    await tx.orderEvent.create({
      data: {
        orderId: id,
        actor: "commerce",
        event:
          reason === "EXPIRED" ? "PAYMENT_WINDOW_EXPIRED" : "PAYMENT_FAILED",
      },
    });
  }, txOptions);
}
export async function beginPayment(
  db: PrismaClient,
  orderId: string,
  gateway = initializePayment,
) {
  const order = await db.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { payments: true },
  });
  const payment = order.payments[0];
  if (order.paymentStatus === "PAID") return `/orders/${order.reference}`;
  if (order.expiresAt.getTime() <= Date.now()) {
    await closeUnpaidOrder(db, order.id, "EXPIRED");
    throw new CommerceError("The reservation expired. Start a new checkout.");
  }
  if (["FAILED", "CANCELLED", "REFUNDED"].includes(order.paymentStatus))
    throw new CommerceError(
      "This payment attempt is closed. Start a new checkout.",
    );
  if (payment.authorizationUrl && validPaymentUrl(payment.authorizationUrl))
    return payment.authorizationUrl;
  const claim = await db.payment.updateMany({
    where: { id: payment.id, status: "PENDING", initializationState: "NEW" },
    data: { initializationState: "IN_PROGRESS" },
  });
  if (claim.count !== 1)
    throw new CommerceError(
      "This payment session is being prepared. Check your order or try again shortly.",
    );
  try {
    const result = await gateway({
      email: (order.customerSnapshot as { email: string }).email,
      amountKobo: order.totalKobo,
      reference: payment.reference,
    });
    if (
      result.reference !== payment.reference ||
      !validPaymentUrl(result.authorization_url)
    )
      throw new CommerceError("Invalid payment session.", 502);
    const saved = await db.payment.updateMany({
      where: { id: payment.id, status: "PENDING" },
      data: {
        initializationState: "READY",
        authorizationUrl: result.authorization_url,
      },
    });
    if (!saved.count) {
      const latest = await db.order.findUniqueOrThrow({
        where: { id: order.id },
      });
      if (latest.paymentStatus === "PAID") return `/orders/${order.reference}`;
      throw new CommerceError("This checkout is closed.");
    }
    return result.authorization_url;
  } catch (error) {
    await closeUnpaidOrder(db, order.id, "FAILED");
    throw error;
  }
}
export function assertVerified(
  payment: { reference: string; amountKobo: number },
  verified: VerifiedPayment,
) {
  const amount =
    Number.isSafeInteger(verified.requested_amount) &&
    Number(verified.requested_amount) > 0
      ? verified.requested_amount
      : verified.amount;
  if (
    verified.reference !== payment.reference ||
    verified.domain !== "test" ||
    verified.currency !== "NGN" ||
    amount !== payment.amountKobo ||
    !Number.isSafeInteger(verified.amount) ||
    verified.amount < payment.amountKobo
  )
    throw new CommerceError(
      "Payment verification did not match the saved test order.",
      422,
    );
}
export async function finalizePayment(
  db: PrismaClient,
  verified: VerifiedPayment,
) {
  const payment = await db.payment.findUnique({
    where: { reference: verified.reference },
  });
  if (!payment) throw new CommerceError("Unknown payment reference.", 404);
  assertVerified(payment, verified);
  if (verified.status !== "success") {
    if (["failed", "abandoned"].includes(verified.status))
      await closeUnpaidOrder(db, payment.orderId, "FAILED");
    const latest = await db.order.findUniqueOrThrow({
      where: { id: payment.orderId },
    });
    return {
      reference: latest.reference,
      paid: latest.paymentStatus === "PAID",
      review: latest.fulfillmentStatus === "PAYMENT_REVIEW",
    };
  }
  if (
    !verified.paid_at ||
    !Number.isFinite(new Date(verified.paid_at).getTime())
  )
    throw new CommerceError("Invalid payment timestamp.", 422);
  return db.$transaction(async (tx) => {
    await lockOrder(tx, payment.orderId);
    const order = await tx.order.findUniqueOrThrow({
      where: { id: payment.orderId },
      include: { items: true, reservations: true, delivery: true },
    });
    if (order.paymentStatus === "REFUNDED")
      return { reference: order.reference, paid: false, review: false };
    if (order.paymentStatus === "PAID")
      return {
        reference: order.reference,
        paid: true,
        review: order.fulfillmentStatus === "PAYMENT_REVIEW",
      };
    const snapshot = order.customerSnapshot as { email: string; name: string };
    if (
      verified.customer?.email?.toLowerCase() !== snapshot.email.toLowerCase()
    )
      throw new CommerceError("Payment customer mismatch.", 422);
    const active = order.reservations.filter((r) => r.status === "ACTIVE");
    const valid =
      !order.cancelledAt &&
      active.length === order.items.length &&
      active.every((r) => r.expiresAt.getTime() > Date.now());
    if (valid) {
      await lockInventory(
        tx,
        active.map((r) => r.productId),
      );
      for (const r of active) {
        await tx.inventory.update({
          where: { productId: r.productId },
          data: {
            stock: { decrement: r.quantity },
            reserved: { decrement: r.quantity },
            version: { increment: 1 },
          },
        });
        await tx.inventoryReservation.update({
          where: { id: r.id },
          data: { status: "CONVERTED" },
        });
        await tx.inventoryMovement.create({
          data: {
            productId: r.productId,
            delta: -r.quantity,
            reservedDelta: -r.quantity,
            reason: "Verified test payment",
            actor: "paystack",
            eventKey: `sale:${r.id}`,
          },
        });
      }
    } else await releaseInTransaction(tx, order.id, "LATE_PAYMENT_RELEASE");
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: "PAID", paidAt: new Date(verified.paid_at!) },
    });
    await tx.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        fulfillmentStatus: order.cancelledAt
          ? "CANCELLED"
          : valid
            ? "PENDING"
            : "PAYMENT_REVIEW",
      },
    });
    if (order.cancelledAt)
      await tx.refund.upsert({
        where: { orderId: order.id },
        create: {
          orderId: order.id,
          amountKobo: order.totalKobo,
          reason: "Late test payment after approved cancellation",
          requestedBy: "commerce",
        },
        update: {},
      });
    await tx.orderEvent.create({
      data: {
        orderId: order.id,
        actor: "paystack",
        event: valid
          ? "TEST_PAYMENT_VERIFIED_STOCK_DEDUCTED"
          : "LATE_TEST_PAYMENT_REQUIRES_REVIEW",
      },
    });
    if (process.env.ENERGY_EMAIL_FROM) {
      await tx.notification.upsert({
        where: { eventKey: `order-confirmation:${order.id}` },
        create: {
          eventKey: `order-confirmation:${order.id}`,
          payload: {
            from: process.env.ENERGY_EMAIL_FROM,
            to: [snapshot.email],
            subject: `Rahat Energy test order ${order.reference}`,
            text: `Hello ${snapshot.name},\n\nYour TEST payment for ${order.reference} has been verified.\n${order.items.map((i) => `${i.quantity} x ${i.name}: NGN ${((i.quantity * i.unitPriceKobo) / 100).toFixed(2)}`).join("\n")}\nTotal: NGN ${(order.totalKobo / 100).toFixed(2)}\nDelivery method: ${order.delivery?.method}.\n${valid ? "Your order awaits processing." : "Your payment requires staff review because the inventory reservation expired. Do not assume dispatch is confirmed."}\nNo live payment has been taken.`,
          },
        },
        update: {},
      });
    }
    return { reference: order.reference, paid: true, review: !valid };
  }, txOptions);
}
export async function expireReservations(db: PrismaClient) {
  const orders = await db.order.findMany({
    where: {
      paymentStatus: { in: ["PENDING", "INITIATED"] },
      expiresAt: { lte: new Date() },
    },
    take: 100,
    orderBy: { expiresAt: "asc" },
    select: { id: true },
  });
  for (const order of orders) await closeUnpaidOrder(db, order.id, "EXPIRED");
  return orders.length;
}
export const fulfillmentTransitions: Record<string, string[]> = {
  PENDING: ["PROCESSING"],
  PROCESSING: ["READY_FOR_PICKUP", "DISPATCHED"],
  READY_FOR_PICKUP: ["DELIVERED"],
  DISPATCHED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
  PAYMENT_REVIEW: [],
};
export async function updateFulfillment(
  db: PrismaClient,
  id: string,
  status: string,
  actor = "energy-admin",
) {
  return db.$transaction(async (tx) => {
    await lockOrder(tx, id);
    const order = await tx.order.findUniqueOrThrow({
      where: { id },
      include: { delivery: true },
    });
    if (
      order.paymentStatus !== "PAID" ||
      !fulfillmentTransitions[order.fulfillmentStatus]?.includes(status)
    )
      throw new CommerceError("This fulfillment transition is not permitted.");
    if (
      (status === "READY_FOR_PICKUP" && order.delivery?.method !== "PICKUP") ||
      (status === "DISPATCHED" && order.delivery?.method !== "DELIVERY")
    )
      throw new CommerceError("Status does not match the delivery method.");
    await tx.order.update({
      where: { id },
      data: { fulfillmentStatus: status },
    });
    const deliveryStatus: Record<string, string> = {
      PROCESSING: "PREPARING",
      READY_FOR_PICKUP: "READY_FOR_PICKUP",
      DISPATCHED: "DISPATCHED",
      DELIVERED: "DELIVERED",
    };
    if (deliveryStatus[status])
      await tx.delivery.update({
        where: { orderId: id },
        data: { status: deliveryStatus[status], version: { increment: 1 } },
      });
    await tx.orderEvent.create({
      data: {
        orderId: id,
        actor,
        event: `FULFILLMENT_${status}`,
      },
    });
    await tx.auditLog.create({
      data: {
        actor,
        action: "FULFILLMENT_UPDATE",
        subject: id,
        data: { from: order.fulfillmentStatus, to: status },
      },
    });
  }, txOptions);
}
