import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { spawnSync } from "node:child_process";
import { mkdirSync, chmodSync, readFileSync, writeFileSync, unlinkSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { assertConnectionPair, assertEnergyDatabase } from "../lib/database-safety";
loadEnvConfig(process.cwd());
async function backup() {
  const runtime = process.env.ENERGY_DATABASE_URL;
  const direct = process.env.ENERGY_DIRECT_URL;
  if (!runtime || !direct) throw new Error("CONFIG");
  assertConnectionPair(runtime, direct);
  const db = new PrismaClient({ datasources: { db: { url: direct } } });
  try {
    await db.$queryRaw`SELECT 1`;
    await assertEnergyDatabase(db);
    const history = await db.$queryRaw<{ present: string | null }[]>`SELECT to_regclass('public."_prisma_migrations"')::text AS present`;
    const migrations = history[0]?.present
      ? await db.$queryRaw<{ migration_name: string }[]>`SELECT migration_name FROM "_prisma_migrations" WHERE finished_at IS NOT NULL ORDER BY migration_name`
      : [];
    const url = new URL(direct);
    const directory = resolve(".backups");
    mkdirSync(directory, { recursive: true, mode: 0o700 }); chmodSync(directory, 0o700);
    const path = resolve(directory, `energy-${new Date().toISOString().replace(/[:.]/g, "-")}.dump`);
    const env = { ...process.env, PGHOST: url.hostname, PGPORT: url.port || "5432", PGUSER: decodeURIComponent(url.username), PGPASSWORD: decodeURIComponent(url.password), PGDATABASE: decodeURIComponent(url.pathname.slice(1)), PGSSLMODE: "require", PGCONNECT_TIMEOUT: "15" };
    const result = spawnSync("pg_dump", ["--format=custom", "--no-owner", "--no-acl", "--file", path], { env, stdio: "pipe", timeout: 180_000 });
    if (existsSync(path)) chmodSync(path, 0o600);
    if (result.status !== 0) { if (existsSync(path)) unlinkSync(path); throw new Error("DUMP"); }
    const check = spawnSync("pg_restore", ["--list", path], { stdio: "pipe", timeout: 15_000 });
    if (check.status !== 0) throw new Error("ARCHIVE");
    const bytes = readFileSync(path);
    const manifest = { file: path, bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex"), migrations: migrations.map(row => row.migration_name), createdAt: new Date().toISOString(), validation: "Archive listing verified; isolated restore rehearsal still required" };
    writeFileSync(`${path}.json`, JSON.stringify(manifest, null, 2) + "\n", { mode: 0o600 });
    console.log(JSON.stringify(manifest, null, 2));
  } catch (e) {
    const message = e instanceof Error ? e.message : "";
    const reason = message.includes("tenant/user") || message.includes("Tenant or user") ? "Supabase pooler could not find this project/user." : message.includes("authentication failed") ? "Database authentication failed." : ["CONFIG", "DUMP", "ARCHIVE", "TARGET", "UNRELATED"].includes(message) ? message : "Database connection/check failed.";
    throw new Error(reason);
  } finally { await db.$disconnect(); }
}
backup().catch(e => { console.error(`Backup not completed: ${e.message} No migration was run.`); process.exitCode = 1; });
