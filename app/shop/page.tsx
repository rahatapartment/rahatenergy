import { storeData } from "@/lib/store-data";
import { Shop } from "@/components/store/Shop";
export const metadata = {
  title: "Shop Rahat Energy",
  description: "Shop Rahat solar panels, inverters, lithium batteries, lighting and portable power stations.",
};
export const dynamic = "force-dynamic";
export default async function Page({ searchParams }: {
  searchParams: { category?: string; search?: string };
}) {
  const { products, status } = await storeData();
  return (
    <main id="main" className="shop-experience shop-page">
      <section className="shop-container" id="collection-catalogue" aria-labelledby="shop-title">
        <header className="shop-heading">
          <h1 id="shop-title">Shop our collection</h1>
          <p>Solar, storage and everyday essentials from Rahat Energy.</p>
        </header>
        {status === "unavailable" && <p className="shop-status" role="status">Live availability is temporarily unavailable. Contact us to confirm stock.</p>}
        <Shop products={products} initialCategory={searchParams.category} initialQuery={searchParams.search} />
      </section>
    </main>
  );
}
