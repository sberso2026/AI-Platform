/**
 * Phase 9F overview — mobile product + Engineering Mobile SDK markers.
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
                <h1 id="ii-overview-title" className="text-2xl font-semibold text-slate-900">
                  Inspection Intelligence
                </h1>
                <p className="mt-2 max-w-2xl text-slate-600">
                  Mobile product (0.6.0-mobile-product). Tablet and phone field surfaces consume the
                  Engineering Mobile SDK. Full offline synchronization and AI Vision remain deferred.
                </p>
                <ul className="mt-6 list-disc space-y-1 pl-5 text-sm text-slate-700">
                  <li>Engineering Mobile SDK shared across Engineering OS modules</li>
                  <li>Camera capture → immutable Platform Files evidence</li>
                  <li>QR/barcode resolve through shared-domain references only</li>
                  <li>Annotations are derivatives; original evidence hash unchanged</li>
                  <li>Authenticated attestations are authoritative; signature marks are supplementary</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
