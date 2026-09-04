"use client";

import { ProjectControlsSurfacePage } from "@/components/engineering/project-controls-surface-page";

export default function ProjectControlsAssurancePage() {
  return (
    <ProjectControlsSurfacePage
      title="Assurance"
      purpose="Advisory assurance posture for published controls. This is not verification authority."
      testId="pc-assurance-page"
      advisory
      emptyTitle="No published assurance evidence is available."
      emptyDescription="Certification flags and release identity remain under Administration / Release."
    />
  );
}
