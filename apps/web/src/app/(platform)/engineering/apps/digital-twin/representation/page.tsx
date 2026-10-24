"use client";

import { DigitalTwinSurfacePage } from "@/components/engineering/digital-twin-surface-page";

export default function DigitalTwinRepresentationPage() {
  return (
    <DigitalTwinSurfacePage
      title="Representation"
      purpose="Linked model or spatial representation. This workspace does not include a new BIM viewer or GIS runtime."
      testId="dt-representation-page"
      emptyTitle="No model or spatial representation is currently linked."
      emptyDescription="Representation navigation is available only where a representation record already exists."
      surfaceKey="representations"
    />
  );
}
