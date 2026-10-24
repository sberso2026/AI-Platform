"use client";

import { DigitalTwinSurfacePage } from "@/components/engineering/digital-twin-surface-page";

export default function DigitalTwinStatePage() {
  return (
    <DigitalTwinSurfacePage
      title="State"
      purpose="Latest governed twin state with provenance. Simulated state is never treated as observed."
      testId="dt-state-page"
      emptyTitle="No published twin state is recorded yet."
      emptyDescription="State appears after a governed review and publish. Candidates are not shown as current state."
      surfaceKey="state"
    />
  );
}
