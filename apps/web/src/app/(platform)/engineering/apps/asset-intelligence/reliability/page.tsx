"use client";

import { AssetIntelligenceSurfacePage } from "@/components/engineering/asset-intelligence-surface-page";

export default function AssetIntelligenceReliabilityPage() {
  return (
    <AssetIntelligenceSurfacePage
      title="Reliability"
      purpose="Qualitative reliability context from recorded evidence."
      testId="ai-reliability-page"
      advisoryLabel="Advisory"
      emptyTitle="No reliability evidence has been published for this asset."
      emptyDescription="Reliability intelligence is advisory and does not make a quantitative reliability claim."
      surfaceKey="reliability"
      hash="reliability"
    />
  );
}
