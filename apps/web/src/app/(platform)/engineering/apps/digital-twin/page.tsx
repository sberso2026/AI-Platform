/**
 * Phase 12G — Digital Twin simulation governance overview.
 */

const SIMULATION_SURFACES = [
  { id: "methods", name: "Methods", summary: "Governed simulation method registry (fixture qualification only)." },
  { id: "providers", name: "Providers", summary: "Provider registry — deterministic_fixture certified path only." },
  { id: "definitions", name: "Definitions", summary: "Versioned simulation definitions with simulation-ready context." },
  { id: "scenarios", name: "Scenarios", summary: "SIMULATED hypothetical scenarios — not forecasts; cannot overwrite observed." },
  { id: "input-sets", name: "Input Sets", summary: "Pinned representation + published state versions; immutable after run." },
  { id: "runs", name: "Runs", summary: "Governed orchestrator — fixture only; never publishes observed state." },
  { id: "results", name: "Results", summary: "Immutable SIMULATED results — success ≠ validation ≠ approval." },
  { id: "validation", name: "Validation", summary: "Technical validation distinct from engineering acceptance." },
  { id: "reviews", name: "Reviews", summary: "digital_twin.simulation_review — no automatic / AI self-approval." },
  { id: "simulated-states", name: "Simulated States", summary: "SIMULATED plane — separate from Observed / Derived / Operational." },
  { id: "comparisons", name: "Comparisons", summary: "Scenario differences only — not optimization." },
] as const;

const UNAVAILABLE = [
  { id: "native-solver", name: "Native FEA/CFD/physics solver", reason: "UNAVAILABLE — nativeEngineeringSolverImplemented=false." },
  { id: "optimization", name: "Simulation optimization", reason: "UNAVAILABLE — simulationOptimizationImplemented=false." },
  { id: "prediction", name: "Predictive Twin / PoF / RUL", reason: "UNAVAILABLE — predictiveTwinImplemented=false." },
  { id: "shm", name: "SHM runtime / calibration", reason: "UNAVAILABLE — shmRuntimeImplemented=false." },
  { id: "three-d-viewer", name: "3D / BIM viewer", reason: "UNAVAILABLE — threeDViewerImplemented=false." },
  { id: "historian", name: "Telemetry historian", reason: "UNAVAILABLE — telemetryHistorianImplemented=false." },
  { id: "actuation", name: "Physical actuation", reason: "UNAVAILABLE — physicalActuationEnabled=false." },
] as const;

export default function DigitalTwinSimulationPage() {
  return (
    <section data-testid="digital-twin-simulation-ready" aria-labelledby="dt-simulation-title">
      <h1 id="dt-simulation-title" className="text-2xl font-semibold text-slate-900">
        Digital Twin — Simulation Governance
      </h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Version <span data-testid="digital-twin-simulation-version">0.7.0-simulation</span>.
        Surfaces below are labeled <strong>SIMULATED</strong> and must not be visually merged with
        observed Twin state. Certified provider:{" "}
        <span data-testid="digital-twin-fixture-provider-flag">deterministic_fixture</span>
        {" "}(
        <span data-testid="digital-twin-native-solver-flag">nativeEngineeringSolverImplemented=false</span>
        ).
      </p>

      <h2 className="mt-8 text-lg font-semibold text-slate-900">SIMULATED surfaces</h2>
      <ul
        className="mt-3 grid gap-3 sm:grid-cols-2"
        data-testid="digital-twin-simulation-surfaces"
        aria-label="Digital Twin SIMULATED surfaces"
      >
        {SIMULATION_SURFACES.map((surface) => (
          <li
            key={surface.id}
            data-testid={`digital-twin-surface-${surface.id}`}
            className="rounded-lg border border-amber-200 bg-amber-50/40 p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">SIMULATED</p>
            <h3 className="font-medium text-slate-900">{surface.name}</h3>
            <p className="mt-1 text-sm text-slate-600">{surface.summary}</p>
          </li>
        ))}
      </ul>

      <section
        className="mt-8 rounded-lg border border-slate-200 p-4"
        data-testid="digital-twin-observed-vs-simulated"
        aria-label="Observed versus simulated firewall"
      >
        <h2 className="text-lg font-semibold text-slate-900">Observed ≠ Simulated</h2>
        <p className="mt-1 text-sm text-slate-600" data-testid="digital-twin-firewall-message">
          Simulated Twin State never silently replaces Observed, Derived, or Operational state.
          Successful execution is not validation and not engineering acceptance.
        </p>
      </section>

      <h2 className="mt-8 text-lg font-semibold text-slate-900">Unavailable capabilities</h2>
      <ul
        className="mt-3 space-y-2"
        data-testid="digital-twin-unavailable-capabilities"
        aria-label="Capabilities unavailable in Phase 12G"
      >
        {UNAVAILABLE.map((item) => (
          <li
            key={item.id}
            data-testid={`digital-twin-unavailable-${item.id}`}
            className="text-sm text-slate-600"
          >
            {item.name} — {item.reason}
          </li>
        ))}
      </ul>
    </section>
  );
}
