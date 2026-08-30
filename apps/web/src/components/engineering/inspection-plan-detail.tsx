"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { nextInspectionSessionStates, PLAN_UPDATE_STATUSES } from "@rtb/inspection-intelligence/browser";
import {
  hostedGet,
  hostedIntent,
  planTargetSummary,
  type InspectionRow,
} from "@/lib/inspection-intelligence/hosted-client";
import { InspectionTargetPicker, type DraftTarget } from "@/components/engineering/inspection-target-picker";

function asTargets(row: InspectionRow): DraftTarget[] {
  const targets = Array.isArray(row.targets) ? row.targets : [];
  return targets
    .map((target) => {
      if (!target || typeof target !== "object") return null;
      const item = target as { kind?: string; canonicalId?: string; snapshot?: { label?: string } };
      if (item.kind !== "project" && item.kind !== "asset" && item.kind !== "location") return null;
      if (!item.canonicalId) return null;
      return {
        kind: item.kind,
        canonicalId: item.canonicalId,
        label: item.snapshot?.label ?? item.kind,
      };
    })
    .filter((item): item is DraftTarget => Boolean(item));
}

export function InspectionPlanDetail({ planId }: { planId: string }) {
  const [plan, setPlan] = useState<InspectionRow>();
  const [sessions, setSessions] = useState<InspectionRow[]>([]);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("planned");
  const [nextDueAt, setNextDueAt] = useState("");
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [starting, setStarting] = useState(false);
  const [canWrite, setCanWrite] = useState(true);

  async function load() {
    const [nextPlan, nextSessions, caps] = await Promise.all([
      hostedGet<InspectionRow>("plan", { id: planId }),
      hostedGet<InspectionRow[]>("sessions"),
      hostedGet<{ canWrite: boolean }>("capabilities").catch(() => ({ canWrite: true })),
    ]);
    setPlan(nextPlan);
    setTitle(String(nextPlan.title ?? ""));
    setStatus(String(nextPlan.status ?? "planned"));
    setNextDueAt(nextPlan.next_due_at ? String(nextPlan.next_due_at).slice(0, 16) : "");
    setSessions(nextSessions.filter((row) => String(row.plan_id) === planId));
    setCanWrite(caps.canWrite !== false);
  }

  useEffect(() => {
    load().catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load plan"));
  }, [planId]);

  const editable = PLAN_UPDATE_STATUSES.has(String(plan?.status ?? "")) && canWrite;
  const inProgress = useMemo(
    () => sessions.find((row) => ["assigned", "started", "paused"].includes(String(row.status))),
    [sessions],
  );

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(undefined);
    try {
      const updated = await hostedIntent<InspectionRow>("update_plan", {
        planId,
        title,
        status,
        nextDueAt: nextDueAt ? new Date(nextDueAt).toISOString() : "",
      });
      setPlan(updated);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function startSession() {
    setStarting(true);
    setError(undefined);
    try {
      const session = await hostedIntent<InspectionRow>("start_session", { planId });
      window.location.href = `/engineering/apps/inspection-intelligence/sessions/${session.id}`;
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not start session");
      setStarting(false);
    }
  }

  if (!plan && !error) {
    return <p className="text-slate-600" role="status">Loading plan…</p>;
  }
  if (!plan) {
    return <p className="text-red-700" role="alert">{error}</p>;
  }

  return (
    <section data-testid="inspection-plan-detail">
      <p className="text-sm font-medium text-cyan-700">Inspection Planning</p>
      <h1 className="mt-1 text-2xl font-semibold text-slate-900">{String(plan.title)}</h1>
      <p className="mt-2 text-slate-600">
        Status: {String(plan.status)} · Target: {planTargetSummary(plan)}
      </p>
      {error ? <p className="mt-3 text-red-700" role="alert">{error}</p> : null}
      <form className="mt-6 max-w-xl space-y-4" onSubmit={save}>
        <label className="block text-sm">
          Title
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={!editable}
            required
          />
        </label>
        <label className="block text-sm">
          Plan status
          <select
            className="mt-1 w-full rounded border px-3 py-2"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            disabled={!editable}
          >
            {[...PLAN_UPDATE_STATUSES].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Planned date
          <input
            type="datetime-local"
            className="mt-1 w-full rounded border px-3 py-2"
            value={nextDueAt}
            onChange={(event) => setNextDueAt(event.target.value)}
            disabled={!editable}
          />
        </label>
        <div>
          <p className="text-sm font-medium text-slate-800">Inspection target</p>
          <div className="mt-2 rounded border border-slate-200 p-3">
            <InspectionTargetPicker value={asTargets(plan)} onChange={() => undefined} disabled />
          </div>
          <p className="mt-1 text-xs text-slate-500">Target binding is set when the plan is created.</p>
        </div>
        {editable ? (
          <button
            className="min-h-11 rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
            disabled={saving}
            type="submit"
          >
            {saving ? "Saving…" : "Save plan"}
          </button>
        ) : (
          <p className="text-sm text-slate-500">This plan is no longer editable.</p>
        )}
      </form>
      <div className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Sessions</h2>
        {inProgress ? (
          <Link
            className="inline-flex min-h-11 items-center rounded-md bg-cyan-700 px-4 py-2 text-white"
            href={`/engineering/apps/inspection-intelligence/sessions/${inProgress.id}`}
            data-testid="inspection-resume-session"
          >
            Resume session
          </Link>
        ) : (
          <button
            type="button"
            className="min-h-11 rounded-md bg-cyan-700 px-4 py-2 text-white disabled:opacity-60"
            onClick={startSession}
            disabled={starting || !canWrite}
            data-testid="inspection-start-session"
          >
            {starting ? "Starting…" : "Start session"}
          </button>
        )}
        {sessions.length === 0 ? (
          <p className="text-sm text-slate-500">No sessions yet.</p>
        ) : (
          <ul className="divide-y rounded border border-slate-200">
            {sessions.map((session) => (
              <li key={String(session.id)} className="flex items-center justify-between px-3 py-3 text-sm">
                <span>
                  {String(session.status)}
                  {session.started_at ? ` · started ${String(session.started_at).slice(0, 16)}` : ""}
                </span>
                <Link
                  className="text-cyan-700 hover:underline"
                  href={`/engineering/apps/inspection-intelligence/sessions/${session.id}`}
                >
                  Open
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export function nextSessionActions(status: string) {
  return nextInspectionSessionStates(status as never);
}
