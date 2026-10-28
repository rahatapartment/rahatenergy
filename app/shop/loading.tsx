export default function Loading() {
  return (
    <main id="main" className="shop-experience shop-loading" aria-busy="true">
      <div className="shop-loading-opening">
        <span className="eyebrow">THE RAHAT ENERGY COLLECTION</span>
        <h1>A new perspective.</h1>
        <p role="status">Preparing the collection…</p>
      </div>
      <div className="shop-loading-body" aria-hidden="true">
        <div className="shop-loading-controls" />
        <div className="discovery-products view-grid">
          {[1, 2, 3, 4, 5, 6].map((number) => (
            <div className="loading-card" key={number} />
          ))}
        </div>
      </div>
    </main>
  );
}
