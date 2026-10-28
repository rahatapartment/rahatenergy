import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { storeData } from "@/lib/store-data";
import { CartView } from "@/components/store/CartView";
import { CartHero } from "@/components/store/CartHero";
export const metadata = { title: "Your energy edit" };
export const dynamic = "force-dynamic";
export default async function Page() {
  const { products } = await storeData();
  return (
    <main id="main" className="cart-experience">
      <CartHero />
      <div className="solutions-content-surface cart-content-surface">
        <section
          id="cart-edit"
          className="cart-edit"
          data-header-surface
          aria-labelledby="cart-edit-title"
        >
          <div className="cart-introduction">
            <span className="eyebrow">01 / YOUR SELECTION</span>
            <h2 id="cart-edit-title">
              Room for <em>possibility.</em>
            </h2>
            <p>
              A thoughtful shortlist. A clearer next step. Review your choices
              and the details that still need confirming.
            </p>
          </div>
          <CartView products={products} />
        </section>
        <section
          className="cart-guidance"
          aria-labelledby="cart-guidance-title"
        >
          <div>
            <span className="eyebrow">02 / BEFORE YOUR NEXT STEP</span>
            <h2 id="cart-guidance-title">
              Good energy.
              <br />
              <em>Starts with clarity.</em>
            </h2>
            <Link href="/how-to-order">
              Explore the ordering guide <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="cart-guidance-notes">
            <article>
              <span>01</span>
              <div>
                <h3>A shortlist, at your pace.</h3>
                <p>
                  Your cart is saved in this browser when storage is available.
                  Adding an item does not reserve stock or lock a price.
                </p>
              </div>
            </article>
            <article>
              <span>02</span>
              <div>
                <h3>The right details matter.</h3>
                <p>
                  Product models, compatibility, current prices and availability
                  need confirmation before you commit.
                </p>
              </div>
            </article>
            <article>
              <span>03</span>
              <div>
                <h3>A considered next step.</h3>
                <p>
                  Delivery arrangements and any installation scope require
                  written confirmation. Share your project context when
                  requesting a quote.
                </p>
              </div>
            </article>
          </div>
        </section>
        <section className="cart-closing">
          <span className="eyebrow">MORE THAN INDIVIDUAL PRODUCTS</span>
          <h2>
            A bigger picture?
            <br />
            <em>Begin with your space.</em>
          </h2>
          <p>
            Explore the questions that help shape an energy solution for your
            home, business or larger project.
          </p>
          <Link href="/solutions">
            Explore energy solutions <ArrowUpRight size={19} />
          </Link>
        </section>
      </div>
    </main>
  );
}
