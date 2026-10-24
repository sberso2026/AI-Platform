"use client";

import { ProjectControlsSurfacePage } from "@/components/engineering/project-controls-surface-page";

export default function ProjectControlsScenariosPage() {
  return (
    <ProjectControlsSurfacePage
      title="Scenarios"
      purpose="Exploratory scenario comparison. No optimisation or automatic execution."
      testId="pc-scenarios-page"
      advisory
      emptyTitle="No published scenario evidence is available."
      emptyDescription="Scenarios are advisory comparisons. They do not change the live plan."
    />
  );
}
