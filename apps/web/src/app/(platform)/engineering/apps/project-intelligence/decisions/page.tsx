import { Suspense } from "react";
import { ProjectQueryDecisionIntelligenceView } from "@/components/engineering/project-query-decision-intelligence";

export default function ProjectIntelligenceDecisionsPage() {
  return (
    <section data-testid="project-intelligence-decisions-ready">
      <p className="text-sm font-medium text-cyan-700">Project Intelligence</p>
      <h2 className="mt-1 text-2xl font-semibold text-slate-900">Decision Intelligence</h2>
      <p className="mt-2 max-w-3xl text-slate-600">
        Decisions required, overdue, recent, and those with schedule, cost, or risk dependencies.
        Canonical decision records remain in Engineering OS. Project Intelligence does not approve
        decisions.
      </p>
      <div className="mt-8">
        <Suspense fallback={<p className="text-sm text-slate-600">Loading decision intelligence…</p>}>
          <ProjectQueryDecisionIntelligenceView />
        </Suspense>
      </div>
    </section>
  );
}
