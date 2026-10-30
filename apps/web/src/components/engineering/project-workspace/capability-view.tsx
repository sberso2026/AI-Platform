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
  workspaceHref,
  type ProjectWorkspaceNavItem,
} from "@/lib/engineering/project-workspace-ia";
import { ObjectRegisterPanel } from "./object-register";
import { useProjectWorkspace } from "./use-workspace";

export function ProjectCapabilityView({
  projectId,
  slug,
}: {
  projectId: string;
  slug: string;
}) {
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

  if (slug === "setup") {
    return <SetupPanel projectId={projectId} snapshot={snapshot} post={post} />;
  }
  if (slug === "lifecycle") {
    return <LifecyclePanel projectId={projectId} snapshot={snapshot} post={post} />;
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
  if (slug === "knowledge") {
    return (
      <BridgePanel
        item={item}
        projectId={projectId}
        note="EOS 3.3 knowledge retrieval — provenance and abstention preserved. Vector search is not graph authority."
      />
    );
  }
  if (slug === "systems") {
    return (
      <SystemsInterfacesPanel
        projectId={projectId}
        snapshot={snapshot}
        post={post}
        item={item}
      />
    );
  }
  if (slug === "changes") {
    return (
      <ChangesImpactPanel projectId={projectId} snapshot={snapshot} post={post} item={item} />
    );
  }
  if (item.objectType) {
    const type = item.objectType as Eos3ObjectType;
    const objects = snapshot.objects.filter((o) => o.objectType === type);
    return (
      <ObjectRegisterPanel
        projectId={projectId}
        objectType={type}
        title={item.label}
        emptyTitle={item.emptyTitle}
        emptyDescription={item.emptyDescription}
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

function SetupPanel({
  projectId,
  snapshot,
  post,
}: {
  projectId: string;
  snapshot: NonNullable<ReturnType<typeof useProjectWorkspace>["snapshot"]>;
  post: ReturnType<typeof useProjectWorkspace>["post"];
}) {
  const s = snapshot.setup;
  const [form, setForm] = useState({
    projectCode: s.projectCode,
    projectName: s.projectName,
    client: s.client,
    site: s.site,
    location: s.location,
    industry: s.industry,
    projectType: s.projectType,
    description: s.description,
    country: s.jurisdiction.country,
    stateRegion: s.jurisdiction.stateRegion,
    profileName: s.jurisdiction.profileName,
    engineeringStandards: s.standards.engineeringStandards.join(", "),
    companyStandards: s.standards.companyStandards.join(", "),
    codeProfiles: s.standards.codeProfiles.join(", "),
    confidentiality: s.confidentiality,
    roles: s.roles.join(", "),
    disciplines: s.disciplines.join(", "),
    lifecycleTemplate: s.lifecycleTemplate,
    governanceProfile: s.governanceProfile,
    qualificationContext: s.qualificationContext,
    assetRelationship: s.assetRelationship,
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const steps = [
    { key: "projectProfile", label: "Project Profile" },
    { key: "jurisdiction", label: "Jurisdiction" },
    { key: "standards", label: "Standards" },
    { key: "lifecycle", label: "Lifecycle" },
    { key: "roles", label: "Roles" },
    { key: "engineeringBasis", label: "Engineering Basis" },
    { key: "requirements", label: "Requirements" },
    { key: "systemsInterfaces", label: "Systems / Interfaces" },
    { key: "deliverablePlan", label: "Deliverable Plan" },
  ] as const;

  return (
    <section data-testid="project-setup-panel" className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">Project Setup</h2>
        <p className="text-sm text-slate-400">
          Configure governance fields after concise project creation. System generation is metadata — not an
          engineering field.
        </p>
        <p className="mt-2 text-xs font-medium text-amber-200" data-testid="setup-status">
          {snapshot.setupStatus}
        </p>
      </div>

      <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3" aria-label="Project setup checklist">
        {steps.map((step, idx) => (
          <li
            key={step.key}
            className="rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-200"
          >
            <span className="text-xs text-slate-500">{idx + 1}.</span> {step.label}{" "}
            <span className="text-xs text-slate-400">
              {s.checklist[step.key] ? "✓" : "○"}
            </span>
          </li>
        ))}
      </ol>

      <form
        className="grid gap-3 md:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          setErr(null);
          try {
            await post({
              action: "update_setup",
              setup: {
                projectCode: form.projectCode,
                projectName: form.projectName,
                client: form.client,
                site: form.site,
                location: form.location,
                industry: form.industry,
                projectType: form.projectType,
                description: form.description,
                confidentiality: form.confidentiality,
                lifecycleTemplate: form.lifecycleTemplate,
                governanceProfile: form.governanceProfile,
                qualificationContext: form.qualificationContext,
                assetRelationship: form.assetRelationship,
                roles: form.roles.split(",").map((x) => x.trim()).filter(Boolean),
                disciplines: form.disciplines.split(",").map((x) => x.trim()).filter(Boolean),
                jurisdiction: {
                  country: form.country,
                  stateRegion: form.stateRegion,
                  profileName: form.profileName,
                },
                standards: {
                  engineeringStandards: form.engineeringStandards
                    .split(",")
                    .map((x) => x.trim())
                    .filter(Boolean),
                  companyStandards: form.companyStandards
                    .split(",")
                    .map((x) => x.trim())
                    .filter(Boolean),
                  codeProfiles: form.codeProfiles
                    .split(",")
                    .map((x) => x.trim())
                    .filter(Boolean),
                },
              },
            });
            setMsg("Setup saved");
          } catch (ex: unknown) {
            setErr(ex instanceof Error ? ex.message : "Save failed");
          }
        }}
      >
        {(
          [
            ["projectCode", "Project Code"],
            ["projectName", "Project Name"],
            ["client", "Client"],
            ["site", "Site"],
            ["location", "Location (free-text)"],
            ["industry", "Industry"],
            ["projectType", "Project Type"],
            ["confidentiality", "Confidentiality / Data Classification"],
            ["country", "Jurisdiction — Country"],
            ["stateRegion", "Jurisdiction — State / region"],
            ["profileName", "Jurisdiction profile"],
            ["engineeringStandards", "Engineering standards (comma-separated)"],
            ["companyStandards", "Company standards"],
            ["codeProfiles", "Applicable code profiles"],
            ["roles", "Project roles"],
            ["disciplines", "Engineering disciplines"],
            ["lifecycleTemplate", "Lifecycle template"],
            ["governanceProfile", "Project governance profile"],
            ["qualificationContext", "Qualification context"],
            ["assetRelationship", "Asset / project relationship"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="text-xs text-slate-400">
            {label}
            <Input
              className="mt-1"
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          </label>
        ))}
        <label className="text-xs text-slate-400 md:col-span-2">
          Project Description / Purpose
          <textarea
            className="mt-1 min-h-20 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>
        <p className="text-xs text-slate-500 md:col-span-2">
          System metadata (read-only): EOS generation {snapshot.trust.generation} · {snapshot.trust.activation}
        </p>
        {err ? <OperationalError message={err} /> : null}
        {msg ? <p className="text-sm text-emerald-300">{msg}</p> : null}
        <div className="md:col-span-2">
          <Button type="submit">Save project setup</Button>
        </div>
      </form>

      <div className="rounded-lg border border-slate-700 p-4">
        <h3 className="text-sm font-semibold text-slate-100">Pilot-001 seed</h3>
        <p className="mt-1 text-xs text-slate-400">
          Load synthetic PILOT-001 objects (REQ-001…CHG-001) into this project workspace store.
        </p>
        <Button
          type="button"
          size="sm"
          className="mt-3"
          onClick={async () => {
            await post({ action: "seed_pilot_001" });
            setMsg("PILOT-001 seeded");
          }}
        >
          Seed PILOT-001 scenario
        </Button>
        <Link
          href={workspaceHref(projectId, "requirements")}
          className="ml-3 text-sm underline-offset-2 hover:underline"
        >
          Go to Requirements
        </Link>
      </div>
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
  const currentIdx = DEFAULT_PILOT_LIFECYCLE.findIndex(
    (s) => s.key === snapshot.lifecycle.currentKey,
  );
  const next = DEFAULT_PILOT_LIFECYCLE[currentIdx + 1];
  const gateEval = snapshot.lifecycle.gateEvaluations.G0;

  return (
    <section data-testid="lifecycle-panel" className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-100">Lifecycle & Stage Gates</h2>
      <p className="text-sm text-slate-400">
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
      {msg ? <p className="text-sm text-emerald-300">{msg}</p> : null}
      {err ? <OperationalError message={err} /> : null}
    </section>
  );
}

function DigitalThreadPanel({
  projectId,
  snapshot,
  post,
}: {
  projectId: string;
  snapshot: NonNullable<ReturnType<typeof useProjectWorkspace>["snapshot"]>;
  post: ReturnType<typeof useProjectWorkspace>["post"];
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
      <h2 className="text-lg font-semibold text-slate-100">Digital Thread</h2>
      <p className="text-sm text-slate-400">
        Canonical structured relationships are the authority. Embeddings are not the source of record.
      </p>
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
    Requirement: "requirements",
    EngineeringBasis: "engineering-basis",
    Assumption: "assumptions",
    System: "systems",
    Interface: "systems",
    Calculation: "calculations",
    Decision: "decisions",
    Review: "reviews",
    Change: "changes",
    Deliverable: "deliverables",
    Asset: "assets",
    Inspection: "inspections",
  };
  return map[objectType] ?? "digital-thread";
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
