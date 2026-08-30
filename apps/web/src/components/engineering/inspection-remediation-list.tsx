"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { nextCorrectiveActionStates } from "@rtb/inspection-intelligence/browser";
import { hostedGet, hostedIntent, type InspectionRow } from "@/lib/inspection-intelligence/hosted-client";

export function InspectionRemediationList() {
  const [actions, setActions] = useState<InspectionRow[]>([]);
  const [recommendations, setRecommendations] = useState<InspectionRow[]>([]);
  const [error, setError] = useState<string>();
  const [canWrite, setCanWrite] = useState(true);
  const [busy, setBusy] = useState(false);

  async function load() {
    const [nextActions, nextRecs, caps] = await Promise.all([
      hostedGet<InspectionRow[]>("corrective_actions"),
      hostedGet<InspectionRow[]>("recommendations"),
      hostedGet<{ canWrite: boolean }>("capabilities").catch(() => ({ canWrite: true })),
    ]);
    setActions(nextActions);
    setRecommendations(nextRecs);
    setCanWrite(caps.canWrite !== false);
  }

  useEffect(() => {
    load().catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load remediation"));
  }, []);

  if (error) return <p className="text-red-700" role="alert">{error}</p>;

  return (
    <section data-testid="inspection-corrective-actions-ready">
      <p className="text-sm font-medium text-cyan-700">Remediation</p>
      <h1 id="ii-actions-title" className="mt-1 text-2xl font-semibold text-slate-900">
        Recommendations and corrective actions
      </h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Inspection recommendations and inspection corrective-action process state. These are not Engineering Core
        actions. No Core action id is stored on inspection_corrective_actions.
      </p>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="font-semibold">Recommendations</h2>
          {recommendations.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">None issued.</p>
          ) : (
            <ul className="mt-3 divide-y rounded border">
              {recommendations.map((row) => (
                <li key={String(row.id)} className="px-4 py-3 text-sm">
                  <p className="font-medium">{String(row.action)} · {String(row.status)}</p>
                  <p className="text-slate-600">{String(row.rationale)}</p>
                  {row.defect_id ? (
                    <Link className="text-cyan-700 hover:underline" href={`/engineering/apps/inspection-intelligence/defects/${row.defect_id}`}>
                      Defect
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h2 className="font-semibold">Inspection corrective actions</h2>
          {actions.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">None recorded.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {actions.map((row) => (
                <li key={String(row.id)} className="rounded border px-4 py-3 text-sm">
                  <p className="font-medium">{String(row.description)}</p>
                  <p className="text-slate-500">{String(row.status)} · due {String(row.due_at ?? "").slice(0, 16)}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {nextCorrectiveActionStates(String(row.status) as never).map((to) => (
                      <button
                        key={to}
                        type="button"
                        className="rounded border px-2 py-1 text-xs disabled:opacity-60"
                        disabled={!canWrite || busy}
                        onClick={async () => {
                          setBusy(true);
                          setError(undefined);
                          try {
                            await hostedIntent("progress_corrective_action", { actionId: row.id, to });
                            await load();
                          } catch (reason) {
                            setError(reason instanceof Error ? reason.message : "Transition failed");
                          } finally {
                            setBusy(false);
                          }
                        }}
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
      </div>
    </section>
  );
}
