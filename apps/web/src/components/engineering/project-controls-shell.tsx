const LINKS = [
  { href: "/engineering/apps/project-controls", label: "Overview" },
  { href: "/engineering/apps/project-controls/release", label: "Release" },
] as const;

export function ProjectControlsShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mx-auto max-w-5xl px-4 py-6"
      data-testid="project-controls-shell"
      data-module-version="1.0.0"
      data-module-status="ga"
    >
      <header className="mb-6 border-b border-slate-200 pb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Engineering OS
        </p>
        <h2 className="text-lg font-semibold text-slate-900">Project Controls</h2>
        <p className="mt-1 text-xs text-slate-500" data-testid="project-controls-ownership">
          Intelligence about projects. Canonical project identity remains in the Engineering Shared
          Project Domain.
        </p>
        <nav className="mt-3 flex flex-wrap gap-4 text-sm" aria-label="Project Controls sections">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="inline-flex min-h-11 min-w-11 items-center text-slate-800 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </header>
      {children}
    </div>
  );
}
