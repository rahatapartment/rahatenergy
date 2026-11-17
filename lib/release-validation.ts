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
