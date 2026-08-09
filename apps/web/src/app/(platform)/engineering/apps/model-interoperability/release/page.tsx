/**
 * Module release status for Engineering Model Interoperability V1.0 GA.
 */
export default function EngineeringModelInteropReleasePage() {
  return (
    <main className="p-8">
      <h1>Module Release Status</h1>
      <dl>
        <dt>GA version</dt>
        <dd data-testid="emi-release-ga-version">
          1.0.0 — engineering-model-interoperability-v1-ready
        </dd>
        <dt>Release tag</dt>
        <dd data-testid="emi-release-tag">
          engineering-model-interoperability-v1.0.0
        </dd>
        <dt>Previous version</dt>
        <dd>0.4.0-etabs-federation</dd>
        <dt>Phase 13D</dt>
        <dd data-testid="emi-release-phase13d-status">
          blocked_external_dependency
        </dd>
      </dl>
      <section aria-label="Unavailable in V1.0">
        <h2>UNAVAILABLE — not production functions of V1.0</h2>
        <ul>
          <li>SPACE GASS live API / live execution</li>
          <li>ETABS live COM / real execution</li>
          <li>SAP2000 / SAFE / CSiBridge</li>
          <li>Analysis-model generation / source-model mutation</li>
        </ul>
      </section>
    </main>
  );
}
