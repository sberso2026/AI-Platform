"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Button, Input } from "@rtb/ui";
import {
  EmptyOperationalState,
  OperationalError,
  OperationalSkeleton,
} from "@/components/engineering/operational";

type WorkPackage = {
  id: string;
  stableId: string;
  title: string;
  description: string;
  maturity: string;
  status: string;
  riskState: string;
  ownerName: string | null;
  disciplines: {
    initiating: string | null;
    lead: string | null;
    participating: string[];
  };
  affectedAssets: Array<{ displayName: string }>;
};

type UiContract = {
  header: { stableId: string; title: string };
  context: {
    projectId: string;
    assetSystem: string;
    engineeringPattern: string | null;
    currentMaturity: string;
    responsibleDisciplines: string[];
    userResponsibility: string | null;
    readinessPercent: number;
    status: string;
    riskState: string;
  };
  cards: {
    needsAttention: Array<{ id: string; kind: string; label: string }>;
    nextRecommendedAction: string | null;
    keyInformation: string[];
    progressReadiness: { percent: number; rule: string };
  };
};

export function WorkPackagesPanel({ projectId }: { projectId: string }) {
  const [packages, setPackages] = useState<WorkPackage[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [contract, setContract] = useState<UiContract | null>(null);
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

  return (
    <div className="space-y-6" data-testid="work-packages-panel">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">Work Packages</h2>
        <p className="mt-1 text-sm text-slate-400">
          Bounded units of engineering work beneath this project. Maturity is independent of project
          stage.
        </p>
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-4 space-y-3">
        <p className="text-sm font-medium text-slate-200">Create work package</p>
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
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      </div>

      {packages.length === 0 ? (
        <EmptyOperationalState
          title="No work packages yet"
          description="Create a work package to bound engineering execution beneath this project."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <ul className="space-y-2" data-testid="wp-list">
            {packages.map((wp) => (
              <li key={wp.id}>
                <button
                  type="button"
                  className={`w-full rounded-md border px-3 py-2 text-left text-sm ${
                    selected === wp.stableId
                      ? "border-sky-500/60 bg-sky-500/10 text-sky-100"
                      : "border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500"
                  }`}
                  onClick={() => setSelected(wp.stableId)}
                  data-testid={`wp-list-item-${wp.stableId}`}
                >
                  <span className="font-medium">
                    {wp.stableId} {wp.title}
                  </span>
                  <span className="mt-1 block text-xs text-slate-400">
                    {wp.maturity} · {wp.disciplines.lead ?? "—"}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {contract ? (
            <div className="space-y-4" data-testid="wp-cockpit-foundation">
              <div>
                <h3 className="text-base font-semibold text-slate-100">
                  {contract.header.stableId} {contract.header.title}
                </h3>
                <dl className="mt-2 grid gap-1 text-xs text-slate-400 sm:grid-cols-2">
                  <div>Project: {contract.context.projectId}</div>
                  <div>Asset/System: {contract.context.assetSystem}</div>
                  <div>Maturity: {contract.context.currentMaturity}</div>
                  <div>
                    Disciplines: {contract.context.responsibleDisciplines.join(", ") || "—"}
                  </div>
                  <div>Responsibility: {contract.context.userResponsibility ?? "—"}</div>
                  <div>
                    Readiness: {contract.context.readinessPercent}% · {contract.context.status} /{" "}
                    {contract.context.riskState}
                  </div>
                </dl>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Card title="Needs Attention" testId="wp-card-attention">
                  {contract.cards.needsAttention.length === 0 ? (
                    <p className="text-xs text-slate-500">No open blockers</p>
                  ) : (
                    <ul className="space-y-1 text-xs text-amber-200">
                      {contract.cards.needsAttention.map((b) => (
                        <li key={b.id}>{b.label}</li>
                      ))}
                    </ul>
                  )}
                </Card>
                <Card title="Next Recommended Action" testId="wp-card-next">
                  <p className="text-sm text-slate-100">
                    {contract.cards.nextRecommendedAction ?? "—"}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Recommendation does not grant authority.
                  </p>
                </Card>
                <Card title="Key Information" testId="wp-card-key">
                  <ul className="space-y-1 text-xs text-slate-300">
                    {contract.cards.keyInformation.map((k) => (
                      <li key={k}>{k}</li>
                    ))}
                  </ul>
                </Card>
                <Card title="Progress / Readiness" testId="wp-card-readiness">
                  <p className="text-2xl font-semibold text-slate-100">
                    {contract.cards.progressReadiness.percent}%
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Derived — not a manual progress percent. {contract.cards.progressReadiness.rule}
                  </p>
                </Card>
              </div>

              <div className="rounded-md border border-slate-700 p-3 text-xs text-slate-400">
                Primary sections prepared for later cockpit: Overview · Design · Inputs ·
                Dependencies · Decisions · Deliverables · Reviews · Changes
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
    <div className="rounded-lg border border-slate-700 bg-slate-950/80 p-3" data-testid={testId}>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
      {children}
    </div>
  );
}
