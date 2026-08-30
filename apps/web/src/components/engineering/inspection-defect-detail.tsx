"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { nextCorrectiveActionStates, nextDefectStates, type DefectLifecycleState } from "@rtb/inspection-intelligence/browser";
import { hostedGet, hostedIntent, planTargetSummary, type InspectionRow } from "@/lib/inspection-intelligence/hosted-client";

type Workspace = {
  defect: InspectionRow;
  session: InspectionRow;
  observation: InspectionRow | null;
  recommendations: InspectionRow[];
  correctiveActions: InspectionRow[];
  assessments: InspectionRow[];
  verifications: InspectionRow[];
  evidence: InspectionRow[];
  ownership: {
    inspectionDefect: boolean;
    projectIntelligenceFinding: boolean;
    engineeringCoreAction: boolean;
    assetDefect: boolean;
  };
};

export function InspectionDefectDetail({ defectId }: { defectId: string }) {
  const [workspace, setWorkspace] = useState<Workspace>();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState<string>();
  const [canWrite, setCanWrite] = useState(true);

  async function load() {
    const [data, caps] = await Promise.all([
      hostedGet<Workspace>("defect", { id: defectId }),
      hostedGet<{ canWrite: boolean }>("capabilities").catch(() => ({ canWrite: true })),
    ]);
    setWorkspace(data);
    setCanWrite(caps.canWrite !== false);
  }

  useEffect(() => {
    load().catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load defect"));
  }, [defectId]);

  async function run(label: string, work: () => Promise<void>) {
    setBusy(label);
    setError(undefined);
    try {
      await work();
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Action failed");
    } finally {
      setBusy(undefined);
    }
  }

  if (!workspace && !error) return <p className="text-slate-600" role="status">Loading defect…</p>;
  if (!workspace) return <p className="text-red-700" role="alert">{error}</p>;

  const taxonomy =
    workspace.defect.taxonomy && typeof workspace.defect.taxonomy === "object"
      ? (workspace.defect.taxonomy as Record<string, unknown>)
      : {};
  const status = String(workspace.defect.status);
  const next = nextDefectStates(status as DefectLifecycleState);

  return (
    <section data-testid="inspection-defect-detail">
      <p className="text-sm font-medium text-cyan-700">Defect Intelligence</p>
      <h1 className="mt-1 text-2xl font-semibold text-slate-900">{String(workspace.defect.title)}</h1>
      <p className="mt-2 text-slate-600">
        Status: {status} · severity {String(taxonomy.severity ?? "unknown")} · urgency{" "}
        {String(taxonomy.urgency ?? "unknown")}
      </p>
      <p className="text-sm text-slate-500">
        Target: {planTargetSummary(workspace.session)} · Session{" "}
        <Link className="text-cyan-700 hover:underline" href={`/engineering/apps/inspection-intelligence/sessions/${workspace.session.id}`}>
          {String(workspace.session.id).slice(0, 8)}
        </Link>
      </p>
      <p className="mt-2 text-sm text-slate-600">{String(workspace.defect.description)}</p>
      <p className="mt-2 text-xs text-slate-500">
        Inspection defect (not a PI finding, Core action, or asset defect). Actor timestamps stay on the hosted record.
        Created {String(workspace.defect.created_at ?? workspace.defect.createdAt ?? "unknown")}.
      </p>
      {error ? <p className="mt-3 text-red-700" role="alert">{error}</p> : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {next.map((to) => (
          <button
            key={to}
            type="button"
            className="min-h-11 rounded-md border px-3 py-2 text-sm disabled:opacity-60"
            disabled={!canWrite || Boolean(busy)}
            onClick={() => run("transition", async () => {
              await hostedIntent("transition_defect", { defectId, to });
            })}
          >
            {to}
          </button>
        ))}
      </div>

      {workspace.observation ? (
        <p className="mt-4 text-sm text-slate-600">
          Source observation: {String(workspace.observation.checklist_item_type)} — {String(workspace.observation.body)}
        </p>
      ) : (
        <p className="mt-4 text-sm text-slate-500">No source observation linked.</p>
      )}

      <form
        className="mt-6 max-w-xl space-y-2 rounded border p-4"
        onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const action = String(data.get("action") ?? "repair");
          const rationale = String(data.get("rationale") ?? "").trim();
          if (!rationale) {
            setError("Recommendation rationale is required.");
            return;
          }
          run("recommendation", async () => {
            await hostedIntent("link_recommendation", {
              sessionId: workspace.session.id,
              defectId,
              action,
              rationale,
            });
            event.currentTarget.reset();
          });
        }}
      >
        <h2 className="font-semibold">Issue recommendation</h2>
        <select name="action" className="w-full rounded border px-3 py-2" disabled={!canWrite}>
          {["repair", "replace", "monitor", "shutdown", "reinspect", "escalate", "engineering_assessment", "no_action"].map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <textarea name="rationale" className="w-full rounded border px-3 py-2" rows={2} disabled={!canWrite} />
        <button className="min-h-11 rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-60" disabled={!canWrite || Boolean(busy)}>
          Save recommendation
        </button>
      </form>

      <form
        className="mt-4 max-w-xl space-y-2 rounded border p-4"
        onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const description = String(data.get("description") ?? "").trim();
          const dueAt = String(data.get("dueAt") ?? "");
          if (!description || !dueAt) {
            setError("Corrective-action description and due date are required.");
            return;
          }
          run("corrective", async () => {
            await hostedIntent("create_corrective_action", {
              sessionId: workspace.session.id,
              defectId,
              recommendationId: String(data.get("recommendationId") ?? "") || undefined,
              ownerPersonId: "self",
              dueAt: new Date(dueAt).toISOString(),
              description,
            });
            event.currentTarget.reset();
          });
        }}
      >
        <h2 className="font-semibold">Create inspection corrective action</h2>
        <p className="text-xs text-slate-500">
          This is inspection process state. It is not an Engineering Core action and does not copy Core action truth.
          No Core action id is stored on this table.
        </p>
        <select name="recommendationId" className="w-full rounded border px-3 py-2" disabled={!canWrite}>
          <option value="">No linked recommendation</option>
          {workspace.recommendations.map((row) => (
            <option key={String(row.id)} value={String(row.id)}>{String(row.action)}</option>
          ))}
        </select>
        <input name="dueAt" type="datetime-local" className="w-full rounded border px-3 py-2" disabled={!canWrite} />
        <textarea name="description" className="w-full rounded border px-3 py-2" rows={2} disabled={!canWrite} />
        <button className="min-h-11 rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-60" disabled={!canWrite || Boolean(busy)}>
          Save corrective action
        </button>
      </form>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <List title="Recommendations" empty="None issued." rows={workspace.recommendations} render={(row) => `${String(row.action)} — ${String(row.rationale)} (${String(row.status)})`} />
        <div>
          <h2 className="font-semibold text-slate-900">Corrective actions</h2>
          {workspace.correctiveActions.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">None recorded.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {workspace.correctiveActions.map((row) => (
                <li key={String(row.id)} className="rounded border px-3 py-2 text-sm">
                  <p>{String(row.description)} · {String(row.status)}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {nextCorrectiveActionStates(String(row.status) as never).map((to) => (
                      <button
                        key={to}
                        type="button"
                        className="rounded border px-2 py-1 text-xs disabled:opacity-60"
                        disabled={!canWrite || Boolean(busy)}
                        onClick={() => run("ca", async () => {
                          await hostedIntent("progress_corrective_action", { actionId: row.id, to });
                        })}
                      >
                        {to}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <List title="Evidence" empty="No linked evidence." rows={workspace.evidence} render={(row) => `${String(row.kind)} · ${String(row.file_id ?? row.content_hash ?? "metadata")}`} />
        <List title="Verifications" empty="No verification recorded (unset, not failed)." rows={workspace.verifications} render={(row) => `${String(row.kind)} · ${String(row.status)}`} />
        <List title="Assessments" empty="No human assessment recorded." rows={workspace.assessments} render={(row) => `${String(row.title)}: ${String(row.body)}`} />
      </div>
    </section>
  );
}

function List({
  title,
  empty,
  rows,
  render,
}: {
  title: string;
  empty: string;
  rows: InspectionRow[];
  render: (row: InspectionRow) => string;
}) {
  return (
    <div>
      <h2 className="font-semibold text-slate-900">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">{empty}</p>
      ) : (
        <ul className="mt-2 space-y-2 text-sm">
          {rows.map((row) => (
            <li key={String(row.id)} className="rounded border px-3 py-2">{render(row)}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
