"use client";

import { AssetIntelligenceSurfacePage } from "@/components/engineering/asset-intelligence-surface-page";

export default function AssetIntelligenceCriticalityPage() {
  return (
    <AssetIntelligenceSurfacePage
      title="Criticality"
      purpose="Consequence criticality recorded against canonical assets. Criticality is not a health score."
      testId="ai-criticality-page"
      emptyTitle="No criticality assessment has been published for this asset."
      emptyDescription="Criticality on the asset register is shown in the table. Published intelligence assessments appear here when present."
      surfaceKey="criticality"
      hash="criticality"
    />
  );
}
