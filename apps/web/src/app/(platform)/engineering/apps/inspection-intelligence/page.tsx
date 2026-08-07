/**
 * Phase 9K overview — Inspection Intelligence V1.0 GA.
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
                    <div data-testid="inspection-intelligence-ai-vision-ready">
                      <div data-testid="inspection-intelligence-release-ready">
                        <div data-testid="inspection-intelligence-v1-ready">
                          <h1
                            id="ii-overview-title"
                            className="text-2xl font-semibold text-slate-900"
                          >
                            Inspection Intelligence
                          </h1>
                          <p className="mt-2 max-w-2xl text-slate-600">
                            Version 1.0.0 Production GA: frozen public contracts, registries,
                            manifest, operations and commercial packaging. AI Vision remains
                            advisory. No Asset Intelligence or Digital Twin ownership.
                          </p>
                          <ul className="mt-6 list-disc space-y-1 pl-5 text-sm text-slate-700">
                            <li>Public contracts v1.0.0 frozen for cross-module consumers</li>
                            <li>Drift detection keeps manifest and registries consistent</li>
                            <li>Provider/model/policy pins fail closed</li>
                            <li>Server-authoritative entitlements and revocation</li>
                          </ul>
                        </div>
                      </div>
                    </div>
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
