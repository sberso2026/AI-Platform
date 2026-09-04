"use client";

import { AssetIntelligenceSurfacePage } from "@/components/engineering/asset-intelligence-surface-page";

export default function AssetIntelligenceConditionPage() {
  return (
    <AssetIntelligenceSurfacePage
      title="Condition"
      purpose="Recorded condition assessments from hosted Asset Intelligence persistence."
      testId="ai-condition-page"
      emptyTitle="No condition evidence has been published for this asset."
      emptyDescription="Condition is derived from Inspection Intelligence contracts when an assessment exists."
      surfaceKey="condition"
      hash="condition"
    />
  );
}
