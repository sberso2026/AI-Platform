/**
 * Phase 9G overview — offline sync + mobile reporting markers.
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
                  <h1 id="ii-overview-title" className="text-2xl font-semibold text-slate-900">
                    Inspection Intelligence
                  </h1>
                  <p className="mt-2 max-w-2xl text-slate-600">
                    Offline synchronization (0.7.0-offline-sync). Durable encrypted offline store,
                    command and evidence queues, conflict reconciliation, and pack-aware mobile
                    reporting. AI Vision remains deferred.
                  </p>
                  <ul className="mt-6 list-disc space-y-1 pl-5 text-sm text-slate-700">
                    <li>Offline packages with checksum, expiry, and revocation</li>
                    <li>Idempotent command and evidence queues</li>
                    <li>Deterministic conflict policies (no last-write-wins for governed records)</li>
                    <li>Entitlement snapshots expire and deny after TTL</li>
                    <li>Browser limitation: cannot guarantee wipe of a permanently offline device</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
