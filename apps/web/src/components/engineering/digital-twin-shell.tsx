"use client";

import { ModuleSectionNav } from "@/components/engineering/module-section-nav";

const LINKS = [
  { href: "/engineering/apps/digital-twin", label: "Overview", exact: true },
  { href: "/engineering/apps/digital-twin/twins", label: "Twins" },
  { href: "/engineering/apps/digital-twin/release", label: "Governance", exact: true },
] as const;

export function DigitalTwinShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mx-auto max-w-6xl px-4 py-6"
      data-testid="digital-twin-shell"
      data-module-version="1.0.0"
      data-module-status="ga"
    >
      <header className="mb-6 border-b border-slate-200 pb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Engineering OS
        </p>
        <h2 className="text-lg font-semibold text-slate-900">Digital Twin</h2>
        <p className="mt-1 text-sm text-slate-600" data-testid="digital-twin-ownership">
          Recorded twin state, history, telemetry bindings, and digital thread.
        </p>
        <ModuleSectionNav links={LINKS} ariaLabel="Digital Twin sections" />
      </header>
      {children}
    </div>
  );
}
