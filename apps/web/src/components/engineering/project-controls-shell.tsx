import { ModuleSectionNav } from "@/components/engineering/module-section-nav";

const LINKS = [
  { href: "/engineering/apps/project-controls", label: "Workspace", exact: true },
  { href: "/engineering/apps/project-controls/release", label: "Governance" },
] as const;

export function ProjectControlsShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mx-auto max-w-6xl px-4 py-6"
      data-testid="project-controls-shell"
      data-module-version="1.0.0"
      data-module-status="ga"
    >
      <header className="mb-6 border-b border-slate-200 pb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Engineering OS
        </p>
        <h2 className="text-lg font-semibold text-slate-900">Project Controls</h2>
        <p className="mt-1 text-sm text-slate-600" data-testid="project-controls-ownership">
          Progress, schedule, cost, change, and forecast intelligence from available project data.
        </p>
        <ModuleSectionNav links={LINKS} ariaLabel="Project Controls sections" />
      </header>
      {children}
    </div>
  );
}
