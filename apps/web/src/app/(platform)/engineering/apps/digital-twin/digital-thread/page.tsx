"use client";

import { DigitalTwinSurfacePage } from "@/components/engineering/digital-twin-surface-page";

export default function DigitalTwinDigitalThreadPage() {
  return (
    <DigitalTwinSurfacePage
      title="Digital thread"
      purpose="Linked engineering evidence referenced by this twin. References only — identity stays with source domains."
      testId="dt-thread-page"
      emptyTitle="No digital-thread links are recorded for this twin."
      emptyDescription="Thread links appear when evidence sources are bound to the twin identity."
      surfaceKey="digital_thread"
    />
  );
}
