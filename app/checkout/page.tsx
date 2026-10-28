import { storeData } from "@/lib/store-data";
import { getDb } from "@/lib/db";
import { paymentsReady } from "@/lib/paystack";
import { Checkout } from "@/components/store/Checkout";
export const metadata = { title: "Secure test checkout" };
export const dynamic = "force-dynamic";
export default async function Page() {
  const store = await storeData();
  const db = getDb();
  const options = db
    ? await db.deliveryOption
        .findMany({ where: { enabled: true }, orderBy: { label: "asc" } })
        .catch(() => [])
    : [];
  return (
    <main id="main" className="page-wrap">
      <div className="page-heading">
        <span className="eyebrow">YOUR NEXT STEP</span>
        <h1>
          Your energy.
          <br />
          <em>Ready for review.</em>
        </h1>
        <p>
          Review current prices, choose your delivery option and continue to
          secure test checkout.
        </p>
      </div>
      <Checkout
        products={store.products}
        options={options}
        available={
          store.status === "connected" && paymentsReady() && options.length > 0
        }
      />
    </main>
  );
}
