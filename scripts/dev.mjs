import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { resolve } from "node:path";

// Preserve existing Energy configuration while making localhost:3000 useful.
const redirect = createServer((req, res) => {
  res.writeHead(307, {
    Location: `http://localhost:3001${req.url?.startsWith("/") ? req.url : "/"}`,
    "Cache-Control": "no-store",
  });
  res.end();
});
let next;
redirect.on("error", (error) => {
  console.error(`Cannot reserve localhost:3000 for Energy: ${error.code || error.message}`);
  next?.kill("SIGTERM");
  process.exitCode = 1;
});
redirect.listen(3000, "::", () => {
  console.log("Rahat Energy: localhost:3000 redirects to localhost:3001.");
  next = spawn(process.execPath, [resolve("node_modules/next/dist/bin/next"), "dev", "-p", "3001", "--hostname", "::", ...process.argv.slice(2)], { stdio: "inherit" });
  next.on("exit", (code) => { redirect.close(); process.exitCode = code ?? 0; });
  next.on("error", () => { console.error("Unable to start the Energy preview."); redirect.close(); process.exitCode = 1; });
});
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => { next?.kill(signal); redirect.close(); });
}
