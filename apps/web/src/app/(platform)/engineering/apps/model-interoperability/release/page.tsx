import { GovernancePanel } from "@/components/engineering/governance-panel";

/**
 * Assurance UX for Engineering Model Interoperability — raw certification flags live here.
 */
export default function EngineeringModelInteropReleasePage() {
  return (
    <main className="p-8">
      <GovernancePanel
        moduleName="Engineering Model Interoperability"
        version="1.0.0"
        knownLimitations={[
          "ETABS: model import and exported-result federation available. Live ETABS execution is not currently certified.",
          "SPACE GASS: federation available. Live execution is not currently certified.",
          "SAP2000 / SAFE / CSiBridge remain unavailable.",
        ]}
        technicalContent={
          <>
            <dl>
              <dt>GA version</dt>
              <dd data-testid="emi-release-ga-version">
                1.0.0 — engineering-model-interoperability-v1-ready
              </dd>
              <dt>Release tag</dt>
              <dd data-testid="emi-release-tag">engineering-model-interoperability-v1.0.0</dd>
              <dt>Previous version</dt>
              <dd>0.4.0-etabs-federation</dd>
              <dt>Phase 13D</dt>
              <dd data-testid="emi-release-phase13d-status">blocked_external_dependency</dd>
            </dl>
            <section className="mt-4" aria-label="Unavailable in V1.0">
              <h2 className="text-sm font-semibold">UNAVAILABLE — not production functions of V1.0</h2>
              <ul className="mt-2 list-disc pl-5">
                <li>SPACE GASS live API / live execution</li>
                <li>ETABS live COM / real execution</li>
                <li>SAP2000 / SAFE / CSiBridge</li>
                <li>Analysis-model generation / source-model mutation</li>
              </ul>
              <p className="mt-3 font-mono text-xs">
                <span data-testid="engineering-model-interoperability-v1-ready">
                  Version <span data-testid="engineering-model-interoperability-ga-version">1.0.0</span>
                </span>
                <br />
                <span data-testid="engineering-model-ifc-federation-ready">
                  IFC Federation — AVAILABLE (bounded federation; no full BIM viewer).
                </span>
                <br />
                <span data-testid="engineering-model-spacegass-ready">
                  SPACE GASS Federation — AVAILABLE. SPACE GASS Live Execution — NOT CERTIFIED.
                </span>
                <br />
                <span data-testid="engineering-model-etabs-ready">
                  ETABS Federation — AVAILABLE. ETABS Live Execution — NOT CERTIFIED.
                </span>
                <br />
                <span data-testid="engineering-execution-host-ready">
                  Controlled Engineering Execution Host — AVAILABLE (host ≠ solver certification).
                </span>
                <br />
                <span data-testid="engineering-model-spacegass-live-execution-not-certified">
                  SPACEGASSLiveExecutionCertified=false
                </span>
                <br />
                <span data-testid="engineering-model-etabs-live-execution-not-certified">
                  ETABSHostedExecutionCertified=false
                </span>
                <br />
                phase13DStatus=blocked_external_dependency
              </p>
            </section>
          </>
        }
      />
    </main>
  );
}
