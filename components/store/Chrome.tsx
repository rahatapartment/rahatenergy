"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowUpRight, ShoppingBag, Search } from "lucide-react";
import { useState, useEffect, useRef, type ReactNode } from "react";
import { useCart } from "./CartProvider";
export function Brand() {
  return (
    <span className="brand brand-official">
      <Image
        src="/images/logo.png"
        alt="Rahat Energy"
        width={1301}
        height={1209}
        sizes="(max-width: 600px) 84px, 120px"
        className="brand-logo"
      />
    </span>
  );
}
export function Chrome({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const isHome = path === "/";
  const hasCinematicHero =
    isHome ||
    [
      "/shop",
      "/about",
      "/contact",
      "/faq",
      "/cart",
      "/track-order",
      "/solutions",
      "/solutions/home",
      "/solutions/business",
      "/solutions/bulk-projects",
    ].includes(path);
  const [scrolled, setScrolled] = useState(false);
  const [overContent, setOverContent] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);
  const content = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 24);
      const introduction =
        document.querySelector<HTMLElement>("[data-header-surface]") ||
        document.getElementById("energy-introduction");
      setOverContent(
        Boolean(introduction && introduction.getBoundingClientRect().top <= 90),
      );
    };
    const scroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", scroll);
    return () => {
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", scroll);
      cancelAnimationFrame(frame);
    };
  }, [path]);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const surface = content.current;
    surface?.setAttribute("inert", "");
    const desktop = matchMedia("(min-width: 1001px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      document.body.style.overflow = previous;
      surface?.removeAttribute("inert");
      desktop.removeEventListener("change", closeOnDesktop);
    };
  }, [open]);
  useEffect(() => {
    setOpen(false);
  }, [path]);
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);
  const { lines } = useCart();
  if (path.startsWith("/admin")) return <>{children}</>;
  const links = [
    ["Shop", "/shop"],
    ["Solutions", "/solutions"],
    ["About", "/about"],
    ["Contact", "/contact"],
    ["Help", "/faq"],
  ];
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header
        ref={header}
        className={`site-header cinematic-header ${hasCinematicHero ? "header-home" : "header-interior"} ${scrolled ? "header-scrolled" : ""} ${overContent ? "header-over-content" : ""} ${open ? "header-menu-open" : ""}`}
        onKeyDown={(event) => {
          if (!open || event.key !== "Tab") return;
          const controls = Array.from(
            header.current?.querySelectorAll<HTMLElement>("a,button,input") ||
              [],
          ).filter((element) => element.getClientRects().length > 0);
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
      >
        <Link className="header-brand" href="/" aria-label="Rahat Energy home">
          <Brand />
        </Link>
        <nav
          className={open ? "main-nav open" : "main-nav"}
          aria-label="Main navigation"
          id="main-navigation"
        >
          {links.map(([label, href], index) => (
            <Link
              aria-current={
                path === href || (href !== "/" && path.startsWith(`${href}/`))
                  ? "page"
                  : undefined
              }
              key={href}
              href={href}
              onClick={() => setOpen(false)}
            >
              <span className="nav-index" aria-hidden="true">
                0{index + 1}
              </span>
              {label}
              <ArrowUpRight
                className="nav-mobile-arrow"
                size={22}
                aria-hidden="true"
              />
            </Link>
          ))}
          <div className="navigation-bottom">
            <span className="eyebrow">ENERGY, BEAUTIFULLY ENGINEERED.</span>
            <Link href="/request-quote" onClick={() => setOpen(false)}>
              Let’s talk about your project <ArrowUpRight size={18} />
            </Link>
          </div>
        </nav>
        <div className="header-actions">
          <Link
            className="icon-button header-search"
            href="/shop#product-search"
            aria-label="Search products"
          >
            <Search size={20} />
          </Link>
          <Link
            className="cart-link"
            href="/cart"
            aria-label={`Shopping bag, ${lines.reduce((n, l) => n + l.quantity, 0)} items`}
          >
            <ShoppingBag size={20} />
            <span>{lines.reduce((n, l) => n + l.quantity, 0)}</span>
          </Link>
          <Link className="button dark header-quote" href="/request-quote">
            Request a quote <ArrowUpRight size={16} />
          </Link>
          <button
            ref={menuButton}
            className="icon-button mobile-menu"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="main-navigation"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <div ref={content} className="store-content">
        {children}
        <footer>
          {(isHome || path === "/about") && (
            <div className="footer-signature">
              <span>
                rahat<span>energy.</span>
              </span>
              <p>
                A considered approach.
                <br />A world of possibility.
              </p>
            </div>
          )}
          <div className="footer-top">
            <div>
              <Link href="/">
                <Brand />
              </Link>
              <p>
                Power for the way you live.
                <br />
                Possibilities for what comes next.
              </p>
            </div>
            <div>
              <h3>Explore</h3>
              <Link href="/shop">Shop all products</Link>
              <Link href="/solutions">Energy solutions</Link>
              <Link href="/about">Our story</Link>
              <Link href="/request-quote">Plan your energy project</Link>
            </div>
            <div>
              <h3>Here to help</h3>
              <Link href="/contact">Contact us</Link>
              <Link href="/how-to-order">How to order</Link>
              <Link href="/faq">FAQs</Link>
              <Link href="/track-order">Order support</Link>
              <Link href="/admin">Operations</Link>
            </div>
            <div className="footer-note">
              <span className="eyebrow">DEVELOPMENT PREVIEW</span>
              <p>
                Catalogue details are provisional. Prices, availability and
                delivery arrangements require confirmation.
              </p>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Rahat Energy</span>
            <nav aria-label="Policies" className="footer-policy-links">
              <Link href="/policies/delivery">Delivery</Link>
              <Link href="/policies/returns">Returns & warranty</Link>
              <Link href="/policies/privacy">Privacy</Link>
              <Link href="/policies/terms">Terms</Link>
            </nav>
          </div>
        </footer>
      </div>
    </>
  );
}
