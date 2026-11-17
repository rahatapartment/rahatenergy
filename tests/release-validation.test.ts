import test from "node:test";
import assert from "node:assert/strict";
import { migrationProblems, releaseFailureReason } from "../lib/release-validation";
const expected = [{ name: "001", checksum: "correct" }];
const complete = { migration_name: "001", checksum: "correct", finished_at: new Date(), rolled_back_at: null };
test("release requires completed migrations with matching checksums", () => {
  assert.deepEqual(migrationProblems(expected, [complete]), []);
  assert.match(migrationProblems(expected, [])[0], /Pending/);
  assert.match(migrationProblems(expected, [{ ...complete, checksum: "changed" }])[0], /differs/);
  assert.match(migrationProblems(expected, [{ ...complete, finished_at: null }])[0], /Unfinished/);
  assert.match(migrationProblems(expected, [{ ...complete, rolled_back_at: new Date() }])[0], /Pending/);
});
test("rolled-back failures do not block a subsequently completed migration", () => {
  assert.deepEqual(migrationProblems(expected, [{ ...complete, finished_at: null, rolled_back_at: new Date() }, complete]), []);
});

test("release diagnostics distinguish connection failures and never expose raw secrets", () => {
  const secret = "postgresql://user:private-password@private-host/project";
  const cases = [
    [{ message: `FATAL tenant/user postgres.private not found ${secret}` }, "DATABASE_TENANT_NOT_FOUND"],
    [{ errorCode: "P1000", message: secret }, "DATABASE_AUTH_FAILED"],
    [{ errorCode: "P1001", message: secret }, "DATABASE_UNREACHABLE"],
    [{ code: "P2010", meta: { code: "42P01" }, message: secret }, "DATABASE_TABLE_MISSING"],
    [{ message: secret }, "DATABASE_CHECK_FAILED"],
  ] as const;
  for (const [error, expected] of cases) {
    const result = releaseFailureReason(error);
    assert.ok(result.startsWith(expected));
    assert.ok(!result.includes(secret) && !result.includes("private-password") && !result.includes("private-host"));
  }
});
