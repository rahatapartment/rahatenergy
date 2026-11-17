export const permissionLabels = {
  "products.view": "View products",
  "products.edit": "Edit products and images",
  "inventory.view": "View inventory",
  "inventory.increase": "Increase stock",
  "inventory.decrease": "Reduce stock",
  "inventory.price": "Change prices",
  "inventory.settings": "Change stock alerts and purchase availability",
  "customers.view": "View customers",
  "customers.manage": "Add and edit customers",
  "orders.view": "View orders",
  "orders.manage": "Update order fulfilment",
  "deliveries.view": "View deliveries",
  "deliveries.manage": "Manage delivery options and updates",
  "quotations.view": "View enquiries",
  "quotations.manage": "Manage enquiries",
  "activity.view": "View audit trail and monitoring",
} as const;
export type AdminPermission = keyof typeof permissionLabels;
export const permissionKeys = Object.keys(
  permissionLabels,
) as AdminPermission[];
export type PermissionActor = { role: string; permissions?: string[] };
export function hasPermission(
  actor: PermissionActor | null | undefined,
  permission: AdminPermission,
) {
  if (!actor) return false;
  if (actor.role === "OWNER") return true;
  const permissions = actor.permissions ?? [];
  if (permissions.includes(permission)) return true;
  if (permission.endsWith(".view"))
    return permissions.some(
      (p) =>
        permissionKeys.includes(p as AdminPermission) &&
        p.startsWith(permission.split(".")[0] + "."),
    );
  return false;
}
export function inventoryPermissionErrors(
  actor: PermissionActor,
  before: {
    stock: number;
    priceKobo: number | null;
    enabled: boolean;
    lowStockThreshold: number;
  },
  after: typeof before,
) {
  const required: AdminPermission[] = [];
  if (after.stock > before.stock) required.push("inventory.increase");
  if (after.stock < before.stock) required.push("inventory.decrease");
  if (after.priceKobo !== before.priceKobo) required.push("inventory.price");
  if (
    after.enabled !== before.enabled ||
    after.lowStockThreshold !== before.lowStockThreshold
  )
    required.push("inventory.settings");
  return required.filter((p) => !hasPermission(actor, p));
}
