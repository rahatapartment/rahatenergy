import { PrismaClient } from "@prisma/client";
const globalDb = globalThis as unknown as { energyDb?: PrismaClient };
export function getDb() {
  if (!process.env.ENERGY_DATABASE_URL || !process.env.ENERGY_DIRECT_URL)
    return null;
  if (!globalDb.energyDb) globalDb.energyDb = new PrismaClient();
  return globalDb.energyDb;
}
