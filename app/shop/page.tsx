import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { storeData } from "@/lib/store-data";
import { categories } from "@/lib/catalogue";
import { ShopHero } from "@/components/store/ShopHero";
import { Shop } from "@/components/store/Shop";
export const metadata = {
  title: "The energy collection",
  description:
    "Explore a considered collection of solar panels, inverters, battery storage and energy essentials. Build your shortlist with Rahat Energy.",
};
export const dynamic = "force-dynamic";
export default async function Page({
  searchParams,
}: {
  searchParams: { category?: string; search?: string };
}) {
  const { products, status } = await storeData();
  return (
    <main id="main" className="shop-experience">
      <ShopHero
        productCount={products.length}
        categoryCount={categories.length}
      />
      <div className="shop-catalogue-surface">
        <section
          className="collection-catalogue"
          id="collection-catalogue"
          data-header-surface
          aria-labelledby="catalogue-title"
        >
          <div className="collection-reveal-signature" aria-hidden="true">
            <span />
            <span>R / E</span>
            <span />
          </div>
          <div className="collection-section-heading">
            <div>
              <span className="eyebrow">01 / FIND YOUR STARTING POINT</span>
              <h2 id="catalogue-title">
                Your energy.
                <br />
                <em>Your edit.</em>
              </h2>
            </div>
            <p>
              From capturing the light to keeping it for later.
              <br />
              Explore, refine and make a shortlist.
            </p>
          </div>
          <div className="collection-service-note">
            <span className="collection-note-dot" aria-hidden="true" />
            <p>
              Provisional catalogue · Images are illustrative.{" "}
              {status === "connected"
                ? "Prices and availability are shown where confirmed."
                : status === "unavailable"
                  ? "Inventory is temporarily unavailable. Request a quote for product details."
                  : "Pricing and availability require confirmation. You can save products to a shortlist."}
            </p>
            <Link href="/request-quote">
              Ask a question <ArrowUpRight size={14} />
            </Link>
          </div>
          <Shop
            products={products}
            initialCategory={searchParams.category}
            initialQuery={searchParams.search}
          />
        </section>
        <section
          className="collection-consultation"
          aria-labelledby="collection-consultation-title"
        >
          <div className="consultation-art">
            <Image
              src="/images/panels.webp"
              alt="Illustrative solar equipment in an architectural setting"
              fill
              sizes="(max-width: 700px) 90vw, 38vw"
            />
            <span>THE RIGHT QUESTIONS MAKE A DIFFERENCE.</span>
          </div>
          <div className="consultation-copy">
            <span className="eyebrow">
              A LITTLE GUIDANCE. A CLEARER PICTURE.
            </span>
            <h2 id="collection-consultation-title">
              Not sure where
              <br />
              <em>to begin?</em>
            </h2>
            <p>
              You do not need to have every answer. Share your space, your
              priorities and the equipment you are considering.
            </p>
            <Link href="/request-quote" className="consultation-action">
              Start a conversation{" "}
              <span>
                <ArrowUpRight size={21} strokeWidth={1.2} />
              </span>
            </Link>
            <Link href="/solutions" className="consultation-secondary">
              Explore solutions for your space <ArrowUpRight size={16} />
            </Link>
          </div>
        </section>
        <div className="collection-endnote">
          <span>ENERGY, BEAUTIFULLY ENGINEERED.</span>
          <a href="#collection-catalogue">
            Return to the collection <ArrowUpRight size={15} />
          </a>
        </div>
      </div>
    </main>
  );
}
