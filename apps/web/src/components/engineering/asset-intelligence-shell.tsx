const LINKS = [
  { href: "/engineering/apps/asset-intelligence", label: "Overview" },
  { href: "/engineering/apps/asset-intelligence/release", label: "Release" },
] as const;

/**
 * Engineering OS shell for Asset Intelligence V1.0.
 */
export function AssetIntelligenceShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mx-auto max-w-5xl px-4 py-6"
      data-testid="asset-intelligence-shell"
      data-module-version="1.0.0"
      data-module-status="ga"
    >
      <header className="mb-6 border-b border-slate-200 pb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Engineering OS
        </p>
        <h2 className="text-lg font-semibold text-slate-900">Asset Intelligence</h2>
        <p className="mt-1 text-xs text-slate-500" data-testid="asset-intelligence-ownership">
          Intelligence about assets. Asset identity and canonical lifecycle remain owned by the
          Engineering OS Shared Asset Domain.
        </p>
        <nav className="mt-3 flex flex-wrap gap-4 text-sm" aria-label="Asset Intelligence sections">
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
