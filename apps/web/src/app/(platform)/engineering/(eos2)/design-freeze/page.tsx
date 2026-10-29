"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { PersistedQualificationNotice } from "@/components/engineering/qualification-runtime-panel";

type View = {
  stage: string;
  target: string | null;
  disciplines: Record<string, { blockers: string[] }>;
  deliverables: Array<{ number: string; title: string; discipline: string; revision: string; purpose: string; review: string; approval: string; release: string; stale: boolean }>;
  packages: number;
  transmittals: number;
  stale: number;
  advisory: string;
  approvalGranted: boolean;
  releasedByAi: boolean;
};

const STAGES = ["concept", "feasibility", "feed", "detailed_engineering"] as const;

export default function DesignFreezePage() {
  const [view, setView] = useState<View | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<(typeof STAGES)[number]>("concept");

  useEffect(() => {
    void fetch("/api/engineering/design-freeze")
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) {
          setError(body.error ?? "Design freeze is not available.");
          return;
        }
        setView(body.data.view as View);
      })
      .catch(() => setError("Design freeze is not available."));
  }, []);

  return (
    <>
      <Header
        title="Design freeze and deliverables"
        description="A freeze records exact revisions. Approval of a deliverable is not IFC release, and IFC release is not regulatory certification. This page does not authorize release."
        wrapDescription
      />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8">
        <PersistedQualificationNotice />
        <p className="mb-4 text-sm">
          <Link className="underline" href="/engineering/change-impact">Change impact</Link>
          {" · "}
          <Link className="underline" href="/engineering/integrated-project">Integrated project</Link>
        </p>
        <div className="mb-4 flex flex-wrap gap-2">
          {STAGES.map((item) => (
            <button key={item} type="button" className="text-sm underline" onClick={() => setStage(item)}>{item}</button>
          ))}
        </div>
        {error ? <p className="text-sm">{error}</p> : null}
        {view ? (
          <section className="max-w-3xl space-y-2 text-sm" data-testid="freeze-home">
            <p>Selected view: {stage}. Lifecycle stage: {view.stage}. Target freeze: {view.target ?? "None on this unclassified view."}</p>
            <p>Deliverables: {view.deliverables.length}. Packages: {view.packages}. Transmittals: {view.transmittals}. Stale deliverables: {view.stale}.</p>
            <p>Approval granted: {view.approvalGranted ? "yes" : "no"}. Released by AI: {view.releasedByAi ? "yes" : "no"}.</p>
            {Object.entries(view.disciplines).map(([discipline, summary]) => (
              <p key={discipline}>{discipline} blockers: {summary.blockers.length ? summary.blockers.join(", ") : "none"}.</p>
            ))}
            {view.deliverables.map((item) => (
              <p key={item.number}>{item.number} {item.title}. {item.discipline}. Rev {item.revision}. {item.purpose}. Review {item.review}. Approval {item.approval}. Release {item.release}. Stale {item.stale ? "yes" : "no"}.</p>
            ))}
            <p>{view.advisory}</p>
          </section>
        ) : null}
      </main>
    </>
  );
}
