import { Suspense } from "react";
import { ProjectQueryDecisionIntelligenceView } from "@/components/engineering/project-query-decision-intelligence";

export default function ProjectIntelligenceQueriesDecisionsPage() {
  return (
    <section data-testid="project-intelligence-queries-decisions-ready">
      <p className="text-[0.8125rem] font-semibold tracking-[0.14em] text-[color:var(--eos-accent)]">Project Intelligence</p>
      <h2 className="mt-1 text-[2.125rem] font-semibold text-[color:var(--eos-text-primary)]">Queries & decisions</h2>
      <p className="mt-2 max-w-3xl text-[1rem] text-[color:var(--eos-text-secondary)]">
        Decisions, technical queries, and actions that affect schedule, cost, or risk. This module
        does not answer queries, approve decisions, or close actions.
      </p>
      <div className="mt-8">
        <Suspense fallback={<p className="text-[1rem] text-[color:var(--eos-text-secondary)]">Loading query and decision intelligence…</p>}>
          <ProjectQueryDecisionIntelligenceView />
        </Suspense>
      </div>
    </section>
  );
}
