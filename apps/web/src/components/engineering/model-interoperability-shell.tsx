"use client";

import { ModuleSectionNav } from "@/components/engineering/module-section-nav";

const LINKS = [
  { href: "/engineering/apps/model-interoperability", label: "Overview", exact: true },
  { href: "/engineering/apps/model-interoperability/models", label: "Models" },
  { href: "/engineering/apps/model-interoperability/results", label: "Results" },
  { href: "/engineering/apps/model-interoperability/federation", label: "Compare" },
  { href: "/engineering/apps/model-interoperability/mappings", label: "Mappings" },
  { href: "/engineering/apps/model-interoperability/release", label: "Governance", exact: true },
] as const;

export function ModelInteroperabilityShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mx-auto max-w-6xl px-4 py-6"
      data-testid="model-interoperability-shell"
      data-module-version="1.0.0"
      data-module-status="ga"
    >
      <header className="mb-6 border-b border-slate-200 pb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Engineering OS
        </p>
        <h2 className="text-lg font-semibold text-slate-900">Engineering Models</h2>
        <p className="mt-1 text-sm text-slate-600" data-testid="model-interoperability-ownership">
          Imported and federated models from ETABS, SPACE GASS, IFC, and related sources.
        </p>
        <ModuleSectionNav links={LINKS} ariaLabel="Engineering Models sections" />
      </header>
      {children}
    </div>
  );
}
