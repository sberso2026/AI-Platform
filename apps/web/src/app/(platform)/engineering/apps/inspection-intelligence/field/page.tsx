import { InspectionHostedWorkbench } from "@/components/engineering/inspection-hosted-workbench";

export default function InspectionFieldPage() {
  return (
    <section data-testid="inspection-field-ready" aria-labelledby="ii-field-title">
      <h1 id="ii-field-title" className="text-xl font-semibold text-slate-900">
        Field Capture
      </h1>
      <p className="mt-2 text-slate-600">
        Record observations, measurements, and immutable evidence against a hosted inspection
        session. Device camera and QR capture remain mobile-SDK reserved.
      </p>
      <div className="mt-4">
        <InspectionHostedWorkbench focus="sessions" />
      </div>
    </section>
  );
}
