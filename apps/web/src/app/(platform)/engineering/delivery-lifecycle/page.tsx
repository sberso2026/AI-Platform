"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";

type View = {
  stage: string;
  maturity: string | null;
  disciplines: string[];
  baselineId: string | null;
  blockers: string[];
  exceptions: string[];
  openAssumptions: number;
  openInterfaces: number;
  activeChanges: number;
  deliverableCount: number;
  advisory: string;
};

export default function DeliveryLifecyclePage() {
  const [view, setView] = useState<View | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/engineering/delivery-lifecycle")
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) {
          setError(body.error ?? "Delivery lifecycle is not available.");
          return;
        }
        setView(body.data.view as View);
      })
      .catch(() => setError("Delivery lifecycle is not available."));
  }, []);

  return (
    <>
      <Header
        title="Delivery lifecycle"
        description="Stage, maturity, and baseline are separate. A stage change is not an engineering approval."
        wrapDescription
      />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8">
        <p className="mb-4 text-sm">
          <Link className="underline" href="/engineering/lifecycle">Lifecycle intelligence</Link>
        </p>
        {error ? <p className="text-sm">{error}</p> : null}
        {view ? (
          <section className="max-w-3xl space-y-3 text-sm" data-testid="delivery-lifecycle-view">
            <p>Where are we? {view.stage === "not_classified" ? "Not classified." : view.stage}</p>
            <p>What is mature? {view.maturity ?? "Maturity is not set."}</p>
            <p>Applicable disciplines: {view.disciplines.length ? view.disciplines.join(", ") : "None declared."}</p>
            <p>Current baseline: {view.baselineId ?? "None."}</p>
            <p>What blocks the next stage? {view.blockers.length ? view.blockers.join("; ") : "No blocking criterion is recorded on this view."}</p>
            <p>Non-blocking exceptions: {view.exceptions.length ? view.exceptions.join("; ") : "None."}</p>
            <p>Open assumptions: {view.openAssumptions}. Open interfaces: {view.openInterfaces}. Active changes: {view.activeChanges}.</p>
            <p>Deliverable readiness: {view.deliverableCount} linked deliverable record(s).</p>
            <p>What changed since the baseline? {view.baselineId ? "See the baseline revision." : "No baseline exists, so there is no baseline delta."}</p>
            <p>{view.advisory}</p>
          </section>
        ) : null}
      </main>
    </>
  );
}
