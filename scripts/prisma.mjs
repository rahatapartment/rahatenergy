// Prefer installed engines to keep Prisma tooling inside this project's resources.
import { existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
const require = createRequire(import.meta.url);
const directory = dirname(require.resolve("@prisma/engines/package.json"));
const files = readdirSync(directory);
const env = { ...process.env };
const library = files.find(
  (file) => file.startsWith("libquery_engine-") && file.endsWith(".node"),
);
const schema = files.find(
  (file) => file.startsWith("schema-engine-") && !file.endsWith(".sha256"),
);
if (library && existsSync(join(directory, library)))
  env.PRISMA_QUERY_ENGINE_LIBRARY ??= join(directory, library);
if (schema && existsSync(join(directory, schema)))
  env.PRISMA_SCHEMA_ENGINE_BINARY ??= join(directory, schema);
const result = spawnSync(
  process.execPath,
  [require.resolve("prisma/build/index.js"), ...process.argv.slice(2)],
  { env, stdio: "inherit" },
);
if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}
process.exit(result.status ?? 1);
