import { Suspense } from "react";
import { ProjectAiAnalystView } from "@/components/engineering/project-ai-analyst";

export default function ProjectIntelligenceAnalystPage() {
  return (
    <section data-testid="project-intelligence-analyst-ready">
      <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--eos-accent)]">
        Ask Project Intelligence
      </p>
      <h2 className="mt-1 text-[2.125rem] font-semibold text-[color:var(--eos-text-primary)]">Ask Project Intelligence</h2>
      <p className="mt-2 max-w-3xl text-[1rem] text-[color:var(--eos-text-secondary)]">
        Ask what needs attention, why the project is at risk, and what evidence supports the answer.
        Advisory only. It does not approve work or replace Primavera, ERP, or document systems.
      </p>
      <div className="mt-8">
        <Suspense fallback={<p className="text-[1rem] text-[color:var(--eos-text-secondary)]">Loading AI Project Analyst…</p>}>
          <ProjectAiAnalystView />
        </Suspense>
      </div>
    </section>
  );
}
