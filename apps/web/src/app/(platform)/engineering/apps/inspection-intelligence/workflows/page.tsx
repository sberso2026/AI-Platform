export default function InspectionWorkflowsPage() {
  return (
    <section data-testid="inspection-workflows-ready" aria-labelledby="ii-workflows-title">
      <h1 id="ii-workflows-title" className="text-xl font-semibold text-slate-900">
        Workflows
      </h1>
      <p className="mt-2 text-slate-600">
        Production desktop/web operational workflows. Definitions, state machines, transition
        guards, SLA timers, and audit trails are provided by the Engineering Workflow SDK — not
        duplicated inside Inspection Intelligence.
      </p>
    </section>
  );
}
