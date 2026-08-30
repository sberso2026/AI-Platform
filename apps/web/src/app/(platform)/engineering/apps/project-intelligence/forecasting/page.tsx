import { Suspense } from "react";
import { ProjectForecastIntelligenceView } from "@/components/engineering/project-forecast-intelligence";

export default function ProjectIntelligenceForecastingPage() {
  return (
    <section data-testid="project-intelligence-forecasting-ready">
      <p className="text-sm font-medium text-cyan-700">Project Intelligence</p>
      <h2 className="mt-1 text-2xl font-semibold text-slate-900">Forecasting</h2>
      <p className="mt-2 max-w-3xl text-slate-600">
        Read-only interpretation of published Project Controls advisory forecast assessments.
        Project Intelligence does not calculate forecasts, predict completion dates, or produce
        monetary forecast amounts.
      </p>
      <div className="mt-8">
        <Suspense fallback={<p className="text-sm text-slate-600">Loading forecast intelligence…</p>}>
          <ProjectForecastIntelligenceView />
        </Suspense>
      </div>
    </section>
  );
}
