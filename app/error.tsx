"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="page-wrap empty">
      <h1>Something interrupted the connection.</h1>
      <p>Please try again in a moment.</p>
      <button className="button dark" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
