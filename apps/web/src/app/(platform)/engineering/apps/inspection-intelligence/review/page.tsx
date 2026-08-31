export default function InspectionReviewPage() {
  return (
    <section data-testid="inspection-review-ready" aria-labelledby="ii-review-title">
      <h1 id="ii-review-title" className="text-xl font-semibold text-slate-900">
        Inspection review
      </h1>
      <p className="mt-2 text-slate-600">
        Human verification for submitted inspections. Approvals stay with people — AI cannot close
        or approve inspections.
      </p>
    </section>
  );
}
