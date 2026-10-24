"use client";

import { DigitalTwinSurfacePage } from "@/components/engineering/digital-twin-surface-page";

export default function DigitalTwinEvidencePage() {
  return (
    <DigitalTwinSurfacePage
      title="Evidence"
      purpose="Spatial references and thread-linked evidence for the selected twin."
      testId="dt-evidence-page"
      emptyTitle="No bound evidence sources are recorded for this twin."
      emptyDescription="Evidence is listed only when spatial or thread records exist."
      surfaceKey="spatial_references"
    />
  );
}
