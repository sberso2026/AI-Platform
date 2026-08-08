/**
 * Phase 12E — Digital Twin telemetry binding overview.
 */

const TELEMETRY_SURFACES = [
  { id: "telemetry-sources", name: "Telemetry Sources", summary: "Reference kernel and Asset Intelligence series — no raw storage." },
  { id: "telemetry-bindings", name: "Bindings", summary: "Governed twin-to-series bindings with review lifecycle." },
  { id: "binding-status", name: "Binding status", summary: "Lifecycle draft through retired; no auto-publish." },
  { id: "source-health", name: "Source health", summary: "available | degraded | unavailable | unknown" },
  { id: "current-projected-state", name: "Current projected state", summary: "Bounded projection from AI time series." },
  { id: "freshness", name: "Freshness", summary: "Last observation age and stale detection." },
  { id: "quality", name: "Quality", summary: "good | suspect | bad | missing | out_of_range | stale | unknown" },
] as const;

const UNAVAILABLE = [
  { id: "telemetry-historian", name: "Telemetry historian", reason: "UNAVAILABLE — not implemented in Phase 12E." },
  { id: "high-frequency", name: "High-frequency telemetry", reason: "UNAVAILABLE — bounded binding/projection only." },
  { id: "shm-signal-processing", name: "SHM signal processing", reason: "UNAVAILABLE — shmSignalProcessingImplemented=false." },
  { id: "sensor-registry", name: "Sensor registry", reason: "UNAVAILABLE — sensorRegistryImplemented=false." },
  { id: "three-d-viewer", name: "3D viewer", reason: "UNAVAILABLE — not implemented." },
] as const;

export default function DigitalTwinTelemetryBindingPage() {
  return (
    <section data-testid="digital-twin-telemetry-binding-ready" aria-labelledby="dt-telemetry-title">
      <h1 id="dt-telemetry-title" className="text-2xl font-semibold text-slate-900">
        Digital Twin — Telemetry Binding
      </h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Version <span data-testid="digital-twin-telemetry-version">0.5.0-telemetry-binding</span>.
        Engineering time series ownership stays with Asset Intelligence; Twin reads via public contracts only.
      </p>

      <h2 className="mt-8 text-lg font-semibold text-slate-900">Telemetry surfaces</h2>
      <ul
        className="mt-3 grid gap-3 sm:grid-cols-2"
        data-testid="digital-twin-telemetry-surfaces"
        aria-label="Digital Twin telemetry binding surfaces"
      >
        {TELEMETRY_SURFACES.map((surface) => (
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
        aria-label="Capabilities unavailable in Phase 12E"
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

      <section className="mt-8" data-testid="digital-twin-source-unavailable-surface" aria-label="Source unavailable">
        <h2 className="text-lg font-semibold text-slate-900">Source unavailable</h2>
        <p className="mt-1 text-sm text-slate-600" data-testid="digital-twin-source-unavailable-message">
          When source health is unavailable, projection is blocked and no auto-publish occurs.
        </p>
      </section>

      <section className="mt-6" data-testid="digital-twin-freshness-quality-surface" aria-label="Freshness and quality">
        <dl className="grid gap-2 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-slate-700">Freshness</dt>
            <dd data-testid="digital-twin-freshness-label" className="text-sm text-slate-600">
              Stale when last observation exceeds policy window.
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-700">Quality</dt>
            <dd data-testid="digital-twin-quality-label" className="text-sm text-slate-600">
              Projections with bad, missing, or stale quality are rejected from auto-ingest.
            </dd>
          </div>
        </dl>
      </section>
    </section>
  );
}
