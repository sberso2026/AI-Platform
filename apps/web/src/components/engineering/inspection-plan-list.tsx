"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  hostedGet,
  hostedIntent,
  planTargetSummary,
  type InspectionRow,
} from "@/lib/inspection-intelligence/hosted-client";
import { InspectionTargetPicker, type DraftTarget } from "@/components/engineering/inspection-target-picker";

export function InspectionPlanList() {
  const [plans, setPlans] = useState<InspectionRow[]>([]);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [latency, setLatency] = useState<number>();

  useEffect(() => {
    const started = performance.now();
    hostedGet<InspectionRow[]>("plans")
      .then((rows) => {
        setPlans(rows);
        setLatency(Math.round(performance.now() - started));
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load plans"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-600" role="status">Loading plans…</p>;
  if (error) return <p className="text-red-700" role="alert">{error}</p>;

  return (
    <section data-testid="inspection-plans-ready">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-cyan-700">Inspection Planning</p>
          <h1 id="ii-plans-title" className="mt-1 text-2xl font-semibold text-slate-900">
            Plans
          </h1>
          <p className="mt-2 text-slate-600">
            Create and manage inspection plans bound to canonical project, asset, and location targets.
          </p>
        </div>
        <Link
          className="inline-flex min-h-11 items-center rounded-md bg-slate-900 px-4 py-2 text-white"
          href="/engineering/apps/inspection-intelligence/plans/new"
        >
          New plan
        </Link>
      </div>
      {latency !== undefined ? <p className="mt-2 text-xs text-slate-400">Loaded in {latency} ms</p> : null}
      {plans.length === 0 ? (
        <p className="mt-6 text-slate-500">No plans yet. Create a plan to start an inspection.</p>
      ) : (
        <ul className="mt-6 divide-y rounded border border-slate-200">
          {plans.map((plan) => (
            <li key={String(plan.id)} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-medium text-slate-900">{String(plan.title)}</p>
                <p className="text-sm text-slate-500">
                  {String(plan.status)} · {planTargetSummary(plan)}
                  {plan.next_due_at ? ` · due ${String(plan.next_due_at).slice(0, 10)}` : ""}
                </p>
              </div>
              <Link
                className="text-cyan-700 hover:underline"
                href={`/engineering/apps/inspection-intelligence/plans/${plan.id}`}
              >
                Open
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function InspectionPlanCreate() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [templates, setTemplates] = useState<InspectionRow[]>([]);
  const [targets, setTargets] = useState<DraftTarget[]>([]);
  const [nextDueAt, setNextDueAt] = useState("");
  const [checklist, setChecklist] = useState("pass_fail,numeric");
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [canWrite, setCanWrite] = useState(true);

  useEffect(() => {
    hostedGet<InspectionRow[]>("templates")
      .then(setTemplates)
      .catch(() => setTemplates([]));
    hostedGet<{ canWrite: boolean }>("capabilities")
      .then((caps) => setCanWrite(caps.canWrite !== false))
      .catch(() => undefined);
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (targets.length === 0) {
      setError("Bind at least one inspection target.");
      return;
    }
    setSaving(true);
    setError(undefined);
    try {
      const created = await hostedIntent<{ plan: InspectionRow }>("create_plan", {
        title: title.trim(),
        templateId: templateId || undefined,
        nextDueAt: nextDueAt ? new Date(nextDueAt).toISOString() : undefined,
        checklistItemTypes: checklist
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        targets: targets.map((target) => ({
          id: crypto.randomUUID(),
          kind: target.kind,
          canonicalId: target.canonicalId,
          snapshot: { capturedAt: new Date().toISOString(), label: target.label },
        })),
      });
      router.push(`/engineering/apps/inspection-intelligence/plans/${created.plan.id}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not create plan");
      setSaving(false);
    }
  }

  return (
    <section data-testid="inspection-plan-create">
      <h1 className="text-2xl font-semibold text-slate-900">New inspection plan</h1>
      <p className="mt-2 text-slate-600">Bind the plan to existing Engineering OS projects, assets, or locations.</p>
      {error ? <p className="mt-3 text-red-700" role="alert">{error}</p> : null}
      <form className="mt-6 max-w-xl space-y-4" onSubmit={onSubmit}>
        <label className="block text-sm">
          Title
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            data-testid="inspection-plan-title"
          />
        </label>
        <label className="block text-sm">
          Template
          <select
            className="mt-1 w-full rounded border px-3 py-2"
            value={templateId}
            onChange={(event) => setTemplateId(event.target.value)}
          >
            <option value="">Create generic template from this plan</option>
            {templates.map((template) => (
              <option key={String(template.id)} value={String(template.id)}>
                {String(template.title)}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Checklist item types
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            value={checklist}
            onChange={(event) => setChecklist(event.target.value)}
          />
        </label>
        <label className="block text-sm">
          Planned date
          <input
            type="datetime-local"
            className="mt-1 w-full rounded border px-3 py-2"
            value={nextDueAt}
            onChange={(event) => setNextDueAt(event.target.value)}
          />
        </label>
        <InspectionTargetPicker value={targets} onChange={setTargets} disabled={!canWrite} />
        <button
          className="min-h-11 rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
          disabled={saving || !canWrite}
          data-testid="inspection-plan-create-submit"
        >
          {saving ? "Creating…" : "Create plan"}
        </button>
      </form>
    </section>
  );
}
