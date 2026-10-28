import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { assertEnergyDatabase } from "../lib/database-safety";
import { seedCatalogue } from "../lib/seed-catalogue";
loadEnvConfig(process.cwd());
if (!process.env.ENERGY_DATABASE_URL || !process.env.ENERGY_DIRECT_URL)
  throw new Error("Dedicated energy database configuration required.");
const db = new PrismaClient();
assertEnergyDatabase(db)
  .then(() => seedCatalogue(db))
  .finally(() => db.$disconnect());
