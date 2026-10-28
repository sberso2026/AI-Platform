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
  lineCount: number;
  classCount: number;
  processCount: number;
  nozzleCount: number;
  routeCount: number;
  stressCriticalCount: number;
  stressModelCount: number;
  staleStressModels: number;
  comparisonCount: number;
  supportCount: number;
  tieInCount: number;
  reviewCount: number;
  deliverableCount: number;
  blockers: string[];
  capabilities: Capability[];
  advisory: string;
};

const STAGES = ["concept", "feasibility", "feed", "detailed_engineering"] as const;

export default function PipingDeliveryPage() {
  const [view, setView] = useState<View | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<(typeof STAGES)[number]>("concept");

  useEffect(() => {
    void fetch("/api/engineering/piping-delivery")
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) {
          setError(body.error ?? "Piping delivery is not available.");
          return;
        }
        setView(body.data.view as View);
      })
      .catch(() => setError("Piping delivery is not available."));
  }, []);

  const unavailable = view?.capabilities.filter((item) => item.state === "NOT_IMPLEMENTED") ?? [];

  return (
    <>
      <Header
        title="Piping delivery"
        description="Concept, feasibility, FEED, and detailed engineering stay distinct. This page does not calculate pipe size, stress, nozzle allowables, or code compliance."
        wrapDescription
      />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8">
        <p className="mb-4 text-sm">
          <Link className="underline" href="/engineering/mechanical">Mechanical delivery</Link>
        </p>
        <div className="mb-4 flex flex-wrap gap-2">
          {STAGES.map((item) => (
            <button key={item} type="button" className="text-sm underline" onClick={() => setStage(item)}>{item}</button>
          ))}
        </div>
        {error ? <p className="text-sm">{error}</p> : null}
        {view ? (
          <section className="max-w-3xl space-y-2 text-sm" data-testid="piping-home">
            <p>Selected view: {stage}. Current lifecycle stage: {view.stage === "not_classified" ? "Not classified." : view.stage}.</p>
            <p>Maturity: {view.maturity ?? "Not set. Maturity is not approval."}</p>
            <p>Design basis items: {view.basisCount}. Requirements: {view.requirementCount}. Lines: {view.lineCount}. Classes: {view.classCount}.</p>
            <p>Process conditions: {view.processCount}. Mechanical nozzles: {view.nozzleCount}. Routes: {view.routeCount}.</p>
            <p>Stress-critical lines: {view.stressCriticalCount}. Stress models: {view.stressModelCount}. Stale stress models: {view.staleStressModels}.</p>
            <p>Nozzle comparisons: {view.comparisonCount}. Supports: {view.supportCount}. Tie-ins: {view.tieInCount}.</p>
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
