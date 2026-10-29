"use client";

import { ProjectControlsSurfacePage } from "@/components/engineering/project-controls-surface-page";

export default function ProjectControlsCostPage() {
  return (
    <ProjectControlsSurfacePage
      title="Cost"
      purpose="Descriptive cost signals from published project data. This is not a budget or accounting ledger."
      testId="pc-cost-page"
      emptyTitle="No published schedule or cost evidence is available."
      emptyDescription="Cost intelligence does not post to a financial ledger."
    />
  );
}
