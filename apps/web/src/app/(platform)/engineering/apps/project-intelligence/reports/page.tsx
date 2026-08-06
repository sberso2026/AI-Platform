import Link from "next/link";

export default function ReportingIntelligencePage() {
  return (
    <section data-testid="reporting-intelligence-ready">
      <div data-testid="project-intelligence-reports-ready">
        <p className="text-sm font-medium text-cyan-700">Reporting Intelligence</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">Reports</h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Module reports run through shared Engineering reporting and audit services. Project
          Intelligence does not own a private reporting stack. Live executive aggregation
          consolidates Document, Meeting, Findings, and Engineering Core without duplicate storage.
        </p>

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

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {[
            ["Workspace activity", "Recent processing and review outcomes for this workspace."],
            ["Evidence coverage", "Grounded answers and abstentions across documents and meetings."],
            ["Review backlog", "Open finding and minutes review items requiring a seat."],
            ["Health summary", "Module health and provider readiness (Teams live remains deferred)."],
          ].map(([title, body]) => (
            <article key={title} className="rounded-lg border border-slate-200 p-5">
              <h3 className="font-medium text-slate-900">{title}</h3>
              <p className="mt-2 text-sm text-slate-600">{body}</p>
            </article>
          ))}
        </div>
        <div className="mt-6">
          <Link
            className="text-sm text-cyan-700 hover:underline"
            href="/engineering/apps/project-intelligence/health"
          >
            Open module health
          </Link>
        </div>
      </div>
    </section>
  );
}
