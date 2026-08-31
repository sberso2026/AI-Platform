"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from "@rtb/ui";

type Member = {
  userId: string;
  email?: string | null;
  fullName?: string | null;
  roleSlug: string;
  roleName: string;
  status: string;
  workspaces: Array<{ id: string; name?: string; slug?: string }>;
};

export default function UsersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [email, setEmail] = useState("");
  const [roleSlug, setRoleSlug] = useState("member");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function reload() {
    const res = await fetch("/api/platform/identity/members");
    const json = await res.json();
    if (!res.ok) {
      setError(json.error?.message ?? json.error ?? "Unable to load members");
      return;
    }
    setError(null);
    setMembers(json.data ?? []);
  }

  useEffect(() => {
    void reload();
  }, []);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
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
      if (!res.ok) throw new Error(json.error?.message ?? json.error ?? "Invite failed");
      const delivery = json.data?.delivery as string;
      if (delivery === "invite_email") {
        setInfo(`Invite email sent to ${email}. The user activates from that email, then signs in.`);
      } else if (delivery === "existing_user") {
        setInfo(`${email} added to this tenant.`);
      } else {
        setInfo(`Invite recorded for ${email}.`);
      }
      setEmail("");
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invite failed");
    } finally {
      setLoading(false);
    }
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
      setError(json.error?.message ?? json.error ?? "Role update failed");
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
              Canonical path: admin invite email → activation → login → tenant role (admin / member / viewer)
              → current workspace membership. Temporary passwords are not used for external onboarding.
              Seats stay on System → Seats.
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
              />
              <select
                className="h-10 rounded-md border border-slate-200 bg-white px-2 text-sm"
                value={roleSlug}
                onChange={(e) => setRoleSlug(e.target.value)}
                aria-label="Role"
              >
                <option value="admin">Administrator / project manager</option>
                <option value="member">Engineer (member)</option>
                <option value="viewer">Licensed reviewer (viewer)</option>
              </select>
              <Button type="submit" disabled={loading}>
                Invite
              </Button>
            </form>
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
            <CardDescription>Existing tenant_memberships and workspace_memberships</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {members.map((member) => (
              <div key={member.userId} className="flex flex-wrap items-center justify-between gap-3 rounded border border-slate-200 p-3">
                <div>
                  <p className="font-medium">{member.fullName || member.email || member.userId}</p>
                  <p className="text-xs text-muted-foreground">
                    {member.email} · {member.roleName} · {member.status}
                    {member.workspaces[0] ? ` · ${member.workspaces[0].name ?? member.workspaces[0].slug}` : ""}
                  </p>
                </div>
                <select
                  className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm"
                  value={["admin", "member", "viewer"].includes(member.roleSlug) ? member.roleSlug : "member"}
                  onChange={(e) => void changeRole(member.userId, e.target.value)}
                  aria-label={`Role for ${member.email ?? member.userId}`}
                >
                  <option value="admin">admin</option>
                  <option value="member">member</option>
                  <option value="viewer">viewer</option>
                </select>
              </div>
            ))}
            {members.length === 0 && !error ? (
              <p className="text-sm text-muted-foreground">No members loaded.</p>
            ) : null}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
