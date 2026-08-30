import { Suspense } from "react";
import Link from "next/link";
import { ProjectReportingIntelligenceView } from "@/components/engineering/project-reporting-intelligence";

export default function ReportingIntelligencePage() {
  return (
    <section data-testid="reporting-intelligence-ready">
      <div data-testid="project-intelligence-reports-ready">
        <p className="text-sm font-medium text-cyan-700">Reporting Intelligence</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">Reports</h2>
        <p className="mt-2 max-w-3xl text-slate-600">
          Project reports are assembled from canonical Project Intelligence and governed external
          context. They are advisory snapshots, not a second project truth model. Live workspace
          aggregation remains available on the executive dashboard.
        </p>

        <div className="mt-8">
          <Suspense fallback={<p className="text-sm text-slate-600">Loading project reports…</p>}>
            <ProjectReportingIntelligenceView />
          </Suspense>
        </div>

        <div className="mt-8 rounded-lg border border-cyan-200 bg-cyan-50/40 p-5">
          <h3 className="font-semibold text-slate-900">Executive Intelligence Dashboard</h3>
          <p className="mt-2 text-sm text-slate-600">
            Configurable live widgets with drill-down to originating features. AI executive
            summaries use Platform AI Runtime and require human review before publish.
          </p>
          <Link
            className="mt-4 inline-block rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
            href="/engineering/apps/project-intelligence/reports/executive"
            data-testid="executive-dashboard-open-link"
          >
            Open executive dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}
