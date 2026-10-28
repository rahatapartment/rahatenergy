export default function Loading() {
  return (
    <main
      id="main"
      className="product-experience product-loading"
      aria-busy="true"
    >
      <span className="eyebrow">THE CONSIDERED COLLECTION</span>
      <p role="status">Preparing your closer look…</p>
      <div className="product-loading-grid" aria-hidden="true">
        <div className="loading-card" />
        <div>
          <div className="product-loading-line" />
          <div className="product-loading-line" />
          <div className="product-loading-line short" />
          <div className="product-loading-action" />
        </div>
      </div>
    </main>
  );
}
