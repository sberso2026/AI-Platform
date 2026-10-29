"use client";

import { useEffect, useState } from "react";
import { ModuleSectionNav } from "@/components/engineering/module-section-nav";

const PRIMARY = [
  { href: "/engineering/apps/inspection-intelligence", label: "Overview", exact: true },
  { href: "/engineering/apps/inspection-intelligence/my-work", label: "My work" },
  { href: "/engineering/apps/inspection-intelligence/plans", label: "Plans" },
  { href: "/engineering/apps/inspection-intelligence/sessions", label: "Inspections" },
  { href: "/engineering/apps/inspection-intelligence/defects", label: "Defects" },
  { href: "/engineering/apps/inspection-intelligence/actions", label: "Actions" },
  { href: "/engineering/apps/inspection-intelligence/review", label: "Verification" },
] as const;

const MORE = [
  { href: "/engineering/apps/inspection-intelligence/templates", label: "Templates" },
  { href: "/engineering/apps/inspection-intelligence/assignments", label: "Assignments" },
  { href: "/engineering/apps/inspection-intelligence/field", label: "Field" },
  { href: "/engineering/apps/inspection-intelligence/condition", label: "Condition" },
  { href: "/engineering/apps/inspection-intelligence/release", label: "Governance" },
] as const;

export const INSPECTION_SHELL_SSR_VIEWPORT = "desktop" as const;

export type InspectionViewport =
  | "phone"
  | "tablet_portrait"
  | "tablet_landscape"
  | "desktop";

export function classifyInspectionViewport(
  width: number,
  height: number,
): InspectionViewport {
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
 * Inspection Intelligence operational shell — one host for desktop/tablet/phone.
 * Certification/release lives under Governance, not as a primary tab wall.
 */
export function InspectionIntelligenceShell({ children }: { children: React.ReactNode }) {
  const [viewport, setViewport] = useState<InspectionViewport>(
    INSPECTION_SHELL_SSR_VIEWPORT,
  );

  useEffect(() => {
    function syncViewport() {
      setViewport(classifyInspectionViewport(window.innerWidth, window.innerHeight));
    }
    syncViewport();
    window.addEventListener("resize", syncViewport);
    window.addEventListener("orientationchange", syncViewport);
    return () => {
      window.removeEventListener("resize", syncViewport);
      window.removeEventListener("orientationchange", syncViewport);
    };
  }, []);

  return (
    <div
      className="mx-auto max-w-6xl px-4 py-6"
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
        <h2 className="text-lg font-semibold text-slate-900">Inspections</h2>
        <p
          className="sr-only"
          data-testid="inspection-sync-readiness"
          aria-live="polite"
        >
          Inspection workflow — online · Offline sync enabled
        </p>
        <ModuleSectionNav links={PRIMARY} ariaLabel="Inspection Intelligence" />
        <nav className="mt-2 flex flex-wrap gap-3 text-xs text-slate-600" aria-label="More inspection tools">
          {MORE.map((link) => (
            <a key={link.href} href={link.href} className="inline-flex min-h-11 items-center hover:underline">
              {link.label}
            </a>
          ))}
        </nav>
      </header>
      {children}
    </div>
  );
}
