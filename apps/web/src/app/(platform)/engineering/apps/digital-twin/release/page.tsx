import { GovernancePanel } from "@/components/engineering/governance-panel";

export default function DigitalTwinReleasePage() {
  return (
    <section data-testid="digital-twin-release-ready" aria-labelledby="dt-release-title">
      <h1 id="dt-release-title" className="sr-only">
        Module Release Status
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
              <dd data-testid="digital-twin-release-ga-version">1.0.0 — digital-twin-v1-ready</dd>
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
              <dt className="font-medium">Shared Spatial Domain</dt>
              <dd data-testid="digital-twin-release-ssd">0.2.0-spatial-core (consume only)</dd>
            </div>
          </dl>
        }
      />
    </section>
  );
}
