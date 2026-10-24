import { InspectionHostedWorkbench } from "@/components/engineering/inspection-hosted-workbench";

export default function InspectionPlansPage() {
  return (
    <section data-testid="inspection-plans-ready" aria-labelledby="ii-plans-title">
      <h1 id="ii-plans-title" className="text-xl font-semibold text-slate-900">
        Inspection plans
      </h1>
      <p className="mt-2 text-slate-600">
        Plans bind to Inspection Targets with optional AssetReference snapshots. Engineering OS
        shared domain remains authoritative for assets and projects.
      </p>
      <div className="mt-4">
        <InspectionHostedWorkbench focus="plans" />
      </div>
    </section>
  );
}
