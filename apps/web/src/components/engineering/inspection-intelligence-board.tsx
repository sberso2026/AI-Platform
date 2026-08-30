"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { hostedGet } from "@/lib/inspection-intelligence/hosted-client";

type Intelligence = {
  openDefectCount: { value: number; unknownStatus: number };
  defectsByRecordedSeverity: { counts: Record<string, number>; unknownSeverity: number };
  unverifiedDefects: { value: number };
  outstandingCorrectiveActions: { value: number; note: string };
  evidenceCompleteness: {
    inProgressSessions: number;
    withRegisteredEvidence: number;
    withoutRegisteredEvidence: number;
    note: string;
  };
  conditionRatingDistribution: {
    counts: Record<string, number>;
    recordedRatings: number;
    unratedSessions: number;
    note: string;
  };
  inspectionsAwaitingVerification: { pendingVerifications: number; sessions: number };
};

export function InspectionIntelligenceBoard() {
  const [data, setData] = useState<Intelligence>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    hostedGet<Intelligence>("intelligence")
      .then(setData)
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load indicators"));
  }, []);

  if (!data && !error) return <p className="text-slate-600" role="status">Loading indicators…</p>;
  if (!data) return <p className="text-red-700" role="alert">{error}</p>;

  return (
    <section className="rounded border border-slate-200 p-4" data-testid="inspection-deterministic-intelligence">
      <h2 className="text-lg font-semibold text-slate-900">Deterministic inspection views</h2>
      <p className="mt-1 text-sm text-slate-500">
        Counts from hosted inspection records only. Missing values stay unknown — they are not scored as healthy or pass.
      </p>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Open defects" value={String(data.openDefectCount.value)} hint={data.openDefectCount.unknownStatus ? `${data.openDefectCount.unknownStatus} unknown status` : undefined} href="/engineering/apps/inspection-intelligence/defects" />
        <Stat label="Unverified defects" value={String(data.unverifiedDefects.value)} href="/engineering/apps/inspection-intelligence/defects" />
        <Stat label="Outstanding corrective actions" value={String(data.outstandingCorrectiveActions.value)} hint="Inspection process records, not Core actions" href="/engineering/apps/inspection-intelligence/actions" />
        <Stat
          label="In-progress sessions without evidence"
          value={`${data.evidenceCompleteness.withoutRegisteredEvidence} / ${data.evidenceCompleteness.inProgressSessions}`}
          hint={data.evidenceCompleteness.note}
          href="/engineering/apps/inspection-intelligence/evidence"
        />
        <Stat
          label="Recorded condition ratings"
          value={String(data.conditionRatingDistribution.recordedRatings)}
          hint={`${data.conditionRatingDistribution.unratedSessions} sessions unrated`}
          href="/engineering/apps/inspection-intelligence/condition"
        />
        <Stat
          label="Pending verifications"
          value={String(data.inspectionsAwaitingVerification.pendingVerifications)}
          href="/engineering/apps/inspection-intelligence/review"
        />
      </dl>
      <div className="mt-4 text-sm text-slate-600">
        <p className="font-medium text-slate-800">Recorded severity</p>
        {Object.keys(data.defectsByRecordedSeverity.counts).length === 0 ? (
          <p>No recorded severity yet.{data.defectsByRecordedSeverity.unknownSeverity ? ` ${data.defectsByRecordedSeverity.unknownSeverity} unset.` : ""}</p>
        ) : (
          <p>
            {Object.entries(data.defectsByRecordedSeverity.counts)
              .map(([key, count]) => `${key}: ${count}`)
              .join(" · ")}
            {data.defectsByRecordedSeverity.unknownSeverity
              ? ` · unknown: ${data.defectsByRecordedSeverity.unknownSeverity}`
              : ""}
          </p>
        )}
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: string;
  hint?: string;
  href: string;
}) {
  return (
    <div className="rounded border border-slate-100 p-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="mt-1 text-xl font-semibold text-slate-900">{value}</dd>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
      <Link className="mt-2 inline-block text-cyan-700 hover:underline" href={href}>
        Open
      </Link>
    </div>
  );
}
