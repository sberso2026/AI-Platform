"use client";

import { ProjectControlsSurfacePage } from "@/components/engineering/project-controls-surface-page";

export default function ProjectControlsProductivityPage() {
  return (
    <ProjectControlsSurfacePage
      title="Productivity"
      purpose="Descriptive productivity signals. This is not workforce management."
      testId="pc-productivity-page"
      emptyTitle="No published productivity evidence is available."
      emptyDescription="Productivity intelligence appears only when a governed state has been published."
    />
  );
}
