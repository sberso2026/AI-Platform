/**
 * Phase 9B overview — keeps discovery marker and adds vertical-slice ready marker.
 */
export default function InspectionIntelligenceOverviewPage() {
  return (
    <section
      data-testid="inspection-intelligence-discovery-ready"
      aria-labelledby="ii-overview-title"
    >
      <div data-testid="inspection-intelligence-vertical-slice-ready">
        <h1 id="ii-overview-title" className="text-2xl font-semibold text-slate-900">
          Inspection Intelligence
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          First vertical slice (0.2.0-vertical-slice). Inspections bind to Inspection Targets;
          Measurement Engine, immutable evidence, Inspection Packs, AI Vision / predictive /
          mobile interfaces are reserved per Phase 9B architectural lock.
        </p>
        <ul className="mt-6 list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>Coupling model: Inspection Target (not direct project/asset ownership)</li>
          <li>AssetReference interfaces only — Asset Intelligence not implemented</li>
          <li>Generic pack active; industry packs plug in without forking the engine</li>
          <li>Event fan-out: Asset Timeline → Digital Twin → Knowledge Graph → Executive Dashboard</li>
        </ul>
      </div>
    </section>
  );
}
