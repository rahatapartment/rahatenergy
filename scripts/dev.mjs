import { createServer } from "node:http";
import { createConnection } from "node:net";
import { spawn } from "node:child_process";
import { resolve } from "node:path";

const previewUrl = "http://localhost:3001";
const occupied = await new Promise(resolvePort => {
  const socket = createConnection({ host: "localhost", port: 3001 });
  socket.once("connect", () => { socket.destroy(); resolvePort(true); });
  socket.once("error", () => resolvePort(false));
  socket.setTimeout(2000, () => { socket.destroy(); resolvePort(true); });
});
if (occupied) {
  let isEnergy = false;
  try {
    const response = await fetch(`${previewUrl}/shop`, { signal: AbortSignal.timeout(15000) });
    isEnergy = response.ok && /<title>[^<]*Rahat Energy/i.test(await response.text());
  } catch { /* An unknown service is never stopped automatically. */ }
  if (isEnergy) {
    console.log(`Rahat Energy is already running at ${previewUrl}. Open it in your browser; no second server was started.`);
    process.exit(0);
  }
  console.error(`Port 3001 is already occupied. If it is your Energy preview, open ${previewUrl}; otherwise stop that service before starting Energy. No process was stopped.`);
  process.exit(1);
}

// Port 3000 is an optional convenience alias; the app always runs on 3001.
const redirect = createServer((req, res) => {
  res.writeHead(307, {
    Location: `${previewUrl}${req.url?.startsWith("/") ? req.url : "/"}`,
    "Cache-Control": "no-store",
  });
  res.end();
});
let next;
let started = false;
function closeRedirect() { if (redirect.listening) redirect.close(); }
function startPreview() {
  if (started) return;
  started = true;
  next = spawn(process.execPath, [resolve("node_modules/next/dist/bin/next"), "dev", "-p", "3001", "--hostname", "::", ...process.argv.slice(2)], { stdio: "inherit" });
  next.on("exit", code => { closeRedirect(); process.exitCode = code ?? 0; });
  next.on("error", () => { console.error("Unable to start the Energy preview."); closeRedirect(); process.exitCode = 1; });
}
redirect.on("error", error => {
  console.log(`The optional localhost:3000 redirect is unavailable (${error.code || "listen error"}). Starting Energy at ${previewUrl}.`);
  startPreview();
});
redirect.listen(3000, "::", () => {
  console.log("Rahat Energy: localhost:3000 redirects to localhost:3001.");
  startPreview();
});
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => { next?.kill(signal); closeRedirect(); });
}
