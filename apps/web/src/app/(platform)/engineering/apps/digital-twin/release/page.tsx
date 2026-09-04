import { GovernancePanel } from "@/components/engineering/governance-panel";

export default function DigitalTwinReleasePage() {
  return (
    <section data-testid="digital-twin-release-ready" aria-labelledby="dt-release-title">
      <h1 id="dt-release-title" className="text-2xl font-semibold text-slate-900">
        Administration / Release
      </h1>
      <GovernancePanel
        moduleName="Digital Twin"
        version="1.0.0"
        knownLimitations={[
          "No physical control, predictive twin, SHM runtime, optimization, or solver execution.",
          "Shared Spatial Domain remains the spatial authority.",
        ]}
        technicalContent={
          <dl className="space-y-2">
            <div>
              <dt className="font-medium">GA version</dt>
              <dd data-testid="digital-twin-ga-version">
                <span data-testid="digital-twin-release-ga-version">1.0.0 — digital-twin-v1-ready</span>
              </dd>
            </div>
            <div>
              <dt className="font-medium">Release tag</dt>
              <dd data-testid="digital-twin-release-tag">digital-twin-v1.0.0</dd>
            </div>
            <div>
              <dt className="font-medium">Actuation / control / predictive</dt>
              <dd data-testid="digital-twin-release-forbidden">
                UNAVAILABLE — not production functions of V1.0
              </dd>
            </div>
            <div>
              <dt className="font-medium">Unavailable in V1.0</dt>
              <dd>
                <ul data-testid="digital-twin-unavailable-capabilities" aria-label="Capabilities unavailable in V1.0">
                  <li>Physical actuation — UNAVAILABLE</li>
                  <li>Predictive twin — UNAVAILABLE</li>
                  <li>Native solver — UNAVAILABLE</li>
                </ul>
              </dd>
            </div>
            <div>
              <dt className="font-medium">V1 surfaces</dt>
              <dd>
                <ul data-testid="digital-twin-v1-surfaces" aria-label="Digital Twin V1 surfaces">
                  <li>Twin identity / profile — GA</li>
                  <li>Twin state — GA</li>
                  <li>Snapshot / history — GA</li>
                  <li>Representation — GA</li>
                  <li>Digital Thread — GA</li>
                </ul>
              </dd>
            </div>
            <div>
              <dt className="font-medium">Shared Spatial Domain</dt>
              <dd data-testid="digital-twin-release-ssd">0.2.0-spatial-core (consume only)</dd>
            </div>
          </dl>
        }
      />
    </section>
  );
}
