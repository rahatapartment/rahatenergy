import Link from "next/link";
export function Disconnected() {
  return (
    <div className="empty">
      <h2>Ready when you are.</h2>
      <p>
        Database setup is deferred. No records or successful operations are
        being simulated here.
      </p>
      <Link className="button dark" href="/admin/preview">
        Explore the read-only walkthrough
      </Link>
    </div>
  );
}
export function ListFilters({
  query,
  status,
  statuses,
  placeholder = "Reference, name or email",
}: {
  query: string;
  status: string;
  statuses: string[];
  placeholder?: string;
}) {
  return (
    <form className="shop-toolbar" method="GET">
      <label className="search-field">
        <span className="sr-only">Search records</span>
        <input
          name="q"
          defaultValue={query}
          placeholder={placeholder}
          maxLength={100}
        />
      </label>
      <label className="sort-field">
        Status
        <select name="status" defaultValue={status}>
          <option value="ALL">All statuses</option>
          {statuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <button className="button dark" type="submit">
        Apply filters
      </button>
    </form>
  );
}
export function Pagination({
  page,
  total,
  query,
  status,
  extra = {},
}: {
  page: number;
  total: number;
  extra?: Record<string, string>;
  query: string;
  status: string;
}) {
  const pages = Math.max(1, Math.ceil(total / 20));
  const href = (p: number) =>
    `?${new URLSearchParams({ page: String(p), q: query, status, ...extra }).toString()}`;
  return (
    <nav className="pagination" aria-label="Results pages">
      <span>
        {total} records · Page {page} of {pages}
      </span>
      <div>
        {page > 1 && (
          <Link className="button outline" href={href(page - 1)}>
            Previous
          </Link>
        )}
        {page < pages && (
          <Link className="button outline" href={href(page + 1)}>
            Next
          </Link>
        )}
      </div>
    </nav>
  );
}
export function listParams(
  search: { q?: string; status?: string; page?: string },
  statuses: readonly string[],
) {
  return {
    q: (search.q || "").slice(0, 100).trim(),
    status: statuses.includes(search.status || "") ? search.status! : "ALL",
    page: Math.max(1, Math.min(10000, Math.trunc(Number(search.page) || 1))),
  };
}
