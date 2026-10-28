"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { QualificationRuntimePanel } from "@/components/engineering/qualification-runtime-panel";

type View = {
  projectId: string;
  projectTitle: string;
  facility: string;
  stage: string;
  stages: string[];
  detailedFreezeBefore: string;
  detailedFreezeBlocker: string;
  detailedFreezeAfter: string;
  ifcReleaseBlocked: string;
  counts: { interfaces: number; changes: number; deliverables: number; dependencyEdges: number };
  leakCount: number;
  limitations: string[];
  advisory: string;
  approvalGranted: boolean;
  releasedByAi: boolean;
};

export default function IntegratedProjectPage() {
  const [view, setView] = useState<View | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/engineering/integrated-project")
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) {
          setError(body.error ?? "The integrated demonstration is not available.");
          return;
        }
        setView(body.data as View);
      })
      .catch(() => setError("The integrated demonstration is not available."));
  }, []);

  return (
    <>
      <Header
        title="Integrated project demonstration"
        description="EOS-IPF-001 is a synthetic gas conditioning facility used to show the existing lifecycle, basis, interface, change, and freeze records working together. It does not qualify an engineering calculation."
        wrapDescription
      />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8">
        <QualificationRuntimePanel />
        <p className="mb-4 text-sm">
          <Link className="underline" href="/engineering/design-freeze">Design freeze</Link>
        </p>
        {error ? <p className="text-sm">{error}</p> : null}
        {view ? (
          <section className="max-w-3xl space-y-2 text-sm" data-testid="integrated-project-home">
            <p>{view.projectId} {view.projectTitle}. Facility: {view.facility}.</p>
            <p>Stages: {view.stages.join(" -> ")}. Current stage: {view.stage}.</p>
            <p>Detailed Design Freeze before resolution: {view.detailedFreezeBefore}. Blocker: {view.detailedFreezeBlocker}. After human resolution: {view.detailedFreezeAfter}.</p>
            <p>IFC release attempt before review: {view.ifcReleaseBlocked}.</p>
            <p>Interfaces {view.counts.interfaces}. Changes {view.counts.changes}. Deliverables {view.counts.deliverables}. Dependency edges {view.counts.dependencyEdges}. Cross-workspace leaks {view.leakCount}.</p>
            <p>Approval granted: {view.approvalGranted ? "yes" : "no"}. Released by AI: {view.releasedByAi ? "yes" : "no"}.</p>
            {view.limitations.map((item) => <p key={item}>{item}</p>)}
            <p>{view.advisory}</p>
          </section>
        ) : null}
      </main>
    </>
  );
}
