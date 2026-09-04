import { Suspense } from "react";
import { ProjectQueryDecisionIntelligenceView } from "@/components/engineering/project-query-decision-intelligence";

export default function ProjectIntelligenceQueriesDecisionsPage() {
  return (
    <section data-testid="project-intelligence-queries-decisions-ready">
      <p className="text-sm font-medium text-cyan-700">Project Intelligence</p>
      <h2 className="mt-1 text-2xl font-semibold text-slate-900">Queries & Decisions</h2>
      <p className="mt-2 max-w-3xl text-slate-600">
        Decisions, technical queries, and actions that affect schedule, cost, or risk. This module
        does not answer queries, approve decisions, or close actions.
      </p>
      <div className="mt-8">
        <Suspense fallback={<p className="text-sm text-slate-600">Loading query and decision intelligence…</p>}>
          <ProjectQueryDecisionIntelligenceView />
        </Suspense>
      </div>
    </section>
  );
}
