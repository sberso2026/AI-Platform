import { Suspense } from "react";
import { ProjectCostProgressIntelligenceView } from "@/components/engineering/project-cost-progress-intelligence";

export default function ProjectIntelligenceCostProgressPage() {
  return (
    <section data-testid="project-intelligence-cost-progress-ready">
      <p className="text-[0.8125rem] font-semibold tracking-[0.14em] text-[color:var(--eos-accent)]">Project Intelligence</p>
      <h2 className="mt-1 text-[2.125rem] font-semibold text-[color:var(--eos-text-primary)]">Cost & progress intelligence</h2>
      <p className="mt-2 max-w-3xl text-[1rem] text-[color:var(--eos-text-secondary)]">
        Budget and forecast signals, emerging exposure, and unapproved changes where published.
        This is not an ERP or cost-control system. Unpublished amounts are not shown as zeros.
      </p>
      <div className="mt-8">
        <Suspense fallback={<p className="text-[1rem] text-[color:var(--eos-text-secondary)]">Loading cost and progress intelligence…</p>}>
          <ProjectCostProgressIntelligenceView />
        </Suspense>
      </div>
    </section>
  );
}
