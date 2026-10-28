export default function Loading() {
  return (
    <main id="main" className="page-wrap" aria-busy="true">
      <div className="skeleton title-skeleton" />
      <div className="product-grid">
        {[1, 2, 3].map((n) => (
          <div key={n} className="skeleton card-skeleton" />
        ))}
        <span className="sr-only" role="status">
          Loading your energy essentials…
        </span>
      </div>
    </main>
  );
}
