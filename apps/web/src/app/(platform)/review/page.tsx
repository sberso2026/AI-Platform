"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card, CardContent, EmptyState } from "@rtb/ui";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import { REVIEW_DISCLAIMER } from "@/lib/review/labels";

type ProjectRow = {
  id: string;
  code?: string;
  name: string;
};

type ContextMembership = {
  tenantId: string;
  tenantSlug: string;
  roleSlug: string;
  requireMfa: boolean;
  workspaces: Array<{ workspaceId: string; slug: string }>;
};

type ActiveContext = {
  current: {
    tenantId: string;
    workspaceId: string;
    tenantSlug: string;
    roleSlug: string;
  } | null;
  reason?: string;
  memberships: ContextMembership[];
};

export default function ReviewHomePage() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [context, setContext] = useState<ActiveContext | null>(null);
  const [switching, setSwitching] = useState(false);

  const load = useCallback(async () => {
    setLoaded(false);
    const contextRes = await fetch("/api/platform/active-context", { credentials: "same-origin" });
    const contextParsed = await parseApiJsonResponse<ActiveContext>(contextRes);
    if (contextParsed.data) setContext(contextParsed.data);
    const response = await fetch("/api/review/projects", { credentials: "same-origin" });
    const parsed = await parseApiJsonResponse<ProjectRow[]>(response);
    if (!parsed.ok || !parsed.data) {
      setError(parsed.errorMessage ?? "Unable to load authorized projects");
      setProjects([]);
      setLoaded(true);
      return;
    }
    setError(null);
    setProjects(parsed.data);
    setLoaded(true);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function selectContext(tenantId: string, workspaceId: string) {
    setSwitching(true);
    setError(null);
    const response = await fetch("/api/platform/active-context", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId, workspaceId }),
    });
    const parsed = await parseApiJsonResponse(response);
    setSwitching(false);
    if (!parsed.ok) {
      setError(parsed.errorMessage ?? "Unable to select tenant/workspace");
      return;
    }
    await load();
  }

  const memberships = context?.memberships ?? [];

  return (
    <>
      <Header title="Engineering Review" description="Select an authorized project" showEngineeringChrome={false} />
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <p className="text-sm text-muted-foreground">{REVIEW_DISCLAIMER}</p>
        {memberships.length > 1 ? (
          <div className="space-y-2" data-testid="review-context-switcher">
            <p className="text-sm font-medium">Active tenant / workspace</p>
            <div className="flex flex-wrap gap-2">
              {memberships.flatMap((membership) =>
                membership.workspaces.map((workspace) => {
                  const active =
                    context?.current?.tenantId === membership.tenantId &&
                    context?.current?.workspaceId === workspace.workspaceId;
                  return (
                    <button
                      key={`${membership.tenantId}:${workspace.workspaceId}`}
                      type="button"
                      disabled={switching || active}
                      onClick={() => void selectContext(membership.tenantId, workspace.workspaceId)}
                      className={`inline-flex h-10 items-center rounded-md border px-3 text-sm ${
                        active ? "border-primary bg-primary/10 font-medium" : "border-border bg-background"
                      }`}
                    >
                      {membership.tenantSlug} / {workspace.slug}
                    </button>
                  );
                }),
              )}
            </div>
          </div>
        ) : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {!loaded ? <p className="text-sm text-muted-foreground">Loading projects…</p> : null}
        {loaded && projects.length === 0 && !error ? (
          <EmptyState
            title="No authorized projects"
            description="You can only review projects in your current workspace."
          />
        ) : null}
        <div className="space-y-3">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardContent className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="font-medium">{project.code ? `${project.code} — ${project.name}` : project.name}</p>
                </div>
                <Link
                  href={`/review/projects/${project.id}`}
                  className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
                >
                  Open
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
