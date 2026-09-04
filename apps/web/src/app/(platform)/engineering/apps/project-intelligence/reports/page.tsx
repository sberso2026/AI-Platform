import { Suspense } from "react";
import Link from "next/link";
import { ProjectReportingIntelligenceView } from "@/components/engineering/project-reporting-intelligence";

export default function ReportingIntelligencePage() {
  return (
    <section data-testid="reporting-intelligence-ready">
      <div data-testid="project-intelligence-reports-ready">
        <p className="text-[0.8125rem] font-semibold tracking-[0.14em] text-[color:var(--eos-accent)]">Project Intelligence</p>
        <h2 className="mt-1 text-[2.125rem] font-semibold text-[color:var(--eos-text-primary)]">Reports</h2>
        <p className="mt-2 max-w-3xl text-[1rem] text-[color:var(--eos-text-secondary)]">
          Executive intelligence: project health, schedule and cost signals, risk exposure, TQ and
          decision backlogs, findings, and recent change. Counts include interpretation. Trends are
          shown only when published evidence supports them.
        </p>

        <div className="mt-8">
          <Suspense fallback={<p className="text-[1rem] text-[color:var(--eos-text-secondary)]">Loading project reports…</p>}>
            <ProjectReportingIntelligenceView />
          </Suspense>
        </div>

        <div className="eos-command-panel mt-8" data-accent="ai">
          <header className="eos-command-rail">
            <h3 className="text-[1.0625rem] font-semibold">Executive intelligence dashboard</h3>
          </header>
          <div className="p-5 sm:p-6">
            <p className="text-[1rem] text-[color:var(--eos-text-secondary)]">
              Live widgets with drill-down to originating features. Advisory summaries require human
              review before publish. This does not replace Primavera, ERP, or document systems.
            </p>
            <Link
              className="mt-4 inline-flex h-11 items-center rounded-md bg-[color:var(--eos-accent)] px-4 text-[0.9375rem] font-semibold text-[color:var(--eos-bg-primary)]"
              href="/engineering/apps/project-intelligence/reports/executive"
              data-testid="executive-dashboard-open-link"
            >
              Open executive dashboard
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
