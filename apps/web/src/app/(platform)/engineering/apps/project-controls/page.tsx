const GA_SURFACES = [
  { id: "progress", name: "Progress", maturity: "GA", summary: "Descriptive progress intelligence. Not earned value." },
  { id: "schedule", name: "Schedule", maturity: "GA", summary: "Descriptive schedule intelligence. Not CPM." },
  { id: "change", name: "Change", maturity: "GA", summary: "Descriptive change intelligence. Not contractual authority." },
  { id: "cost", name: "Cost", maturity: "GA", summary: "Descriptive cost intelligence. Not a budget ledger." },
  { id: "productivity", name: "Productivity", maturity: "GA", summary: "Descriptive productivity intelligence." },
  { id: "forecast", name: "Forecast", maturity: "GA advisory", summary: "Advisory trajectory from composed contributors." },
  { id: "decision", name: "Decision support", maturity: "GA advisory", summary: "Options and recommendations. Human owns decisions." },
  { id: "scenario", name: "Scenario", maturity: "GA advisory", summary: "Exploratory comparisons. No auto-execution." },
  { id: "risk-opportunity", name: "Risk / opportunity", maturity: "GA advisory", summary: "Advisory signals. No register mutation." },
  { id: "assurance", name: "Assurance", maturity: "GA advisory", summary: "Advisory posture. Not verification authority." },
  { id: "explainability", name: "Explainability", maturity: "GA advisory", summary: "Public summaries with traces." },
  { id: "organizational-learning", name: "Organizational learning", maturity: "GA advisory", summary: "Advisory references. No knowledge mutation." },
  { id: "profile", name: "Project profile", maturity: "GA", summary: "Composed Project Context Engine output." },
] as const;

const UNAVAILABLE = [
  { id: "native-cpm", name: "Native CPM / critical path", reason: "Schedule intelligence is descriptive only." },
  { id: "earned-value", name: "Earned value (EV/CPI/SPI)", reason: "Progress intelligence is not earned value." },
  { id: "financial-posting", name: "Financial posting / budget ledger", reason: "Project Controls posts nothing to a ledger." },
  { id: "schedule-execution", name: "Schedule execution", reason: "Intelligence never executes schedule changes." },
  { id: "resource-leveling", name: "Resource leveling", reason: "Out of scope for V1.0." },
  { id: "autonomous-decisions", name: "Autonomous project management", reason: "Humans own project decisions." },
] as const;

export default function ProjectControlsOverviewPage() {
  return (
    <section data-testid="project-controls-ready" aria-labelledby="pc-overview-title">
      <div data-testid="project-controls-v1-ready">
        <h1 id="pc-overview-title" className="text-2xl font-semibold text-slate-900">
          Project Controls
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Version <span data-testid="project-controls-ga-version">1.0.0</span> Production GA:
          frozen public contracts, capability and service registries, generated module manifest,
          operations runbooks and commercial packaging. Advisory surfaces support human decisions;
          project identity stays in the Shared Project Domain.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">V1 surfaces</h2>
        <ul
          className="mt-3 grid gap-3 sm:grid-cols-2"
          data-testid="project-controls-v1-surfaces"
          aria-label="Project Controls V1 surfaces"
        >
          {GA_SURFACES.map((surface) => (
            <li
              key={surface.id}
              className="rounded-md border border-slate-200 p-3"
              data-testid={`project-controls-surface-${surface.id}`}
            >
              <p className="text-sm font-medium text-slate-900">{surface.name}</p>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {surface.maturity}
              </p>
              <p className="mt-1 text-sm text-slate-600">{surface.summary}</p>
            </li>
          ))}
        </ul>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">
          Not production functions of V1.0
        </h2>
        <ul
          className="mt-3 space-y-2"
          data-testid="project-controls-unavailable-capabilities"
          aria-label="Capabilities unavailable in V1.0"
        >
          {UNAVAILABLE.map((item) => (
            <li
              key={item.id}
              className="rounded-md border border-slate-300 bg-slate-50 p-3"
              data-testid={`project-controls-unavailable-${item.id}`}
            >
              <p className="text-sm font-medium text-slate-900">
                {item.name} — <span className="uppercase">UNAVAILABLE</span>
              </p>
              <p className="mt-1 text-sm text-slate-600">{item.reason}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
