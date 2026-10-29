"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { PersistedQualificationNotice } from "@/components/engineering/qualification-runtime-panel";
import { PilotWorkflowPanel } from "@/components/engineering/pilot-workflow-panel";

type Summary = {
  unassessed: number;
  material: number;
  recalculationRequired: number;
  modelRevisionRequired: number;
  deliverableRevisionRequired: number;
  awaitingOther: number;
};
type View = {
  open: number;
  unassessed: number;
  critical: number;
  material: number;
  staleCalculations: number;
  staleModels: number;
  deliverables: number;
  baselineDeviations: number;
  recent: string[];
  approvalGranted: boolean;
  recalculated: boolean;
  baselineRewritten: boolean;
  advisory: string;
};

const STAGES = ["concept", "feasibility", "feed", "detailed_engineering"] as const;

export default function ChangeImpactPage() {
  const [view, setView] = useState<View | null>(null);
  const [summaries, setSummaries] = useState<Record<string, Summary>>({});
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<(typeof STAGES)[number]>("concept");

  useEffect(() => {
    void fetch("/api/engineering/change-impact")
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) {
          setError(body.error ?? "Change impact intelligence is not available.");
          return;
        }
        setView(body.data.view as View);
        setSummaries(body.data.summaries as Record<string, Summary>);
      })
      .catch(() => setError("Change impact intelligence is not available."));
  }, []);

  return (
    <>
      <Header
        title="Change impact intelligence"
        description="A discovered dependency is a candidate until an engineer assesses it. This page does not approve a change, recalculate a result, revise a deliverable, or rewrite a baseline."
        wrapDescription
      />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8">
        <PersistedQualificationNotice />
        <PilotWorkflowPanel />
        <p className="mb-4 text-sm">
          <Link className="underline" href="/engineering/interface-intelligence">Interface intelligence</Link>
          {" · "}
          <Link className="underline" href="/engineering/design-freeze">Design freeze</Link>
        </p>
        <div className="mb-4 flex flex-wrap gap-2">
          {STAGES.map((item) => (
            <button key={item} type="button" className="text-sm underline" onClick={() => setStage(item)}>{item}</button>
          ))}
        </div>
        {error ? <p className="text-sm">{error}</p> : null}
        {view ? (
          <section className="max-w-3xl space-y-2 text-sm" data-testid="change-home">
            <p>Selected view: {stage}. Open changes: {view.open}. Unassessed impacts: {view.unassessed}. High or critical changes: {view.critical}.</p>
            <p>Confirmed material impacts: {view.material}. Stale calculations: {view.staleCalculations}. Stale models: {view.staleModels}. Affected deliverables: {view.deliverables}.</p>
            <p>Baseline deviations: {view.baselineDeviations}. Recent changes: {view.recent.length ? view.recent.join(", ") : "None on this unclassified view."}</p>
            <p>Approval granted: {view.approvalGranted ? "yes" : "no"}. Recalculated: {view.recalculated ? "yes" : "no"}. Baseline rewritten: {view.baselineRewritten ? "yes" : "no"}.</p>
            {Object.entries(summaries).map(([discipline, summary]) => (
              <p key={discipline}>{discipline}: unassessed {summary.unassessed}, material {summary.material}, recalculation {summary.recalculationRequired}, model {summary.modelRevisionRequired}, deliverable {summary.deliverableRevisionRequired}, awaiting other {summary.awaitingOther}.</p>
            ))}
            <p>{view.advisory}</p>
          </section>
        ) : null}
      </main>
    </>
  );
}
