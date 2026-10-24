"use client";

import { AssetIntelligenceSurfacePage } from "@/components/engineering/asset-intelligence-surface-page";

export default function AssetIntelligenceEvidencePage() {
  return (
    <AssetIntelligenceSurfacePage
      title="Evidence"
      purpose="Hosted timeline, condition history, and composed snapshot evidence for the selected asset."
      testId="ai-evidence-page"
      emptyTitle="No inspection or condition evidence is available for the selected asset."
      emptyDescription="Evidence is linked from inspections, documents, and published intelligence states."
      surfaceKey="condition_history"
      hash="history"
    />
  );
}
