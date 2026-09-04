"use client";

import { ProjectControlsSurfacePage } from "@/components/engineering/project-controls-surface-page";

export default function ProjectControlsSchedulePage() {
  return (
    <ProjectControlsSurfacePage
      title="Schedule"
      purpose="Descriptive schedule signals from available project data. Native CPM calculation is not available."
      testId="pc-schedule-page"
      emptyTitle="No published schedule or cost evidence is available."
      emptyDescription="Schedule intelligence does not execute schedule changes and does not compute a critical path."
    />
  );
}
