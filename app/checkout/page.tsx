import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { storeData } from "@/lib/store-data";
import { getDb } from "@/lib/db";
import { paymentsReady } from "@/lib/paystack";
import { Checkout } from "@/components/store/Checkout";
export const metadata = { title: "Checkout" };
export const dynamic = "force-dynamic";
export default async function Page() {
  const store = await storeData();
  const db = getDb();
  const options = db ? await db.deliveryOption.findMany({ where: { enabled: true }, orderBy: { label: "asc" } }).catch(() => []) : [];
  return <main id="main" className="checkout-page"><div className="checkout-container">
    <header className="checkout-page-heading"><div><Link href="/cart" className="checkout-back"><ArrowLeft size={14} />Back to your cart</Link><h1>A thoughtful final step.</h1><p>Review your selection and let us take care of the details.</p></div><span className="checkout-secure"><LockKeyhole size={16} />Your checkout</span></header>
    <Checkout products={store.products} options={options} available={store.status === "connected" && paymentsReady() && options.length > 0} />
  </div></main>;
}
