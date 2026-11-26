import Link from "next/link";
import { ArrowUpRight, ArrowUp } from "lucide-react";
import Image from "@/components/WebImage";
import type { ReactNode } from "react";

const shopLinks = [
  ["Solar panels", "/categories/solar-panels"],
  ["Solar inverters", "/categories/solar-inverters"],
  ["Lithium batteries", "/categories/battery-storage"],
  ["Portable power", "/categories/power-stations"],
  ["Solar lighting", "/categories/solar-lighting"],
  ["Energy accessories", "/categories/energy-accessories"],
  ["Fans", "/categories/fans"],
  ["Massage chairs", "/categories/massage-chairs"],
];
const companyLinks = [
  ["Our story", "/about"],
  ["Energy solutions", "/solutions"],
  ["Contact our team", "/contact"],
  ["Request a quote", "/request-quote"],
];
const supportLinks = [
  ["How to order", "/how-to-order"],
  ["Track your order", "/track-order"],
  ["Frequently asked questions", "/faq"],
  ["Delivery information", "/policies/delivery"],
  ["Returns & warranty", "/policies/returns"],
];

export function Footer({ brand }: { brand: ReactNode }) {
  return (
    <footer className="premium-footer" aria-labelledby="footer-title">
      <div className="premium-footer-inner">
        <section className="footer-invitation" aria-labelledby="footer-title">
          <Image
            className="footer-invitation-photo"
            src="/images/hero.webp"
            alt=""
            fill
            sizes="(max-width: 720px) 94vw, (max-width: 1440px) 68vw, 960px"
          />
          <h2 id="footer-title">
            <span data-motion-line>Good energy.</span>
            <em data-motion-line>Better possibilities.</em>
          </h2>
          <div className="footer-invitation-actions">
            <Link className="footer-quote" href="/request-quote">Request a quote <ArrowUpRight size={18} aria-hidden="true" /></Link>
            <Link className="footer-contact" href="/contact">Contact our team <ArrowUpRight size={16} aria-hidden="true" /></Link>
          </div>
        </section>
        <div className="footer-directory">
          <div className="footer-brand-block">
            <Link href="/" aria-label="Rahat Energy home" className="footer-brand-link">{brand}<span>Rahat Energy</span></Link>
            <p>Solar, storage and everyday essentials for homes and businesses.</p>
            <Link href="/shop" className="footer-collection-link">Explore the collection <ArrowUpRight size={15} aria-hidden="true" /></Link>
          </div>
          <nav className="footer-directory-column" aria-label="Shop products"><h3>The collection</h3>{shopLinks.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}</nav>
          <nav className="footer-directory-column" aria-label="About Rahat Energy"><h3>Rahat Energy</h3>{companyLinks.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}</nav>
          <nav className="footer-directory-column" aria-label="Customer support"><h3>Here to help</h3>{supportLinks.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}</nav>
        </div>
        <div className="footer-legal-row">
          <span>© {new Date().getFullYear()} Rahat Energy. All rights reserved.</span>
          <nav aria-label="Legal information"><Link href="/policies/privacy">Privacy policy</Link><Link href="/policies/terms">Terms & conditions</Link><Link href="/admin">Team access</Link></nav>
          <a href="#main" className="footer-back-top">Back to top <ArrowUp size={15} aria-hidden="true" /></a>
        </div>
      </div>
    </footer>
  );
}
