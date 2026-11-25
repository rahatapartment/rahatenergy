import { staticGenerationAsyncStorage } from "next/dist/client/components/static-generation-async-storage.external";
import { before, after, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { editAdminUser } from "../lib/admin-users";
import {
  inviteAdmin,
  acceptAdminInvitation,
  invitationHash,
} from "../lib/admin-invitations";
import {
  adminIdentity,
  createAdminSession,
  ADMIN_COOKIE,
  type AdminIdentity,
} from "../lib/admin-auth";
import { PATCH as stockPatch } from "../app/api/admin/inventory/[id]/route";
import { POST as customerPost } from "../app/api/admin/customers/route";
import { seedCatalogue } from "../lib/seed-catalogue";
const url = process.env.ENERGY_TEST_DATABASE_URL;
if (
  !url ||
  !["127.0.0.1", "localhost"].includes(new URL(url).hostname) ||
  !new URL(url).pathname.endsWith("_test")
)
  throw Error("Disposable loopback _test database required");
const db = new PrismaClient({ datasources: { db: { url } } });
let owner: AdminIdentity;
before(async () => {
  process.env.ENERGY_DATABASE_URL = url;
  process.env.ENERGY_DIRECT_URL = url;
  process.env.ENERGY_ADMIN_EMAIL = "owner@example.test";
  process.env.ENERGY_ADMIN_PASSWORD = "fixture-owner-password-long";
  process.env.ENERGY_ADMIN_SESSION_SECRET =
    "temporary-admin-team-fixture-secret-123456";
  process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3001";
  process.env.ENERGY_EMAIL_FROM = "Team <team@example.test>";
  process.env.ENERGY_RESEND_API_KEY = "fixture-no-network";
  execFileSync(process.execPath, ["scripts/prisma.mjs", "migrate", "deploy"], {
    env: process.env,
    stdio: "pipe",
  });
  await seedCatalogue(db);
});
beforeEach(async () => {
  await db.$executeRaw`TRUNCATE TABLE "AdminUser", "AdminInvitation", "AuditLog", "InventoryMovement", "Notification", "Customer" CASCADE`;
  await db.inventory.updateMany({
    data: {
      stock: 10,
      reserved: 0,
      version: 0,
      priceKobo: 10000,
      enabled: true,
      lowStockThreshold: 2,
    },
  });
  owner = (await adminIdentity(await createAdminSession()))!;
});
after(async () => db.$disconnect());
async function invitation(permissions: string[]) {
  await inviteAdmin(db, owner, {
    email: "worker@example.test",
    roleLabel: "Stock manager",
    permissions,
  });
  const job = await db.notification.findFirstOrThrow({
    orderBy: { createdAt: "desc" },
  });
  const token = (job.payload as { text: string }).text.match(
    /token=([A-Za-z0-9_-]{43})/,
  )![1];
  return { token, invite: await db.adminInvitation.findFirstOrThrow() };
}
async function req(
  user: { id: string; role: string; sessionVersion: number },
  path: string,
  body: unknown,
) {
  return new Request("http://localhost:3001" + path, {
    method: "POST",
    headers: {
      origin: "http://localhost:3001",
      cookie: `${ADMIN_COOKIE}=${await createAdminSession(user)}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}
test("environment owner, invitation hash only, acceptance once and email audit attribution", async () => {
  await assert.rejects(inviteAdmin(db, owner, {
    email: "owner@example.test",
    roleLabel: "Stock manager",
    permissions: ["inventory.increase"],
  }), /reserved/);
  const { token, invite } = await invitation(["inventory.increase"]);
  assert.equal(invite.tokenHash, invitationHash(token));
  assert.ok(!JSON.stringify(invite).includes(token));
  const user = await acceptAdminInvitation(db, {
    token,
    name: "Worker",
    password: "fixture-worker-password-long",
  });
  assert.equal(user.role, "OPERATOR");
  assert.equal(user.roleLabel, "Stock manager");
  assert.deepEqual(user.permissions, ["inventory.increase"]);
  await assert.rejects(
    acceptAdminInvitation(db, {
      token,
      name: "Again",
      password: "fixture-worker-password-long",
    }),
  );
  const audit = await db.auditLog.findFirstOrThrow({
    where: { action: "INVITATION_ACCEPTED" },
  });
  assert.equal(audit.actorEmail, "worker@example.test");
  assert.ok(!JSON.stringify(audit).includes(token));
});
test("expired and revoked invitations cannot create accounts", async () => {
  const { token, invite } = await invitation(["products.edit"]);
  await db.adminInvitation.update({
    where: { id: invite.id },
    data: { expiresAt: new Date(0) },
  });
  await assert.rejects(
    acceptAdminInvitation(db, {
      token,
      name: "Worker",
      password: "fixture-worker-password-long",
    }),
  );
  await db.adminInvitation.update({
    where: { id: invite.id },
    data: { expiresAt: new Date(Date.now() + 60000), revokedAt: new Date() },
  });
  await assert.rejects(
    acceptAdminInvitation(db, {
      token,
      name: "Worker",
      password: "fixture-worker-password-long",
    }),
  );
  assert.equal(await db.adminUser.count(), 0);
});
test("stock API permits increase only, rejects decrease and unrelated customer changes", async () => {
  const { token } = await invitation(["inventory.increase"]);
  const user = await acceptAdminInvitation(db, {
    token,
    name: "Worker",
    password: "fixture-worker-password-long",
  });
  const patch = async (stock: number, version: number) => {
    const request = await req(user, "/api/admin/inventory/re-001", {
      stock,
      version,
      priceKobo: 10000,
      enabled: true,
      lowStockThreshold: 2,
    });
    return staticGenerationAsyncStorage.run(
      {
        incrementalCache: {},
        urlPathname: "/api/admin/inventory/re-001",
        isStaticGeneration: false,
      } as never,
      () => stockPatch(request, { params: { id: "re-001" } }),
    );
  };
  const response = await patch(11, 0);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).inventory.version, 1);
  assert.equal(
    (await db.inventory.findUniqueOrThrow({ where: { productId: "re-001" } }))
      .stock,
    11,
  );
  const log = await db.auditLog.findFirstOrThrow({
    where: { action: "INVENTORY_UPDATE" },
  });
  assert.equal(log.actorEmail, "worker@example.test");
  assert.equal((await patch(9, 1)).status, 403);
  assert.equal((await patch(12, 0)).status, 409);
  const denied = await customerPost(
    await req(user, "/api/admin/customers", {
      name: "Customer",
      email: "customer@example.test",
      phone: "",
    }),
  );
  assert.equal(denied.status, 403);
  assert.equal(await db.customer.count(), 0);
});
test("permissions updates revoke previous sessions and cannot grant owner role", async () => {
  const { token } = await invitation(["customers.manage"]);
  const user = await acceptAdminInvitation(db, {
    token,
    name: "Worker",
    password: "fixture-worker-password-long",
  });
  const session = await createAdminSession(user);
  assert.ok(await adminIdentity(session));
  const added = await customerPost(
    await req(user, "/api/admin/customers", {
      name: "Customer",
      email: "customer@example.test",
      phone: "",
    }),
  );
  assert.equal(added.status, 200);
  await editAdminUser(db, owner, user.id, {
    role: "OPERATOR",
    active: true,
    permissions: ["products.view"],
  });
  assert.equal(await adminIdentity(session), null);
  await assert.rejects(
    editAdminUser(db, owner, user.id, { role: "OWNER", active: true }),
  );
  const legacyOwner = await db.adminUser.create({
    data: {
      name: "Legacy Owner",
      email: "legacy-owner@example.test",
      passwordHash: "fixture",
      role: "OWNER",
    },
  });
  assert.equal(await adminIdentity(await createAdminSession(legacyOwner)), null);
});
