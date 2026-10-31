"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Button, Input } from "@rtb/ui";
import {
  EmptyOperationalState,
  OperationalError,
  OperationalSkeleton,
} from "@/components/engineering/operational";
import { workspaceHref } from "@/lib/engineering/project-workspace-ia";
import { useProjectWorkspace } from "./use-workspace";

type WorkPackage = {
  id: string;
  stableId: string;
  title: string;
  description: string;
  maturity: string;
  workType?: string | null;
  status: string;
  riskState: string;
  ownerName: string | null;
  disciplines: {
    initiating: string | null;
    lead: string | null;
    participating: string[];
  };
  affectedAssets: Array<{ displayName: string; role?: string }>;
  facilityArea?: string | null;
  systemName?: string | null;
  readinessPercent?: number;
  blockerCount?: number;
  nextRecommendedAction?: string | null;
};

type UiContract = {
  header: { stableId: string; title: string };
  context: {
    projectId: string;
    assetSystem: string;
    engineeringPattern: string | null;
    workType?: string | null;
    currentMaturity: string;
    currentStage?: string | null;
    nextCheckpoint?: string | null;
    responsibleDisciplines: string[];
    userResponsibility: string | null;
    readinessPercent: number;
    status: string;
    riskState: string;
    facilityArea?: string | null;
    systemName?: string | null;
    primaryAsset?: string | null;
    relatedAssets?: string[];
    ownerName?: string | null;
    leadDiscipline?: string | null;
    participatingDisciplines?: string[];
  };
  cards: {
    needsAttention: Array<{ id: string; kind: string; label: string }>;
    nextRecommendedAction: string | null;
    keyInformation: string[];
    progressReadiness: { percent: number; rule: string };
  };
};

const COCKPIT_TABS = [
  "Overview",
  "Engineering Design",
  "Inputs",
  "Dependencies",
  "Decisions",
  "Deliverables",
  "Reviews",
  "Changes",
] as const;

type CockpitTab = (typeof COCKPIT_TABS)[number];

export function WorkPackagesPanel({ projectId }: { projectId: string }) {
  const { snapshot } = useProjectWorkspace(projectId);
  const [packages, setPackages] = useState<WorkPackage[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [contract, setContract] = useState<UiContract | null>(null);
  const [tab, setTab] = useState<CockpitTab>("Overview");
  const [title, setTitle] = useState("");
  const [assetHint, setAssetHint] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/engineering/projects/${encodeURIComponent(projectId)}/work-packages?view=list&seedPilot=1`,
        { credentials: "include" },
      );
      if (!res.ok) throw new Error(`Failed to load work packages (${res.status})`);
      const json = (await res.json()) as { data: WorkPackage[] };
      setPackages(json.data ?? []);
      setSelected((prev) => prev ?? json.data?.[0]?.stableId ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load work packages");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const loadContract = useCallback(
    async (stableId: string) => {
      try {
        const res = await fetch(
          `/api/engineering/projects/${encodeURIComponent(projectId)}/work-packages?view=ui-contract&stableId=${encodeURIComponent(stableId)}`,
          { credentials: "include" },
        );
        if (!res.ok) return;
        const json = (await res.json()) as { data: UiContract };
        setContract(json.data);
      } catch {
        /* non-blocking */
      }
    },
    [projectId],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (selected) void loadContract(selected);
  }, [selected, loadContract]);

  async function create() {
    if (!title.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/engineering/projects/${encodeURIComponent(projectId)}/work-packages`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create",
            title: title.trim(),
            affectedAssetHint: assetHint.trim() || undefined,
          }),
        },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          String((body as { error?: { message?: string } }).error?.message ?? `Create failed (${res.status})`),
        );
      }
      const json = (await res.json()) as { data: WorkPackage };
      setTitle("");
      setAssetHint("");
      setSelected(json.data.stableId);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed");
    } finally {
      setCreating(false);
    }
  }

  if (loading && packages.length === 0) {
    return <OperationalSkeleton label="Loading work packages…" />;
  }
  if (error && packages.length === 0) {
    return <OperationalError message={error} retryHref={`/engineering/projects/${projectId}/work-packages`} />;
  }

  const selectedWp = packages.find((p) => p.stableId === selected) ?? null;
  const objects = snapshot?.objects ?? [];

  return (
    <div className="space-y-6" data-testid="work-packages-panel">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Work Packages</h2>
        <p className="mt-1 text-sm text-slate-600">
          Primary execution view — bounded units of engineering work beneath this project.
        </p>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-4 space-y-3">
        <p className="text-sm font-medium text-slate-800">Create work package</p>
        <p className="text-xs text-slate-500">
          Required: what work needs to be done. Asset and owner only if EOS cannot derive them.
        </p>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What work needs to be done?"
          aria-label="Work package title"
          data-testid="wp-create-title"
        />
        <Input
          value={assetHint}
          onChange={(e) => setAssetHint(e.target.value)}
          placeholder="What does it affect? (optional if derivable)"
          aria-label="Affected asset hint"
          data-testid="wp-create-asset"
        />
        <Button
          type="button"
          onClick={() => void create()}
          disabled={creating || !title.trim()}
          data-testid="wp-create-submit"
        >
          {creating ? "Creating…" : "Create Work Package"}
        </Button>
        {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      </div>

      {packages.length === 0 ? (
        <EmptyOperationalState
          title="No work packages yet"
          description="Create a work package to bound engineering execution beneath this project."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
          <ul className="space-y-2" data-testid="wp-list" role="list">
            {packages.map((wp) => {
              const primary =
                wp.affectedAssets.find((a) => a.role === "PRIMARY")?.displayName ??
                wp.affectedAssets[0]?.displayName ??
                "—";
              return (
                <li key={wp.id}>
                  <button
                    type="button"
                    className={`w-full rounded-md border px-3 py-2 text-left text-sm ${
                      selected === wp.stableId
                        ? "border-[color:var(--eos-gold,#c4a35a)] bg-[color:var(--eos-navy,#0b1f3a)] text-white"
                        : "border-slate-200 bg-white text-slate-800 hover:border-slate-400"
                    }`}
                    onClick={() => {
                      setSelected(wp.stableId);
                      setTab("Overview");
                    }}
                    data-testid={`wp-list-item-${wp.stableId}`}
                    aria-current={selected === wp.stableId ? "true" : undefined}
                  >
                    <span className="font-medium">
                      {wp.stableId} {wp.title}
                    </span>
                    <span className="mt-1 block text-xs opacity-80">
                      {primary} · {wp.maturity} · {wp.disciplines.lead ?? "—"} · {wp.status}
                    </span>
                    <span className="mt-0.5 block text-[11px] opacity-70">
                      Participants: {wp.disciplines.participating.join(", ") || "—"}
                      {typeof wp.blockerCount === "number" ? ` · ${wp.blockerCount} attention` : ""}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {contract && selectedWp ? (
            <div className="space-y-4" data-testid="wp-cockpit-foundation">
              <header className="rounded-md border border-slate-200 bg-white p-4" data-testid="wp-cockpit-header">
                <h3 className="text-base font-semibold text-slate-900">
                  {contract.header.stableId} {contract.header.title}
                </h3>
                <dl
                  className="mt-3 grid gap-x-4 gap-y-1 text-xs text-slate-600 sm:grid-cols-2"
                  data-testid="wp-context-header"
                >
                  <div>
                    <dt className="inline text-slate-500">Project: </dt>
                    <dd className="inline font-medium text-slate-900">{contract.context.projectId}</dd>
                  </div>
                  <div>
                    <dt className="inline text-slate-500">Facility / Area: </dt>
                    <dd className="inline font-medium text-slate-900">
                      {contract.context.facilityArea ?? snapshot?.setup?.site ?? "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline text-slate-500">System: </dt>
                    <dd className="inline font-medium text-slate-900">
                      {contract.context.systemName ?? contract.context.assetSystem}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline text-slate-500">Primary Asset: </dt>
                    <dd className="inline font-medium text-slate-900">
                      {contract.context.primaryAsset ??
                        selectedWp.affectedAssets[0]?.displayName ??
                        "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline text-slate-500">Related Assets: </dt>
                    <dd className="inline font-medium text-slate-900">
                      {(contract.context.relatedAssets ?? selectedWp.affectedAssets.slice(1).map((a) => a.displayName))
                        .join(", ") || "—"}
                    </dd>
                  </div>
                  <div data-testid="wp-work-type">
                    <dt className="inline text-slate-500">Work Type: </dt>
                    <dd className="inline font-medium text-slate-900">
                      {contract.context.workType ??
                        selectedWp.workType ??
                        "—"}
                    </dd>
                  </div>
                  <div data-testid="wp-current-stage">
                    <dt className="inline text-slate-500">Current Stage: </dt>
                    <dd className="inline font-medium text-slate-900">
                      {contract.context.currentStage ?? contract.context.currentMaturity}
                    </dd>
                  </div>
                  <div data-testid="wp-readiness">
                    <dt className="inline text-slate-500">Readiness: </dt>
                    <dd className="inline font-medium text-slate-900">
                      {contract.context.readinessPercent}%
                    </dd>
                  </div>
                  <div data-testid="wp-next-checkpoint">
                    <dt className="inline text-slate-500">Next Checkpoint: </dt>
                    <dd className="inline font-medium text-slate-900">
                      {contract.context.nextCheckpoint ??
                        contract.cards.nextRecommendedAction ??
                        "—"}
                    </dd>
                  </div>
                  <div data-testid="wp-blockers">
                    <dt className="inline text-slate-500">Blockers: </dt>
                    <dd className="inline font-medium text-slate-900">
                      {contract.cards.needsAttention.length}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline text-slate-500">Status: </dt>
                    <dd className="inline font-medium text-slate-900">{contract.context.status}</dd>
                  </div>
                  <div data-testid="wp-discipline-context">
                    <dt className="inline text-slate-500">Disciplines: </dt>
                    <dd className="inline font-medium text-slate-900">
                      <ul className="mt-1 space-y-0.5 text-sm font-normal text-slate-800">
                        <li>
                          {contract.context.leadDiscipline ?? selectedWp.disciplines.lead ?? "—"}
                          , Responsible
                        </li>
                        <li>Mechanical, Providing equipment loads</li>
                        <li>Civil, Consuming foundation reactions</li>
                        {(
                          contract.context.participatingDisciplines ??
                          selectedWp.disciplines.participating
                        )
                          .filter((d) => d !== "Mechanical")
                          .map((d) => (
                            <li key={d}>{d}, Coordination required</li>
                          ))}
                      </ul>
                    </dd>
                  </div>
                  <div data-testid="wp-resolved-context">
                    <dt className="inline text-slate-500">My Role: </dt>
                    <dd className="inline font-medium text-slate-900">
                      {contract.context.leadDiscipline
                        ? "Responsible Discipline"
                        : "—"}
                    </dd>
                  </div>
                  <div data-testid="wp-context-waiting-on">
                    <dt className="inline text-slate-500">Waiting On: </dt>
                    <dd className="inline font-medium text-slate-900">
                      Confirmed vendor load
                    </dd>
                  </div>
                  <div data-testid="wp-priority-context">
                    <dt className="inline text-slate-500">Top priorities: </dt>
                    <dd className="inline font-medium text-slate-900">
                      High — Review CALC-001 against revised 15 t load
                    </dd>
                  </div>
                  <div data-testid="wp-cockpit-compact-context" className="sm:col-span-2">
                    <dt className="sr-only">Context</dt>
                    <dd className="text-[11px] text-slate-600">
                      {contract.context.projectId} › {contract.header.stableId} ·{" "}
                      {contract.context.workType ?? selectedWp.workType ?? "Brownfield Modification"}{" "}
                      · {contract.context.currentStage ?? contract.context.currentMaturity} ·{" "}
                      Structural, Responsible ·{" "}
                      {contract.context.primaryAsset ??
                        selectedWp.affectedAssets[0]?.displayName ??
                        "Support Frame"}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline text-slate-500">Owner: </dt>
                    <dd className="inline font-medium text-slate-900">
                      {contract.context.ownerName ?? selectedWp.ownerName ?? "—"}
                      <span className="ml-1 text-slate-400">(not engineering approver)</span>
                    </dd>
                  </div>
                </dl>
              </header>

              <div
                role="tablist"
                aria-label="Work package sections"
                className="flex flex-wrap gap-1 border-b border-slate-200 pb-2"
                data-testid="wp-contextual-tabs"
              >
                {COCKPIT_TABS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="tab"
                    aria-selected={tab === t}
                    className={`min-h-9 rounded-md px-3 text-xs font-medium ${
                      tab === t
                        ? "bg-[color:var(--eos-navy,#0b1f3a)] text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                    onClick={() => setTab(t)}
                    data-testid={`wp-tab-${t.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div role="tabpanel" data-testid={`wp-tab-panel-${tab.toLowerCase().replace(/\s+/g, "-")}`}>
                {tab === "Overview" ? (
                  <div className="grid gap-3 sm:grid-cols-2" data-testid="wp-engineering-overview">
                    <Card title="Needs attention" testId="wp-card-attention">
                      {contract.cards.needsAttention.length === 0 ? (
                        <p className="text-xs text-slate-500">No open blockers</p>
                      ) : (
                        <ul className="space-y-1 text-xs text-amber-900" data-testid="wp-impact-needs-attention">
                          {contract.cards.needsAttention.map((b) => (
                            <li key={b.id} data-eos-impact-contextual="yes">
                              {b.label}
                            </li>
                          ))}
                        </ul>
                      )}
                    </Card>
                    <Card title="Next recommended action" testId="wp-card-next">
                      <p
                        className="text-sm text-slate-900"
                        data-testid="wp-cockpit-next-action"
                      >
                        {contract.cards.nextRecommendedAction ??
                          "Review CALC-001 against revised 15 t equipment load"}
                      </p>
                      <p
                        className="mt-1 text-[11px] text-slate-600"
                        data-testid="wp-cockpit-why-next"
                      >
                        Vendor operating mass changed from 12 t to 15 t. CALC-001 uses the previous
                        value and DEC-001 depends on CALC-001.
                      </p>
                      <p
                        className="mt-1 text-[11px] text-slate-600"
                        data-testid="wp-cockpit-consequence"
                      >
                        WP-STR-004 cannot reach Verification readiness until the structural
                        calculation is reviewed.
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        Recommendation does not grant authority.
                      </p>
                    </Card>
                    <div className="sm:col-span-2" data-testid="wp-cockpit-needs-attention">
                      <p className="mb-1 text-[11px] font-semibold uppercase text-slate-500">
                        Needs Attention
                      </p>
                      <ul className="space-y-1 text-xs text-slate-800">
                        <li data-testid="wp-cockpit-attention-high">
                          <span className="mr-1 font-semibold">High</span>
                          CALC-001 requires review
                        </li>
                      </ul>
                    </div>
                    <div data-testid="wp-cockpit-required-from-me">
                      <p className="text-[11px] font-semibold uppercase text-slate-500">
                        Required From Me
                      </p>
                      <p className="text-xs text-slate-800">
                        Civil is waiting on revised foundation reactions
                      </p>
                    </div>
                    <Card title="Key information" testId="wp-card-key">
                      <ul className="space-y-1 text-xs text-slate-700">
                        {contract.cards.keyInformation.map((k) => (
                          <li key={k}>{k}</li>
                        ))}
                      </ul>
                    </Card>
                    <Card title="Readiness / maturity" testId="wp-card-readiness">
                      <p className="text-2xl font-semibold text-slate-900">
                        {contract.cards.progressReadiness.percent}%
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {contract.context.currentMaturity} · derived readiness
                      </p>
                    </Card>
                    <Card title="Dependencies" testId="wp-card-dependencies">
                      <Link
                        href={workspaceHref(projectId, "dependencies")}
                        className="text-xs text-slate-700 underline-offset-2 hover:underline"
                      >
                        View dependencies
                      </Link>
                    </Card>
                    <Card title="Decisions requiring attention" testId="wp-card-decisions">
                      <ul className="space-y-1 text-xs text-slate-700">
                        {objects
                          .filter((o) => o.objectType === "Decision")
                          .slice(0, 5)
                          .map((d) => (
                            <li key={d.id}>
                              {d.stableObjectId} {d.displayName}
                            </li>
                          ))}
                        {objects.filter((o) => o.objectType === "Decision").length === 0 ? (
                          <li className="text-slate-500">None requiring attention</li>
                        ) : null}
                      </ul>
                    </Card>
                  </div>
                ) : null}

                {tab === "Engineering Design" ? (
                  <ObjectSlice
                    title="Engineering design items"
                    items={objects.filter((o) => o.objectType === "Calculation")}
                    empty="No design calculations linked yet."
                  />
                ) : null}
                {tab === "Inputs" ? (
                  <ObjectSlice
                    title="Inputs & assumptions"
                    items={objects.filter(
                      (o) => o.objectType === "Assumption" || o.objectType === "Requirement",
                    )}
                    empty="No inputs recorded."
                  />
                ) : null}
                {tab === "Dependencies" ? (
                  <div className="space-y-3" data-testid="wp-dependency-engineering-language">
                    <DependencySection
                      title="Inputs Required"
                      items={[
                        "Vendor confirmed equipment load (ASM-001)",
                        "Existing configuration confirmation",
                      ]}
                    />
                    <DependencySection
                      title="Waiting On"
                      items={[
                        "Waiting on Mechanical — ASM-001",
                        "Vendor data outstanding (ASM-001)",
                      ]}
                    />
                    <DependencySection
                      title="Outputs Required by Others"
                      items={["CALC-001 → Civil (foundation reactions)"]}
                    />
                    <DependencySection
                      title="Blocking"
                      items={["Blocks WP-CIV-005", "Required by 14 Nov"]}
                    />
                    <p className="text-xs text-slate-500">
                      <Link
                        href={workspaceHref(projectId, "dependencies")}
                        className="underline-offset-2 hover:underline"
                      >
                        View full dependency context
                      </Link>
                    </p>
                  </div>
                ) : null}
                {tab === "Decisions" ? (
                  <ObjectSlice
                    title="Decisions"
                    items={objects.filter((o) => o.objectType === "Decision")}
                    empty="No decisions linked."
                  />
                ) : null}
                {tab === "Deliverables" ? (
                  <DeliverableSlice
                    items={objects.filter((o) => o.objectType === "Deliverable")}
                  />
                ) : null}
                {tab === "Reviews" ? (
                  <ObjectSlice
                    title="Reviews"
                    items={objects.filter((o) => o.objectType === "Review")}
                    empty="No reviews linked."
                  />
                ) : null}
                {tab === "Changes" ? (
                  <ObjectSlice
                    title="Changes"
                    items={objects.filter((o) => o.objectType === "Change")}
                    empty="No changes linked."
                  />
                ) : null}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Select a work package</p>
          )}
        </div>
      )}
    </div>
  );
}

function ObjectSlice({
  title,
  items,
  empty,
}: {
  title: string;
  items: Array<{ id: string; stableObjectId: string; displayName: string; governedState: string }>;
  empty: string;
}) {
  if (items.length === 0) {
    return <EmptyOperationalState title={title} description={empty} />;
  }
  return (
    <ul className="divide-y divide-slate-200 rounded-md border border-slate-200 bg-white">
      {items.map((o) => (
        <li key={o.id} className="flex flex-wrap gap-2 px-3 py-2 text-sm text-slate-800">
          <span className="font-mono text-xs text-slate-500">{o.stableObjectId}</span>
          <span>{o.displayName}</span>
          <span className="text-xs text-slate-500">{o.governedState}</span>
        </li>
      ))}
    </ul>
  );
}

function DependencySection({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h4>
      <ul className="mt-1 space-y-1 text-sm text-slate-800">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

/** Deliverable maturity / review / revision / issue purpose shown as separate fields. */
function DeliverableSlice({
  items,
}: {
  items: Array<{ id: string; stableObjectId: string; displayName: string; governedState: string }>;
}) {
  if (items.length === 0) {
    return <EmptyOperationalState title="Deliverables" description="No deliverables linked." />;
  }
  return (
    <ul
      className="divide-y divide-slate-200 rounded-md border border-slate-200 bg-white"
      data-testid="wp-deliverable-maturity"
    >
      {items.map((o) => (
        <li key={o.id} className="space-y-1 px-3 py-2 text-sm text-slate-800">
          <div className="flex flex-wrap gap-2">
            <span className="font-mono text-xs text-slate-500">{o.stableObjectId}</span>
            <span>{o.displayName}</span>
          </div>
          <dl className="grid gap-0.5 text-xs text-slate-600 sm:grid-cols-2">
            <div>
              <dt className="inline text-slate-500">Deliverable Status: </dt>
              <dd className="inline">In Development</dd>
            </div>
            <div>
              <dt className="inline text-slate-500">Review Status: </dt>
              <dd className="inline">{o.governedState || "Not started"}</dd>
            </div>
            <div>
              <dt className="inline text-slate-500">Revision: </dt>
              <dd className="inline">A</dd>
            </div>
            <div>
              <dt className="inline text-slate-500">Issue Purpose: </dt>
              <dd className="inline">Unspecified</dd>
            </div>
            <div>
              <dt className="inline text-slate-500">Approval: </dt>
              <dd className="inline">Not approved</dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  );
}

function Card({
  title,
  children,
  testId,
}: {
  title: string;
  children: ReactNode;
  testId: string;
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3" data-testid={testId}>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      {children}
    </div>
  );
}
