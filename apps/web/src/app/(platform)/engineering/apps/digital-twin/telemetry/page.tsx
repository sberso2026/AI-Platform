"use client";

import { DigitalTwinSurfacePage } from "@/components/engineering/digital-twin-surface-page";

export default function DigitalTwinTelemetryPage() {
  return (
    <DigitalTwinSurfacePage
      title="Telemetry"
      purpose="Bound telemetry sources and projections where recorded. This is not a live SHM runtime."
      testId="dt-telemetry-page"
      emptyTitle="No telemetry bindings are recorded for this twin."
      emptyDescription="Bindings appear when a source has been reviewed and linked."
      surfaceKey="telemetry_bindings"
    />
  );
}
