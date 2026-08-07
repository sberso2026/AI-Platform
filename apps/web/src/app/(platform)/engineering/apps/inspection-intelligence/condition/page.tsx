export default function InspectionConditionPage() {
  return (
    <section data-testid="inspection-condition-ready" aria-labelledby="ii-condition-title">
      <h1 id="ii-condition-title" className="text-xl font-semibold text-slate-900">
        Condition Rating
      </h1>
      <p className="mt-2 text-slate-600">
        Enter and review condition grades with confidence, uncertainty, evidence drill-down, trend
        history, override rationale, and scheme/pack versions. Observed, calculated, approved, and
        published layers remain distinct.
      </p>
      <dl className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
        <div>
          <dt className="font-medium">Scheme</dt>
          <dd data-testid="inspection-condition-scheme">structural_ordinal_1_5 @ 1.0.0</dd>
        </div>
        <div>
          <dt className="font-medium">Confidence / uncertainty</dt>
          <dd data-testid="inspection-condition-confidence">visible on each rating</dd>
        </div>
        <div>
          <dt className="font-medium">Override authority</dt>
          <dd data-testid="inspection-condition-override">reason + actor + prior value retained</dd>
        </div>
        <div>
          <dt className="font-medium">Publication</dt>
          <dd data-testid="inspection-condition-publish">authorised roles only; offline stays draft</dd>
        </div>
      </dl>
    </section>
  );
}
