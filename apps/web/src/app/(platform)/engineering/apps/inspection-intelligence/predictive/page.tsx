export default function InspectionPredictivePage() {
  return (
    <section data-testid="inspection-predictive-ready" aria-labelledby="ii-predictive-title">
      <h1 id="ii-predictive-title" className="text-xl font-semibold text-slate-900">
        Predictive Signals
      </h1>
      <p className="mt-2 text-slate-600">
        Advisory signals from inspections, defects, and actions. Explanations, confidence, and
        provider identity are always shown. Signals are never presented as confirmed failures.
      </p>
      <dl className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
        <div>
          <dt className="font-medium">Advisory banner</dt>
          <dd data-testid="inspection-predictive-advisory">Advisory only — human review required</dd>
        </div>
        <div>
          <dt className="font-medium">Provider unavailable</dt>
          <dd data-testid="inspection-predictive-abstain">Fail closed / abstain visibly</dd>
        </div>
        <div>
          <dt className="font-medium">ML accuracy</dt>
          <dd data-testid="inspection-predictive-no-ml-claim">No production ML accuracy claim</dd>
        </div>
        <div>
          <dt className="font-medium">Remaining life</dt>
          <dd data-testid="inspection-predictive-no-rul">No remaining useful life claim</dd>
        </div>
      </dl>
    </section>
  );
}
