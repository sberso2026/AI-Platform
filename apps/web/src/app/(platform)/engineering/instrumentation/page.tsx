"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";

type Capability = { id: string; stage: string; state: string };
type View = {
  stage: string;
  maturity: string | null;
  basisCount: number;
  requirementCount: number;
  instrumentCount: number;
  ioCount: number;
  loopCount: number;
  narrativeCount: number;
  causeEffectCount: number;
  alarmCount: number;
  sifCount: number;
  packageCount: number;
  panelCount: number;
  junctionBoxCount: number;
  cableCount: number;
  networkCount: number;
  cyberCount: number;
  fatCount: number;
  satCount: number;
  staleCount: number;
  interfaceCount: number;
  openChanges: number;
  openAssumptions: number;
  reviewCount: number;
  deliverableCount: number;
  blockers: string[];
  capabilities: Capability[];
  advisory: string;
};

const STAGES = ["concept", "feasibility", "feed", "detailed_engineering"] as const;

export default function InstrumentationDeliveryPage() {
  const [view, setView] = useState<View | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<(typeof STAGES)[number]>("concept");

  useEffect(() => {
    void fetch("/api/engineering/instrumentation-delivery")
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) {
          setError(body.error ?? "Instrumentation and control delivery is not available.");
          return;
        }
        setView(body.data.view as View);
      })
      .catch(() => setError("Instrumentation and control delivery is not available."));
  }, []);

  const unavailable = view?.capabilities.filter((item) => item.state === "NOT_IMPLEMENTED") ?? [];

  return (
    <>
      <Header
        title="Instrumentation and control"
        description="Concept, feasibility, FEED, and detailed engineering stay distinct. This page does not determine SIL targets, calculate SIS performance, or generate control logic."
        wrapDescription
      />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8">
        <p className="mb-4 text-sm">
          <Link className="underline" href="/engineering/electrical">Electrical delivery</Link>
        </p>
        <div className="mb-4 flex flex-wrap gap-2">
          {STAGES.map((item) => (
            <button key={item} type="button" className="text-sm underline" onClick={() => setStage(item)}>{item}</button>
          ))}
        </div>
        {error ? <p className="text-sm">{error}</p> : null}
        {view ? (
          <section className="max-w-3xl space-y-2 text-sm" data-testid="instrumentation-home">
            <p>Selected view: {stage}. Current lifecycle stage: {view.stage === "not_classified" ? "Not classified." : view.stage}.</p>
            <p>Maturity: {view.maturity ?? "Not set. Maturity is not approval."}</p>
            <p>Design basis items: {view.basisCount}. Requirements: {view.requirementCount}. Instrument index: {view.instrumentCount}. I/O list: {view.ioCount}.</p>
            <p>Control loops: {view.loopCount}. Control narratives: {view.narrativeCount}. Cause and effect: {view.causeEffectCount}. Alarms: {view.alarmCount}.</p>
            <p>SIF records: {view.sifCount}. Package interfaces: {view.packageCount}. Panels: {view.panelCount}. Junction boxes: {view.junctionBoxCount}.</p>
            <p>Instrument cables: {view.cableCount}. Networks: {view.networkCount}. Cybersecurity requirements: {view.cyberCount}. FAT: {view.fatCount}. SAT: {view.satCount}.</p>
            <p>Stale records: {view.staleCount}. Interfaces: {view.interfaceCount}. Open changes: {view.openChanges}. Open assumptions: {view.openAssumptions}.</p>
            <p>Reviews: {view.reviewCount}. Deliverables: {view.deliverableCount}.</p>
            <p>Next-stage blockers: {view.blockers.length ? view.blockers.join("; ") : "None on this unclassified view."}</p>
            <p>Not calculated in this module: {unavailable.map((item) => item.id).join(", ") || "None"}.</p>
            <p>{view.advisory}</p>
          </section>
        ) : null}
      </main>
    </>
  );
}
