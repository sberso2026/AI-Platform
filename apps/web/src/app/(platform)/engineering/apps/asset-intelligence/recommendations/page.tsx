"use client";

import { AssetIntelligenceSurfacePage } from "@/components/engineering/asset-intelligence-surface-page";

export default function AssetIntelligenceRecommendationsPage() {
  return (
    <AssetIntelligenceSurfacePage
      title="Recommendations"
      purpose="Advisory maintenance recommendations. Asset Intelligence does not create CMMS work orders."
      testId="ai-recommendations-page"
      advisoryLabel="Advisory"
      emptyTitle="No maintenance recommendation has been published for this asset."
      emptyDescription="Recommendations are advice for a human decision. They do not instruct a CMMS."
      surfaceKey="maintenance"
      hash="maintenance"
    />
  );
}
