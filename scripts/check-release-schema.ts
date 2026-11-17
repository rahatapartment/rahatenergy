import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { catalogue } from "../lib/catalogue";
import { assertConnectionPair, assertEnergyDatabase } from "../lib/database-safety";
import { migrationProblems, type MigrationEvidence } from "../lib/release-validation";
loadEnvConfig(process.cwd());
async function check() {
  const runtime = process.env.ENERGY_DATABASE_URL, direct = process.env.ENERGY_DIRECT_URL;
  if (!runtime || !direct) throw new Error("Configure the existing Energy database before releasing.");
  assertConnectionPair(runtime, direct);
  const db = new PrismaClient();
  try {
    await assertEnergyDatabase(db);
    const expected = readdirSync("prisma/migrations", { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => ({ name: entry.name, checksum: createHash("sha256").update(readFileSync(`prisma/migrations/${entry.name}/migration.sql`)).digest("hex") }));
    const applied = await db.$queryRaw<MigrationEvidence[]>`SELECT migration_name, checksum, finished_at, rolled_back_at FROM "_prisma_migrations"`;
    const issues = migrationProblems(expected, applied);
    if (issues.length) { issues.forEach(issue => console.error(issue)); throw new Error("Apply the reviewed migrations after a verified backup, then retry release."); }
    const inventory = await db.inventory.findMany({ where: { productId: { in: catalogue.map(p => p.id) } }, select: { productId: true } });
    if (catalogue.some(p => !inventory.some(row => row.productId === p.id))) throw new Error("Active catalogue inventory rows are missing. Complete database activation before release.");
    await db.productContent.count();
    await db.productImage.count();
    console.log(`Release schema verified: ${expected.length} migrations and ${catalogue.length} active inventory rows. No data was changed.`);
  } finally { await db.$disconnect(); }
}
check().catch(e => {
  // Avoid exposing provider errors containing credentials or connection URLs.
  const message = e instanceof Error ? e.message : "";
  const allowed = ["Configure the existing Energy database", "Apply the reviewed migrations", "Active catalogue inventory"];
  console.error(allowed.some(prefix => message.startsWith(prefix)) ? message : "Release schema check failed. Verify the existing Energy database connection and migration history; deployment has been stopped.");
  process.exitCode = 1;
});
