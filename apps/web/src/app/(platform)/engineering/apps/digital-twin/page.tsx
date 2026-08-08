/**
 * Phase 12K — Digital Twin Digital Thread Intelligence overview.
 */

const SIMULATION_SURFACES = [
  { id: "methods", name: "Methods", summary: "Governed simulation method registry (fixture + CalculiX linear elastic static)." },
  { id: "providers", name: "Providers", summary: "Provider registry — deterministic_fixture (test-only) and CalculiX real adapter." },
  { id: "definitions", name: "Definitions", summary: "Versioned simulation definitions with simulation-ready context." },
  { id: "scenarios", name: "Scenarios", summary: "SIMULATED hypothetical scenarios — not forecasts; cannot overwrite observed." },
  { id: "input-sets", name: "Input Sets", summary: "Pinned representation + published state versions; immutable after run." },
  { id: "runs", name: "Runs", summary: "Governed orchestrator — fixture or CalculiX; never publishes observed state." },
  { id: "results", name: "Results", summary: "Immutable SIMULATED results — success ≠ validation ≠ approval." },
  { id: "validation", name: "Validation", summary: "Technical validation distinct from engineering acceptance." },
  { id: "reviews", name: "Reviews", summary: "digital_twin.simulation_review — no automatic / AI self-approval." },
  { id: "simulated-states", name: "Simulated States", summary: "SIMULATED plane — separate from Observed / Derived / Operational." },
  { id: "comparisons", name: "Comparisons", summary: "Scenario differences only — not optimization." },
] as const;

const ASSURANCE_SURFACES = [
  { id: "method-qualifications", name: "Method Qualifications", summary: "Layer 1 — registered ≠ qualified; enforced before real execution." },
  { id: "provider-qualifications", name: "Provider Qualifications", summary: "Layer 2 — method-specific; no auto-inherit across methods." },
  { id: "application-qualifications", name: "Application Qualifications", summary: "Layer 3 — context-bounded Method+Provider permission." },
  { id: "execution-qualifications", name: "Execution Qualifications", summary: "Layer 4 — no auto engineering approval from successful runs." },
  { id: "eligibility", name: "Eligibility", summary: "Fail-closed outcomes: eligible | conditionally_eligible | not_eligible | …" },
  { id: "packages", name: "Simulation Packages", summary: "TwinSimulationPackage + manifest — Platform Files refs only." },
  { id: "package-integrity", name: "Package Integrity", summary: "Hash mismatch detection for sealed manifests." },
  { id: "reproducibility", name: "Reproducibility", summary: "Bounded reproducibility assessment — not universal accuracy." },
] as const;

const SOLVER_SURFACES = [
  { id: "calculix-adapter", name: "CalculiX Adapter", summary: "First real solver — ccx linear elastic static; GPL open-source." },
  { id: "fixture-provider", name: "Fixture Provider", summary: "deterministic_fixture — test-only; never silent fallback for real solvers." },
  { id: "benchmarks", name: "Benchmarks", summary: "Axial bar δ=PL/(AE) positive + negative cases (units, BC, timeout, …)." },
  { id: "version-probe", name: "Version Probe", summary: "ccx -v health/version observations — fail-closed when unavailable." },
] as const;

const CAPABILITY_SURFACES = [
  {
    id: "calculix-linear-static",
    name: "CalculiX linear_elastic_static",
    status: "qualified" as const,
    summary: "Sole certified real execution capability — linked to Phase 12I method.",
  },
  {
    id: "calculix-modal",
    name: "CalculiX modal",
    status: "reserved" as const,
    summary: "Reserved / not_qualified — no execution path in 12J.",
  },
  {
    id: "calculix-buckling",
    name: "CalculiX buckling",
    status: "reserved" as const,
    summary: "Reserved / not_qualified — no execution path in 12J.",
  },
  {
    id: "calculix-thermal",
    name: "CalculiX thermal",
    status: "reserved" as const,
    summary: "Reserved / not_qualified — no execution path in 12J.",
  },
  {
    id: "calculix-contact",
    name: "CalculiX contact",
    status: "reserved" as const,
    summary: "Reserved / not_qualified — no execution path in 12J.",
  },
  {
    id: "compatibility-matrix",
    name: "Provider Compatibility Matrix",
    status: "query" as const,
    summary: "Method×Solver×Version×Application×ProjectType queries — never executes.",
  },
  {
    id: "capability-discovery",
    name: "Capability Discovery",
    status: "query" as const,
    summary: "Query-only discovery — execute-on-discover rejected.",
  },
] as const;

const THREAD_SURFACES = [
  {
    id: "compose",
    name: "Compose",
    summary: "DigitalThreadSnapshot — refs only; integrates Twin Thread/Snapshot/Timeline by reference.",
  },
  {
    id: "as-of",
    name: "As-of Traversal",
    summary: "Temporal traversal: as-of, historical, current-reference — no causal inference.",
  },
  {
    id: "provenance",
    name: "Provenance",
    summary: "Missing provenance → unknown (fail-closed). Never fabricate.",
  },
  {
    id: "integrity",
    name: "Integrity",
    summary: "Detect complete|partial|broken_reference|conflicting|stale|unknown — never auto-repair.",
  },
  {
    id: "change-set",
    name: "Change Set",
    summary: "Diff two thread snapshots — added/removed/superseded/version/relationship/…",
  },
  {
    id: "kg-reuse",
    name: "KG Reuse",
    summary: "Platform shared KG refs only — duplicateKnowledgeGraphDetected=false.",
  },
] as const;

const UNAVAILABLE = [
  { id: "native-solver", name: "Native FEA/CFD/physics solver", reason: "UNAVAILABLE — nativeEngineeringSolverImplemented=false." },
  { id: "ansys", name: "ANSYS adapter", reason: "RESERVED — unavailable stub." },
  { id: "abaqus", name: "Abaqus adapter", reason: "RESERVED — unavailable stub." },
  { id: "opensees", name: "OpenSees adapter", reason: "RESERVED — not first solver (heavier install)." },
  { id: "openfoam", name: "OpenFOAM adapter", reason: "RESERVED — CFD scope / heavier CI." },
  { id: "optimization", name: "Simulation optimization", reason: "UNAVAILABLE — simulationOptimizationImplemented=false." },
  { id: "prediction", name: "Predictive Twin / PoF / RUL", reason: "UNAVAILABLE — predictiveTwinImplemented=false." },
  { id: "shm", name: "SHM runtime / calibration", reason: "UNAVAILABLE — shmRuntimeImplemented=false." },
  { id: "three-d-viewer", name: "3D / BIM viewer", reason: "UNAVAILABLE — threeDViewerImplemented=false." },
  { id: "historian", name: "Telemetry historian", reason: "UNAVAILABLE — telemetryHistorianImplemented=false." },
  { id: "actuation", name: "Physical actuation", reason: "UNAVAILABLE — physicalActuationEnabled=false." },
] as const;

export default function DigitalTwinSolverCapabilitiesPage() {
  return (
    <>
      <section data-testid="digital-twin-simulation-ready" aria-labelledby="dt-simulation-title">
        <h1 id="dt-simulation-title" className="text-2xl font-semibold text-slate-900">
          Digital Twin — Simulation Governance
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Version <span data-testid="digital-twin-simulation-version">0.11.0-digital-thread</span>.
          Surfaces below are labeled <strong>SIMULATED</strong> and must not be visually merged with
          observed Twin state. Providers:{" "}
          <span data-testid="digital-twin-fixture-provider-flag">deterministic_fixture</span>
          {" "}(test-only) and{" "}
          <span data-testid="digital-twin-calculix-provider-flag">calculix</span>
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
            Real solver requests never silently fall back to fixture (
            <span data-testid="digital-twin-silent-fallback-flag">silentSolverFallbackAllowed=false</span>
            ).
          </p>
        </section>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">Unavailable / reserved capabilities</h2>
        <ul
          className="mt-3 space-y-2"
          data-testid="digital-twin-unavailable-capabilities"
          aria-label="Capabilities unavailable in Phase 12K"
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

      <section
        className="mt-10"
        data-testid="digital-twin-simulation-assurance-ready"
        aria-labelledby="dt-assurance-title"
      >
        <h2 id="dt-assurance-title" className="text-2xl font-semibold text-slate-900">
          Simulation Assurance
        </h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Version{" "}
          <span data-testid="digital-twin-assurance-version">0.11.0-digital-thread</span>.
          Four-layer qualification enforced before CalculiX execution (
          <span data-testid="digital-twin-four-layer-flag">FourLayerQualificationIntact=true</span>
          ).
        </p>
        <ul
          className="mt-3 grid gap-3 sm:grid-cols-2"
          data-testid="digital-twin-assurance-surfaces"
          aria-label="Digital Twin assurance surfaces"
        >
          {ASSURANCE_SURFACES.map((surface) => (
            <li
              key={surface.id}
              data-testid={`digital-twin-assurance-surface-${surface.id}`}
              className="rounded-lg border border-sky-200 bg-sky-50/40 p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-800">ASSURANCE</p>
              <h3 className="font-medium text-slate-900">{surface.name}</h3>
              <p className="mt-1 text-sm text-slate-600">{surface.summary}</p>
            </li>
          ))}
        </ul>
      </section>

      <section
        className="mt-10"
        data-testid="digital-twin-external-solver-ready"
        aria-labelledby="dt-solver-title"
      >
        <h2 id="dt-solver-title" className="text-2xl font-semibold text-slate-900">
          External Engineering Solver
        </h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Version <span data-testid="digital-twin-external-solver-version">0.11.0-digital-thread</span>.
          First real solver: CalculiX (
          <span data-testid="digital-twin-external-solver-flag">
            externalEngineeringSolverAdaptersImplemented=true
          </span>
          ). Fixture vs real providers are visually distinct.
        </p>
        <ul
          className="mt-3 grid gap-3 sm:grid-cols-2"
          data-testid="digital-twin-solver-surfaces"
          aria-label="Digital Twin external solver surfaces"
        >
          {SOLVER_SURFACES.map((surface) => (
            <li
              key={surface.id}
              data-testid={`digital-twin-solver-surface-${surface.id}`}
              className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
                {surface.id === "fixture-provider" ? "FIXTURE" : "REAL SOLVER"}
              </p>
              <h3 className="font-medium text-slate-900">{surface.name}</h3>
              <p className="mt-1 text-sm text-slate-600">{surface.summary}</p>
            </li>
          ))}
        </ul>
      </section>

      <section
        className="mt-10"
        data-testid="digital-twin-solver-capabilities-ready"
        aria-labelledby="dt-capabilities-title"
      >
        <h2 id="dt-capabilities-title" className="text-2xl font-semibold text-slate-900">
          Solver Capability Registry
        </h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Version{" "}
          <span data-testid="digital-twin-solver-capabilities-version">0.11.0-digital-thread</span>.
          Multi-provider capability catalog — discovery only; no auto-execute (
          <span data-testid="digital-twin-capability-registry-flag">
            SolverCapabilityRegistryReady=true
          </span>
          ).
        </p>
        <ul
          className="mt-3 grid gap-3 sm:grid-cols-2"
          data-testid="digital-twin-capability-surfaces"
          aria-label="Digital Twin solver capability surfaces"
        >
          {CAPABILITY_SURFACES.map((surface) => (
            <li
              key={surface.id}
              data-testid={`digital-twin-capability-surface-${surface.id}`}
              className={
                surface.status === "qualified"
                  ? "rounded-lg border border-emerald-200 bg-emerald-50/40 p-4"
                  : surface.status === "reserved"
                    ? "rounded-lg border border-slate-200 bg-slate-50/60 p-4"
                    : "rounded-lg border border-indigo-200 bg-indigo-50/40 p-4"
              }
            >
              <p
                className={
                  surface.status === "qualified"
                    ? "text-xs font-semibold uppercase tracking-wide text-emerald-800"
                    : surface.status === "reserved"
                      ? "text-xs font-semibold uppercase tracking-wide text-slate-600"
                      : "text-xs font-semibold uppercase tracking-wide text-indigo-800"
                }
              >
                {surface.status === "qualified"
                  ? "QUALIFIED"
                  : surface.status === "reserved"
                    ? "RESERVED"
                    : "QUERY ONLY"}
              </p>
              <h3 className="font-medium text-slate-900">{surface.name}</h3>
              <p className="mt-1 text-sm text-slate-600">{surface.summary}</p>
            </li>
          ))}
        </ul>
      </section>

      <section
        className="mt-10"
        data-testid="digital-twin-digital-thread-ready"
        aria-labelledby="dt-thread-title"
      >
        <h2 id="dt-thread-title" className="text-2xl font-semibold text-slate-900">
          Digital Thread Intelligence
        </h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Version{" "}
          <span data-testid="digital-twin-digital-thread-version">0.11.0-digital-thread</span>.
          Cross-domain traceability and provenance composition — REFERENCES only (
          <span data-testid="digital-twin-digital-thread-flag">
            DigitalThreadIntelligenceReady=true
          </span>
          ). Digital Thread ≠ Knowledge Graph ≠ Timeline. Traceability ≠ causality.
        </p>
        <ul
          className="mt-3 grid gap-3 sm:grid-cols-2"
          data-testid="digital-twin-digital-thread-surfaces"
          aria-label="Digital Twin digital thread surfaces"
        >
          {THREAD_SURFACES.map((surface) => (
            <li
              key={surface.id}
              data-testid={`digital-twin-digital-thread-surface-${surface.id}`}
              className="rounded-lg border border-teal-200 bg-teal-50/40 p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">
                THREAD REF
              </p>
              <h3 className="font-medium text-slate-900">{surface.name}</h3>
              <p className="mt-1 text-sm text-slate-600">{surface.summary}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
