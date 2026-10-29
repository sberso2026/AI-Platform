import { GovernancePanel } from "@/components/engineering/governance-panel";

export default function ProjectControlsReleasePage() {
  return (
    <section data-testid="project-controls-release-ready" aria-labelledby="pc-release-title">
      <h1 id="pc-release-title" className="text-2xl font-semibold text-slate-900">
        Administration / Release
      </h1>
      <GovernancePanel
        moduleName="Project Controls"
        version="1.0.0"
        knownLimitations={[
          "Descriptive schedule intelligence from available project data. Native CPM calculation is not available.",
          "Progress intelligence is not earned value.",
          "Does not post to a financial ledger.",
        ]}
        technicalContent={
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="font-medium">GA version</dt>
              <dd data-testid="project-controls-ga-version">
                <span data-testid="project-controls-release-ga-version">1.0.0 — project-controls-v1-ready</span>
              </dd>
            </div>
            <div>
              <dt className="font-medium">Release tag</dt>
              <dd data-testid="project-controls-release-tag">project-controls-v1.0.0</dd>
            </div>
            <div>
              <dt className="font-medium">Registries</dt>
              <dd data-testid="project-controls-release-registries">
                Capability, service and event contract registries frozen at 1.0.0
              </dd>
            </div>
            <div>
              <dt className="font-medium">Migration lineage</dt>
              <dd data-testid="project-controls-release-migrations">
                batch_61 → batch_73, additive only — no batch_74
              </dd>
            </div>
            <div>
              <dt className="font-medium">CPM / EV</dt>
              <dd data-testid="project-controls-release-cpm-ev">
                UNAVAILABLE — not production functions of V1.0
              </dd>
            </div>
            <div>
              <dt className="font-medium">Unavailable in V1.0</dt>
              <dd>
                <ul
                  className="mt-1 list-disc space-y-1 pl-5"
                  data-testid="project-controls-unavailable-capabilities"
                  aria-label="Capabilities unavailable in V1.0"
                >
                  <li data-testid="project-controls-unavailable-native-cpm">
                    Native CPM / Critical path — UNAVAILABLE
                  </li>
                  <li data-testid="project-controls-unavailable-earned-value">
                    Earned value / EV/CPI/SPI — UNAVAILABLE
                  </li>
                  <li data-testid="project-controls-unavailable-financial-posting">
                    Financial posting / budget ledger — UNAVAILABLE
                  </li>
                  <li data-testid="project-controls-unavailable-schedule-execution">
                    Schedule execution — UNAVAILABLE
                  </li>
                  <li data-testid="project-controls-unavailable-resource-leveling">
                    Resource leveling — UNAVAILABLE
                  </li>
                  <li data-testid="project-controls-unavailable-autonomous-decisions">
                    Autonomous decisions — UNAVAILABLE
                  </li>
                </ul>
              </dd>
            </div>
            <div>
              <dt className="font-medium">V1 surfaces</dt>
              <dd>
                <ul data-testid="project-controls-v1-surfaces" aria-label="Project Controls V1 surfaces">
                  <li data-testid="project-controls-surface-progress">Progress — GA</li>
                  <li data-testid="project-controls-surface-schedule">Schedule — GA</li>
                  <li data-testid="project-controls-surface-change">Change — GA</li>
                  <li data-testid="project-controls-surface-cost">Cost — GA</li>
                  <li data-testid="project-controls-surface-productivity">Productivity — GA</li>
                  <li data-testid="project-controls-surface-forecast">Forecast — GA advisory</li>
                  <li data-testid="project-controls-surface-decision">Decision support — GA advisory</li>
                  <li data-testid="project-controls-surface-scenario">Scenario — GA advisory</li>
                  <li data-testid="project-controls-surface-risk-opportunity">Risk / opportunity — GA advisory</li>
                  <li data-testid="project-controls-surface-assurance">Assurance — GA advisory</li>
                  <li data-testid="project-controls-surface-explainability">Explainability — GA advisory</li>
                  <li data-testid="project-controls-surface-organizational-learning">Organizational learning — GA advisory</li>
                </ul>
              </dd>
            </div>
            <div>
              <dt className="font-medium">Ownership</dt>
              <dd data-testid="project-controls-release-ownership">
                No canonical project identity, financial ledger or autonomous decision ownership
              </dd>
            </div>
          </dl>
        }
      />
    </section>
  );
}
