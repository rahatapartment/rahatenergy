import { CartTrigger } from "@/components/store/CartTrigger";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { storeData } from "@/lib/store-data";
import { getDb } from "@/lib/db";
import { paymentMode, paymentsReady } from "@/lib/paystack";
import { Checkout } from "@/components/store/Checkout";
export const metadata = { title: "Checkout" };
export const dynamic = "force-dynamic";
export default async function Page() {
  const store = await storeData();
  const db = getDb();
  const options = db ? await db.deliveryOption.findMany({ where: { enabled: true }, orderBy: { label: "asc" } }).catch(() => []) : [];
  const paymentAvailable = paymentsReady();
  return <main id="main" className="checkout-page"><div className="checkout-container">
    <header className="checkout-page-heading"><div><CartTrigger className="checkout-back"><ArrowLeft size={14} />Edit your cart</CartTrigger><h1>A thoughtful final step.</h1><p>Review your selection and let us take care of the details.</p></div><span className="checkout-secure"><LockKeyhole size={16} />Your checkout</span></header>
    <Checkout testMode={paymentAvailable && paymentMode() === "test"} products={store.products} options={options} available={store.status === "connected"} paymentAvailable={paymentAvailable} />
  </div></main>;
}
