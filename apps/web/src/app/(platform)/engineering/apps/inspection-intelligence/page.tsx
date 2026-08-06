/**
 * Phase 9E overview — operational workflows + Engineering Workflow SDK markers.
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
              <h1 id="ii-overview-title" className="text-2xl font-semibold text-slate-900">
                Inspection Intelligence
              </h1>
              <p className="mt-2 max-w-2xl text-slate-600">
                Operational workflows (0.5.0-operational-workflows). Desktop and web inspection
                orchestration consumes the Engineering Workflow SDK. Mobile product, offline sync,
                and AI Vision remain deferred.
              </p>
              <ul className="mt-6 list-disc space-y-1 pl-5 text-sm text-slate-700">
                <li>Engineering Workflow SDK shared across Engineering OS modules</li>
                <li>Assignment → execution → review → approval → verification → close-out</li>
                <li>Workflow transitions emit typed Engineering OS events</li>
                <li>Reporting data models prepared (no mobile reporting)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
