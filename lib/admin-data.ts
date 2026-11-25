import { getDb } from "./db";
import { paymentMode } from "./paystack";
export async function adminData() {
  const db = getDb();
  if (!db) return null;
  try {
    const mode = paymentMode();
    const reference = mode === "live"
      ? { startsWith: "REPAY-LIVE-" }
      : { startsWith: "REPAY-", not: { startsWith: "REPAY-LIVE-" } };
    const ordersInMode = { payments: { some: { reference } } };
    const [
      orders,
      deliveries,
      customers,
      quotations,
      movements,
      paidSales,
      paidOrders,
      pendingOrders,
      lowStock,
      pendingDeliveries,
      newQuotes,
    ] = await Promise.all([
      db.order.findMany({
        take: 100,
        orderBy: { createdAt: "desc" },
        include: { customer: true, items: true },
      }),
      db.delivery.findMany({
        take: 100,
        orderBy: { updatedAt: "desc" },
        include: { order: { select: { reference: true } } },
      }),
      db.customer.findMany({
        take: 100,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { orders: true } } },
      }),
      db.quotation.findMany({ take: 100, orderBy: { createdAt: "desc" } }),
      db.inventoryMovement.findMany({
        take: 50,
        orderBy: { createdAt: "desc" },
      }),
      db.payment.aggregate({
        where: { status: "PAID", reference },
        _sum: { amountKobo: true },
      }),
      db.order.count({ where: { ...ordersInMode, paymentStatus: "PAID" } }),
      db.order.count({ where: { ...ordersInMode, paymentStatus: "PENDING" } }),
      db.inventory.findMany(),
      db.delivery.count({ where: { status: { not: "DELIVERED" }, order: ordersInMode } }),
      db.quotation.count({ where: { status: "NEW" } }),
    ]);
    return {
      mode,
      orders,
      deliveries,
      customers,
      quotations,
      movements,
      metrics: {
        sales: paidSales._sum.amountKobo ?? 0,
        paidOrders,
        pendingOrders,
        lowStock: lowStock.filter(
          (p) => p.stock - p.reserved <= p.lowStockThreshold,
        ).length,
        pendingDeliveries,
        newQuotes,
      },
    };
  } catch {
    return null;
  }
}
