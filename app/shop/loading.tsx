export default function Loading() {
  return (
    <main id="main" className="shop-experience shop-page shop-loading" aria-busy="true">
      <div className="shop-container">
        <header className="shop-heading"><h1>Shop our collection</h1><p role="status">Loading products…</p></header>
        <div aria-hidden="true">
          <div className="shop-loading-controls" />
          <div className="shop-product-grid">{[1, 2, 3, 4, 5, 6, 7, 8].map(number => <div className="loading-card" key={number} />)}</div>
        </div>
      </div>
    </main>
  );
}
