import { GovernancePanel } from "@/components/engineering/governance-panel";

export default function AssetIntelligenceReleasePage() {
  return (
    <section data-testid="asset-intelligence-release-ready" aria-labelledby="ai-release-title">
      <h1 id="ai-release-title" className="text-2xl font-semibold text-slate-900">
        Administration / Release
      </h1>
      <GovernancePanel
        moduleName="Asset Intelligence"
        version="1.0.0"
        knownLimitations={[
          "Predictive execution, probability of failure, and remaining life are not certified.",
          "Canonical asset identity remains in Engineering OS.",
        ]}
        technicalContent={
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="font-medium">GA version</dt>
              <dd data-testid="asset-intelligence-ga-version">
                <span data-testid="asset-intelligence-release-ga-version">1.0.0 — asset-intelligence-v1-ready</span>
              </dd>
            </div>
            <div>
              <dt className="font-medium">Release tag</dt>
              <dd data-testid="asset-intelligence-release-tag">asset-intelligence-v1.0.0</dd>
            </div>
            <div>
              <dt className="font-medium">Registries</dt>
              <dd data-testid="asset-intelligence-release-registries">
                Capability, service and event contract registries frozen at 1.0.0
              </dd>
            </div>
            <div>
              <dt className="font-medium">Manifest</dt>
              <dd data-testid="asset-intelligence-release-manifest">
                Module manifest generated from version.ts and drift-checked
              </dd>
            </div>
            <div>
              <dt className="font-medium">Migration lineage</dt>
              <dd data-testid="asset-intelligence-release-migrations">
                batch_55 → 55b → 56 → 57 → 58 → 59, additive only
              </dd>
            </div>
            <div>
              <dt className="font-medium">Unavailable in V1.0</dt>
              <dd>
                <p>UNAVAILABLE — not production functions of V1.0</p>
                <ul
                  className="mt-1 list-disc space-y-1 pl-5"
                  data-testid="asset-intelligence-unavailable-capabilities"
                  aria-label="Capabilities unavailable in V1.0"
                >
                  <li data-testid="asset-intelligence-unavailable-predictive-execution">
                    Predictive execution — UNAVAILABLE
                  </li>
                  <li>Probability of Failure (PoF) — UNAVAILABLE</li>
                  <li>Remaining Useful Life (RUL) — UNAVAILABLE</li>
                </ul>
              </dd>
            </div>
            <div>
              <dt className="font-medium">V1 surfaces</dt>
              <dd>
                <ul data-testid="asset-intelligence-v1-surfaces" aria-label="Asset Intelligence V1 surfaces">
                  <li data-testid="asset-intelligence-surface-condition">Condition — GA</li>
                  <li data-testid="asset-intelligence-surface-criticality">Criticality — GA</li>
                  <li data-testid="asset-intelligence-surface-reliability">Reliability — GA advisory</li>
                  <li data-testid="asset-intelligence-surface-failure">Failure — GA</li>
                  <li data-testid="asset-intelligence-surface-trend-degradation">Trend and degradation — GA advisory</li>
                  <li data-testid="asset-intelligence-surface-lifecycle">Lifecycle — GA</li>
                  <li data-testid="asset-intelligence-surface-risk">Risk signals — GA advisory</li>
                  <li data-testid="asset-intelligence-surface-maintenance">Maintenance recommendations — GA advisory</li>
                  <li data-testid="asset-intelligence-surface-priority">Priority context — GA advisory</li>
                  <li data-testid="asset-intelligence-surface-fusion">Multi-source fusion — GA</li>
                  <li data-testid="asset-intelligence-surface-predictive-governance">Predictive governance — GA</li>
                </ul>
              </dd>
            </div>
            <div>
              <dt className="font-medium">Ownership</dt>
              <dd data-testid="asset-intelligence-release-ownership">
                No canonical asset identity, canonical Risk, CMMS work order or Digital Twin ownership
              </dd>
            </div>
            <div>
              <dt className="font-medium">Persistence</dt>
              <dd data-testid="asset-intelligence-release-persistence">
                Hosted Supabase only — in-memory repositories refused in production
              </dd>
            </div>
            <div>
              <dt className="font-medium">Backup and restore</dt>
              <dd data-testid="asset-intelligence-release-backup">
                Certified against the V1 recovery runbook and hosted table verification
              </dd>
            </div>
          </dl>
        }
      />
    </section>
  );
}
