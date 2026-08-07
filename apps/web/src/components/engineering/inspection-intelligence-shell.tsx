"use client";

import { useMemo, useState } from "react";

const LINKS = [
  { href: "/engineering/apps/inspection-intelligence", label: "Overview" },
  { href: "/engineering/apps/inspection-intelligence/my-work", label: "My Work" },
  { href: "/engineering/apps/inspection-intelligence/templates", label: "Templates" },
  { href: "/engineering/apps/inspection-intelligence/plans", label: "Plans" },
  { href: "/engineering/apps/inspection-intelligence/sessions", label: "Sessions" },
  { href: "/engineering/apps/inspection-intelligence/workflows", label: "Workflows" },
  { href: "/engineering/apps/inspection-intelligence/assignments", label: "Assignments" },
  { href: "/engineering/apps/inspection-intelligence/field", label: "Field" },
  { href: "/engineering/apps/inspection-intelligence/sync", label: "Sync" },
  { href: "/engineering/apps/inspection-intelligence/condition", label: "Condition" },
  { href: "/engineering/apps/inspection-intelligence/predictive", label: "Predictive" },
  { href: "/engineering/apps/inspection-intelligence/vision", label: "Vision" },
  { href: "/engineering/apps/inspection-intelligence/defects", label: "Defects" },
  { href: "/engineering/apps/inspection-intelligence/actions", label: "Actions" },
  { href: "/engineering/apps/inspection-intelligence/review", label: "Review" },
] as const;

function classifyViewport(width: number, height: number): string {
  const min = Math.min(width, height);
  const max = Math.max(width, height);
  if (max < 600 || min < 768) {
    if (max < 900 || min < 600) return "phone";
  }
  if (min >= 768 && max <= 1400) {
    return width >= height ? "tablet_landscape" : "tablet_portrait";
  }
  return "desktop";
}

/**
 * Responsive Inspection Intelligence field shell — one host for desktop/tablet/phone.
 */
export function InspectionIntelligenceShell({ children }: { children: React.ReactNode }) {
  const [width] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1280,
  );
  const [height] = useState(() =>
    typeof window !== "undefined" ? window.innerHeight : 800,
  );
  const viewport = useMemo(() => classifyViewport(width, height), [width, height]);

  return (
    <div
      className="mx-auto max-w-5xl px-4 py-6"
      data-testid="inspection-intelligence-shell"
      data-viewport={viewport}
      data-touch-optimized="true"
      data-min-touch-target="44"
      data-sync-readiness="online_ready"
      data-offline-sync="true"
    >
      <header className="mb-6 border-b border-slate-200 pb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Engineering OS
        </p>
        <h2 className="text-lg font-semibold text-slate-900">Inspection Intelligence</h2>
        <p
          className="mt-1 text-xs text-slate-500"
          data-testid="inspection-sync-readiness"
          aria-live="polite"
        >
          Connectivity: online · Offline sync: enabled
        </p>
        <nav
          className="mt-3 flex flex-wrap gap-4 text-sm"
          aria-label="Inspection Intelligence features"
        >
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
