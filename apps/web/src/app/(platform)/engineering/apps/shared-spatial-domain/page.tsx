/**
 * Thin readiness marker for Phase 12M Shared Spatial Domain Core.
 * Not a map product.
 */
export default function SharedSpatialDomainCorePage() {
  return (
    <main className="p-8">
      <h1>Engineering Shared Spatial Domain</h1>
      <p data-testid="shared-spatial-domain-spatial-core-ready">
        Spatial core ready (0.2.0-spatial-core) — reference registry only; no map
        product.
      </p>
    </main>
  );
}
