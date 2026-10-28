import test from "node:test";
import assert from "node:assert/strict";
import { POST as quote } from "../app/api/quotations/route";
import { POST as login } from "../app/api/admin/login/route";
const request = (
  path: string,
  body: unknown,
  origin = "http://localhost:3001",
) =>
  new Request(`http://localhost:3001${path}`, {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
test("quote API rejects cross-site requests and malformed submissions before persistence", async () => {
  assert.equal(
    (await quote(request("/api/quotations", {}, "https://other.example")))
      .status,
    403,
  );
  assert.equal((await quote(request("/api/quotations", {}))).status, 400);
});
test("quote API returns unavailable, never a fake success, when independent DB is absent", async () => {
  delete process.env.ENERGY_DATABASE_URL;
  delete process.env.ENERGY_DIRECT_URL;
  const response = await quote(
    request("/api/quotations", {
      name: "Example Customer",
      email: "customer@example.com",
      phone: "08000000000",
      productId: "re-001",
      quantity: 1,
      location: "Example City",
      requirements: "Please send specifications.",
      consent: true,
    }),
  );
  assert.equal(response.status, 503);
  assert.ok(!("reference" in (await response.json())));
});
test("admin login rejects cross-site and unconfigured authentication", async () => {
  delete process.env.ENERGY_ADMIN_PASSWORD;
  assert.equal(
    (await login(request("/api/admin/login", {}, "https://other.example")))
      .status,
    403,
  );
  assert.equal((await login(request("/api/admin/login", {}))).status, 503);
});
