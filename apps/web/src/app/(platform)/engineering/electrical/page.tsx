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
  loadCount: number;
  connectedLoadStatus: string;
  demandLoadStatus: string;
  sourceCount: number;
  transformerCount: number;
  switchgearCount: number;
  mccCount: number;
  sldCount: number;
  modelCount: number;
  studyCount: number;
  cableCount: number;
  cableScheduleCount: number;
  staleStudyCount: number;
  earthingCount: number;
  lightingCount: number;
  emergencyCount: number;
  upsCount: number;
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

export default function ElectricalDeliveryPage() {
  const [view, setView] = useState<View | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<(typeof STAGES)[number]>("concept");

  useEffect(() => {
    void fetch("/api/engineering/electrical-delivery")
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) {
          setError(body.error ?? "Electrical delivery is not available.");
          return;
        }
        setView(body.data.view as View);
      })
      .catch(() => setError("Electrical delivery is not available."));
  }, []);

  const unavailable = view?.capabilities.filter((item) => item.state === "NOT_IMPLEMENTED") ?? [];

  return (
    <>
      <Header
        title="Electrical delivery"
        description="Concept, feasibility, FEED, and detailed engineering stay distinct. This page does not calculate load flow, fault level, cable size, or protection settings."
        wrapDescription
      />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8">
        <p className="mb-4 text-sm">
          <Link className="underline" href="/engineering/geotechnical">Geotechnical delivery</Link>
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
          <section className="max-w-3xl space-y-2 text-sm" data-testid="electrical-home">
            <p>Selected view: {stage}. Current lifecycle stage: {view.stage === "not_classified" ? "Not classified." : view.stage}.</p>
            <p>Maturity: {view.maturity ?? "Not set. Maturity is not approval."}</p>
            <p>Design basis items: {view.basisCount}. Requirements: {view.requirementCount}. Load list records: {view.loadCount}.</p>
            <p>Connected load: {view.connectedLoadStatus}. Demand load: {view.demandLoadStatus}. Sources: {view.sourceCount}. Transformers: {view.transformerCount}.</p>
            <p>Switchgear: {view.switchgearCount}. MCCs: {view.mccCount}. Single-line diagrams: {view.sldCount}. Power-system models: {view.modelCount}.</p>
            <p>Study records: {view.studyCount}. Stale studies: {view.staleStudyCount}. Cable records: {view.cableCount}. Cable schedules: {view.cableScheduleCount}.</p>
            <p>Earthing records: {view.earthingCount}. Lighting records: {view.lightingCount}. Emergency power: {view.emergencyCount}. UPS: {view.upsCount}.</p>
            <p>Interfaces: {view.interfaceCount}. Open changes: {view.openChanges}. Open assumptions: {view.openAssumptions}. Reviews: {view.reviewCount}. Deliverables: {view.deliverableCount}.</p>
            <p>Next-stage blockers: {view.blockers.length ? view.blockers.join("; ") : "None on this unclassified view."}</p>
            <p>Not calculated in this module: {unavailable.map((item) => item.id).join(", ") || "None"}.</p>
            <p>{view.advisory}</p>
          </section>
        ) : null}
      </main>
    </>
  );
}
