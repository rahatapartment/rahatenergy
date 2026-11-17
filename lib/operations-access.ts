import { hasPermission, type AdminPermission } from "./admin-permissions";
import { redirect } from "next/navigation";
import { currentAdmin } from "./admin-auth";
import { getDb } from "./db";
export async function operationsAccess(permission?: AdminPermission | "owner") {
  const actor = await currentAdmin();
  const db = getDb();
  if (
    !actor &&
    (db ||
      (process.env.ENERGY_ADMIN_PASSWORD &&
        process.env.ENERGY_ADMIN_SESSION_SECRET))
  )
    redirect("/admin/login");
  if (
    actor &&
    permission &&
    (permission === "owner"
      ? actor.role !== "OWNER"
      : !hasPermission(actor, permission))
  )
    redirect("/admin?access=restricted");
  return { actor, db: actor ? db : null };
}
