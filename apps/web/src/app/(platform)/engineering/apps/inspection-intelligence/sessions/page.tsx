import { InspectionHostedWorkbench } from "@/components/engineering/inspection-hosted-workbench";

export default function InspectionSessionsPage() {
  return (
    <section data-testid="inspection-sessions-ready" aria-labelledby="ii-sessions-title">
      <h1 id="ii-sessions-title" className="text-xl font-semibold text-slate-900">
        Inspection sessions
      </h1>
      <p className="mt-2 text-slate-600">
        Session execution for observations, measurements, and immutable evidence. Records persist in
        hosted Inspection Intelligence tables.
      </p>
      <div className="mt-4">
        <InspectionHostedWorkbench focus="sessions" />
      </div>
    </section>
  );
}
