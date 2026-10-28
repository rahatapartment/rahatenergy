"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef, type ReactNode } from "react";
import {
  LayoutDashboard,
  Package,
  Layers,
  ClipboardList,
  Truck,
  Users,
  MessageSquare,
  ArrowUpRight,
  Settings,
  Activity,
  Menu,
  X,
  Search,
  LogOut,
  LockKeyhole,
  ChevronRight,
} from "lucide-react";
import { Brand } from "@/components/store/Chrome";
const navigation = [
  ["Overview", "/admin", LayoutDashboard, "Workspace"],
  ["Products", "/admin/products", Package, "Commerce"],
  ["Inventory", "/admin/inventory", Layers, "Commerce"],
  ["Orders", "/admin/orders", ClipboardList, "Commerce"],
  ["Deliveries", "/admin/deliveries", Truck, "Commerce"],
  ["Customers", "/admin/customers", Users, "Relationships"],
  ["Quotations", "/admin/quotations", MessageSquare, "Relationships"],
  ["Monitoring", "/admin/monitoring", Activity, "Administration"],
  ["Settings", "/admin/settings", Settings, "Administration"],
] as const;
const descriptions: Record<string, string> = {
  Overview: "A clear perspective on your independent energy operations.",
  Products:
    "Your controlled collection. Fifteen identities, one source of truth.",
  Inventory:
    "Manage prices, stock and purchase availability with a recorded reason.",
  Orders: "Review payment and fulfilment with the details that matter.",
  Deliveries: "Keep dispatch, collection and delivery progress in view.",
  Customers: "Customer relationships, handled with care.",
  Quotations: "Turn project context into a considered conversation.",
  Monitoring:
    "Inspect recorded worker activity, notifications and audit history.",
  Settings: "Independent service configuration and administrator access.",
};
export function AdminShell({
  title,
  children,
  authenticated,
  preview = false,
}: {
  title: string;
  children: ReactNode;
  authenticated: boolean;
  preview?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    setOpen(false);
    setQuery("");
  }, [pathname]);
  useEffect(() => {
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [open]);
  async function logout() {
    if (pending) return;
    setPending(true);
    setError("");
    try {
      const res = await fetch("/api/admin/logout", { method: "POST" });
      if (!res.ok) throw new Error();
      router.push("/admin/login");
      router.refresh();
    } catch {
      setError("Unable to sign out. Please try again.");
    } finally {
      setPending(false);
    }
  }
  const section = title.replace(" walkthrough", "");
  return (
    <div className="admin-shell admin-premium">
      <a className="skip-link" href="#main">
        Skip to operations
      </a>
      <div className="admin-mobile-bar">
        <Link href="/" aria-label="Rahat Energy home">
          <Brand />
        </Link>
        <button
          ref={toggle}
          type="button"
          aria-label={
            open ? "Close operations navigation" : "Open operations navigation"
          }
          aria-expanded={open}
          aria-controls="operations-sidebar"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
      <aside
        id="operations-sidebar"
        className={`admin-sidebar${open ? " is-open" : ""}`}
      >
        <Link
          className="admin-desktop-brand"
          href="/"
          aria-label="Rahat Energy home"
        >
          <Brand />
        </Link>
        <div className="admin-workspace-label">
          <span>R / E</span>
          <div>
            Operations workspace<small>Independent energy commerce</small>
          </div>
        </div>
        <label className="admin-nav-search">
          <Search size={15} aria-hidden="true" />
          <span className="sr-only">Find an admin section</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a section…"
            type="search"
          />
        </label>
        <nav aria-label="Operations">
          {["Workspace", "Commerce", "Relationships", "Administration"].map(
            (group) => {
              const links = navigation.filter(
                ([label, , , g]) =>
                  g === group &&
                  label.toLowerCase().includes(query.toLowerCase().trim()),
              );
              return (
                links.length > 0 && (
                  <div className="admin-nav-group" key={group}>
                    <span>{group}</span>
                    {links.map(([label, href, Icon]) => {
                      const target = preview
                        ? `/admin/preview${href === "/admin" ? "" : href.slice(6)}`
                        : href;
                      const active =
                        pathname === target ||
                        (!["/admin", "/admin/preview"].includes(target) &&
                          pathname.startsWith(`${target}/`));
                      return (
                        <Link
                          key={href}
                          href={target}
                          aria-current={active ? "page" : undefined}
                        >
                          <Icon size={17} strokeWidth={1.6} />
                          <span>{label}</span>
                          {active && <ChevronRight size={13} />}
                        </Link>
                      );
                    })}
                  </div>
                )
              );
            },
          )}
          {!navigation.some(([label]) =>
            label.toLowerCase().includes(query.toLowerCase().trim()),
          ) && (
            <p className="admin-nav-empty" role="status">
              No sections found.
            </p>
          )}
        </nav>
        <div className="admin-sidebar-bottom">
          <div className="admin-access-state">
            <LockKeyhole size={16} />
            <div>
              {preview
                ? "Read-only walkthrough"
                : authenticated
                  ? "Administrator session"
                  : "Editing locked"}
              <small>
                {preview
                  ? "Illustrative content only"
                  : authenticated
                    ? "Server permissions apply"
                    : "Sign in to access records"}
              </small>
            </div>
          </div>
          {authenticated ? (
            <button
              className="admin-signout"
              disabled={pending}
              onClick={logout}
            >
              <LogOut size={16} />
              {pending ? "Signing out…" : "Sign out"}
            </button>
          ) : (
            <Link className="admin-signout" href="/admin/login">
              <ArrowUpRight size={16} />
              Administrator sign in
            </Link>
          )}
          {error && (
            <p className="admin-logout-error" role="alert">
              {error}
            </p>
          )}
        </div>
      </aside>
      <main id="main" className="admin-content">
        <div className="admin-topbar">
          <div>
            <span>Operations</span>
            <ChevronRight size={12} />
            <strong>{section}</strong>
          </div>
          <span className="admin-mode-pill">
            {preview ? "Read-only sample" : "Test commerce"}
          </span>
          <Link href="/">
            View storefront <ArrowUpRight size={14} />
          </Link>
        </div>
        <header className="admin-header">
          <div>
            <span className="eyebrow">RAHAT ENERGY / OPERATIONS</span>
            <h1>{title}</h1>
            <p>
              {descriptions[section] ||
                "Review the record and its permitted operational actions."}
            </p>
          </div>
          <div className="admin-header-mark" aria-hidden="true">
            R<span>/</span>E
          </div>
        </header>
        <div className="admin-page-body">{children}</div>
        <footer className="admin-workspace-footer">
          <span>RAHAT ENERGY · INDEPENDENT OPERATIONS</span>
          <span>
            {preview
              ? "Sample controls cannot write records"
              : "Controlled catalogue · Test payments only"}
          </span>
        </footer>
      </main>
    </div>
  );
}
