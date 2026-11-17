import { Login } from "@/components/admin/Login";
import { getDb } from "@/lib/db";
export const metadata = { title: "Admin sign in" };
export const dynamic = "force-dynamic";
export default async function Page() {
  const db = getDb();
  let initialSetup = false;
  let unavailable = false;
  try { initialSetup = db ? (await db.adminUser.count()) === 0 : true; }
  catch { unavailable = true; }
  return <Login initialSetup={initialSetup} unavailable={unavailable} />;
}
