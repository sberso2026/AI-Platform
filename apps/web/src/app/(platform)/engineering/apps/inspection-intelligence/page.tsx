/**
 * Phase 9H overview — condition rating, predictive signals, structural pack.
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
            <div data-testid="inspection-intelligence-operational-workflows-ready">
              <div data-testid="inspection-intelligence-mobile-ready">
                <div data-testid="inspection-intelligence-offline-sync-ready">
                  <div data-testid="inspection-intelligence-condition-predictive-ready">
                    <h1 id="ii-overview-title" className="text-2xl font-semibold text-slate-900">
                      Inspection Intelligence
                    </h1>
                    <p className="mt-2 max-w-2xl text-slate-600">
                      Condition rating, predictive signals, and structural pack expansion
                      (0.8.0-condition-predictive). Advisory signals fail closed; AI Vision remains
                      deferred. Not an Asset Intelligence or Digital Twin authority.
                    </p>
                    <ul className="mt-6 list-disc space-y-1 pl-5 text-sm text-slate-700">
                      <li>Governed condition ratings with override history and scheme versioning</li>
                      <li>Aggregation with uncertainty, missing evidence, and abstention</li>
                      <li>Deterministic predictive signals — advisory only, no RUL claim</li>
                      <li>Structural condition pack with offline and mobile compatibility</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
