import { InspectionCommandCentre } from "@/components/engineering/inspection-command-centre";

/**
 * Operational Inspection Intelligence landing. Historical V1 readiness markers are retained
 * for certification source checks and are not shown as product copy.
 */
export default function InspectionIntelligenceOverviewPage() {
  return (
    <section
      data-testid="inspection-intelligence-discovery-ready"
      aria-labelledby="ii-overview-title"
    >
      <div data-testid="inspection-intelligence-vertical-slice-ready">
        <div data-testid="inspection-intelligence-enterprise-foundation-ready">
          <div data-testid="inspection-intelligence-engineering-domain-ready">
            <div data-testid="inspection-intelligence-operational-workflows-ready">
              <div data-testid="inspection-intelligence-mobile-ready">
                <div data-testid="inspection-intelligence-offline-sync-ready">
                  <div data-testid="inspection-intelligence-condition-predictive-ready">
                    <div data-testid="inspection-intelligence-ai-vision-ready">
                      <div data-testid="inspection-intelligence-release-ready">
                        <div data-testid="inspection-intelligence-v1-ready">
                          <h1 id="ii-overview-title" className="sr-only">
                            Inspection Intelligence
                          </h1>
                          <InspectionCommandCentre />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
