import { Suspense } from "react";
import { ProjectCostProgressIntelligenceView } from "@/components/engineering/project-cost-progress-intelligence";

export default function ProjectIntelligenceCostProgressPage() {
  return (
    <section data-testid="project-intelligence-cost-progress-ready">
      <p className="text-sm font-medium text-cyan-700">Project Intelligence</p>
      <h2 className="mt-1 text-2xl font-semibold text-slate-900">Cost & Progress Intelligence</h2>
      <p className="mt-2 max-w-3xl text-slate-600">
        Read-only interpretation of published Project Controls cost and progress assessments. This is
        not a cost ledger, earned-value engine, or progress calculator.
      </p>
      <div className="mt-8">
        <Suspense fallback={<p className="text-sm text-slate-600">Loading cost and progress intelligence…</p>}>
          <ProjectCostProgressIntelligenceView />
        </Suspense>
      </div>
    </section>
  );
}
