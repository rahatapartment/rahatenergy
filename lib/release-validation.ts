export type MigrationEvidence = { migration_name: string; checksum: string; finished_at: Date | null; rolled_back_at: Date | null };
export function migrationProblems(expected: { name: string; checksum: string }[], applied: MigrationEvidence[]) {
  const problems: string[] = [];
  for (const migration of expected) {
    const records = applied.filter(row => row.migration_name === migration.name && !row.rolled_back_at);
    const completed = records.find(row => row.finished_at);
    if (records.some(row => !row.finished_at)) problems.push(`Unfinished migration: ${migration.name}`);
    if (!completed) problems.push(`Pending migration: ${migration.name}`);
    else if (completed.checksum !== migration.checksum) problems.push(`Migration differs from the applied version: ${migration.name}`);
  }
  return problems;
}

/** Return fixed diagnostic text only; never echo provider messages or credentials. */
export function releaseFailureReason(error: unknown) {
  const e = error as { message?: unknown; code?: unknown; errorCode?: unknown; meta?: { code?: unknown } } | null;
  const message = typeof e?.message === "string" ? e.message.toLowerCase() : "";
  const code = String(e?.code ?? e?.errorCode ?? "");
  if (message.includes("tenant/user") || message.includes("tenant or user"))
    return "DATABASE_TENANT_NOT_FOUND: Supabase could not match the configured pooler host and project/user. No migration was attempted.";
  if (code === "P1000" || message.includes("authentication failed") || message.includes("password authentication"))
    return "DATABASE_AUTH_FAILED: The database rejected authentication. No migration was attempted.";
  if (code === "P1001" || message.includes("can't reach database") || message.includes("enotfound") || message.includes("econnrefused"))
    return "DATABASE_UNREACHABLE: The build environment could not reach the configured database.";
  if (code === "P1002" || message.includes("timed out") || message.includes("timeout"))
    return "DATABASE_TIMEOUT: The database connection or query timed out.";
  if (message.includes("certificate") || message.includes("ssl") || code === "P1011")
    return "DATABASE_TLS_FAILED: The secure database connection could not be established.";
  if (code === "P2021" || e?.meta?.code === "42P01" || (message.includes("does not exist") && (message.includes("relation") || message.includes("table"))))
    return "DATABASE_TABLE_MISSING: A required database table is missing. Review and apply the pending migrations after backup.";
  if (message === "target") return "DATABASE_PROJECT_MISMATCH: The runtime/direct connections or project guard do not match.";
  if (message === "unrelated") return "DATABASE_TARGET_REFUSED: Unrelated application tables were detected. No migration was attempted.";
  return "DATABASE_CHECK_FAILED: The database check failed for an unclassified reason. Inspect database/provider logs; credentials are intentionally omitted.";
}
