import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import {
  assertEnergyDatabase,
  assertConnectionPair,
} from "../lib/database-safety";
import { seedCatalogue } from "../lib/seed-catalogue";
loadEnvConfig(process.cwd());
async function activate() {
  if (!process.env.ENERGY_DATABASE_URL || !process.env.ENERGY_DIRECT_URL)
    throw new Error("CONFIG");
  const db = new PrismaClient();
  try {
    await db.$queryRaw`SELECT 1`;
    assertConnectionPair(
      process.env.ENERGY_DATABASE_URL!,
      process.env.ENERGY_DIRECT_URL!,
    );
    await assertEnergyDatabase(db);
    const direct = new PrismaClient({
      datasources: { db: { url: process.env.ENERGY_DIRECT_URL! } },
    });
    try {
      await direct.$queryRaw`SELECT 1`;
      await assertEnergyDatabase(direct);
    } finally {
      await direct.$disconnect();
    }
    console.log(
      "Independent connection validated; no unrelated public application tables found.",
    );
    if (process.argv.includes("--check-only")) return;
    execFileSync(
      process.execPath,
      ["scripts/prisma.mjs", "migrate", "deploy"],
      { stdio: "inherit", env: process.env },
    );
    await seedCatalogue(db);
    const before = await db.inventory.findMany({
      orderBy: { productId: "asc" },
    });
    await seedCatalogue(db);
    const after = await db.inventory.findMany({
      orderBy: { productId: "asc" },
    });
    if (
      JSON.stringify(before) !== JSON.stringify(after) ||
      (await db.product.count()) !== 15 ||
      after.length !== 15
    )
      throw new Error("SEED");
    const marker = `activation-check-${randomUUID()}`;
    try {
      await db.$transaction(async (tx) => {
        await tx.auditLog.create({
          data: {
            actor: "activation-check",
            action: "WRITE_TEST",
            subject: marker,
            data: { test: true },
          },
        });
        throw new Error(marker);
      });
    } catch (error) {
      if (!(error instanceof Error) || error.message !== marker) throw error;
    }
    if (await db.auditLog.findFirst({ where: { subject: marker } }))
      throw new Error("ROLLBACK");
    console.log(
      "Migrations applied; exactly 15 products/inventory rows verified; repeated seed preserved operational values; transactional write/rollback verified.",
    );
  } finally {
    await db.$disconnect();
  }
}
activate().catch((error) => {
  const code = error instanceof Error ? error.message : "";
  console.error(
    code === "CONFIG"
      ? "Configure ENERGY_DATABASE_URL and ENERGY_DIRECT_URL from the NEW Rahat Energy Supabase project. Do not paste credentials into chat."
      : code === "UNRELATED" || code === "TARGET"
        ? "Activation refused: connection targets differ or unrelated public application tables exist. Use the same dedicated Rahat Energy database for both connections."
        : "Database activation did not complete. Check the dedicated connection, permissions and migrations; no successful activation is claimed.",
  );
  process.exitCode = 1;
});
