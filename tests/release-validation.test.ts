import test from "node:test";
import assert from "node:assert/strict";
import { migrationProblems } from "../lib/release-validation";
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
