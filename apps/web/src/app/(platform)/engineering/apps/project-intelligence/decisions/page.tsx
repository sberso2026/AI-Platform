import { Suspense } from "react";
import { ProjectQueryDecisionIntelligenceView } from "@/components/engineering/project-query-decision-intelligence";

export default function ProjectIntelligenceDecisionsPage() {
  return (
    <section data-testid="project-intelligence-decisions-ready">
      <p className="text-[0.8125rem] font-semibold tracking-[0.14em] text-[color:var(--eos-accent)]">Project Intelligence</p>
      <h2 className="mt-1 text-[2.125rem] font-semibold text-[color:var(--eos-text-primary)]">Decision intelligence</h2>
      <p className="mt-2 max-w-3xl text-[1rem] text-[color:var(--eos-text-secondary)]">
        What decisions are holding up this project? Required, overdue, recently resolved, and supporting evidence.
        Canonical decision records remain in Engineering OS. Project Intelligence does not approve decisions.
      </p>
      <div className="mt-8">
        <Suspense fallback={<p className="text-[1rem] text-[color:var(--eos-text-secondary)]">Loading decision intelligence…</p>}>
          <ProjectQueryDecisionIntelligenceView />
        </Suspense>
      </div>
    </section>
  );
}
