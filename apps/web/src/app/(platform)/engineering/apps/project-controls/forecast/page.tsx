"use client";

import { ProjectControlsSurfacePage } from "@/components/engineering/project-controls-surface-page";

export default function ProjectControlsForecastPage() {
  return (
    <ProjectControlsSurfacePage
      title="Forecast"
      purpose="Advisory trajectory from composed contributors where published. Not predictive scheduling."
      testId="pc-forecast-page"
      advisory
      emptyTitle="No published forecast evidence is available."
      emptyDescription="Forecast is advisory. It does not execute a plan or compute earned value."
    />
  );
}
