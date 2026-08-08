/**
 * Phase 12F — Digital Twin representation mapping & navigation overview.
 */

const REPRESENTATION_SURFACES = [
  { id: "representations", name: "Representations", summary: "Source model refs (IFC/BIM/CAD/drawing) — no binaries." },
  { id: "versions", name: "Versions", summary: "Immutable representation source version history." },
  { id: "mappings", name: "Mappings", summary: "Governed twin↔element mappings with review lifecycle." },
  { id: "mapped-elements", name: "Mapped Elements", summary: "Element references without geometry payloads." },
  { id: "state-context", name: "State Context", summary: "Resolve published state mappings to elements." },
  { id: "telemetry-context", name: "Telemetry Context", summary: "Resolve telemetry binding ↔ element links." },
  { id: "inspection-context", name: "Inspection Context", summary: "Inspection→element reserved when II contracts missing." },
  { id: "mapping-review", name: "Mapping Review", summary: "draft→pending_review→approved→published — no AI self-approval." },
] as const;

const UNAVAILABLE = [
  { id: "three-d-viewer", name: "3D / BIM viewer", reason: "UNAVAILABLE — threeDViewerImplemented=false; navigation is list/reference based." },
  { id: "bim-authoring", name: "BIM/CAD authoring", reason: "UNAVAILABLE — authoringEnabled=false." },
  { id: "geometry-db", name: "Geometry database", reason: "UNAVAILABLE — storesGeometryPayload=false." },
  { id: "simulation", name: "Simulation execution", reason: "UNAVAILABLE — simulationExecutionImplemented=false." },
  { id: "shm", name: "SHM signal processing", reason: "UNAVAILABLE — shmSignalProcessingImplemented=false." },
  { id: "historian", name: "Telemetry historian", reason: "UNAVAILABLE — telemetryHistorianImplemented=false." },
  { id: "actuation", name: "Physical actuation", reason: "UNAVAILABLE — physicalActuationEnabled=false." },
] as const;

export default function DigitalTwinRepresentationPage() {
  return (
    <section data-testid="digital-twin-representation-ready" aria-labelledby="dt-representation-title">
      <h1 id="dt-representation-title" className="text-2xl font-semibold text-slate-900">
        Digital Twin — Representation Mapping
      </h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Version <span data-testid="digital-twin-representation-version">0.6.0-representation</span>.
        Visual 3D/BIM viewer is UNAVAILABLE (
        <span data-testid="digital-twin-three-d-viewer-flag">threeDViewerImplemented=false</span>
        ). Navigation is list and reference based only.
      </p>

      <h2 className="mt-8 text-lg font-semibold text-slate-900">Representation surfaces</h2>
      <ul
        className="mt-3 grid gap-3 sm:grid-cols-2"
        data-testid="digital-twin-representation-surfaces"
        aria-label="Digital Twin representation surfaces"
      >
        {REPRESENTATION_SURFACES.map((surface) => (
          <li
            key={surface.id}
            data-testid={`digital-twin-surface-${surface.id}`}
            className="rounded-lg border border-slate-200 p-4"
          >
            <h3 className="font-medium text-slate-900">{surface.name}</h3>
            <p className="mt-1 text-sm text-slate-600">{surface.summary}</p>
          </li>
        ))}
      </ul>

      <h2 className="mt-8 text-lg font-semibold text-slate-900">Unavailable capabilities</h2>
      <ul
        className="mt-3 space-y-2"
        data-testid="digital-twin-unavailable-capabilities"
        aria-label="Capabilities unavailable in Phase 12F"
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

      <section
        className="mt-8"
        data-testid="digital-twin-viewer-unavailable-surface"
        aria-label="Viewer unavailable"
      >
        <h2 className="text-lg font-semibold text-slate-900">Viewer unavailable</h2>
        <p className="mt-1 text-sm text-slate-600" data-testid="digital-twin-viewer-unavailable-message">
          threeDViewerImplemented remains false. Use representation navigation to resolve
          Twin → sources/elements via list and reference APIs.
        </p>
      </section>
    </section>
  );
}
