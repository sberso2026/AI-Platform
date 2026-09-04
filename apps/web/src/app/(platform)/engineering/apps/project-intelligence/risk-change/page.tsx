import { Suspense } from "react";
import { ProjectRiskChangeIntelligenceView } from "@/components/engineering/project-risk-change-intelligence";

export default function ProjectIntelligenceRiskChangePage() {
  return (
    <section data-testid="project-intelligence-risk-change-ready">
      <p className="text-sm font-medium text-cyan-700">Project Intelligence</p>
      <h2 className="mt-1 text-2xl font-semibold text-slate-900">Risk & Change Intelligence</h2>
      <p className="mt-2 max-w-3xl text-slate-600">
        Critical and high risks, worsening signals, overdue mitigations, and related change exposure.
        Canonical risk and change records remain in their source systems.
      </p>
      <div className="mt-8">
        <Suspense fallback={<p className="text-sm text-slate-600">Loading risk and change intelligence…</p>}>
          <ProjectRiskChangeIntelligenceView />
        </Suspense>
      </div>
    </section>
  );
}
