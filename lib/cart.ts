import { catalogue, type StoreProduct } from "./catalogue";
export type CartLine = { productId: string; quantity: number };
export function normalizeCart(input: unknown): CartLine[] {
  if (!Array.isArray(input)) return [];
  const merged = new Map<string, number>();
  for (const line of input) {
    if (
      !line ||
      !catalogue.some((p) => p.id === line.productId) ||
      !Number.isInteger(line.quantity) ||
      line.quantity < 1
    )
      continue;
    merged.set(
      line.productId,
      Math.min(99, (merged.get(line.productId) || 0) + line.quantity),
    );
  }
  return [...merged].map(([productId, quantity]) => ({ productId, quantity }));
}
export function cartSummary(lines: CartLine[], products: StoreProduct[]) {
  let subtotal = 0;
  let unknownPrice = false;
  for (const line of lines) {
    const p = products.find((p) => p.id === line.productId);
    if (!p || p.priceKobo === null) unknownPrice = true;
    else subtotal += p.priceKobo * line.quantity;
  }
  return {
    subtotal: unknownPrice ? null : subtotal,
    count: lines.reduce((sum, l) => sum + l.quantity, 0),
  };
}
