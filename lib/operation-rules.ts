export const quoteStatuses = ["NEW", "CONTACTED", "QUOTED", "CLOSED"] as const;
export const deliveryTransitions: Record<string, string[]> = {
  PENDING: ["PREPARING"],
  PREPARING: ["READY_FOR_DISPATCH"],
  READY_FOR_DISPATCH: ["DISPATCHED"],
  DISPATCHED: ["OUT_FOR_DELIVERY", "DELIVERED", "FAILED_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED", "FAILED_DELIVERY"],
  FAILED_DELIVERY: ["READY_FOR_DISPATCH"],
  DELIVERED: [],
  CANCELLED: [],
  READY_FOR_PICKUP: ["DELIVERED"],
};
export function deliveryChoices(status: string, method: string) {
  if (method === "PICKUP") {
    return (
      (
        {
          PENDING: ["PREPARING"],
          PREPARING: ["READY_FOR_PICKUP"],
          READY_FOR_PICKUP: ["DELIVERED"],
        } as Record<string, string[]>
      )[status] || []
    );
  }
  return deliveryTransitions[status] || [];
}
export const quoteTransitions: Record<string, string[]> = {
  NEW: ["CONTACTED", "QUOTED", "CLOSED"],
  CONTACTED: ["QUOTED", "CLOSED"],
  QUOTED: ["CONTACTED", "CLOSED"],
  CLOSED: ["CONTACTED"],
};
