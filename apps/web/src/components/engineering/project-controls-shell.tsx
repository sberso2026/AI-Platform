"use client";

import { ModuleOpsShell } from "@/components/engineering/module-ops-shell";

const PRIMARY = [
  { href: "/engineering/apps/project-controls", label: "Overview", exact: true },
  { href: "/engineering/apps/project-controls/progress", label: "Progress" },
  { href: "/engineering/apps/project-controls/schedule", label: "Schedule" },
  { href: "/engineering/apps/project-controls/cost", label: "Cost" },
  { href: "/engineering/apps/project-controls/change", label: "Change" },
  { href: "/engineering/apps/project-controls/productivity", label: "Productivity" },
  { href: "/engineering/apps/project-controls/forecast", label: "Forecast" },
  { href: "/engineering/apps/project-controls/scenarios", label: "Scenarios" },
  { href: "/engineering/apps/project-controls/assurance", label: "Assurance" },
] as const;

const ADMIN = [
  { href: "/engineering/apps/project-controls/release", label: "Diagnostics / Release" },
] as const;

export function ProjectControlsShell({ children }: { children: React.ReactNode }) {
  return (
    <ModuleOpsShell
      title="Project Controls"
      description="Published progress, schedule, cost, change, and forecast evidence."
      testId="project-controls-shell"
      primaryLinks={PRIMARY}
      adminLinks={ADMIN}
      adminLabel="Administration"
      moduleVersionAttr="1.0.0"
      moduleStatusAttr="ga"
    >
      {children}
    </ModuleOpsShell>
  );
}
