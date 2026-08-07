export default function AssetIntelligenceReleasePage() {
  return (
    <section data-testid="asset-intelligence-release-ready" aria-labelledby="ai-release-title">
      <h1 id="ai-release-title" className="text-xl font-semibold text-slate-900">
        Module Release Status
      </h1>
      <p className="mt-2 text-slate-600">
        Publication readiness, registry health and governance locks for Asset Intelligence 1.0.0.
        Every state below is shown as text, never colour alone.
      </p>
      <dl className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
        <div>
          <dt className="font-medium">GA version</dt>
          <dd data-testid="asset-intelligence-release-ga-version">
            1.0.0 — asset-intelligence-v1-ready
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
          <dt className="font-medium">Predictive execution</dt>
          <dd data-testid="asset-intelligence-release-predictive">
            UNAVAILABLE — governance only, no method executes
          </dd>
        </div>
        <div>
          <dt className="font-medium">PoF / RUL</dt>
          <dd data-testid="asset-intelligence-release-pof-rul">
            UNAVAILABLE — not production functions of V1.0
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
    </section>
  );
}
