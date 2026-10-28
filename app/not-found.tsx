import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="page-wrap empty">
      <span className="eyebrow">404 / A DIFFERENT DIRECTION</span>
      <h1>Let’s find your way.</h1>
      <p>This page could not be found.</p>
      <Link className="button dark" href="/shop">
        Explore the collection
      </Link>
    </main>
  );
}
