"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { hostedGet } from "@/lib/inspection-intelligence/hosted-client";

type TimelineEvent = { at: string; kind: string; id: string; sessionId: string; summary: string };

type TargetHistory = {
  target: { kind: string; canonicalId: string };
  sessions: Array<{ id: string; status: string }>;
  timeline: TimelineEvent[];
  changeOverTime: {
    conditionRatingHistory: Record<string, Array<{ at: string; ratingId: string; numericScore?: number; ordinalCode?: string }>>;
    repeatDefects: Array<{ key: string; count: number }>;
    measurementDeltas: Array<{ key: string; delta: number; note: string }>;
  };
  missingContinuity: boolean;
  profile?: { totalMs: number };
};

export function InspectionTargetHistory({ kind, canonicalId }: { kind: string; canonicalId: string }) {
  const [data, setData] = useState<TargetHistory>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    hostedGet<TargetHistory>("target_history", { kind, canonicalId })
      .then(setData)
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load target history"));
  }, [kind, canonicalId]);

  if (!data && !error) return <p className="text-slate-600" role="status">Loading target history…</p>;
  if (!data) return <p className="text-red-700" role="alert">{error}</p>;

  const ratingSchemes = Object.entries(data.changeOverTime.conditionRatingHistory);

  return (
    <section data-testid="inspection-target-history">
      <p className="text-sm font-medium text-cyan-700">Inspection History</p>
      <h1 className="mt-1 text-2xl font-semibold text-slate-900">
        {kind} · {canonicalId.slice(0, 8)}
      </h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Inspection-derived chronology for this InspectionTarget. Missing records stay missing; continuity is not inferred.
      </p>
      {data.missingContinuity ? <p className="mt-4 text-slate-500">No inspection sessions couple to this target.</p> : null}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="font-semibold">Timeline</h2>
          {data.timeline.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No dated inspection records.</p>
          ) : (
            <ol className="mt-3 space-y-2 text-sm">
              {data.timeline.map((event) => (
                <li key={`${event.kind}-${event.id}-${event.at}`} className="rounded border px-3 py-2">
                  <p className="font-medium">{event.kind}: {event.summary}</p>
                  <p className="text-xs text-slate-500">
                    {event.at} · session{" "}
                    <Link className="text-cyan-700 hover:underline" href={`/engineering/apps/inspection-intelligence/sessions/${event.sessionId}`}>
                      {event.sessionId.slice(0, 8)}
                    </Link>
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>
        <div>
          <h2 className="font-semibold">Change over time</h2>
          <p className="mt-2 text-xs text-slate-500">Same-scheme ratings and like-for-like measurements only. No causality.</p>
          {ratingSchemes.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No recorded condition ratings. Unrated remains unrated.</p>
          ) : (
            ratingSchemes.map(([scheme, series]) => (
              <div key={scheme} className="mt-3 text-sm">
                <p className="font-medium">{scheme}</p>
                <ul className="mt-1 space-y-1">
                  {series.map((point) => (
                    <li key={point.ratingId}>
                      {point.at || "timestamp unknown"} · {point.ordinalCode ?? (typeof point.numericScore === "number" ? `numeric ${point.numericScore}` : "unknown value")}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
          {data.changeOverTime.measurementDeltas.length > 0 ? (
            <ul className="mt-4 text-sm">
              {data.changeOverTime.measurementDeltas.map((delta) => (
                <li key={delta.key}>{delta.key}: delta {delta.delta} (numeric like-for-like only)</li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-slate-500">No deterministic measurement delta. Units, identity, or timestamps are not comparable.</p>
          )}
          {data.changeOverTime.repeatDefects.length > 0 ? (
            <p className="mt-4 text-sm">Repeat defect groups: {data.changeOverTime.repeatDefects.map((row) => `${row.key} (${row.count})`).join(" · ")}</p>
          ) : (
            <p className="mt-4 text-sm text-slate-500">No repeat defects by target identity.</p>
          )}
        </div>
      </div>
      {data.profile ? <p className="mt-4 text-xs text-slate-400">Loaded in {data.profile.totalMs} ms</p> : null}
    </section>
  );
}
