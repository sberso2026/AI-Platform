import { Suspense } from "react";
import { InspectionAiEngineerView } from "@/components/engineering/inspection-ai-engineer";

export default function InspectionIntelligenceEngineerPage() {
  return (
    <section data-testid="inspection-intelligence-engineer-ready">
      <p className="text-sm font-medium text-cyan-700">Inspection Intelligence</p>
      <h2 className="mt-1 text-2xl font-semibold text-slate-900">AI Inspection Engineer</h2>
      <p className="mt-2 max-w-3xl text-slate-600">
        Advisory assistant over canonical Inspection Intelligence. It summarizes recorded facts,
        cites source identifiers, and abstains where data is absent. It does not approve inspections,
        certify condition, or mutate canonical records.
      </p>
      <div className="mt-8">
        <Suspense fallback={<p className="text-sm text-slate-600">Loading AI Inspection Engineer…</p>}>
          <InspectionAiEngineerView />
        </Suspense>
      </div>
    </section>
  );
}
