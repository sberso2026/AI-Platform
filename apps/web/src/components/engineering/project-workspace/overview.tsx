"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  EmptyOperationalState,
  OperationalError,
  OperationalSkeleton,
} from "@/components/engineering/operational";
import {
  ENGINEERING_HUB_BRANCHES,
  workspaceHref,
  DEFAULT_PILOT_LIFECYCLE,
} from "@/lib/engineering/project-workspace-ia";
import { useProjectWorkspace } from "./use-workspace";
import { Button } from "@rtb/ui";

type WpListItem = {
  stableId: string;
  title: string;
  maturity: string;
  status: string;
  disciplines: { lead: string | null; participating: string[] };
  affectedAssets: Array<{ displayName: string }>;
};

export function ProjectOverviewPanel({
  projectId,
  project,
}: {
  projectId: string;
  project: Record<string, unknown>;
}) {
  const { snapshot, error, loading, post } = useProjectWorkspace(projectId);
  const [packages, setPackages] = useState<WpListItem[]>([]);

  const loadWp = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/engineering/projects/${encodeURIComponent(projectId)}/work-packages?view=list&seedPilot=1`,
        { credentials: "include" },
      );
      if (!res.ok) return;
      const json = (await res.json()) as { data: WpListItem[] };
      setPackages(json.data ?? []);
    } catch {
      /* non-blocking */
    }
  }, [projectId]);

  useEffect(() => {
    void loadWp();
  }, [loadWp]);

  if (loading && !snapshot) return <OperationalSkeleton label="Loading engineering workspace…" />;
  if (error && !snapshot) {
    return <OperationalError message={error} retryHref={workspaceHref(projectId, "")} />;
  }
  if (!snapshot) return null;

  const stage =
    DEFAULT_PILOT_LIFECYCLE.find((s) => s.key === snapshot.lifecycle.currentKey)?.label ??
    snapshot.lifecycle.currentKey;
  const gate = snapshot.lifecycle.gateEvaluations.G0;
  const blockers = gate?.blocking?.length ?? 0;

  return (
    <div className="space-y-6" data-testid="project-overview-engineering">
      <section
        className="rounded-md border border-[color:var(--eos-gold,#c4a35a)]/40 bg-white p-4"
        data-testid="guided-default-banner"
      >
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[color:var(--eos-navy,#0b1f3a)]">
          Guided Engineering
        </p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Start with the engineering problem — not empty registers
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Describe what you are trying to do. EOS prepares the initial definition for review. You confirm
          material exceptions.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={workspaceHref(projectId, "guided")}
            className="inline-flex min-h-11 items-center rounded-md bg-[color:var(--eos-navy,#0b1f3a)] px-4 text-sm font-medium text-white"
            data-testid="open-guided-engineering"
          >
            Open Guided Engineering
          </Link>
          <Link
            href={workspaceHref(projectId, "setup")}
            className="inline-flex min-h-11 items-center text-sm text-slate-700 underline-offset-2 hover:underline"
          >
            Advanced project setup
          </Link>
        </div>
      </section>

      <section
        className="rounded-md border border-slate-200 bg-white p-4"
        data-testid="work-package-primary-execution"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Active Work Packages</h2>
            <p className="text-sm text-slate-600">
              Primary execution view — open a work package before deep registers.
            </p>
          </div>
          <Link
            href={workspaceHref(projectId, "work-packages")}
            className="inline-flex min-h-10 items-center rounded-md border border-slate-300 px-3 text-sm text-slate-800"
            data-testid="open-all-work-packages"
          >
            All Work Packages
          </Link>
        </div>
        {packages.length === 0 ? (
          <div className="mt-3">
            <EmptyOperationalState
              title="No work packages yet"
              description="Create a work package to bound engineering execution."
            />
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100" data-testid="overview-wp-list">
            {packages.slice(0, 6).map((wp) => (
              <li key={wp.stableId} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <div>
                  <Link
                    href={workspaceHref(projectId, "work-packages")}
                    className="font-medium text-slate-900 underline-offset-2 hover:underline"
                    data-testid={`overview-wp-${wp.stableId}`}
                  >
                    {wp.stableId} {wp.title}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {wp.affectedAssets[0]?.displayName ?? "—"} · {wp.maturity} ·{" "}
                    {wp.disciplines.lead ?? "—"} · {wp.status}
                  </p>
                </div>
                <span className="rounded border border-slate-200 px-2 py-0.5 text-[11px] text-slate-600">
                  {wp.disciplines.participating.join(", ") || "—"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section
        className="rounded-md border border-slate-200 bg-white p-4"
        data-testid="engineering-hub"
      >
        <h2 className="text-lg font-semibold text-slate-900">Engineering hub</h2>
        <p className="text-sm text-slate-600">
          Navigation summary — opens existing project capabilities. Does not duplicate engineering state.
        </p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3" data-testid="engineering-hub-branches">
          {ENGINEERING_HUB_BRANCHES.map((b) => (
            <li key={b.id}>
              <Link
                href={workspaceHref(projectId, b.slug)}
                className="flex min-h-11 items-center rounded-md border border-slate-200 px-3 text-sm text-slate-800 hover:border-[color:var(--eos-gold,#c4a35a)]"
                data-testid={`hub-${b.id}`}
              >
                {b.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Project status</h2>
          <p className="text-sm text-slate-600">Compact maturity and readiness — details on demand.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {snapshot.setupStatus === "PROJECT_SETUP_INCOMPLETE" ? (
            <Link
              href={workspaceHref(projectId, "guided")}
              className="inline-flex min-h-11 items-center rounded-md border border-rose-400/40 bg-rose-50 px-3 text-sm text-rose-900"
              data-testid="setup-incomplete-cta"
            >
              Guided start — setup incomplete
            </Link>
          ) : (
            <span className="inline-flex min-h-11 items-center rounded-md border border-emerald-500/30 px-3 text-sm text-emerald-800">
              Setup complete
            </span>
          )}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => post({ action: "seed_pilot_001" })}
          >
            Seed PILOT-001
          </Button>
        </div>
      </div>

      <div
        className="rounded-md border border-slate-200 bg-white p-4"
        data-testid="lifecycle-compact-summary"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Maturity</p>
        <p className="mt-1 text-base font-semibold text-slate-900">{stage}</p>
        <p className="mt-1 text-sm text-slate-600">
          {Math.max(0, 100 - blockers * 12)}% ready · {blockers} blockers · Gate{" "}
          {gate?.result ?? "not evaluated"}
        </p>
        <Link
          href={workspaceHref(projectId, "lifecycle")}
          className="mt-2 inline-block text-sm text-slate-700 underline-offset-2 hover:underline"
          data-testid="view-maturity-details"
        >
          View maturity details
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatusTile
          label="Project"
          value={`${project.project_code ?? ""} — ${project.project_name ?? ""}`}
        />
        <StatusTile label="Lifecycle stage" value={stage} testId="overview-lifecycle-stage" />
        <StatusTile
          label="Site"
          value={snapshot.setup.site || "Not configured"}
        />
        <StatusTile
          label="Engineering Design"
          value={
            snapshot.counts.Calculation
              ? `${snapshot.counts.Calculation} calculation(s)`
              : "Open Engineering Design"
          }
        />
      </div>

      <section className="rounded-md border border-slate-200 bg-white p-4">
        <h3 className="mb-2 text-sm font-semibold text-slate-900">Next required actions</h3>
        <ul className="space-y-1 text-sm text-slate-700">
          {packages.length === 0 ? (
            <li>
              <Link
                href={workspaceHref(projectId, "work-packages")}
                className="underline-offset-2 hover:underline"
              >
                Create first Work Package
              </Link>
            </li>
          ) : null}
          <li>
            <Link
              href={workspaceHref(projectId, "engineering-design")}
              className="underline-offset-2 hover:underline"
              data-testid="overview-open-engineering-design"
            >
              Open Engineering Design
            </Link>
          </li>
          <li>
            <Link
              href={workspaceHref(projectId, "assets")}
              className="underline-offset-2 hover:underline"
            >
              Review Assets & Systems
            </Link>
          </li>
          <li>
            <Link
              href={workspaceHref(projectId, "dependencies")}
              className="underline-offset-2 hover:underline"
            >
              View dependencies
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}

function StatusTile({
  label,
  value,
  testId,
}: {
  label: string;
  value: string;
  testId?: string;
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-3" data-testid={testId}>
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value || "—"}</p>
    </div>
  );
}
