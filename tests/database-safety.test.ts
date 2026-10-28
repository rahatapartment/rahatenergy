import test from "node:test";
import assert from "node:assert/strict";
import { assertConnectionPair } from "../lib/database-safety";
test("activation rejects mismatched Supabase projects and database names", () => {
  assert.throws(() =>
    assertConnectionPair(
      "postgresql://postgres:fixture@db.firstproject.supabase.co:5432/postgres",
      "postgresql://postgres:fixture@db.secondproject.supabase.co:5432/postgres",
    ),
  );
  assert.throws(() =>
    assertConnectionPair(
      "postgresql://postgres:fixture@db.firstproject.supabase.co:5432/postgres",
      "postgresql://postgres:fixture@db.firstproject.supabase.co:5432/other",
    ),
  );
});
test("activation accepts a runtime pooler and direct connection to the same project", () => {
  assert.doesNotThrow(() =>
    assertConnectionPair(
      "postgresql://postgres.firstproject:fixture@aws-0-fixture.pooler.supabase.com:6543/postgres?pgbouncer=true",
      "postgresql://postgres:fixture@db.firstproject.supabase.co:5432/postgres",
    ),
  );
});
test("activation refuses unrelated non-Supabase hosts or ports", () => {
  assert.throws(() =>
    assertConnectionPair(
      "postgresql://fixture@127.0.0.1:5432/energy",
      "postgresql://fixture@127.0.0.1:6543/energy",
    ),
  );
});
