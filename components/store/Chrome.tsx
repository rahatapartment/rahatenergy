"use client";
import Link from "next/link";
import Image from "@/components/WebImage";
import { usePathname } from "next/navigation";
import { categoryContent } from "@/lib/content";
import { Menu, X, ArrowUpRight, ShoppingBag, Search } from "lucide-react";
import { useState, useEffect, useRef, type ReactNode } from "react";
import { useCart } from "./CartProvider";
import { Footer } from "./Footer";
import { useStoreMotion } from "./useStoreMotion";
import { CartDrawer } from "./CartDrawer";
export function Brand() {
  return (
    <span className="brand brand-official">
      <Image
        src="/images/logo.webp"
        alt="Rahat Energy"
        width={2500}
        height={2500}
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
    categoryContent.some(({ slug }) => path === `/categories/${slug}`) ||
    [
      "/about",
      "/contact",
      "/request-quote",
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
  useStoreMotion(content, path);
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
  const { lines, openCart } = useCart();
  const cartCount = lines.reduce((total, line) => total + line.quantity, 0);
  if (path.startsWith("/admin") && path !== "/admin/login") return <>{children}</>;
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
          <span className="header-wordmark" aria-hidden="true">Rahat Energy</span>
        </Link>
        <nav
          className={open ? "main-nav open" : "main-nav"}
          aria-label="Main navigation"
          id="main-navigation"
        >
          {links.map(([label, href]) => (
            <Link
              aria-current={
                path === href || path.startsWith(`${href}/`) ||
                  (href === "/shop" && path.startsWith("/categories/"))
                  ? "page"
                  : undefined
              }
              key={href}
              href={href}
              onClick={() => setOpen(false)}
            >
              {label}
              <ArrowUpRight
                className="nav-mobile-arrow"
                size={22}
                aria-hidden="true"
              />
            </Link>
          ))}
          <div className="navigation-bottom">
            <Link href="/track-order" onClick={() => setOpen(false)}>
              Track your order <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </nav>
        <div className="header-actions">
          <Link
            className="icon-button header-search"
            href="/shop#product-search"
            aria-label="Search products"
            onClick={() => setOpen(false)}
          >
            <Search size={18} aria-hidden="true" />
            <span className="header-search-label">Search</span>
          </Link>
          <button
            type="button"
            className="cart-link"
            aria-label={`Shopping bag, ${cartCount} items`}
            aria-haspopup="dialog"
            aria-controls="cart-drawer"
            onClick={() => { setOpen(false); openCart(); }}
          >
            <ShoppingBag size={19} aria-hidden="true" />
            <span>{cartCount}</span>
          </button>
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
        <Footer brand={<Brand />} />
      </div>
      <CartDrawer />
    </>
  );
}
