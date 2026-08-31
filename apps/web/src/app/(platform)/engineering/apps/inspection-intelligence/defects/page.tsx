import { InspectionHostedWorkbench } from "@/components/engineering/inspection-hosted-workbench";

export default function InspectionDefectsPage() {
  return (
    <section data-testid="inspection-defects-ready" aria-labelledby="ii-defects-title">
      <h1 id="ii-defects-title" className="text-xl font-semibold text-slate-900">
        Defects
      </h1>
      <p className="mt-2 text-slate-600">
        Open, unverified, and closed defects recorded against inspection targets. Defects
        reference Engineering OS assets — they do not replace the asset register.
      </p>
      <div className="mt-4">
        <InspectionHostedWorkbench focus="defects" />
      </div>
    </section>
  );
}
