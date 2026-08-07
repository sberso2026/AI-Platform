/**
 * Phase 9J overview — module release closure, registries and manifest.
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
                        <h1
                          id="ii-overview-title"
                          className="text-2xl font-semibold text-slate-900"
                        >
                          Inspection Intelligence
                        </h1>
                        <p className="mt-2 max-w-2xl text-slate-600">
                          Module release closure (1.0.0-ii-release): public contracts, capability and
                          service registries, hardened pack registry, machine-readable manifest, and
                          operational health metrics. No Asset Intelligence or Digital Twin
                          ownership.
                        </p>
                        <ul className="mt-6 list-disc space-y-1 pl-5 text-sm text-slate-700">
                          <li>Versioned public APIs, commands, queries, events, reporting, AI, search</li>
                          <li>Capability / Service / Pack registries with upgrade and rollback policy</li>
                          <li>Governed publication with audit; consumer contracts are consume-only</li>
                          <li>AI Vision remains advisory and human-validated</li>
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
    </section>
  );
}
