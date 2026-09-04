"use client";

import { ProjectControlsSurfacePage } from "@/components/engineering/project-controls-surface-page";

export default function ProjectControlsProgressPage() {
  return (
    <ProjectControlsSurfacePage
      title="Progress"
      purpose="Descriptive progress intelligence from published project status. This is not earned value."
      testId="pc-progress-page"
      emptyTitle="No published progress evidence is available."
      emptyDescription="Progress appears here when a governed progress state has been published for the selected project."
    />
  );
}
