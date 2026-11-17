import Link from "next/link";
import { ArrowUpRight, ArrowUp } from "lucide-react";
import type { ReactNode } from "react";

const shopLinks = [
  ["Solar panels", "/categories/solar-panels"],
  ["Solar inverters", "/categories/solar-inverters"],
  ["Lithium batteries", "/categories/battery-storage"],
  ["Portable power", "/categories/power-stations"],
  ["Lighting & accessories", "/shop"],
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
        <div className="footer-invitation">
          <div>
            <span className="footer-kicker">LET’S POWER WHAT’S NEXT</span>
            <h2 id="footer-title">Good energy.<br /><em>Better possibilities.</em></h2>
          </div>
          <div className="footer-invitation-actions">
            <p>Find the right energy solution<br />for your home or business.</p>
            <Link className="footer-quote" href="/request-quote">Let’s talk about your project <ArrowUpRight size={19} aria-hidden="true" /></Link>
            <Link className="footer-contact" href="/contact">Have a question? Get in touch <ArrowUpRight size={15} aria-hidden="true" /></Link>
          </div>
        </div>
        <div className="footer-directory">
          <div className="footer-brand-block">
            <Link href="/" aria-label="Rahat Energy home" className="footer-brand-link">{brand}<span>RAHAT ENERGY<span>ENERGY SOLUTIONS</span></span></Link>
            <p>Solar, storage and everyday essentials.<br />Power for the way you live.</p>
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
