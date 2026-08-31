"use client";

import { ModuleSectionNav } from "@/components/engineering/module-section-nav";

const LINKS = [
  { href: "/engineering/apps/asset-intelligence", label: "Overview", exact: true },
  { href: "/engineering/apps/asset-intelligence/assets", label: "Assets" },
  { href: "/engineering/apps/asset-intelligence/release", label: "Governance", exact: true },
] as const;

export function AssetIntelligenceShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mx-auto max-w-6xl px-4 py-6"
      data-testid="asset-intelligence-shell"
      data-module-version="1.0.0"
      data-module-status="ga"
    >
      <header className="mb-6 border-b border-slate-200 pb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Engineering OS
        </p>
        <h2 className="text-lg font-semibold text-slate-900">Asset Intelligence</h2>
        <p className="mt-1 text-sm text-slate-600" data-testid="asset-intelligence-ownership">
          Condition, defects, inspections, and risk signals for recorded assets.
        </p>
        <ModuleSectionNav links={LINKS} ariaLabel="Asset Intelligence sections" />
      </header>
      {children}
    </div>
  );
}
