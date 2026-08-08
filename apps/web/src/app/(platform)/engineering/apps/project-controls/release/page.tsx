export default function ProjectControlsReleasePage() {
  return (
    <section data-testid="project-controls-release-ready" aria-labelledby="pc-release-title">
      <h1 id="pc-release-title" className="text-xl font-semibold text-slate-900">
        Module Release Status
      </h1>
      <p className="mt-2 text-slate-600">
        Publication readiness, registry health and governance locks for Project Controls 1.0.0.
      </p>
      <dl className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
        <div>
          <dt className="font-medium">GA version</dt>
          <dd data-testid="project-controls-release-ga-version">
            1.0.0 — project-controls-v1-ready
          </dd>
        </div>
        <div>
          <dt className="font-medium">Release tag</dt>
          <dd data-testid="project-controls-release-tag">project-controls-v1.0.0</dd>
        </div>
        <div>
          <dt className="font-medium">Registries</dt>
          <dd data-testid="project-controls-release-registries">
            Capability, service and event contract registries frozen at 1.0.0
          </dd>
        </div>
        <div>
          <dt className="font-medium">Migration lineage</dt>
          <dd data-testid="project-controls-release-migrations">
            batch_61 → batch_73, additive only — no batch_74
          </dd>
        </div>
        <div>
          <dt className="font-medium">CPM / EV</dt>
          <dd data-testid="project-controls-release-cpm-ev">
            UNAVAILABLE — not production functions of V1.0
          </dd>
        </div>
        <div>
          <dt className="font-medium">Ownership</dt>
          <dd data-testid="project-controls-release-ownership">
            No canonical project identity, financial ledger or autonomous decision ownership
          </dd>
        </div>
      </dl>
    </section>
  );
}
