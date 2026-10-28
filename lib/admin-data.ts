import { getDb } from "./db";
export async function adminData() {
  const db = getDb();
  if (!db) return null;
  try {
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
        where: { status: "PAID" },
        _sum: { amountKobo: true },
      }),
      db.order.count({ where: { paymentStatus: "PAID" } }),
      db.order.count({ where: { paymentStatus: "PENDING" } }),
      db.inventory.findMany(),
      db.delivery.count({ where: { status: { not: "DELIVERED" } } }),
      db.quotation.count({ where: { status: "NEW" } }),
    ]);
    return {
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
