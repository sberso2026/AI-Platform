/**
 * Phase 9C overview — enterprise foundation ready markers.
 */
export default function InspectionIntelligenceOverviewPage() {
  return (
    <section
      data-testid="inspection-intelligence-discovery-ready"
      aria-labelledby="ii-overview-title"
    >
      <div data-testid="inspection-intelligence-vertical-slice-ready">
        <div data-testid="inspection-intelligence-enterprise-foundation-ready">
          <h1 id="ii-overview-title" className="text-2xl font-semibold text-slate-900">
            Inspection Intelligence
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Enterprise foundation (0.3.0-enterprise-foundation). Durable persistence, Engineering
            Module SDK, Inspection Pack SDK, immutable templates/evidence, authorized state
            machine, and typed event pipeline are locked. AI Vision, offline/mobile, and condition
            rating remain reserved.
          </p>
          <ul className="mt-6 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Inspection Target abstraction + AssetReference contracts</li>
            <li>Packs extend the engine — coatings scaffold only</li>
            <li>Events only between modules — no direct cross-module calls</li>
            <li>Future modules reuse Engineering Module SDK</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
