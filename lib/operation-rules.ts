export const quoteStatuses = ["NEW", "CONTACTED", "QUOTED", "CLOSED"] as const;

const courierStages = ["PENDING", "PREPARING", "READY_FOR_DISPATCH", "DISPATCHED", "OUT_FOR_DELIVERY", "DELIVERED"];
const pickupStages = ["PENDING", "PREPARING", "READY_FOR_PICKUP", "DELIVERED"];
const courierFulfilment = ["PENDING", "PROCESSING", "DISPATCHED", "DELIVERED"];
const pickupFulfilment = ["PENDING", "PROCESSING", "READY_FOR_PICKUP", "DELIVERED"];

function laterStages(stages: string[], status: string) {
  const index = stages.indexOf(status);
  return index < 0 ? [] : stages.slice(index + 1);
}

export function deliveryStatuses(method: string) {
  return method === "PICKUP"
    ? pickupStages
    : [...courierStages.slice(0, -1), "FAILED_DELIVERY", "DELIVERED"];
}

export function deliveryChoices(status: string, method: string) {
  if (method === "PICKUP") return laterStages(pickupStages, status);
  if (status === "FAILED_DELIVERY") return laterStages(courierStages, "PREPARING");
  const later = laterStages(courierStages, status);
  if (status === "DISPATCHED" || status === "OUT_FOR_DELIVERY")
    return [...later.slice(0, -1), "FAILED_DELIVERY", "DELIVERED"];
  return later;
}

export function fulfilmentStatuses(method: string) {
  return method === "PICKUP" ? pickupFulfilment : courierFulfilment;
}

export function fulfilmentChoices(status: string, method: string) {
  return laterStages(fulfilmentStatuses(method), status);
}

export function statusLabel(status: string, method: string) {
  if (status === "DELIVERED" && method === "PICKUP") return "Collected";
  const text = status.toLowerCase().replaceAll("_", " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export const quoteTransitions: Record<string, string[]> = {
  NEW: ["CONTACTED", "QUOTED", "CLOSED"],
  CONTACTED: ["QUOTED", "CLOSED"],
  QUOTED: ["CONTACTED", "CLOSED"],
  CLOSED: ["CONTACTED"],
};
