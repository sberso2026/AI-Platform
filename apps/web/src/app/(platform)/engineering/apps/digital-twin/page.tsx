/**
 * Phase 12N — Digital Twin V1.0 Production GA overview.
 */

const V1_SURFACES = [
  { id: "identity", name: "Twin identity / profile", maturity: "GA" },
  { id: "state", name: "Twin state", maturity: "GA" },
  { id: "snapshot", name: "Snapshot / history", maturity: "GA" },
  { id: "ingestion", name: "State ingestion", maturity: "GA" },
  { id: "telemetry", name: "Telemetry binding", maturity: "GA" },
  { id: "representation", name: "Representation & navigation", maturity: "GA" },
  { id: "digital-thread", name: "Digital Thread", maturity: "GA" },
  { id: "simulation", name: "Simulation governance", maturity: "GA advisory" },
  { id: "assurance", name: "Simulation assurance", maturity: "GA advisory" },
  { id: "solver", name: "Engineering simulation integration", maturity: "GA" },
  { id: "capabilities", name: "Certified solver capabilities", maturity: "GA" },
  { id: "spatial", name: "Spatial reference binding", maturity: "GA" },
] as const;

const UNAVAILABLE = [
  { id: "actuation", name: "Physical actuation" },
  { id: "control", name: "Automatic control" },
  { id: "predictive", name: "Predictive twin / PoF / RUL" },
  { id: "native-solver", name: "Native engineering solver" },
  { id: "optimization", name: "Optimization" },
  { id: "shm", name: "SHM runtime" },
  { id: "gis", name: "GIS / spatial analytics" },
  { id: "modal", name: "Modal / buckling / thermal / nonlinear" },
] as const;

export default function DigitalTwinV1Page() {
  return (
    <>
      <section data-testid="digital-twin-ready" aria-labelledby="dt-overview-title">
        <div data-testid="digital-twin-v1-ready">
          <h1 id="dt-overview-title" className="text-2xl font-semibold text-slate-900">
            Digital Twin
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Version <span data-testid="digital-twin-ga-version">1.0.0</span> Production GA.
            Certified bounded surface from Phases 12A–12M. Spatial authority remains Shared Spatial
            Domain 0.2.0-spatial-core.
          </p>
          <ul
            className="mt-4 grid gap-2 sm:grid-cols-2"
            data-testid="digital-twin-v1-surfaces"
            aria-label="Digital Twin V1 surfaces"
          >
            {V1_SURFACES.map((surface) => (
              <li
                key={surface.id}
                data-testid={`digital-twin-surface-${surface.id}`}
                className="rounded-lg border border-slate-200 p-3 text-sm"
              >
                {surface.name} — {surface.maturity}
              </li>
            ))}
          </ul>
          <ul
            className="mt-6 space-y-1 text-sm text-slate-600"
            data-testid="digital-twin-unavailable-capabilities"
            aria-label="Capabilities unavailable in V1.0"
          >
            {UNAVAILABLE.map((item) => (
              <li key={item.id} data-testid={`digital-twin-unavailable-${item.id}`}>
                {item.name} — UNAVAILABLE
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-slate-600" data-testid="digital-twin-solver-boundary">
            Certified solver: CalculiX linear_elastic_static (ccx 2.21).{" "}
            <span data-testid="digital-twin-silent-fallback-flag">silentFixtureFallbackEnabled=false</span>
          </p>
        </div>
      </section>
      <section data-testid="digital-twin-entitlement-denied" hidden>
        <p data-testid="digital-twin-entitlement-denied-message">
          Access denied — an Engineering OS seat and workspace are required.
        </p>
      </section>
    </>
  );
}
