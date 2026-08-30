import { Suspense } from "react";
import { ProjectAiAnalystView } from "@/components/engineering/project-ai-analyst";

export default function ProjectIntelligenceAnalystPage() {
  return (
    <section data-testid="project-intelligence-analyst-ready">
      <p className="text-sm font-medium text-cyan-700">Project Intelligence</p>
      <h2 className="mt-1 text-2xl font-semibold text-slate-900">AI Project Analyst</h2>
      <p className="mt-2 max-w-3xl text-slate-600">
        Advisory assistant over deterministic Project Intelligence. It explains, synthesizes, and
        cites authorized evidence. It does not approve work, mutate canonical records, or invent
        forecasts.
      </p>
      <div className="mt-8">
        <Suspense fallback={<p className="text-sm text-slate-600">Loading AI Project Analyst…</p>}>
          <ProjectAiAnalystView />
        </Suspense>
      </div>
    </section>
  );
}
