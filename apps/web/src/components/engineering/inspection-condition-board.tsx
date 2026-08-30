"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { hostedGet, type InspectionRow } from "@/lib/inspection-intelligence/hosted-client";

function ratingLabel(row: InspectionRow): string {
  const payload = row.payload && typeof row.payload === "object" ? (row.payload as Record<string, unknown>) : {};
  const observed = payload.observed && typeof payload.observed === "object"
    ? (payload.observed as { ordinalCode?: string; numericScore?: number })
    : {};
  if (observed.ordinalCode) return `ordinal ${observed.ordinalCode}`;
  if (typeof observed.numericScore === "number") return `numeric ${observed.numericScore}`;
  return "unknown value";
}

export function InspectionConditionBoard() {
  const [rows, setRows] = useState<InspectionRow[]>([]);
  const [assessments, setAssessments] = useState<InspectionRow[]>([]);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([hostedGet<InspectionRow[]>("conditions"), hostedGet<InspectionRow[]>("assessments")])
      .then(([ratings, nextAssessments]) => {
        setRows(ratings);
        setAssessments(nextAssessments);
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load condition records"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section data-testid="inspection-condition-ready">
        <Header />
        <p className="mt-6 text-slate-600" role="status">Loading condition records…</p>
      </section>
    );
  }
  if (error) return <p className="text-red-700" role="alert">{error}</p>;

  return (
    <section data-testid="inspection-condition-ready">
      <Header />
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="font-semibold text-slate-900">Condition ratings</h2>
          {rows.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No ratings recorded. Unrated remains unrated.</p>
          ) : (
            <ul className="mt-3 divide-y rounded border">
              {rows.map((row) => {
                const payload = row.payload && typeof row.payload === "object" ? (row.payload as Record<string, unknown>) : {};
                return (
                  <li key={String(row.rating_id ?? row.id)} className="px-4 py-3 text-sm">
                    <p className="font-medium">{ratingLabel(row)}</p>
                    <p className="text-slate-500">
                      {String(row.scheme_id)} @ {String(row.scheme_version)} · {String(row.review_state)} ·
                      assessor {String(payload.assessorUserId ?? "unknown")} · {String(payload.assessedAt ?? row.created_at ?? "")}
                    </p>
                    <p className="text-xs text-slate-500">
                      Session{" "}
                      <Link className="text-cyan-700 hover:underline" href={`/engineering/apps/inspection-intelligence/sessions/${row.session_id}`}>
                        {String(row.session_id).slice(0, 8)}
                      </Link>
                      {" · "}evidence {String(row.evidence_sufficiency ?? payload.evidenceSufficiency ?? "unknown")}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div>
          <h2 className="font-semibold text-slate-900">Human assessments</h2>
          {assessments.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No assessments recorded.</p>
          ) : (
            <ul className="mt-3 divide-y rounded border">
              {assessments.map((row) => (
                <li key={String(row.id)} className="px-4 py-3 text-sm">
                  <p className="font-medium">{String(row.title)}</p>
                  <p className="text-slate-600">{String(row.body)}</p>
                  <p className="text-xs text-slate-500">
                    {row.ai_generated ? "AI draft (not canonical)" : "Human"} · {String(row.status)} · {String(row.created_at ?? "")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function Header() {
  return (
    <>
      <p className="text-sm font-medium text-cyan-700">Condition Assessment</p>
      <h1 id="ii-condition-title" className="mt-1 text-2xl font-semibold text-slate-900">
        Condition rating
      </h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Human-controlled inspection-derived ratings. Missing ratings stay unknown. AI drafts cannot become canonical.
      </p>
      <dl className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
        <div>
          <dt className="font-medium">Scheme</dt>
          <dd data-testid="inspection-condition-scheme">structural_ordinal_1_5 @ 1.0.0</dd>
        </div>
        <div>
          <dt className="font-medium">Confidence / uncertainty</dt>
          <dd data-testid="inspection-condition-confidence">visible on each rating</dd>
        </div>
        <div>
          <dt className="font-medium">Override authority</dt>
          <dd data-testid="inspection-condition-override">reason + actor + prior value retained</dd>
        </div>
        <div>
          <dt className="font-medium">Publication</dt>
          <dd data-testid="inspection-condition-publish">authorised roles only; offline stays draft</dd>
        </div>
      </dl>
    </>
  );
}
