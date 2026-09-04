"use client";

import { AssetIntelligenceSurfacePage } from "@/components/engineering/asset-intelligence-surface-page";

export default function AssetIntelligenceFailureModesPage() {
  return (
    <AssetIntelligenceSurfacePage
      title="Failure modes"
      purpose="Recorded failure mode, mechanism, and cause intelligence over the governed taxonomy."
      testId="ai-failure-page"
      emptyTitle="No failure-mode evidence has been published for this asset."
      emptyDescription="Failure intelligence is shown only when a failure assessment exists."
      surfaceKey="failure"
      hash="failure"
    />
  );
}
