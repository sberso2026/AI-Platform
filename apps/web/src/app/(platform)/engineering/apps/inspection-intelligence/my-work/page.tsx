export default function InspectionMyWorkPage() {
  return (
    <section data-testid="inspection-my-work-ready" aria-labelledby="ii-my-work-title">
      <h1 id="ii-my-work-title" className="text-xl font-semibold text-slate-900">
        My Work
      </h1>
      <p className="mt-2 text-slate-600">
        Compact assignment queue for tablet and phone. Guided steps reuse Engineering Workflow SDK
        assignments — not a separate mobile workflow engine.
      </p>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-700">
        <li>Assigned inspections</li>
        <li>In-progress sessions</li>
        <li>Pending attestations</li>
      </ol>
    </section>
  );
}
