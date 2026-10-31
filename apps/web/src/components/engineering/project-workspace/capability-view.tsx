"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button, Input } from "@rtb/ui";
import {
  AskEngineeringAI,
  EmptyOperationalState,
  OperationalError,
  OperationalSkeleton,
} from "@/components/engineering/operational";
import type { Eos3ObjectType } from "@/lib/engineering/eos3-canonical-objects";
import {
  DEFAULT_PILOT_LIFECYCLE,
  findWorkspaceNavItem,
  proposedConfirmedEmptyCopy,
  resolveWorkspaceSlug,
  workspaceHref,
  type ProjectWorkspaceNavItem,
} from "@/lib/engineering/project-workspace-ia";
import { ObjectRegisterPanel } from "./object-register";
import { GuidedEngineeringPanel } from "./guided-panel";
import { ProjectSetupPanel } from "./setup-panel";
import { WorkPackagesPanel } from "./work-packages-panel";
import { AssetsSystemsPanel } from "./assets-systems-panel";
import { useProjectWorkspace } from "./use-workspace";
import { ImpactAttentionBanner } from "@/components/engineering/impact-attention-banner";

export function ProjectCapabilityView({
  projectId,
  slug: rawSlug,
}: {
  projectId: string;
  slug: string;
}) {
  const slug = resolveWorkspaceSlug(rawSlug);
  const item = findWorkspaceNavItem(slug);
  const { snapshot, error, loading, post, reload } = useProjectWorkspace(projectId);

  if (loading && !snapshot) {
    return <OperationalSkeleton label="Loading project capability…" />;
  }
  if (error && !snapshot) {
    return <OperationalError message={error} retryHref={workspaceHref(projectId, slug)} />;
  }
  if (!snapshot || !item) {
    return (
      <EmptyOperationalState
        title="Unknown capability"
        description="This project workspace route is not mapped."
      />
    );
  }

  if (slug === "guided") {
    return <GuidedEngineeringPanel projectId={projectId} />;
  }
  if (slug === "work-packages") {
    return <WorkPackagesPanel projectId={projectId} />;
  }
  if (slug === "assets") {
    return <AssetsSystemsPanel projectId={projectId} />;
  }
  if (slug === "setup") {
    return (
      <ProjectSetupPanel
        projectId={projectId}
        snapshot={snapshot}
        onSaved={() => reload()}
      />
    );
  }
  if (slug === "lifecycle") {
    return <LifecyclePanel projectId={projectId} snapshot={snapshot} post={post} />;
  }
  if (slug === "dependencies") {
    return <DependenciesPanel projectId={projectId} snapshot={snapshot} post={post} />;
  }
  if (slug === "digital-thread") {
    return <DigitalThreadPanel projectId={projectId} snapshot={snapshot} post={post} />;
  }
  if (slug === "impact-analysis") {
    return <ImpactPanel projectId={projectId} snapshot={snapshot} post={post} />;
  }
  if (slug === "qualification") {
    return <QualificationPanel snapshot={snapshot} />;
  }
  if (slug === "integrations") {
    return <IntegrationsPanel snapshot={snapshot} />;
  }
  if (slug === "trust") {
    return <TrustPanel snapshot={snapshot} />;
  }
  if (slug === "migration") {
    return <MigrationPanel snapshot={snapshot} />;
  }
  if (slug === "handover") {
    return <HandoverPanel snapshot={snapshot} />;
  }
  if (slug === "evidence" || slug === "audit") {
    return <AuditEvidencePanel snapshot={snapshot} mode={slug} />;
  }
  if (slug === "engineering-ai") {
    return <EngineeringAiPanel projectId={projectId} />;
  }
  if (slug === "engineering-reference" || slug === "knowledge") {
    return (
      <BridgePanel
        item={item}
        projectId={projectId}
        note="Engineering reference with provenance. Search is not the source of record."
      />
    );
  }
  if (slug === "scope-design-basis") {
    return (
      <ScopeDesignBasisPanel projectId={projectId} snapshot={snapshot} post={post} item={item} />
    );
  }
  if (slug === "engineering-design") {
    return (
      <EngineeringDesignPanel projectId={projectId} snapshot={snapshot} post={post} item={item} />
    );
  }
  if (slug === "interfaces" || slug === "systems") {
    return (
      <SystemsInterfacesPanel
        projectId={projectId}
        snapshot={snapshot}
        post={post}
        item={item}
      />
    );
  }
  if (slug === "changes-decisions" || slug === "changes" || slug === "decisions") {
    return (
      <ChangesDecisionsPanel projectId={projectId} snapshot={snapshot} post={post} item={item} />
    );
  }
  if (item.objectType) {
    const type = item.objectType as Eos3ObjectType;
    const objects = snapshot.objects.filter((o) => o.objectType === type);
    const proposed = objects.filter((o) =>
      String(o.governedState).toUpperCase().includes("PROPOS"),
    ).length;
    const confirmed = objects.length - proposed;
    const empty = proposedConfirmedEmptyCopy(
      `${type.toLowerCase()}s`,
      confirmed,
      proposed,
    );
    return (
      <ObjectRegisterPanel
        projectId={projectId}
        objectType={type}
        title={item.label}
        emptyTitle={objects.length === 0 ? empty.title : item.emptyTitle}
        emptyDescription={objects.length === 0 ? empty.description : item.emptyDescription}
        objects={objects}
        bridgeHref={item.bridgeHref?.(projectId)}
        extraColumns={extraCols(type)}
        onCreate={async (input) => {
          await post({
            action: "create_object",
            objectType: type,
            ...input,
          });
        }}
      />
    );
  }

  return <BridgePanel item={item} projectId={projectId} />;
}

function extraCols(type: Eos3ObjectType) {
  if (type === "Calculation") {
    return [
      { key: "qualificationStatus", label: "Qualification" },
      { key: "discipline", label: "Discipline" },
    ];
  }
  if (type === "Assumption") {
    return [
      { key: "equipmentMass", label: "Mass" },
      { key: "status", label: "Asm status" },
    ];
  }
  if (type === "Decision") {
    return [{ key: "question", label: "Question" }];
  }
  return [{ key: "status", label: "Detail" }];
}

function BridgePanel({
  item,
  projectId,
  note,
}: {
  item: ProjectWorkspaceNavItem;
  projectId: string;
  note?: string;
}) {
  const href = item.bridgeHref?.(projectId);
  return (
    <section data-testid={`bridge-${item.id}`}>
      <h2 className="text-lg font-semibold text-slate-100">{item.label}</h2>
      <p className="mt-1 text-sm text-slate-400">{item.emptyDescription}</p>
      {note ? <p className="mt-2 text-xs text-amber-200">{note}</p> : null}
      {href ? (
        <p className="mt-4">
          <Link
            href={href}
            className="inline-flex min-h-11 items-center rounded-md bg-slate-100 px-4 text-sm font-medium text-slate-900"
          >
            Open {item.label} for this project
          </Link>
        </p>
      ) : (
        <EmptyOperationalState title={item.emptyTitle} description={item.emptyDescription} />
      )}
    </section>
  );
}

function ScopeDesignBasisPanel({
  projectId,
  snapshot,
  post,
  item,
}: {
  projectId: string;
  snapshot: NonNullable<ReturnType<typeof useProjectWorkspace>["snapshot"]>;
  post: ReturnType<typeof useProjectWorkspace>["post"];
  item: ProjectWorkspaceNavItem;
}) {
  const requirements = snapshot.objects.filter((o) => o.objectType === "Requirement");
  const basis = snapshot.objects.filter((o) => o.objectType === "EngineeringBasis");
  const assumptions = snapshot.objects.filter((o) => o.objectType === "Assumption");
  const proposedReq = requirements.filter((o) =>
    String(o.governedState).toUpperCase().includes("PROPOS"),
  ).length;
  const emptyReq = proposedConfirmedEmptyCopy(
    "requirements",
    requirements.length - proposedReq,
    proposedReq,
  );

  return (
    <div className="space-y-8" data-testid="scope-design-basis-panel">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{item.label}</h2>
        <p className="text-sm text-slate-600">
          Requirements, engineering basis, and assumptions — confirm proposed items before treating them as
          fact.
        </p>
      </div>
      <ObjectRegisterPanel
        projectId={projectId}
        objectType="Requirement"
        title="Requirements"
        emptyTitle={emptyReq.title}
        emptyDescription={emptyReq.description}
        objects={requirements}
        bridgeHref={item.bridgeHref?.(projectId)}
        onCreate={async (input) => {
          await post({ action: "create_object", objectType: "Requirement", ...input });
        }}
      />
      <ObjectRegisterPanel
        projectId={projectId}
        objectType="EngineeringBasis"
        title="Engineering Basis"
        emptyTitle="No engineering basis recorded"
        emptyDescription="Create the project engineering basis and link jurisdiction/standards."
        objects={basis}
        onCreate={async (input) => {
          await post({ action: "create_object", objectType: "EngineeringBasis", ...input });
        }}
      />
      <section data-testid="contextual-assumptions" className="space-y-2">
        <h3 className="text-base font-semibold text-slate-900">Assumptions</h3>
        <p className="text-xs text-slate-500">
          Shown in context — not a dominant primary module. Detailed register remains available here.
        </p>
        {assumptions.length === 0 ? (
          <EmptyOperationalState
            title="No assumptions recorded"
            description="Assumptions appear here and on calculations, decisions, and work packages."
          />
        ) : (
          <ul className="divide-y divide-slate-200 rounded-md border border-slate-200 bg-white">
            {assumptions.map((a) => (
              <li key={a.id} className="flex flex-wrap items-baseline gap-2 px-3 py-2 text-sm text-slate-800">
                <span className="font-mono text-xs text-slate-500">{a.stableObjectId}</span>
                <span className="font-medium">{a.displayName}</span>
                <span className="text-xs text-slate-500">
                  {String(a.payload?.equipmentMass ?? a.payload?.value ?? "—")}
                </span>
                <span className="text-xs text-amber-800">
                  {String(a.payload?.status ?? a.governedState)}
                </span>
                <span className="text-xs text-slate-500">
                  Used by {String(a.payload?.usedBy ?? "related calculations")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function EngineeringDesignPanel({
  projectId,
  snapshot,
  post,
  item,
}: {
  projectId: string;
  snapshot: NonNullable<ReturnType<typeof useProjectWorkspace>["snapshot"]>;
  post: ReturnType<typeof useProjectWorkspace>["post"];
  item: ProjectWorkspaceNavItem;
}) {
  const calcs = snapshot.objects.filter((o) => o.objectType === "Calculation");
  const assumptions = snapshot.objects.filter((o) => o.objectType === "Assumption");
  const impactedCalcs = calcs.filter((c) => {
    const state = String(c.payload?.impactState ?? c.governedState ?? "");
    return ["STALE", "REVIEW_REQUIRED", "IMPACT_CANDIDATE", "POTENTIALLY_AFFECTED"].includes(state);
  });
  return (
    <div className="space-y-6" data-testid="engineering-design-panel">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Engineering Design</h2>
        <p className="text-sm text-slate-600">
          Active design home — calculations, models, drawings, specifications, and design notes. Deliverables
          remain under Deliverables & Records.
        </p>
        <dl
          className="mt-2 grid gap-x-4 gap-y-0.5 text-xs text-slate-600 sm:grid-cols-2"
          data-testid="ed-resolved-context"
        >
          <div>
            <dt className="inline text-slate-500">Work Package: </dt>
            <dd className="inline font-medium text-slate-900">WP-STR-004 Support Frame Modification</dd>
          </div>
          <div>
            <dt className="inline text-slate-500">Current Stage: </dt>
            <dd className="inline font-medium text-slate-900">Engineering Design</dd>
          </div>
          <div>
            <dt className="inline text-slate-500">Asset / System: </dt>
            <dd className="inline font-medium text-slate-900">Support Frame</dd>
          </div>
          <div>
            <dt className="inline text-slate-500">Needs Attention: </dt>
            <dd className="inline font-medium text-slate-900">CALC-001 review</dd>
          </div>
        </dl>
        <div
          className="mt-2 text-xs text-slate-700"
          data-testid="ed-cockpit-context"
        >
          <span data-testid="ed-cockpit-next-action">
            Next Action: Review CALC-001 against revised 15 t equipment load
          </span>
        </div>
        <div
          className="mt-2 rounded-md border border-slate-100 bg-slate-50/80 p-3 text-xs text-slate-800"
          data-testid="ed-stage-guidance"
          data-eos-stage-progressive="yes"
        >
          <p data-testid="ed-stage-current">
            <span className="font-semibold text-slate-500">Current Stage: </span>
            Engineering Design
          </p>
          <p className="mt-1 font-semibold text-slate-500">Required Now</p>
          <ul className="mt-0.5 list-inside list-disc" data-testid="ed-stage-required-now">
            <li>Review revised vendor load</li>
            <li>Update CALC-001</li>
            <li>Resolve ASM-001</li>
          </ul>
          <p className="mt-1" data-testid="ed-stage-next-checkpoint">
            <span className="font-semibold text-slate-500">Next Checkpoint: </span>
            Verification
          </p>
          <p className="mt-1" data-testid="ed-stage-blocking">
            <span className="font-semibold text-slate-500">Blocking: </span>
            CALC-001 review · DEC-001 reassessment
          </p>
        </div>
      </div>
      {impactedCalcs.length > 0 ? (
        <div className="space-y-2" data-testid="engineering-design-impact-context">
          {impactedCalcs.map((c) => (
            <ImpactAttentionBanner
              key={c.id}
              testId={`calc-impact-${c.stableObjectId}`}
              title="Input changed — calculation may need review"
              detail={String(
                c.payload?.impactReason ??
                  `${c.stableObjectId} ${c.displayName} may be affected by upstream change`,
              )}
              impactState={String(c.payload?.impactState ?? c.governedState)}
              onViewImpactHref={`/engineering/projects/${encodeURIComponent(projectId)}/dependencies?stableId=${encodeURIComponent(c.stableObjectId)}`}
            />
          ))}
        </div>
      ) : null}
      <ObjectRegisterPanel
        projectId={projectId}
        objectType="Calculation"
        title="Calculations & design outputs"
        emptyTitle={item.emptyTitle}
        emptyDescription={item.emptyDescription}
        objects={calcs}
        bridgeHref={item.bridgeHref?.(projectId)}
        extraColumns={extraCols("Calculation")}
        onCreate={async (input) => {
          await post({ action: "create_object", objectType: "Calculation", ...input });
        }}
      />
      {assumptions.length > 0 ? (
        <section data-testid="design-contextual-assumptions" className="rounded-md border border-slate-200 bg-white p-3">
          <h3 className="text-sm font-semibold text-slate-900">Assumptions used in design</h3>
          <ul className="mt-2 space-y-1 text-xs text-slate-700">
            {assumptions.map((a) => (
              <li key={a.id}>
                <span className="font-mono">{a.stableObjectId}</span> {a.displayName} ·{" "}
                {String(a.payload?.equipmentMass ?? "—")} · {String(a.payload?.status ?? a.governedState)}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <p className="text-xs text-slate-500">
        Models and drawings open from linked records — not duplicated here as separate engineering truth.
      </p>
    </div>
  );
}

function ChangesDecisionsPanel({
  projectId,
  snapshot,
  post,
  item,
}: {
  projectId: string;
  snapshot: NonNullable<ReturnType<typeof useProjectWorkspace>["snapshot"]>;
  post: ReturnType<typeof useProjectWorkspace>["post"];
  item: ProjectWorkspaceNavItem;
}) {
  const decisions = snapshot.objects.filter((o) => o.objectType === "Decision");
  const changes = snapshot.objects.filter((o) => o.objectType === "Change");
  const assumptions = snapshot.objects.filter((o) => o.objectType === "Assumption");
  const reassessment = decisions.filter((d) => {
    const state = String(d.payload?.impactState ?? d.payload?.status ?? "");
    return state === "REASSESSMENT_REQUIRED" || state === "STALE" || state === "IMPACT_CANDIDATE";
  });
  return (
    <div className="space-y-6" data-testid="changes-decisions-panel">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{item.label}</h2>
        <p className="text-sm text-slate-600">
          Decisions require human authority. Recommendations are not decisions.
        </p>
      </div>
      {reassessment.length > 0 ? (
        <div className="space-y-2" data-testid="decision-impact-context">
          {reassessment.map((d) => (
            <ImpactAttentionBanner
              key={d.id}
              testId={`decision-impact-${d.stableObjectId}`}
              title="Supporting information changed — decision may require reassessment"
              detail={String(
                d.payload?.impactReason ??
                  `${d.stableObjectId} relied on engineering information that changed`,
              )}
              impactState={String(d.payload?.impactState ?? d.payload?.status ?? "REASSESSMENT_REQUIRED")}
              onViewImpactHref={`/engineering/projects/${encodeURIComponent(projectId)}/dependencies?stableId=${encodeURIComponent(d.stableObjectId)}`}
            />
          ))}
        </div>
      ) : null}
      <div className="space-y-3" data-testid="decision-engineering-ui">
        {decisions.length === 0 ? (
          <EmptyOperationalState
            title="No confirmed decisions"
            description="Decision records for this project will appear here."
          />
        ) : (
          decisions.map((d) => (
            <article
              key={d.id}
              className="rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-800"
              data-testid={`decision-card-${d.stableObjectId}`}
            >
              <header className="flex flex-wrap items-baseline gap-2">
                <span className="font-mono text-xs text-slate-500">{d.stableObjectId}</span>
                <h3 className="font-semibold">{d.displayName}</h3>
                <span className="rounded border border-slate-300 px-1.5 text-[11px]">
                  {String(d.payload?.status ?? d.lifecycleState)}
                </span>
              </header>
              <p className="mt-2 text-sm">
                <span className="text-slate-500">Question: </span>
                {String(d.payload?.question ?? d.displayName)}
              </p>
              {d.payload?.attentionReason ? (
                <p className="mt-1 text-xs text-amber-800">
                  Why attention: {String(d.payload.attentionReason)}
                </p>
              ) : null}
              <dl className="mt-2 grid gap-1 text-xs text-slate-600 sm:grid-cols-2">
                <div>Work Package: {String(d.payload?.workPackageId ?? "—")}</div>
                <div>Asset/System: {String(d.payload?.assetSystem ?? "—")}</div>
                <div>Options: {String(d.payload?.options ?? "—")}</div>
                <div>Evidence: {String(d.payload?.evidence ?? "—")}</div>
                <div>
                  Assumptions:{" "}
                  {assumptions
                    .slice(0, 3)
                    .map((a) => a.stableObjectId)
                    .join(", ") || "—"}
                </div>
                <div>Calculations: {String(d.payload?.calculations ?? "—")}</div>
                <div>Authority: {String(d.payload?.authority ?? "Human engineering authority")}</div>
                <div>
                  Recommendation: {String(d.payload?.recommendation ?? "—")}{" "}
                  <span className="text-slate-400">(not a decision)</span>
                </div>
                <div>Rationale: {String(d.payload?.rationale ?? "—")}</div>
                <div>Affected: {String(d.payload?.affectedItems ?? "—")}</div>
              </dl>
            </article>
          ))
        )}
      </div>
      <ChangesImpactPanel projectId={projectId} snapshot={snapshot} post={post} item={item} />
      {changes.length === 0 ? null : (
        <p className="text-xs text-slate-500">{changes.length} change record(s) in project context.</p>
      )}
    </div>
  );
}

function DependenciesPanel({
  projectId,
  snapshot,
  post,
}: {
  projectId: string;
  snapshot: NonNullable<ReturnType<typeof useProjectWorkspace>["snapshot"]>;
  post: ReturnType<typeof useProjectWorkspace>["post"];
}) {
  return (
    <section className="space-y-4" data-testid="dependencies-engineering-ui">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Dependencies</h2>
        <p className="text-sm text-slate-600">
          Upstream and downstream engineering relationships. Full graph visualization is under Advanced.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-800">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Upstream</p>
          <p className="mt-2 font-mono text-xs leading-6">
            Vendor Data
            <br />→ Equipment Load
            <br />→ Structural Calculation
          </p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-800">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Downstream</p>
          <p className="mt-2 font-mono text-xs leading-6">
            Structural Calculation
            <br />→ Decision
            <br />→ Drawing
          </p>
        </div>
      </div>
      <p className="text-xs text-slate-500">
        {snapshot.objects.length} governed objects available for dependency traversal.
      </p>
      <div className="flex flex-wrap gap-2">
        <Link
          href={workspaceHref(projectId, "digital-thread")}
          className="inline-flex min-h-10 items-center rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800"
          data-testid="view-dependencies-full"
        >
          View dependencies — Full view
        </Link>
        <Button
          type="button"
          variant="outline"
          onClick={async () => {
            const start =
              snapshot.objects.find((o) => o.stableObjectId === "CALC-001")?.id ??
              snapshot.objects[0]?.id;
            if (!start) return;
            await post({ action: "thread", objectId: start });
          }}
        >
          View dependencies
        </Button>
      </div>
      <DigitalThreadPanel projectId={projectId} snapshot={snapshot} post={post} compact />
    </section>
  );
}

function LifecyclePanel({
  projectId,
  snapshot,
  post,
}: {
  projectId: string;
  snapshot: NonNullable<ReturnType<typeof useProjectWorkspace>["snapshot"]>;
  post: ReturnType<typeof useProjectWorkspace>["post"];
}) {
  const [authority, setAuthority] = useState("project_lead");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const currentIdx = DEFAULT_PILOT_LIFECYCLE.findIndex(
    (s) => s.key === snapshot.lifecycle.currentKey,
  );
  const next = DEFAULT_PILOT_LIFECYCLE[currentIdx + 1];
  const gateEval = snapshot.lifecycle.gateEvaluations.G0;
  const stageLabel =
    DEFAULT_PILOT_LIFECYCLE.find((s) => s.key === snapshot.lifecycle.currentKey)?.label ??
    snapshot.lifecycle.currentKey;
  const blockers = gateEval?.blocking?.length ?? 0;

  return (
    <section data-testid="lifecycle-panel" className="space-y-4">
      <div
        className="rounded-md border border-slate-200 bg-white p-4"
        data-testid="lifecycle-compact-summary"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Maturity</p>
        <p className="mt-1 text-lg font-semibold text-slate-900">{stageLabel}</p>
        <p className="mt-1 text-sm text-slate-600">
          {gateEval ? `${Math.max(0, 100 - blockers * 12)}% ready` : "Readiness pending evaluation"} ·{" "}
          {blockers} blocker{blockers === 1 ? "" : "s"} ·{" "}
          {(snapshot.counts?.Review ?? 0) > 0
            ? `${snapshot.counts.Review} review outstanding`
            : "No outstanding reviews"}
        </p>
        <button
          type="button"
          className="mt-2 text-sm text-slate-700 underline-offset-2 hover:underline"
          data-testid="view-maturity-details"
          onClick={() => setDetailsOpen((v) => !v)}
        >
          {detailsOpen ? "Hide maturity details" : "View maturity details"}
        </button>
      </div>
      {!detailsOpen ? null : (
        <>
      <h2 className="text-lg font-semibold text-slate-900">Lifecycle & Stage Gates</h2>
      <p className="text-sm text-slate-600">
        Current stage is governed — not a free-text field. Advancement requires valid transitions and human
        authority at gates.
      </p>
      <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
        <p className="text-xs text-slate-500">Current stage</p>
        <p className="text-lg font-semibold text-slate-100" data-testid="current-lifecycle-stage">
          {DEFAULT_PILOT_LIFECYCLE.find((s) => s.key === snapshot.lifecycle.currentKey)?.label ??
            snapshot.lifecycle.currentKey}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Previous:{" "}
          {currentIdx > 0 ? DEFAULT_PILOT_LIFECYCLE[currentIdx - 1].label : "—"} · Next:{" "}
          {next?.label ?? "—"}
        </p>
      </div>

      <ol className="space-y-2" aria-label="Lifecycle template">
        {DEFAULT_PILOT_LIFECYCLE.map((step) => {
          const active = step.key === snapshot.lifecycle.currentKey;
          const gate = step.kind === "gate" ? snapshot.lifecycle.gateEvaluations[step.key] : null;
          return (
            <li
              key={step.key}
              className={`rounded border px-3 py-2 text-sm ${
                active ? "border-amber-500/50 bg-amber-500/10 text-amber-100" : "border-slate-700 text-slate-300"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span>
                  {step.label}{" "}
                  <span className="text-[11px] uppercase text-slate-500">{step.kind}</span>
                </span>
                {gate ? (
                  <span className="text-xs" data-testid={`gate-result-${step.key}`}>
                    {gate.result}
                    {gate.blocking.length ? ` · blocking: ${gate.blocking.length}` : ""}
                  </span>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-end gap-3">
        <label className="text-xs text-slate-400">
          Human authority role
          <Input className="mt-1" value={authority} onChange={(e) => setAuthority(e.target.value)} />
        </label>
        <Button
          type="button"
          onClick={async () => {
            setErr(null);
            try {
              const data = (await post({
                action: "evaluate_gate",
                gateKey: "G0",
                authority,
              })) as { result?: string; blocking?: string[] };
              setMsg(`G0 evaluation: ${data?.result ?? "done"}`);
            } catch (ex: unknown) {
              setErr(ex instanceof Error ? ex.message : "Evaluate failed");
            }
          }}
        >
          Evaluate G0
        </Button>
        {next ? (
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              setErr(null);
              try {
                await post({
                  action: "transition_lifecycle",
                  toKey: next.key,
                  authority,
                  rationale: "Governed advancement from project workspace",
                });
                setMsg(`Advanced to ${next.key}`);
              } catch (ex: unknown) {
                setErr(ex instanceof Error ? ex.message : "Transition blocked");
              }
            }}
          >
            Advance to {next.key}
          </Button>
        ) : null}
        <Link
          href={`/engineering/lifecycle?projectId=${projectId}`}
          className="text-sm underline-offset-2 hover:underline"
        >
          Open full lifecycle workspace
        </Link>
      </div>
      {gateEval ? (
        <div className="rounded border border-slate-700 p-3 text-xs text-slate-300" data-testid="g0-evaluation-detail">
          <p>Gate requirements / evidence: {gateEval.evidence.join(", ") || "—"}</p>
          <p>Blocking: {gateEval.blocking.join("; ") || "none"}</p>
          <p>Conditions: {gateEval.conditions.join("; ") || "—"}</p>
          <p>Authority: {gateEval.authority ?? "—"}</p>
        </div>
      ) : null}
      {msg ? <p className="text-sm text-emerald-700">{msg}</p> : null}
      {err ? <OperationalError message={err} /> : null}
        </>
      )}
    </section>
  );
}

function DigitalThreadPanel({
  projectId,
  snapshot,
  post,
  compact = false,
}: {
  projectId: string;
  snapshot: NonNullable<ReturnType<typeof useProjectWorkspace>["snapshot"]>;
  post: ReturnType<typeof useProjectWorkspace>["post"];
  compact?: boolean;
}) {
  const params = useSearchParams();
  const initial = params.get("objectId") ?? snapshot.objects.find((o) => o.stableObjectId === "REQ-001")?.id ?? "";
  const [objectId, setObjectId] = useState(initial);
  const [path, setPath] = useState<
    Array<{ objectId: string; objectType: string; stableObjectId: string; via: string | null }>
  >([]);
  const [err, setErr] = useState<string | null>(null);

  return (
    <section data-testid="digital-thread-panel" className="space-y-4">
      {compact ? null : (
        <>
          <h2 className="text-lg font-semibold text-slate-900">Dependencies — Full view</h2>
          <p className="text-sm text-slate-600">
            Full relationship view for advanced inspection. Prefer Dependencies for routine work.
          </p>
        </>
      )}
      <div className="flex flex-wrap gap-2">
        <label className="text-xs text-slate-400">
          Start object
          <select
            className="mt-1 block min-h-11 rounded-md border border-slate-600 bg-slate-950 px-2 text-sm text-slate-100"
            value={objectId}
            onChange={(e) => setObjectId(e.target.value)}
          >
            <option value="">Select…</option>
            {snapshot.objects.map((o) => (
              <option key={o.id} value={o.id}>
                {o.stableObjectId} — {o.objectType}
              </option>
            ))}
          </select>
        </label>
        <Button
          type="button"
          className="self-end"
          onClick={async () => {
            setErr(null);
            try {
              const data = (await post({ action: "thread", objectId })) as {
                path?: typeof path;
              };
              setPath(data?.path ?? []);
            } catch (ex: unknown) {
              setErr(ex instanceof Error ? ex.message : "Thread failed");
            }
          }}
        >
          Traverse
        </Button>
      </div>
      {err ? <OperationalError message={err} /> : null}
      {path.length === 0 ? (
        <EmptyOperationalState
          title="No thread loaded"
          description="Select a starting object such as REQ-001 and traverse the canonical graph."
        />
      ) : (
        <ol className="space-y-2" data-testid="digital-thread-path">
          {path.map((step, i) => (
            <li key={`${step.objectId}-${i}`} className="rounded border border-slate-700 px-3 py-2 text-sm text-slate-200">
              <span className="font-mono text-xs text-amber-200">{step.stableObjectId}</span>{" "}
              <span className="text-slate-400">{step.objectType}</span>
              {step.via ? <span className="ml-2 text-[11px] text-slate-500">via {step.via}</span> : null}
              <Link
                href={workspaceHref(projectId, slugForType(step.objectType))}
                className="ml-3 text-xs underline-offset-2 hover:underline"
              >
                Open
              </Link>
            </li>
          ))}
        </ol>
      )}
      <p className="text-xs text-slate-500">
        Relationships in store: {snapshot.relationships.length} (lazy traversal — full graph not eagerly rendered)
      </p>
    </section>
  );
}

function slugForType(objectType: string): string {
  const map: Record<string, string> = {
    Requirement: "scope-design-basis",
    EngineeringBasis: "scope-design-basis",
    Assumption: "scope-design-basis",
    System: "interfaces",
    Interface: "interfaces",
    Calculation: "engineering-design",
    Decision: "changes-decisions",
    Review: "reviews",
    Change: "changes-decisions",
    Deliverable: "deliverables",
    Asset: "assets",
    Inspection: "inspections",
    WorkPackage: "work-packages",
  };
  return map[objectType] ?? "dependencies";
}

function ImpactPanel({
  projectId,
  snapshot,
  post,
}: {
  projectId: string;
  snapshot: NonNullable<ReturnType<typeof useProjectWorkspace>["snapshot"]>;
  post: ReturnType<typeof useProjectWorkspace>["post"];
}) {
  const changes = snapshot.objects.filter((o) => o.objectType === "Change");
  const [changeId, setChangeId] = useState(changes[0]?.id ?? "");
  const [rows, setRows] = useState<
    Array<{
      objectId: string;
      objectType?: string;
      displayName?: string;
      stableObjectId?: string;
      governedState: string;
    }>
  >([]);
  const [err, setErr] = useState<string | null>(null);

  return (
    <section data-testid="impact-analysis-panel" className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-100">Impact Analysis</h2>
      <p className="text-sm text-slate-400">
        Given a change, show affected canonical objects and governed staleness.
      </p>
      <div className="flex flex-wrap gap-2">
        <select
          className="min-h-11 rounded-md border border-slate-600 bg-slate-950 px-2 text-sm text-slate-100"
          value={changeId}
          onChange={(e) => setChangeId(e.target.value)}
        >
          {changes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.stableObjectId} — {c.displayName}
            </option>
          ))}
        </select>
        <Button
          type="button"
          onClick={async () => {
            setErr(null);
            try {
              const data = (await post({ action: "impact", changeId })) as typeof rows;
              setRows(Array.isArray(data) ? data : []);
            } catch (ex: unknown) {
              setErr(ex instanceof Error ? ex.message : "Impact failed");
            }
          }}
        >
          Analyse impact
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={async () => {
            await post({
              action: "apply_mass_change",
              changeStableId: "CHG-001",
              fromMass: "12 t",
              toMass: "15 t",
            });
            setErr(null);
          }}
        >
          Apply pilot mass 12t→15t
        </Button>
      </div>
      {err ? <OperationalError message={err} /> : null}
      {rows.length === 0 ? (
        <EmptyOperationalState
          title="No impact rows"
          description="Select CHG-001 and analyse, or apply the pilot mass change first."
        />
      ) : (
        <table className="min-w-full text-left text-sm" data-testid="impact-rows">
          <thead className="text-xs uppercase text-slate-500">
            <tr>
              <th className="px-2 py-1">Object</th>
              <th className="px-2 py-1">Type</th>
              <th className="px-2 py-1">State</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.objectId} className="border-t border-slate-800 text-slate-200">
                <td className="px-2 py-1 font-mono text-xs">{r.stableObjectId}</td>
                <td className="px-2 py-1">{r.objectType}</td>
                <td className="px-2 py-1">{r.governedState}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Link href={workspaceHref(projectId, "changes")} className="text-sm underline-offset-2 hover:underline">
        Back to Changes
      </Link>
    </section>
  );
}

function ChangesImpactPanel({
  projectId,
  snapshot,
  post,
  item,
}: {
  projectId: string;
  snapshot: NonNullable<ReturnType<typeof useProjectWorkspace>["snapshot"]>;
  post: ReturnType<typeof useProjectWorkspace>["post"];
  item: ProjectWorkspaceNavItem;
}) {
  const objects = snapshot.objects.filter((o) => o.objectType === "Change");
  return (
    <div className="space-y-6">
      <ObjectRegisterPanel
        projectId={projectId}
        objectType="Change"
        title="Changes & Impact"
        emptyTitle={item.emptyTitle}
        emptyDescription={item.emptyDescription}
        objects={objects}
        bridgeHref={item.bridgeHref?.(projectId)}
        onCreate={async (input) => {
          await post({ action: "create_object", objectType: "Change", ...input });
        }}
      />
      <p>
        <Link
          href={workspaceHref(projectId, "impact-analysis")}
          className="text-sm font-medium underline-offset-2 hover:underline"
        >
          Open Impact Analysis
        </Link>
      </p>
    </div>
  );
}

function SystemsInterfacesPanel({
  projectId,
  snapshot,
  post,
  item,
}: {
  projectId: string;
  snapshot: NonNullable<ReturnType<typeof useProjectWorkspace>["snapshot"]>;
  post: ReturnType<typeof useProjectWorkspace>["post"];
  item: ProjectWorkspaceNavItem;
}) {
  const systems = snapshot.objects.filter((o) => o.objectType === "System");
  const interfaces = snapshot.objects.filter((o) => o.objectType === "Interface");
  return (
    <div className="space-y-8" data-testid="systems-interfaces-panel">
      <ObjectRegisterPanel
        projectId={projectId}
        objectType="System"
        title="Systems"
        emptyTitle="No systems recorded"
        emptyDescription={item.emptyDescription}
        objects={systems}
        bridgeHref={`/engineering/systems?projectId=${projectId}`}
        onCreate={async (input) => {
          await post({ action: "create_object", objectType: "System", ...input });
        }}
      />
      <ObjectRegisterPanel
        projectId={projectId}
        objectType="Interface"
        title="Interfaces"
        emptyTitle="No interfaces recorded"
        emptyDescription="Define internal/external interfaces with owner and status."
        objects={interfaces}
        bridgeHref={`/engineering/interfaces?projectId=${projectId}`}
        onCreate={async (input) => {
          await post({ action: "create_object", objectType: "Interface", ...input });
        }}
      />
    </div>
  );
}

function QualificationPanel({
  snapshot,
}: {
  snapshot: NonNullable<ReturnType<typeof useProjectWorkspace>["snapshot"]>;
}) {
  const q = snapshot.qualification;
  return (
    <section data-testid="qualification-panel" className="space-y-3">
      <h2 className="text-lg font-semibold text-slate-100">Qualification</h2>
      <ul className="space-y-2 text-sm text-slate-200">
        <li>D1: <strong>{q.d1}</strong></li>
        <li>Non-D1: <strong>{q.nonD1}</strong></li>
        <li>SPACE GASS global qualification: <strong>{q.spaceGassGlobal}</strong></li>
        <li>External solver global qualification: <strong>{q.externalSolverGlobal}</strong></li>
      </ul>
      <p className="text-xs text-slate-400">
        UI styling must not imply qualification that does not exist. CONNECTED ≠ QUALIFIED.
      </p>
    </section>
  );
}

function IntegrationsPanel({
  snapshot,
}: {
  snapshot: NonNullable<ReturnType<typeof useProjectWorkspace>["snapshot"]>;
}) {
  return (
    <section className="space-y-4" data-testid="integrations-panel">
      <h2 className="text-lg font-semibold text-slate-100">Integrations & Solvers</h2>
      <table className="min-w-full text-left text-sm">
        <thead className="text-xs uppercase text-slate-500">
          <tr>
            <th className="px-2 py-1">Connector</th>
            <th className="px-2 py-1">Capability</th>
            <th className="px-2 py-1">Status</th>
            <th className="px-2 py-1">Qualification</th>
          </tr>
        </thead>
        <tbody>
          {snapshot.integrations.map((i) => (
            <tr key={i.connector} className="border-t border-slate-800 text-slate-200">
              <td className="px-2 py-1">{i.connector}</td>
              <td className="px-2 py-1">{i.capability}</td>
              <td className="px-2 py-1">{i.status}</td>
              <td className="px-2 py-1">{i.qualification}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3 className="text-sm font-semibold text-slate-100">Solvers</h3>
      <table className="min-w-full text-left text-sm">
        <thead className="text-xs uppercase text-slate-500">
          <tr>
            <th className="px-2 py-1">Name</th>
            <th className="px-2 py-1">Mode</th>
            <th className="px-2 py-1">Qualification</th>
            <th className="px-2 py-1">Execution</th>
          </tr>
        </thead>
        <tbody>
          {snapshot.solvers.map((s) => (
            <tr key={s.name} className="border-t border-slate-800 text-slate-200">
              <td className="px-2 py-1">{s.name}</td>
              <td className="px-2 py-1">{s.mode}</td>
              <td className="px-2 py-1">{s.qualification}</td>
              <td className="px-2 py-1">{s.executionSupport}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function TrustPanel({
  snapshot,
}: {
  snapshot: NonNullable<ReturnType<typeof useProjectWorkspace>["snapshot"]>;
}) {
  const t = snapshot.trust;
  return (
    <section data-testid="trust-panel" className="space-y-3">
      <h2 className="text-lg font-semibold text-slate-100">Trust / Release Status</h2>
      <dl className="grid gap-2 text-sm text-slate-200 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-slate-500">EOS generation</dt>
          <dd>{t.generation}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Release state</dt>
          <dd>{t.releaseState}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Activation</dt>
          <dd>{t.activation}</dd>
        </div>
      </dl>
      <div>
        <h3 className="text-sm font-semibold">Supported</h3>
        <ul className="list-disc pl-5 text-sm text-slate-300">
          {t.supported.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="text-sm font-semibold">Unsupported</h3>
        <ul className="list-disc pl-5 text-sm text-slate-300">
          {t.unsupported.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="text-sm font-semibold">Limitations</h3>
        <ul className="list-disc pl-5 text-sm text-slate-300">
          {t.limitations.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function MigrationPanel({
  snapshot,
}: {
  snapshot: NonNullable<ReturnType<typeof useProjectWorkspace>["snapshot"]>;
}) {
  const m = snapshot.migration;
  return (
    <section data-testid="migration-panel" className="space-y-2 text-sm text-slate-200">
      <h2 className="text-lg font-semibold text-slate-100">Migration Status</h2>
      <p>{m.claim}</p>
      <p>Eligibility: {m.eligibility}</p>
      <p>Status: {m.status}</p>
      <p>Authorization: {m.authorization}</p>
      <p className="text-xs text-amber-200">Do not encourage Production migration from this UI.</p>
    </section>
  );
}

function HandoverPanel({
  snapshot,
}: {
  snapshot: NonNullable<ReturnType<typeof useProjectWorkspace>["snapshot"]>;
}) {
  const h = snapshot.handover;
  return (
    <section data-testid="handover-panel" className="space-y-2 text-sm text-slate-200">
      <h2 className="text-lg font-semibold text-slate-100">Handover & Readiness</h2>
      <p>Readiness: {h.readiness}</p>
      <p>Acceptance: {h.acceptance}</p>
      <p>Design vs as-built: {h.designVsAsBuilt}</p>
      <p>Outstanding: {h.outstanding.length ? h.outstanding.join(", ") : "none recorded"}</p>
    </section>
  );
}

function AuditEvidencePanel({
  snapshot,
  mode,
}: {
  snapshot: NonNullable<ReturnType<typeof useProjectWorkspace>["snapshot"]>;
  mode: string;
}) {
  const rows = mode === "evidence" ? snapshot.objects.filter((o) => o.objectType === "Evidence") : null;
  return (
    <section data-testid={`${mode}-panel`} className="space-y-3">
      <h2 className="text-lg font-semibold text-slate-100">
        {mode === "evidence" ? "Evidence & Provenance" : "Audit / Events"}
      </h2>
      {mode === "evidence" ? (
        rows && rows.length === 0 ? (
          <EmptyOperationalState
            title="No evidence records"
            description="Evidence objects and provenance links appear here when recorded."
          />
        ) : (
          <ul className="space-y-1 text-sm text-slate-200">
            {rows?.map((r) => (
              <li key={r.id}>
                {r.stableObjectId} — {r.displayName}
              </li>
            ))}
          </ul>
        )
      ) : snapshot.audit.length === 0 ? (
        <EmptyOperationalState
          title="No audit events"
          description="Object created, revised, gated, and decision events will appear here."
        />
      ) : (
        <ul className="max-h-96 space-y-1 overflow-y-auto text-sm text-slate-300" data-testid="audit-events">
          {snapshot.audit
            .slice()
            .reverse()
            .slice(0, 100)
            .map((e, i) => (
              <li key={`${e.at}-${i}`} className="rounded border border-slate-800 px-2 py-1">
                <span className="font-mono text-[11px] text-slate-500">{e.at}</span> {e.action}{" "}
                <span className="text-xs text-slate-500">{e.objectId.slice(0, 8)}</span>
              </li>
            ))}
        </ul>
      )}
    </section>
  );
}

function EngineeringAiPanel({ projectId }: { projectId: string }) {
  return (
    <section data-testid="engineering-ai-panel" className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-100">Engineering AI</h2>
      <p className="text-sm text-slate-400">
        EOS 3.7 Engineering Reasoning Assistant — shows evidence, inferences, assumptions, conflicts, and
        abstention. AI is not the final decision authority.
      </p>
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-100">
        Human authority reminder: recommendations require human acceptance. Unsupported live LLM claims are not
        made by this UI.
      </div>
      <AskEngineeringAI
        label="Ask Engineering Reasoning Assistant"
        projectId={projectId}
        objectType="project"
        objectId={projectId}
        q="What is the governed status of this project’s engineering basis and open assumptions?"
      />
    </section>
  );
}
