import { Suspense } from "react";
import { ProjectScheduleIntelligenceView } from "@/components/engineering/project-schedule-intelligence";

export default function ProjectIntelligenceSchedulePage() {
  return (
    <section data-testid="project-intelligence-schedule-ready">
      <p className="text-[0.8125rem] font-semibold tracking-[0.14em] text-[color:var(--eos-accent)]">Project Intelligence</p>
      <h2 className="mt-1 text-[2.125rem] font-semibold text-[color:var(--eos-text-primary)]">Schedule intelligence</h2>
      <p className="mt-2 max-w-3xl text-[1rem] text-[color:var(--eos-text-secondary)]">
        Milestone movement, overdue milestones, and published schedule trend. This is not a scheduling
        editor and does not replace Primavera or Microsoft Project.
      </p>
      <div className="mt-8">
        <Suspense fallback={<p className="text-[1rem] text-[color:var(--eos-text-secondary)]">Loading schedule intelligence…</p>}>
          <ProjectScheduleIntelligenceView />
        </Suspense>
      </div>
    </section>
  );
}
