"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@rtb/ui";

type RoleRow = { id: string; name: string; slug: string; description?: string | null };

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/platform/identity/roles")
      .then((res) => res.json().then((json) => ({ ok: res.ok, json })))
      .then(({ ok, json }) => {
        if (!ok) {
          setError(json.error?.message ?? json.error ?? "Unable to load roles");
          return;
        }
        setRoles(json.data?.roles ?? []);
      })
      .catch(() => setError("Unable to load roles"));
  }, []);

  return (
    <>
      <Header title="Roles" description="Canonical tenant roles — assignment happens on Users" />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        <p className="mb-4 text-sm text-slate-600">
          These are the existing Platform RBAC slugs. Assign a role when inviting a user; do not create a
          second role catalogue.{" "}
          <Link href="/users" className="font-medium text-blue-700 hover:underline">
            Open user administration
          </Link>
        </p>
        {error ? (
          <p className="mb-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2">
          {roles.map((role) => (
            <Card key={role.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{role.name}</CardTitle>
                  <Badge variant="secondary">System</Badge>
                </div>
                <CardDescription>{role.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <code className="text-xs text-muted-foreground">{role.slug}</code>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
