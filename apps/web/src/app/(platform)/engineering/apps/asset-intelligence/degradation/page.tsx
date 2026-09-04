"use client";

import { AssetIntelligenceSurfacePage } from "@/components/engineering/asset-intelligence-surface-page";

export default function AssetIntelligenceDegradationPage() {
  return (
    <AssetIntelligenceSurfacePage
      title="Degradation"
      purpose="Observed trend and degradation where a governed assessment has been published."
      testId="ai-degradation-page"
      advisoryLabel="Advisory"
      emptyTitle="No degradation evidence has been published for this asset."
      emptyDescription="Degradation is not a forecast. It appears only after a trend assessment is recorded."
      surfaceKey="trend_degradation"
      hash="trend_degradation"
    />
  );
}
