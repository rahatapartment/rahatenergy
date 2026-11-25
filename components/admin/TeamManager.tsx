"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { permissionKeys, permissionLabels, teamAccessPresets } from "@/lib/admin-permissions";
type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
  roleLabel: string | null;
  active: boolean;
  permissions: string[];
};
type Invitation = {
  id: string;
  email: string;
  roleLabel: string;
  expiresAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
};
type AccessType = keyof typeof teamAccessPresets | "custom";

function AccessFields({ roleLabel, permissions }: { roleLabel?: string | null; permissions?: string[] }) {
  const startingType = !roleLabel || roleLabel === "Team member"
    ? "team-member"
    : roleLabel === "Manager" ? "manager" : "custom";
  const [type, setType] = useState<AccessType>(startingType);
  const [customLabel, setCustomLabel] = useState(startingType === "custom" ? roleLabel ?? "" : "");
  const [selected, setSelected] = useState<string[]>(permissions ?? [...teamAccessPresets["team-member"].permissions]);
  const preset = type === "custom" ? null : teamAccessPresets[type];

  function choose(next: AccessType) {
    setType(next);
    setSelected(next === "custom" ? [] : [...teamAccessPresets[next].permissions]);
  }
  return (
    <>
      <div className="inventory-inputs">
        <label>
          Account type
          <select value={type} onChange={event => choose(event.target.value as AccessType)}>
            <option value="manager">Manager</option>
            <option value="team-member">Team member</option>
            <option value="custom">Custom</option>
          </select>
        </label>
        {preset ? <input type="hidden" name="roleLabel" value={preset.label} /> : (
          <label>
            Custom role name
            <input name="roleLabel" value={customLabel} onChange={event => setCustomLabel(event.target.value)} required minLength={2} maxLength={60} />
          </label>
        )}
      </div>
      <p className="small muted">{preset?.description ?? "Choose the permissions for this custom role."} {preset && "You can adjust the selection below."}</p>
      <fieldset className="team-permissions">
        <legend>Allowed actions</legend>
        {permissionKeys.map(key => (
          <label key={key}>
            <input
              type="checkbox"
              name="permissions"
              value={key}
              checked={selected.includes(key)}
              onChange={event => {
                const checked = event.target.checked;
                setSelected(current => checked ? [...current, key] : current.filter(value => value !== key));
              }}
            />
            {permissionLabels[key]}
          </label>
        ))}
      </fieldset>
    </>
  );
}
export function TeamManager({
  members,
  invitations,
  emailReady,
}: {
  members: Member[];
  invitations: Invitation[];
  emailReady: boolean;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function request(url: string, method: string, body: unknown) {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (!res.ok) throw Error(d.error);
      setMessage(
        d.message ||
          "Saved. Permissions take effect on the next request; previous sessions are revoked.",
      );
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unable to save.");
    } finally {
      setBusy(false);
    }
  }
  function invite(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    void request("/api/admin/invitations", "POST", {
      email: f.get("email"),
      roleLabel: f.get("roleLabel"),
      permissions: f.getAll("permissions"),
    });
  }
  return (
    <>
      <section className="inventory-form">
        <h2>Invite a team member</h2>
        <p>Choose a preset or create a custom role. Team invitations, refunds and cancellations stay with the store owner.</p>
        {!emailReady && (
          <p className="notice">
            Email invitations need the Resend API key, sender address and
            application URL configured in the server environment.
          </p>
        )}
        <form onSubmit={invite}>
          <div className="inventory-inputs">
            <label>
              Email address
              <input name="email" type="email" required autoComplete="off" />
            </label>
          </div>
          <AccessFields />
          <button className="button dark" disabled={busy || !emailReady}>
            {busy ? "Working…" : "Send invitation"}
          </button>
          <p className="small muted">
            Invitations expire in 48 hours. Sending another invitation to the
            same email replaces the previous link.
          </p>
        </form>
      </section>
      <p role="status" className="notice">
        {message || "Access changes and invitations are recorded in Activity."}
      </p>
      <h2>Team members</h2>
      {members.map((m) => (
        <section className="inventory-form" key={m.id}>
          <h3>
            {m.name} · {m.email}
          </h3>
          {m.role === "OWNER" ? (
            <p>Business owner · Full access</p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                void request("/api/admin/users", "PATCH", {
                  id: m.id,
                  role: "OPERATOR",
                  roleLabel: f.get("roleLabel"),
                  active: f.get("active") === "on",
                  permissions: f.getAll("permissions"),
                });
              }}
            >
              <label className="check-field">
                <input
                  type="checkbox"
                  name="active"
                  defaultChecked={m.active}
                />{" "}
                Account active
              </label>
              <AccessFields roleLabel={m.roleLabel} permissions={m.permissions} />
              <button className="button dark" disabled={busy}>
                Save access
              </button>
            </form>
          )}
        </section>
      ))}
      <h2>Invitations</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {invitations.map((i) => (
              <tr key={i.id}>
                <td>{i.email}</td>
                <td>{i.roleLabel}</td>
                <td>
                  {i.acceptedAt
                    ? "Accepted"
                    : i.revokedAt
                      ? "Revoked"
                      : new Date(i.expiresAt) < new Date()
                        ? "Expired"
                        : "Pending acceptance"}
                </td>
                <td>
                  {!i.acceptedAt && !i.revokedAt && (
                    <button
                      disabled={busy}
                      onClick={() =>
                        request("/api/admin/invitations", "DELETE", {
                          id: i.id,
                        })
                      }
                    >
                      Revoke invitation
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
