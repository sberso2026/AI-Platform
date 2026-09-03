"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/layout/header";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from "@rtb/ui";

type Member = {
  userId: string;
  email?: string | null;
  fullName?: string | null;
  roleSlug: string;
  roleName: string;
  status: string;
  invitationStatus?: string;
  emailConfirmed?: boolean;
  onboardingState?: string;
  activationStatus?: string;
  workspaces: Array<{ id: string; name?: string; slug?: string }>;
};

const INVITEABLE_ROLES = ["admin", "member", "viewer"] as const;

function lifecycleMessage(json: { error?: { message?: string; code?: string } | string }): string {
  if (typeof json.error === "string") return json.error;
  return json.error?.message ?? "Request failed";
}

function lifecycleCode(json: { error?: { code?: string } | string }): string | null {
  if (json.error && typeof json.error === "object") return json.error.code ?? null;
  return null;
}

export default function UsersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [email, setEmail] = useState("");
  const [roleSlug, setRoleSlug] = useState("member");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [directoryLoading, setDirectoryLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [rateLimitedUntil, setRateLimitedUntil] = useState<number | null>(null);
  const [seatByUser, setSeatByUser] = useState<Record<string, string>>({});
  const [seatCapacity, setSeatCapacity] = useState<string | null>(null);

  const rateLimited = rateLimitedUntil != null && Date.now() < rateLimitedUntil;

  async function reload() {
    setDirectoryLoading(true);
    const res = await fetch("/api/platform/identity/members");
    const json = await res.json();
    if (!res.ok) {
      setError(lifecycleMessage(json));
      setDirectoryLoading(false);
      return;
    }
    setError(null);
    setMembers(json.data ?? []);
    setDirectoryLoading(false);
  }

  async function reloadSeats() {
    const poolsRes = await fetch("/api/platform/commerce/seats/pools");
    if (!poolsRes.ok) return;
    const poolsJson = await poolsRes.json();
    const pool = (poolsJson.data ?? [])[0] as { id?: string; total_seats?: number; assigned_seats?: number } | undefined;
    if (!pool?.id) return;
    setSeatCapacity(`${pool.assigned_seats ?? "?"}/${pool.total_seats ?? "?"}`);
    const assignRes = await fetch(`/api/platform/commerce/seats/assignments?seatPoolId=${pool.id}`);
    if (!assignRes.ok) return;
    const assignJson = await assignRes.json();
    const next: Record<string, string> = {};
    for (const row of assignJson.data ?? []) {
      if (row.user_id && row.status === "active") next[row.user_id] = "assigned";
    }
    setSeatByUser(next);
  }

  useEffect(() => {
    void reload();
    void reloadSeats();
  }, []);

  useEffect(() => {
    if (!rateLimitedUntil) return;
    const id = window.setInterval(() => {
      if (Date.now() >= rateLimitedUntil) setRateLimitedUntil(null);
    }, 1000);
    return () => window.clearInterval(id);
  }, [rateLimitedUntil]);

  const rateLimitLabel = useMemo(() => {
    if (!rateLimitedUntil) return null;
    const mins = Math.max(1, Math.ceil((rateLimitedUntil - Date.now()) / 60000));
    return `Auth mailer rate limited. Wait about ${mins} min before inviting again.`;
  }, [rateLimitedUntil, rateLimited]);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    if (rateLimited) return;
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch("/api/platform/identity/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, roleSlug }),
      });
      const json = await res.json();
      const code = lifecycleCode(json);
      if (res.status === 429 || code === "rate_limited" || code === "invite_email_rate_limited") {
        setRateLimitedUntil(Date.now() + 60 * 60 * 1000);
        throw new Error(lifecycleMessage(json));
      }
      if (res.status === 502 || code === "activation_delivery_failed") {
        setInfo(
          `${lifecycleMessage(json)} The user remains pending activation. Use Resend activation after SMTP is ready.`,
        );
        setEmail("");
        await reload();
        await reloadSeats();
        return;
      }
      if (res.status === 409 && code === "seat_capacity_exceeded") {
        setInfo(lifecycleMessage(json));
        await reload();
        await reloadSeats();
        return;
      }
      if (!res.ok) throw new Error(lifecycleMessage(json));
      const delivery = json.data?.delivery as string;
      const onboardingState = json.data?.onboardingState as string | undefined;
      if (delivery === "activation_sent" || onboardingState === "pending_activation") {
        setInfo(`Pending Auth identity created for ${email}. They set a password from the activation email, then sign in.`);
      } else if (delivery === "existing_user") {
        setInfo(`${email} is already on this tenant.`);
      } else {
        setInfo(`Invite recorded for ${email}.`);
      }
      setEmail("");
      await reload();
      await reloadSeats();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invite failed");
    } finally {
      setLoading(false);
    }
  }

  async function resendActivation(userId: string) {
    setError(null);
    setInfo(null);
    const res = await fetch("/api/platform/identity/members", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, resendActivation: true }),
    });
    const json = await res.json();
    const code = lifecycleCode(json);
    if (res.status === 429 || code === "rate_limited") {
      setRateLimitedUntil(Date.now() + 60 * 60 * 1000);
      setError(lifecycleMessage(json));
      return;
    }
    if (!res.ok) {
      setError(lifecycleMessage(json));
      return;
    }
    setInfo("Activation email resent. The Auth user was not recreated.");
    await reload();
  }

  async function changeRole(userId: string, nextRole: string) {
    setError(null);
    const res = await fetch("/api/platform/identity/members", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, roleSlug: nextRole }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(lifecycleMessage(json));
      return;
    }
    await reload();
  }

  return (
    <>
      <Header title="Users" description="Invite users into this tenant using Platform Identity memberships" />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Invite user</CardTitle>
            <CardDescription>
              Invite a colleague with their work email. They set a password from the activation
              email, then sign in to this tenant. Assign Engineering OS seats under Licences & Seats,
              not from this form.
              {seatCapacity ? ` Current seat pool ${seatCapacity}.` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-wrap gap-2" onSubmit={invite}>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@company.com"
                aria-label="Invite email"
                disabled={rateLimited}
              />
              <select
                className="h-10 rounded-md border border-slate-200 bg-white px-2 text-sm"
                value={roleSlug}
                onChange={(e) => setRoleSlug(e.target.value)}
                aria-label="Tenant role"
                disabled={rateLimited}
              >
                <option value="admin">Administrator / project manager</option>
                <option value="member">Engineer (member)</option>
                <option value="viewer">Licensed reviewer (viewer)</option>
              </select>
              <Button type="submit" disabled={loading || rateLimited}>
                {rateLimited ? "Rate limited" : "Invite"}
              </Button>
            </form>
            {rateLimitLabel ? (
              <p className="mt-3 text-sm text-amber-800" role="status">
                {rateLimitLabel}
              </p>
            ) : null}
            {error ? (
              <p className="mt-3 text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            {info ? <p className="mt-3 text-sm text-slate-700">{info}</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Directory</CardTitle>
            <CardDescription>
              Tenant role is owner / admin / member / viewer. The selector only changes inviteable tenant roles
              (admin / member / viewer). Owner is locked. Workspace membership scopes projects; it does not use a
              separate workspace-role selector.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {members.map((member) => {
              const isOwner = member.roleSlug === "owner";
              const workspace = member.workspaces[0];
              return (
                <div
                  key={member.userId}
                  className="flex flex-wrap items-start justify-between gap-3 rounded border border-slate-200 p-3"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="font-medium">{member.fullName || member.email || member.userId}</p>
                    <p className="text-xs text-muted-foreground">
                      {member.email} · tenant role {member.roleName} ({member.roleSlug}) · account {member.status}
                      {member.onboardingState ? ` · activation ${member.onboardingState}` : member.invitationStatus ? ` · invite ${member.invitationStatus}` : ""}
                      {workspace ? ` · workspace ${workspace.name ?? workspace.slug}` : " · no workspace"}
                      {` · product access ${seatByUser[member.userId] === "assigned" ? "seat assigned" : "no seat"}`}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                  {member.onboardingState === "pending_activation" || member.onboardingState === "activation_delivery_failed" ? (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={rateLimited}
                      onClick={() => void resendActivation(member.userId)}
                      aria-label={`Resend activation for ${member.email ?? member.userId}`}
                    >
                      Resend activation
                    </Button>
                  ) : null}
                  {isOwner ? (
                    <p className="h-9 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm leading-9" aria-label="Owner tenant role locked">
                      Owner (locked)
                    </p>
                  ) : (
                    <select
                      className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm"
                      value={INVITEABLE_ROLES.includes(member.roleSlug as (typeof INVITEABLE_ROLES)[number]) ? member.roleSlug : "member"}
                      onChange={(e) => void changeRole(member.userId, e.target.value)}
                      aria-label={`Tenant role for ${member.email ?? member.userId}`}
                    >
                      <option value="admin">admin</option>
                      <option value="member">member</option>
                      <option value="viewer">viewer</option>
                    </select>
                  )}
                  </div>
                </div>
              );
            })}
            {directoryLoading ? (
              <p className="text-sm text-muted-foreground">Loading directory…</p>
            ) : members.length === 0 && !error ? (
              <p className="text-sm text-muted-foreground">No tenant members in this directory yet.</p>
            ) : null}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
