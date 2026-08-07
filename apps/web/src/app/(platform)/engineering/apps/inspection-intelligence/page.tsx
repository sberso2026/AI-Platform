/**
 * Phase 9I overview — AI Vision evidence analysis (advisory, human-validated).
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
                      <h1 id="ii-overview-title" className="text-2xl font-semibold text-slate-900">
                        Inspection Intelligence
                      </h1>
                      <p className="mt-2 max-w-2xl text-slate-600">
                        AI Vision evidence analysis (0.9.0-ai-vision): advisory overlays, immutable
                        originals, provider governance, and human validation. No Asset Intelligence
                        or Digital Twin ownership.
                      </p>
                      <ul className="mt-6 list-disc space-y-1 pl-5 text-sm text-slate-700">
                        <li>Originals immutable; derivatives hashed and lineage-tracked</li>
                        <li>Tenant allowlist providers with fail-closed outage/policy denial</li>
                        <li>Human accept/reject/adjust with reason before condition linkage</li>
                        <li>Pack adapters for generic, coatings, and structural_condition</li>
                      </ul>
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
