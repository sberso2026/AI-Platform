"use client";

const LINKS = [
  { href: "/engineering/apps/inspection-intelligence", label: "Overview" },
  { href: "/engineering/apps/inspection-intelligence/templates", label: "Templates" },
  { href: "/engineering/apps/inspection-intelligence/plans", label: "Plans" },
  { href: "/engineering/apps/inspection-intelligence/sessions", label: "Sessions" },
  { href: "/engineering/apps/inspection-intelligence/review", label: "Review" },
] as const;

/**
 * Engineering OS shell for Inspection Intelligence vertical slice (Phase 9B).
 */
export function InspectionIntelligenceShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6" data-testid="inspection-intelligence-shell">
      <header className="mb-6 border-b border-slate-200 pb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Engineering OS
        </p>
        <h2 className="text-lg font-semibold text-slate-900">Inspection Intelligence</h2>
        <nav
          className="mt-3 flex flex-wrap gap-4 text-sm"
          aria-label="Inspection Intelligence features"
        >
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-slate-800 underline-offset-2 hover:underline"
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
