/**
 * Phase 9D overview — engineering domain completion markers.
 */
export default function InspectionIntelligenceOverviewPage() {
  return (
    <section
      data-testid="inspection-intelligence-discovery-ready"
      aria-labelledby="ii-overview-title"
    >
      <div data-testid="inspection-intelligence-vertical-slice-ready">
        <div data-testid="inspection-intelligence-enterprise-foundation-ready">
          <div data-testid="inspection-intelligence-engineering-domain-ready">
            <h1 id="ii-overview-title" className="text-2xl font-semibold text-slate-900">
              Inspection Intelligence
            </h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              Engineering domain completion (0.4.0-engineering-domain). Defects, recommendations,
              corrective actions, assessments, verification, close-out, compliance, KPIs, and typed
              risk adapters are in place. Mobile, offline, and AI Vision remain deferred to Phase
              9E+.
            </p>
            <ul className="mt-6 list-disc space-y-1 pl-5 text-sm text-slate-700">
              <li>Engineering Domain SDK shared across Engineering OS modules</li>
              <li>Close-out requires verified corrective actions</li>
              <li>AI assessments require mandatory human approval</li>
              <li>Risk Register integration via typed adapters only</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
