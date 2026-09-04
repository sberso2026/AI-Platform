import { Suspense } from "react";
import { ProjectEngineeringIntelligenceView } from "@/components/engineering/project-engineering-intelligence";

export default function ProjectIntelligenceEngineeringPage() {
  return (
    <section data-testid="project-intelligence-engineering-ready">
      <p className="text-[0.8125rem] font-semibold tracking-[0.14em] text-[color:var(--eos-accent)]">Project Intelligence</p>
      <h2 className="mt-1 text-[2.125rem] font-semibold text-[color:var(--eos-text-primary)]">Engineering intelligence</h2>
      <p className="mt-2 max-w-3xl text-[1rem] text-[color:var(--eos-text-secondary)]">
        Technical operations across documents, findings, technical queries, decisions, and actions.
        This is not a second document register. Drill down to source records.
      </p>
      <div className="mt-8">
        <Suspense fallback={<p className="text-[1rem] text-[color:var(--eos-text-secondary)]">Loading engineering intelligence…</p>}>
          <ProjectEngineeringIntelligenceView />
        </Suspense>
      </div>
    </section>
  );
}
