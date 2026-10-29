"use client";

import { DigitalTwinSurfacePage } from "@/components/engineering/digital-twin-surface-page";

export default function DigitalTwinHistoryPage() {
  return (
    <DigitalTwinSurfacePage
      title="History"
      purpose="Historical snapshots and versioned state records for the selected twin."
      testId="dt-history-page"
      emptyTitle="No history snapshots are recorded for this twin."
      emptyDescription="Snapshots appear when a twin state is published and retained."
      surfaceKey="snapshot_history"
    />
  );
}
