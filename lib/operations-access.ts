import { redirect } from "next/navigation";
import { currentAdmin } from "./admin-auth";
import { getDb } from "./db";
export async function operationsAccess() {
  const actor = await currentAdmin();
  const db = getDb();
  if (
    !actor &&
    (db ||
      (process.env.ENERGY_ADMIN_PASSWORD &&
        process.env.ENERGY_ADMIN_SESSION_SECRET))
  )
    redirect("/admin/login");
  return { actor, db: actor ? db : null };
}
