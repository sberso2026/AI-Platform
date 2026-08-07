export default function InspectionReleasePage() {
  return (
    <section data-testid="inspection-release-ready" aria-labelledby="ii-release-title">
      <h1 id="ii-release-title" className="text-xl font-semibold text-slate-900">
        Module Release Status
      </h1>
      <p className="mt-2 text-slate-600">
        Publication readiness, registry health, and operational metrics for Inspection Intelligence
        1.0.0-ii-release. Provider-unavailable and sync states are shown as text, not colour alone.
      </p>
      <dl className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
        <div>
          <dt className="font-medium">Publication</dt>
          <dd data-testid="inspection-release-publication">
            Authority-governed path — capture → sync → condition → validated vision → report
          </dd>
        </div>
        <div>
          <dt className="font-medium">Registries</dt>
          <dd data-testid="inspection-release-registries">
            Capability, Service, and Pack registries published
          </dd>
        </div>
        <div>
          <dt className="font-medium">Manifest</dt>
          <dd data-testid="inspection-release-manifest">
            Machine-readable module manifest generated and verified
          </dd>
        </div>
        <div>
          <dt className="font-medium">Provider health</dt>
          <dd data-testid="inspection-release-provider">
            Vision / predictive: available or fail-closed unavailable
          </dd>
        </div>
        <div>
          <dt className="font-medium">Sync status</dt>
          <dd data-testid="inspection-release-sync">Queue depth and lag as numeric text</dd>
        </div>
        <div>
          <dt className="font-medium">Ownership</dt>
          <dd data-testid="inspection-release-no-twin">
            No Asset Intelligence or Digital Twin ownership
          </dd>
        </div>
        <div>
          <dt className="font-medium">GA version</dt>
          <dd data-testid="inspection-release-ga-version">1.0.0 — inspection-intelligence-v1-ready</dd>
        </div>
        <div>
          <dt className="font-medium">Provider / model / policy</dt>
          <dd data-testid="inspection-release-pins">
            vision_provider_approved_v1 / ii_vision_detector@1.0.0 / vision_policy_v1
          </dd>
        </div>
      </dl>
    </section>
  );
}
