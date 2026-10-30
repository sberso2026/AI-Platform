"use client";

import Link from "next/link";
import {
  EmptyOperationalState,
  OperationalError,
  OperationalMetricCard,
  OperationalSkeleton,
} from "@/components/engineering/operational";
import { workspaceHref } from "@/lib/engineering/project-workspace-ia";
import { DEFAULT_PILOT_LIFECYCLE } from "@/lib/engineering/project-workspace-ia";
import { useProjectWorkspace } from "./use-workspace";
import { Button } from "@rtb/ui";

export function ProjectOverviewPanel({
  projectId,
  project,
}: {
  projectId: string;
  project: Record<string, unknown>;
}) {
  const { snapshot, error, loading, post } = useProjectWorkspace(projectId);

  if (loading && !snapshot) return <OperationalSkeleton label="Loading engineering control centre…" />;
  if (error && !snapshot) {
    return <OperationalError message={error} retryHref={workspaceHref(projectId, "")} />;
  }
  if (!snapshot) return null;

  const stage =
    DEFAULT_PILOT_LIFECYCLE.find((s) => s.key === snapshot.lifecycle.currentKey)?.label ??
    snapshot.lifecycle.currentKey;
  const gate = snapshot.lifecycle.gateEvaluations.G0;
  const c = snapshot.counts;

  const cards: Array<{ label: string; value: number; href: string; tone?: "attention" | "neutral" }> = [
    { label: "Requirements", value: c.Requirement ?? 0, href: workspaceHref(projectId, "requirements") },
    { label: "Assumptions", value: c.Assumption ?? 0, href: workspaceHref(projectId, "assumptions") },
    { label: "Interfaces", value: c.Interface ?? 0, href: workspaceHref(projectId, "systems") },
    { label: "Changes", value: c.Change ?? 0, href: workspaceHref(projectId, "changes") },
    { label: "Calculations", value: c.Calculation ?? 0, href: workspaceHref(projectId, "calculations") },
    { label: "Deliverables", value: c.Deliverable ?? 0, href: workspaceHref(projectId, "deliverables") },
    { label: "Reviews", value: c.Review ?? 0, href: workspaceHref(projectId, "reviews") },
    {
      label: "Open decisions",
      value: c.Decision ?? 0,
      href: workspaceHref(projectId, "decisions"),
    },
  ];

  return (
    <div className="space-y-6" data-testid="project-overview-engineering">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Engineering control centre</h2>
          <p className="text-sm text-slate-400">
            Project identity, lifecycle, qualification, and next required actions — not only risks/TQs.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {snapshot.setupStatus === "PROJECT_SETUP_INCOMPLETE" ? (
            <Link
              href={workspaceHref(projectId, "setup")}
              className="inline-flex min-h-11 items-center rounded-md border border-rose-400/40 bg-rose-500/10 px-3 text-sm text-rose-100"
              data-testid="setup-incomplete-cta"
            >
              Configure Project — {snapshot.setupStatus}
            </Link>
          ) : (
            <span className="inline-flex min-h-11 items-center rounded-md border border-emerald-500/30 px-3 text-sm text-emerald-200">
              {snapshot.setupStatus}
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

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatusTile label="Project" value={`${project.project_code ?? ""} — ${project.project_name ?? ""}`} />
        <StatusTile label="Lifecycle stage" value={stage} testId="overview-lifecycle-stage" />
        <StatusTile
          label="Gate G0"
          value={gate?.result ?? "NOT_EVALUATED"}
          testId="overview-gate-status"
        />
        <StatusTile label="Project status" value={String(project.status ?? "—")} />
        <StatusTile
          label="Jurisdiction"
          value={
            snapshot.setup.jurisdiction.country
              ? `${snapshot.setup.jurisdiction.country}${
                  snapshot.setup.jurisdiction.stateRegion
                    ? ` / ${snapshot.setup.jurisdiction.stateRegion}`
                    : ""
                }`
              : "Not configured"
          }
        />
        <StatusTile
          label="Standards profile"
          value={
            snapshot.setup.standards.engineeringStandards[0] ??
            snapshot.setup.standards.codeProfiles[0] ??
            "Not configured"
          }
        />
        <StatusTile
          label="Engineering Basis"
          value={c.EngineeringBasis ? `${c.EngineeringBasis} recorded` : "Missing"}
        />
        <StatusTile
          label="Qualification"
          value={`D1 ${snapshot.qualification.d1} · Non-D1 ${snapshot.qualification.nonD1}`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <OperationalMetricCard
            key={card.label}
            label={card.label}
            value={card.value}
            href={card.href}
            tone={card.value === 0 ? "attention" : "neutral"}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-700 bg-slate-950/60 p-4">
          <h3 className="text-sm font-semibold text-slate-100">Gate readiness</h3>
          <p className="mt-2 text-sm text-slate-300">
            Blocking: {gate?.blocking?.length ? gate.blocking.join("; ") : "none evaluated / none"}
          </p>
          <Link
            href={workspaceHref(projectId, "lifecycle")}
            className="mt-3 inline-block text-sm underline-offset-2 hover:underline"
          >
            Open Lifecycle & Gates
          </Link>
        </section>
        <section className="rounded-lg border border-slate-700 bg-slate-950/60 p-4">
          <h3 className="text-sm font-semibold text-slate-100">Project-to-asset readiness</h3>
          <p className="mt-2 text-sm text-slate-300">{snapshot.handover.readiness}</p>
          <Link
            href={workspaceHref(projectId, "handover")}
            className="mt-3 inline-block text-sm underline-offset-2 hover:underline"
          >
            Open Handover & Readiness
          </Link>
        </section>
      </div>

      <section className="rounded-lg border border-slate-700 bg-slate-950/60 p-4">
        <h3 className="mb-2 text-sm font-semibold text-slate-100">Next required actions</h3>
        <ul className="space-y-1 text-sm text-slate-300">
          {snapshot.setupStatus === "PROJECT_SETUP_INCOMPLETE" ? (
            <li>
              <Link href={workspaceHref(projectId, "setup")} className="underline-offset-2 hover:underline">
                Complete Project Setup checklist
              </Link>
            </li>
          ) : null}
          {!c.Requirement ? (
            <li>
              <Link
                href={workspaceHref(projectId, "requirements")}
                className="underline-offset-2 hover:underline"
              >
                Create first requirement
              </Link>
            </li>
          ) : null}
          {(gate?.result === "HOLD" || gate?.result === "NOT_EVALUATED") && (
            <li>
              <Link href={workspaceHref(projectId, "lifecycle")} className="underline-offset-2 hover:underline">
                Evaluate G0 gate readiness
              </Link>
            </li>
          )}
          <li>
            <Link
              href={workspaceHref(projectId, "digital-thread")}
              className="underline-offset-2 hover:underline"
            >
              Inspect digital thread from REQ-001
            </Link>
          </li>
        </ul>
        {snapshot.audit.length === 0 ? (
          <div className="mt-3">
            <EmptyOperationalState
              title="No recent activity yet"
              description="Create objects or seed PILOT-001 to populate recent audit activity."
            />
          </div>
        ) : (
          <ul className="mt-3 max-h-40 space-y-1 overflow-y-auto text-xs text-slate-400" aria-label="Recent activity">
            {snapshot.audit
              .slice()
              .reverse()
              .slice(0, 8)
              .map((e, i) => (
                <li key={`${e.at}-${i}`}>
                  {e.at} — {e.action}
                </li>
              ))}
          </ul>
        )}
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
    <div className="rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-3" data-testid={testId}>
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-100">{value || "—"}</p>
    </div>
  );
}
