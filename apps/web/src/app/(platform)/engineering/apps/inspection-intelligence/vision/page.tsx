export default function InspectionVisionPage() {
  return (
    <section data-testid="inspection-vision-ready" aria-labelledby="ii-vision-title">
      <h1 id="ii-vision-title" className="text-xl font-semibold text-slate-900">
        AI Vision Review
      </h1>
      <p className="mt-2 text-slate-600">
        Review advisory vision overlays against immutable originals. Toggle overlays, inspect
        confidence (also shown as text), and accept, reject, or adjust with a required reason.
      </p>
      <dl className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
        <div>
          <dt className="font-medium">Advisory status</dt>
          <dd data-testid="inspection-vision-advisory">Advisory only — human validation required</dd>
        </div>
        <div>
          <dt className="font-medium">Original evidence</dt>
          <dd data-testid="inspection-vision-original">Immutable — overlays are derivatives</dd>
        </div>
        <div>
          <dt className="font-medium">Provider unavailable</dt>
          <dd data-testid="inspection-vision-abstain">Fail closed / abstain visibly</dd>
        </div>
        <div>
          <dt className="font-medium">Confidence</dt>
          <dd data-testid="inspection-vision-confidence">
            Numeric percent plus textual band (not colour-only)
          </dd>
        </div>
        <div>
          <dt className="font-medium">Accuracy claim</dt>
          <dd data-testid="inspection-vision-no-accuracy">No unsupported accuracy claim</dd>
        </div>
        <div>
          <dt className="font-medium">Publication</dt>
          <dd data-testid="inspection-vision-publish">Validated outputs only; no silent mutation</dd>
        </div>
      </dl>
    </section>
  );
}
