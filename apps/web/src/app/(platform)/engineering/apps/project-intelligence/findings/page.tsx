import Link from "next/link";

export default function FindingsIntelligencePage() {
  return (
    <section data-testid="findings-intelligence-ready">
      <div data-testid="project-intelligence-findings-ready">
        <p className="text-sm font-medium text-cyan-700">Findings Intelligence</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">Findings</h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Consolidated findings from Document Intelligence and Meeting Intelligence. Typed candidates
          are reviewed here. Findings never mutate Engineering Core without human approval through
          authorised adapters. Microsoft Teams live remains conditionally deferred and is out of
          Findings scope.
        </p>

        <nav className="mt-8 grid gap-3 text-sm text-slate-700 sm:grid-cols-2" aria-label="Findings Intelligence surfaces">
          {[
            ["Overview", "Intake and disposition summary"],
            ["Findings register", "Accepted and open findings"],
            ["Candidate intake", "Document, meeting, and manual sources"],
            ["Review queue", "Human review actions"],
            ["Evidence and citations", "Immutable citation lineage"],
            ["Related and duplicates", "Human merge only"],
            ["Conflicts", "Visible until human resolution"],
            ["Patterns", "Evidence-grounded pattern intelligence"],
            ["Conversion proposals", "Core conversion after acceptance"],
            ["Assignments", "Reviewer assignment history"],
            ["Health", "Feature readiness"],
            ["Settings", "Taxonomy and policy"],
          ].map(([title, detail]) => (
            <div key={title} className="rounded-md border border-slate-200 px-4 py-3">
              <p className="font-medium text-slate-900">{title}</p>
              <p className="mt-1 text-slate-600">{detail}</p>
            </div>
          ))}
        </nav>

        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <Link
            className="text-cyan-700 hover:underline"
            href="/engineering/apps/project-intelligence/documents/review"
          >
            Document review queue
          </Link>
          <Link
            className="text-cyan-700 hover:underline"
            href="/engineering/apps/project-intelligence/meetings"
            data-testid="findings-meeting-intelligence-link"
          >
            Meeting Intelligence
          </Link>
          <Link
            className="text-cyan-700 hover:underline"
            href="/engineering/apps/project-intelligence/reports"
          >
            Reporting handoff
          </Link>
        </div>
      </div>
    </section>
  );
}
