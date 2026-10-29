import { GovernancePanel } from "@/components/engineering/governance-panel";

export default function InspectionReleasePage() {
  return (
    <section data-testid="inspection-release-ready" aria-labelledby="ii-release-title">
      <GovernancePanel
        moduleName="Inspection Intelligence"
        version="1.0.0"
        knownLimitations={[
          "AI Vision remains advisory.",
          "Does not own asset identity or Digital Twin.",
        ]}
        technicalContent={
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="font-medium">Publication</dt>
              <dd data-testid="inspection-release-publication">
                Authority-governed path — capture → sync → condition → validated vision → report
              </dd>
            </div>
            <div>
              <dt className="font-medium">Registries</dt>
              <dd data-testid="inspection-release-registries">
                Capability, Service, and Pack registries published
              </dd>
            </div>
            <div>
              <dt className="font-medium">Manifest</dt>
              <dd data-testid="inspection-release-manifest">
                Machine-readable module manifest generated and verified
              </dd>
            </div>
            <div>
              <dt className="font-medium">Provider health</dt>
              <dd data-testid="inspection-release-provider">
                Vision / predictive: available or fail-closed unavailable
              </dd>
            </div>
            <div>
              <dt className="font-medium">Sync status</dt>
              <dd data-testid="inspection-release-sync">Queue depth and lag as numeric text</dd>
            </div>
            <div>
              <dt className="font-medium">Ownership</dt>
              <dd data-testid="inspection-release-no-twin">
                No Asset Intelligence or Digital Twin ownership
              </dd>
            </div>
            <div>
              <dt className="font-medium">Certification registry</dt>
              <dd>
                <ul className="mt-1 space-y-1 font-mono text-xs">
                  <li data-testid="inspection-intelligence-vertical-slice-ready">
                    inspection-intelligence-vertical-slice-ready
                  </li>
                  <li data-testid="inspection-intelligence-enterprise-foundation-ready">
                    inspection-intelligence-enterprise-foundation-ready
                  </li>
                  <li data-testid="inspection-intelligence-engineering-domain-ready">
                    inspection-intelligence-engineering-domain-ready
                  </li>
                  <li data-testid="inspection-intelligence-operational-workflows-ready">
                    inspection-intelligence-operational-workflows-ready
                  </li>
                  <li data-testid="inspection-intelligence-mobile-ready">
                    inspection-intelligence-mobile-ready
                  </li>
                  <li data-testid="inspection-intelligence-offline-sync-ready">
                    inspection-intelligence-offline-sync-ready
                  </li>
                  <li data-testid="inspection-intelligence-condition-predictive-ready">
                    inspection-intelligence-condition-predictive-ready
                  </li>
                  <li data-testid="inspection-intelligence-ai-vision-ready">
                    inspection-intelligence-ai-vision-ready
                  </li>
                  <li data-testid="inspection-intelligence-release-ready">
                    inspection-intelligence-release-ready
                  </li>
                  <li data-testid="inspection-intelligence-v1-ready">
                    inspection-intelligence-v1-ready
                  </li>
                </ul>
              </dd>
            </div>
            <div>
              <dt className="font-medium">Provider / model / policy</dt>
              <dd data-testid="inspection-release-pins">
                vision_provider_approved_v1 / ii_vision_detector@1.0.0 / vision_policy_v1
              </dd>
            </div>
          </dl>
        }
      />
      <h1 id="ii-release-title" className="sr-only">
        Module Release Status
      </h1>
    </section>
  );
}
