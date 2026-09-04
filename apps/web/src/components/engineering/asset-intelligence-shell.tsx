"use client";

import { ModuleOpsShell } from "@/components/engineering/module-ops-shell";

const PRIMARY = [
  { href: "/engineering/apps/asset-intelligence", label: "Overview", exact: true },
  { href: "/engineering/apps/asset-intelligence/assets", label: "Assets" },
  { href: "/engineering/apps/asset-intelligence/condition", label: "Condition" },
  { href: "/engineering/apps/asset-intelligence/criticality", label: "Criticality" },
  { href: "/engineering/apps/asset-intelligence/reliability", label: "Reliability" },
  { href: "/engineering/apps/asset-intelligence/degradation", label: "Degradation" },
  { href: "/engineering/apps/asset-intelligence/failure-modes", label: "Failure Modes" },
  { href: "/engineering/apps/asset-intelligence/recommendations", label: "Recommendations" },
  { href: "/engineering/apps/asset-intelligence/evidence", label: "Evidence" },
] as const;

const ADMIN = [
  { href: "/engineering/apps/asset-intelligence/release", label: "Diagnostics / Release" },
] as const;

export function AssetIntelligenceShell({ children }: { children: React.ReactNode }) {
  return (
    <ModuleOpsShell
      title="Asset Intelligence"
      description="Condition, criticality, and recorded evidence for governed assets."
      testId="asset-intelligence-shell"
      primaryLinks={PRIMARY}
      adminLinks={ADMIN}
      adminLabel="Administration"
      moduleVersionAttr="1.0.0"
      moduleStatusAttr="ga"
    >
      {children}
    </ModuleOpsShell>
  );
}
