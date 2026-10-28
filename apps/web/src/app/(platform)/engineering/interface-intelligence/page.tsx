"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";

type MatrixRow = { source: string; receiver: string; active: number; open: number; rejected: number; conditional: number; stale: number };
type Summary = { waiting: number; received: number; owed: number; accepted: number; rejected: number; stale: number };
type View = {
  stage: string;
  active: number;
  accepted: number;
  conditional: number;
  pending: number;
  rejected: number;
  overdue: number;
  stale: number;
  blocking: number;
  issued: number;
  underReview: number;
  critical: number;
  blockers: string[];
  matrix: MatrixRow[];
  diagnostics: string[];
  advisory: string;
  approvalGranted: boolean;
  recalculated: boolean;
};

const STAGES = ["concept", "feasibility", "feed", "detailed_engineering"] as const;

export default function InterfaceIntelligencePage() {
  const [view, setView] = useState<View | null>(null);
  const [summaries, setSummaries] = useState<Record<string, Summary>>({});
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<(typeof STAGES)[number]>("concept");

  useEffect(() => {
    void fetch("/api/engineering/interface-intelligence")
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) {
          setError(body.error ?? "Interface intelligence is not available.");
          return;
        }
        setView(body.data.view as View);
        setSummaries(body.data.summaries as Record<string, Summary>);
      })
      .catch(() => setError("Interface intelligence is not available."));
  }, []);

  return (
    <>
      <Header
        title="Interface intelligence"
        description="Acceptance of a handoff is the current basis for downstream work. It is not design approval. This page does not recalculate engineering results."
        wrapDescription
      />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8">
        <p className="mb-4 text-sm">
          <Link className="underline" href="/engineering/interfaces">Interface register</Link>
          {" · "}
          <Link className="underline" href="/engineering/instrumentation">Instrumentation and control</Link>
        </p>
        <div className="mb-4 flex flex-wrap gap-2">
          {STAGES.map((item) => (
            <button key={item} type="button" className="text-sm underline" onClick={() => setStage(item)}>{item}</button>
          ))}
        </div>
        {error ? <p className="text-sm">{error}</p> : null}
        {view ? (
          <section className="max-w-3xl space-y-2 text-sm" data-testid="interface-home">
            <p>Selected view: {stage}. Current lifecycle stage: {view.stage}.</p>
            <p>Active: {view.active}. Issued: {view.issued}. Under review: {view.underReview}. Accepted: {view.accepted}. Accepted with conditions: {view.conditional}.</p>
            <p>Pending: {view.pending}. Rejected: {view.rejected}. Overdue: {view.overdue}. Stale: {view.stale}. Critical: {view.critical}. Blocking: {view.blocking}.</p>
            <p>Matrix rows: {view.matrix.length ? view.matrix.map((row) => `${row.source} to ${row.receiver}: ${row.active} active, ${row.open} open`).join("; ") : "None on this unclassified view."}</p>
            <p>Diagnostics: {view.diagnostics.length ? view.diagnostics.join(", ") : "None on this unclassified view."}</p>
            <p>Next-stage blockers: {view.blockers.length ? view.blockers.join("; ") : "None on this unclassified view."}</p>
            <p>Approval granted: {view.approvalGranted ? "yes" : "no"}. Recalculated: {view.recalculated ? "yes" : "no"}.</p>
            {Object.entries(summaries).map(([discipline, summary]) => (
              <p key={discipline}>{discipline}: waiting {summary.waiting}, received {summary.received}, owed {summary.owed}, accepted {summary.accepted}, rejected {summary.rejected}, stale {summary.stale}.</p>
            ))}
            <p>{view.advisory}</p>
          </section>
        ) : null}
      </main>
    </>
  );
}
