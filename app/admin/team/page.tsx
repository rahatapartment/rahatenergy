import { operationsAccess } from "@/lib/operations-access";
import { AdminShell } from "@/components/admin/AdminShell";
import { TeamManager } from "@/components/admin/TeamManager";
import Link from "next/link";
export const dynamic = "force-dynamic";
export default async function Page() {
  const { actor, db } = await operationsAccess("owner");
  const [members, invitations] = db
    ? await Promise.all([
        db.adminUser.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            active: true,
            permissions: true,
          },
          orderBy: { createdAt: "asc" },
        }),
        db.adminInvitation.findMany({
          orderBy: { createdAt: "desc" },
          take: 100,
          select: {
            id: true,
            email: true,
            roleLabel: true,
            expiresAt: true,
            acceptedAt: true,
            revokedAt: true,
          },
        }),
      ])
    : [[], []];
  return (
    <AdminShell title="Team access" authenticated={!!actor}>
      {actor?.bootstrap ? (
        <p className="notice">
          Create the business owner account in{" "}
          <Link href="/admin/settings">Settings</Link> before inviting your
          team.
        </p>
      ) : (
        <TeamManager
          emailReady={
            !!(
              process.env.ENERGY_RESEND_API_KEY &&
              process.env.ENERGY_EMAIL_FROM &&
              process.env.NEXT_PUBLIC_APP_URL
            )
          }
          key={members
            .map((m) => `${m.id}-${m.active}-${m.permissions.join(",")}`)
            .join("|")}
          members={members}
          invitations={invitations.map((i) => ({
            ...i,
            expiresAt: i.expiresAt.toISOString(),
            acceptedAt: i.acceptedAt?.toISOString() ?? null,
            revokedAt: i.revokedAt?.toISOString() ?? null,
          }))}
        />
      )}
    </AdminShell>
  );
}
