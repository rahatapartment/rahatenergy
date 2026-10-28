import type { PrismaClient, Prisma } from "@prisma/client";
import { CommerceError } from "./commerce-validation";
import {
  lockOrder,
  lockInventory,
  releaseInTransaction,
  assertVerified,
} from "./commerce";
import { deliveryChoices, quoteTransitions } from "./operation-rules";
import {
  quoteUpdateSchema,
  deliveryUpdateSchema,
} from "./operations-validation";
import {
  verifyPayment,
  fetchRefund,
  type VerifiedPayment,
  type ProviderRefund,
} from "./paystack";
const options = { maxWait: 10000, timeout: 15000 };
export async function queueOperationNotice(
  tx: Prisma.TransactionClient,
  order: { id: string; reference: string; customerSnapshot: Prisma.JsonValue },
  key: string,
  description: string,
) {
  if (!process.env.ENERGY_EMAIL_FROM) return;
  const contact = order.customerSnapshot as { email: string; name: string };
  await tx.notification.upsert({
    where: { eventKey: key },
    create: {
      eventKey: key,
      payload: {
        from: process.env.ENERGY_EMAIL_FROM,
        to: [contact.email],
        subject: `Rahat Energy test order ${order.reference} update`,
        text: `Hello ${contact.name},\n\n${description}\nOrder: ${order.reference}\nThis is a test order. No live payment action was performed by this notification.`,
      },
    },
    update: {},
  });
}
export async function updateQuotation(
  db: PrismaClient,
  id: string,
  raw: unknown,
  actor: string,
) {
  const input = quoteUpdateSchema.parse(raw);
  return db.$transaction(async (tx) => {
    const current = await tx.quotation.findUniqueOrThrow({ where: { id } });
    if (current.version !== input.version)
      throw new CommerceError("This enquiry changed. Refresh before saving.");
    if (
      input.status !== current.status &&
      !quoteTransitions[current.status]?.includes(input.status)
    )
      throw new CommerceError(
        "This enquiry status transition is not permitted.",
      );
    const changed = await tx.quotation.updateMany({
      where: { id, version: input.version },
      data: {
        status: input.status,
        internalNotes: input.internalNotes,
        version: { increment: 1 },
      },
    });
    if (changed.count !== 1)
      throw new CommerceError("This enquiry changed. Refresh before saving.");
    await tx.auditLog.create({
      data: {
        actor,
        action: "QUOTATION_UPDATED",
        subject: id,
        data: {
          from: current.status,
          to: input.status,
          internalNotes: input.internalNotes,
          reason: input.reason,
        },
      },
    });
  });
}
export async function updateDelivery(
  db: PrismaClient,
  orderId: string,
  raw: unknown,
  actor: string,
) {
  const input = deliveryUpdateSchema.parse(raw);
  return db.$transaction(async (tx) => {
    await lockOrder(tx, orderId);
    const order = await tx.order.findUniqueOrThrow({
      where: { id: orderId },
      include: { delivery: true },
    });
    const delivery = order.delivery;
    if (
      !delivery ||
      order.paymentStatus !== "PAID" ||
      ["PAYMENT_REVIEW", "CANCELLED", "DELIVERED"].includes(
        order.fulfillmentStatus,
      )
    )
      throw new CommerceError(
        "Delivery cannot be changed in this order state.",
      );
    if (delivery.version !== input.version)
      throw new CommerceError("Delivery changed. Refresh before saving.");
    if (
      input.status !== delivery.status &&
      !deliveryChoices(delivery.status, delivery.method).includes(input.status)
    )
      throw new CommerceError("This delivery transition is not permitted.");
    if (
      input.status === delivery.status &&
      input.trackingReference === (delivery.trackingReference || "")
    )
      return;
    await tx.delivery.update({
      where: { orderId },
      data: {
        status: input.status,
        trackingReference: input.trackingReference || null,
        version: { increment: 1 },
      },
    });
    let fulfillment = order.fulfillmentStatus;
    if (
      ["DISPATCHED", "OUT_FOR_DELIVERY", "FAILED_DELIVERY"].includes(
        input.status,
      )
    )
      fulfillment = "DISPATCHED";
    else if (input.status === "DELIVERED") fulfillment = "DELIVERED";
    else if (input.status === "READY_FOR_PICKUP")
      fulfillment = "READY_FOR_PICKUP";
    else if (fulfillment === "PENDING") fulfillment = "PROCESSING";
    await tx.order.update({
      where: { id: orderId },
      data: { fulfillmentStatus: fulfillment },
    });
    await tx.orderEvent.create({
      data: { orderId, actor, event: `DELIVERY_${input.status}` },
    });
    await tx.auditLog.create({
      data: {
        actor,
        action: "DELIVERY_UPDATED",
        subject: orderId,
        data: {
          from: delivery.status,
          to: input.status,
          trackingReference: input.trackingReference,
          reason: input.reason,
        },
      },
    });
    if (input.status !== delivery.status)
      await queueOperationNotice(
        tx,
        order,
        `delivery:${delivery.id}:${delivery.version + 1}`,
        `Delivery status: ${input.status.replaceAll("_", " ")}.${input.trackingReference ? ` Tracking reference: ${input.trackingReference}.` : ""}`,
      );
  }, options);
}
export async function cancelOrder(
  db: PrismaClient,
  id: string,
  reference: string,
  reason: string,
  actor: string,
) {
  return db.$transaction(async (tx) => {
    await lockOrder(tx, id);
    const order = await tx.order.findUniqueOrThrow({
      where: { id },
      include: { items: true, reservations: true, delivery: true },
    });
    if (reference !== order.reference)
      throw new CommerceError("Enter the exact order reference to confirm.");
    if (order.cancelledAt) return;
    if (["DISPATCHED", "DELIVERED"].includes(order.fulfillmentStatus))
      throw new CommerceError(
        "Dispatched or delivered goods require a separate returns review.",
      );
    if (order.paymentStatus === "REFUNDED")
      throw new CommerceError("This order is already refunded.");
    const paid = order.paymentStatus === "PAID";
    await releaseInTransaction(tx, id, "ADMIN_CANCELLATION");
    let restored = false;
    if (paid && !order.stockRestoredAt) {
      const sold = order.items.filter((i) =>
        order.reservations.some(
          (r) => r.productId === i.productId && r.status === "CONVERTED",
        ),
      );
      if (sold.length) {
        await lockInventory(
          tx,
          sold.map((i) => i.productId),
        );
        for (const item of sold) {
          await tx.inventory.update({
            where: { productId: item.productId },
            data: {
              stock: { increment: item.quantity },
              version: { increment: 1 },
            },
          });
          await tx.inventoryMovement.create({
            data: {
              productId: item.productId,
              delta: item.quantity,
              reservedDelta: 0,
              reason: "Approved pre-dispatch cancellation",
              actor,
              eventKey: `cancel-restock:${id}:${item.productId}`,
            },
          });
        }
        restored = true;
      }
    }
    await tx.order.update({
      where: { id },
      data: {
        cancelledAt: new Date(),
        cancellationReason: reason,
        stockRestoredAt: restored ? new Date() : undefined,
        fulfillmentStatus: "CANCELLED",
        paymentStatus: paid ? "PAID" : "CANCELLED",
      },
    });
    if (order.delivery)
      await tx.delivery.update({
        where: { orderId: id },
        data: { status: "CANCELLED", version: { increment: 1 } },
      });
    if (paid)
      await tx.refund.upsert({
        where: { orderId: id },
        create: {
          orderId: id,
          amountKobo: order.totalKobo,
          reason,
          requestedBy: actor,
        },
        update: {},
      });
    else
      await tx.payment.updateMany({
        where: { orderId: id, status: { notIn: ["PAID", "REFUNDED"] } },
        data: { status: "CANCELLED", initializationState: "FAILED" },
      });
    await tx.orderEvent.create({
      data: {
        orderId: id,
        actor,
        event: paid
          ? "ORDER_CANCELLED_TEST_REFUND_REQUIRED"
          : "ORDER_CANCELLED",
      },
    });
    await tx.auditLog.create({
      data: {
        actor,
        action: "ORDER_CANCELLED",
        subject: id,
        data: { reason, stockRestored: restored, refundRequired: paid },
      },
    });
    await queueOperationNotice(
      tx,
      order,
      `cancellation:${id}`,
      paid
        ? "Your test order was cancelled. A test refund requires separate verification; cancellation alone does not mark payment refunded."
        : "Your unpaid test order was cancelled.",
    );
  }, options);
}
export async function allocateReviewedOrder(
  db: PrismaClient,
  id: string,
  reference: string,
  reason: string,
  actor: string,
) {
  return db.$transaction(async (tx) => {
    await lockOrder(tx, id);
    const order = await tx.order.findUniqueOrThrow({
      where: { id },
      include: { items: true },
    });
    if (
      order.reference !== reference ||
      order.paymentStatus !== "PAID" ||
      order.fulfillmentStatus !== "PAYMENT_REVIEW" ||
      order.cancelledAt
    )
      throw new CommerceError("This payment review cannot be allocated.");
    await lockInventory(
      tx,
      order.items.map((i) => i.productId),
    );
    const inventory = await tx.inventory.findMany({
      where: { productId: { in: order.items.map((i) => i.productId) } },
    });
    for (const item of order.items) {
      const stock = inventory.find((i) => i.productId === item.productId);
      if (!stock?.enabled || stock.stock - stock.reserved < item.quantity)
        throw new CommerceError(
          "There is insufficient enabled stock to resolve this review.",
        );
    }
    for (const item of order.items) {
      await tx.inventory.update({
        where: { productId: item.productId },
        data: {
          stock: { decrement: item.quantity },
          version: { increment: 1 },
        },
      });
      await tx.inventoryReservation.updateMany({
        where: { orderId: id, productId: item.productId },
        data: { status: "CONVERTED" },
      });
      await tx.inventoryMovement.create({
        data: {
          productId: item.productId,
          delta: -item.quantity,
          reservedDelta: 0,
          reason: "Approved payment-review allocation",
          actor,
          eventKey: `review-allocation:${id}:${item.productId}`,
        },
      });
    }
    await tx.order.update({
      where: { id },
      data: { fulfillmentStatus: "PENDING" },
    });
    await tx.orderEvent.create({
      data: { orderId: id, actor, event: "PAYMENT_REVIEW_STOCK_ALLOCATED" },
    });
    await tx.auditLog.create({
      data: {
        actor,
        action: "PAYMENT_REVIEW_RESOLVED",
        subject: id,
        data: { reason },
      },
    });
  }, options);
}
export async function verifyCompletedRefund(
  db: PrismaClient,
  orderId: string,
  refundId: string,
  actor: string,
  gateway: {
    payment: (reference: string) => Promise<VerifiedPayment>;
    refund: (id: string) => Promise<ProviderRefund>;
  } = { payment: verifyPayment, refund: fetchRefund },
) {
  const order = await db.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { refund: true, payments: true },
  });
  if (!order.refund || !order.cancelledAt)
    throw new CommerceError(
      "A reviewed cancellation and refund request are required.",
    );
  if (order.refund.status === "VERIFIED") return;
  const payment = order.payments.find((p) => p.status === "PAID");
  if (!payment)
    throw new CommerceError("No paid payment is available for this refund.");
  const [charge, refund] = await Promise.all([
    gateway.payment(payment.reference),
    gateway.refund(refundId),
  ]);
  assertVerified(payment, charge);
  const transactionId =
    typeof refund.transaction === "number"
      ? refund.transaction
      : refund.transaction.id;
  if (
    String(refund.id) !== refundId ||
    refund.domain !== "test" ||
    refund.currency !== "NGN" ||
    refund.status !== "processed" ||
    refund.amount !== order.refund.amountKobo ||
    !Number.isSafeInteger(charge.id) ||
    transactionId !== charge.id ||
    !refund.refunded_at ||
    !Number.isFinite(new Date(refund.refunded_at).getTime())
  )
    throw new CommerceError(
      "The provider has not confirmed a matching completed full test refund.",
      422,
    );
  return db.$transaction(async (tx) => {
    await lockOrder(tx, orderId);
    const current = await tx.refund.findUniqueOrThrow({ where: { orderId } });
    if (current.status === "VERIFIED") return;
    const latest = await tx.order.findUniqueOrThrow({ where: { id: orderId } });
    if (
      latest.fulfillmentStatus !== "CANCELLED" ||
      latest.paymentStatus !== "PAID"
    )
      throw new CommerceError(
        "The order state changed. Review before verifying a refund.",
      );
    await tx.refund.update({
      where: { orderId },
      data: {
        status: "VERIFIED",
        providerRefundId: refundId,
        verifiedAt: new Date(refund.refunded_at!),
        verifiedBy: actor,
      },
    });
    await tx.order.update({
      where: { id: orderId },
      data: { paymentStatus: "REFUNDED" },
    });
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: "REFUNDED" },
    });
    await tx.orderEvent.create({
      data: { orderId, actor, event: "PROVIDER_TEST_REFUND_VERIFIED" },
    });
    await tx.auditLog.create({
      data: {
        actor,
        action: "TEST_REFUND_VERIFIED",
        subject: orderId,
        data: { refundId, amountKobo: current.amountKobo },
      },
    });
    await queueOperationNotice(
      tx,
      latest,
      `refund:${current.id}`,
      `The provider has confirmed the test refund for order total NGN ${(current.amountKobo / 100).toFixed(2)}.`,
    );
  }, options);
}
