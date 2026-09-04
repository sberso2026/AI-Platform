import { Suspense } from "react";
import { ProjectRiskChangeIntelligenceView } from "@/components/engineering/project-risk-change-intelligence";

export default function ProjectIntelligenceRiskChangePage() {
  return (
    <section data-testid="project-intelligence-risk-change-ready">
      <p className="text-[0.8125rem] font-semibold tracking-[0.14em] text-[color:var(--eos-accent)]">Project Intelligence</p>
      <h2 className="mt-1 text-[2.125rem] font-semibold text-[color:var(--eos-text-primary)]">Risk & change intelligence</h2>
      <p className="mt-2 max-w-3xl text-[1rem] text-[color:var(--eos-text-secondary)]">
        Critical and high risks, overdue mitigations, and related change exposure.
        Canonical risk and change records remain in their source systems. Matrix coordinates are not invented.
      </p>
      <div className="mt-8">
        <Suspense fallback={<p className="text-[1rem] text-[color:var(--eos-text-secondary)]">Loading risk and change intelligence…</p>}>
          <ProjectRiskChangeIntelligenceView />
        </Suspense>
      </div>
    </section>
  );
}
