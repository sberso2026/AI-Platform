/**
 * Phase 10K overview — Asset Intelligence V1.0 GA.
 */

const GA_SURFACES = [
  {
    id: "condition",
    name: "Condition",
    maturity: "GA",
    summary: "Asset condition derived from Inspection Intelligence 1.0.0 evidence.",
  },
  {
    id: "criticality",
    name: "Criticality",
    maturity: "GA",
    summary: "Consequence dimension under governed review. Not a health factor.",
  },
  {
    id: "reliability",
    name: "Reliability",
    maturity: "GA advisory",
    summary: "Qualitative reliability intelligence. No quantitative reliability claim.",
  },
  {
    id: "failure",
    name: "Failure",
    maturity: "GA",
    summary: "Failure mode, mechanism and cause intelligence over a governed taxonomy.",
  },
  {
    id: "trend-degradation",
    name: "Trend and degradation",
    maturity: "GA advisory",
    summary: "Observed trend and governed degradation inside an analysis window. Not a forecast.",
  },
  {
    id: "lifecycle",
    name: "Lifecycle",
    maturity: "GA",
    summary: "Lifecycle intelligence. Canonical lifecycle stays in the Shared Asset Domain.",
  },
  {
    id: "risk",
    name: "Risk signals",
    maturity: "GA advisory",
    summary: "Advisory signals. Canonical Engineering Risk is never auto-mutated.",
  },
  {
    id: "maintenance",
    name: "Maintenance recommendations",
    maturity: "GA advisory",
    summary: "Recommendation only. Asset Intelligence creates no CMMS work order.",
  },
  {
    id: "priority",
    name: "Priority context",
    maturity: "GA advisory",
    summary: "Contextual priority. No numeric priority score is produced.",
  },
  {
    id: "fusion",
    name: "Multi-source fusion",
    maturity: "GA",
    summary: "Reconciliation across registered sources with full provenance.",
  },
  {
    id: "predictive-governance",
    name: "Predictive governance",
    maturity: "GA",
    summary:
      "Objective registry, method registry, eligibility and fixture-bounded qualification. Executes nothing.",
  },
] as const;

const UNAVAILABLE = [
  {
    id: "predictive-execution",
    name: "Predictive execution",
    reason: "No predictive method runs in V1.0. Governance only.",
  },
  {
    id: "probability-of-failure",
    name: "Probability of Failure (PoF)",
    reason: "Registered objective, permanently not-ready in V1.0.",
  },
  {
    id: "remaining-useful-life",
    name: "Remaining Useful Life (RUL)",
    reason: "Registered objective, permanently not-ready in V1.0.",
  },
  {
    id: "predictive-ml",
    name: "Machine-learning predictions",
    reason: "ML methods are registered and suspended from execution.",
  },
] as const;

export default function AssetIntelligenceOverviewPage() {
  return (
    <section data-testid="asset-intelligence-ready" aria-labelledby="ai-overview-title">
      <div data-testid="asset-intelligence-v1-ready">
        <h1 id="ai-overview-title" className="text-2xl font-semibold text-slate-900">
          Asset Intelligence
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Version <span data-testid="asset-intelligence-ga-version">1.0.0</span> Production GA:
          frozen public contracts, capability and service registries, generated module manifest,
          operations runbooks and commercial packaging. Advisory surfaces are decision support;
          engineering authority stays with the accountable engineer.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">V1 surfaces</h2>
        <ul
          className="mt-3 grid gap-3 sm:grid-cols-2"
          data-testid="asset-intelligence-v1-surfaces"
          aria-label="Asset Intelligence V1 surfaces"
        >
          {GA_SURFACES.map((surface) => (
            <li
              key={surface.id}
              className="rounded-md border border-slate-200 p-3"
              data-testid={`asset-intelligence-surface-${surface.id}`}
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
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          The following are UNAVAILABLE in Asset Intelligence 1.0.0. They are labelled here in text
          so the boundary is never inferred from styling alone.
        </p>
        <ul
          className="mt-3 space-y-2"
          data-testid="asset-intelligence-unavailable-capabilities"
          aria-label="Capabilities unavailable in V1.0"
        >
          {UNAVAILABLE.map((item) => (
            <li
              key={item.id}
              className="rounded-md border border-slate-300 bg-slate-50 p-3"
              data-testid={`asset-intelligence-unavailable-${item.id}`}
            >
              <p className="text-sm font-medium text-slate-900">
                {item.name} — <span className="uppercase">UNAVAILABLE</span>
              </p>
              <p className="mt-1 text-sm text-slate-600">{item.reason}</p>
            </li>
          ))}
        </ul>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">Health boundary</h2>
        <p
          className="mt-1 max-w-2xl text-sm text-slate-600"
          data-testid="asset-intelligence-health-boundary"
        >
          The Asset Health Index is composed from condition evidence only. Criticality, failure,
          degradation, lifecycle, risk, priority, fusion and predictive governance do not contribute
          to health in V1.0.
        </p>
      </div>
    </section>
  );
}
