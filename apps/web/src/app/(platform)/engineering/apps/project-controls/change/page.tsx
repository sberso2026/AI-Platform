"use client";

import { ProjectControlsSurfacePage } from "@/components/engineering/project-controls-surface-page";

export default function ProjectControlsChangePage() {
  return (
    <ProjectControlsSurfacePage
      title="Change"
      purpose="Descriptive change intelligence. This is not contractual authority."
      testId="pc-change-page"
      emptyTitle="No published change evidence is available."
      emptyDescription="Change signals appear when a governed change state has been published for the selected project."
    />
  );
}
