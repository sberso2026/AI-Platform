import { Suspense } from "react";
import { ProjectScheduleIntelligenceView } from "@/components/engineering/project-schedule-intelligence";

export default function ProjectIntelligenceSchedulePage() {
  return (
    <section data-testid="project-intelligence-schedule-ready">
      <p className="text-sm font-medium text-cyan-700">Project Intelligence</p>
      <h2 className="mt-1 text-2xl font-semibold text-slate-900">Schedule Intelligence</h2>
      <p className="mt-2 max-w-3xl text-slate-600">
        Read-only interpretation of published Project Controls schedule assessments. This is not a
        scheduling editor and does not calculate critical path or float.
      </p>
      <div className="mt-8">
        <Suspense fallback={<p className="text-sm text-slate-600">Loading schedule intelligence…</p>}>
          <ProjectScheduleIntelligenceView />
        </Suspense>
      </div>
    </section>
  );
}
