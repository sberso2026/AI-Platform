import { InspectionHostedWorkbench } from "@/components/engineering/inspection-hosted-workbench";

export default function InspectionActionsPage() {
  return (
    <section data-testid="inspection-corrective-actions-ready" aria-labelledby="ii-actions-title">
      <h1 id="ii-actions-title" className="text-xl font-semibold text-slate-900">
        Corrective actions
      </h1>
      <p className="mt-2 text-slate-600">
        Ownership, due dates, verification, and closure recorded against hosted inspection sessions.
      </p>
      <div className="mt-4">
        <InspectionHostedWorkbench focus="actions" />
      </div>
    </section>
  );
}
