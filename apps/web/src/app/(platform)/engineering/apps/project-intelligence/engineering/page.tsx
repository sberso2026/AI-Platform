import { Suspense } from "react";
import { ProjectEngineeringIntelligenceView } from "@/components/engineering/project-engineering-intelligence";

export default function ProjectIntelligenceEngineeringPage() {
  return (
    <section data-testid="project-intelligence-engineering-ready">
      <p className="text-sm font-medium text-cyan-700">Project Intelligence</p>
      <h2 className="mt-1 text-2xl font-semibold text-slate-900">Engineering Intelligence</h2>
      <p className="mt-2 max-w-3xl text-slate-600">
        Management view of documents, technical queries, meetings, findings, and engineering actions.
        This is not a second document register. Drill down to source records.
      </p>
      <div className="mt-8">
        <Suspense fallback={<p className="text-sm text-slate-600">Loading engineering intelligence…</p>}>
          <ProjectEngineeringIntelligenceView />
        </Suspense>
      </div>
    </section>
  );
}
