"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  CheckSquare,
  ChevronRight,
  ClipboardList,
  DraftingCompass,
  Factory,
  FileStack,
  GitBranch,
  GitPullRequest,
  HardHat,
  Package,
} from "lucide-react";
import {
  ENGINEERING_HUB_BRANCHES,
  ENGINEERING_HUB_CENTRAL_IMAGE_SRC,
} from "@/lib/engineering/project-workspace-ia";
import { persistEngineeringProjectFilter } from "@/hooks/use-engineering-project-filter";

type Props = {
  projectId: string;
};

const BRANCH_ICONS: Record<(typeof ENGINEERING_HUB_BRANCHES)[number]["icon"], LucideIcon> = {
  ClipboardList,
  DraftingCompass,
  Package,
  GitBranch,
  GitPullRequest,
  CheckSquare,
  FileStack,
  Factory,
  HardHat,
  BookOpen,
};

/**
 * Central Engineering Hub — industrial decorative centre + ten real DOM branch cards.
 * Gold connector graphics are presentational only (not the Relationship Graph).
 */
export function EngineeringHubRadial({ projectId }: Props) {
  const n = ENGINEERING_HUB_BRANCHES.length;
  const connectorPaths = ENGINEERING_HUB_BRANCHES.map((_, i) => {
    const angleDeg = -90 + (360 / n) * i;
    const rad = (angleDeg * Math.PI) / 180;
    const x2 = 50 + Math.cos(rad) * 34;
    const y2 = 50 + Math.sin(rad) * 34;
    return { x2, y2, i };
  });

  return (
    <section
      className="eos-engineering-hub relative mx-auto flex min-h-[520px] w-full max-w-[640px] items-center justify-center"
      data-testid="home-engineering-hub"
      data-eos-hub-branch-count={String(n)}
      data-eos-hub-industrial-image="yes"
      data-eos-hub-connectors="presentational"
      aria-label="Central Engineering Hub"
    >
      {/* Presentational connector ring — NOT relationship-graph data */}
      <svg
        className="pointer-events-none absolute inset-[8%] z-0"
        viewBox="0 0 100 100"
        aria-hidden
        data-testid="home-hub-connectors"
        data-eos-hub-connector-data-model="no"
      >
        <circle
          cx="50"
          cy="50"
          r="22"
          fill="none"
          stroke="rgba(56, 189, 248, 0.28)"
          strokeWidth="0.35"
        />
        <circle
          cx="50"
          cy="50"
          r="28"
          fill="none"
          stroke="rgba(196, 163, 90, 0.35)"
          strokeWidth="0.4"
          strokeDasharray="1.2 1.6"
        />
        {connectorPaths.map(({ x2, y2, i }) => (
          <g key={`conn-${i}`}>
            <line
              x1="50"
              y1="50"
              x2={x2}
              y2={y2}
              stroke="rgba(196, 163, 90, 0.55)"
              strokeWidth="0.45"
            />
            <circle cx={x2} cy={y2} r="0.9" fill="rgba(196, 163, 90, 0.9)" />
          </g>
        ))}
      </svg>

      <div
        className="eos-hub-centre relative z-10 flex h-[11.5rem] w-[11.5rem] flex-col items-center justify-center overflow-hidden rounded-full border-2 border-[color:var(--eos-gold,#c4a35a)] shadow-[0_0_0_4px_rgba(56,189,248,0.18),0_12px_28px_rgba(11,31,58,0.35)] sm:h-[13rem] sm:w-[13rem]"
        data-testid="home-hub-centre"
      >
        {/* Decorative industrial plant — labels live in DOM branch cards, not in this image */}
        <img
          src={ENGINEERING_HUB_CENTRAL_IMAGE_SRC}
          alt=""
          width={208}
          height={208}
          className="absolute inset-0 h-full w-full object-cover"
          data-testid="home-hub-industrial-image"
          data-eos-hub-central-image-decorative="yes"
          decoding="async"
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(11,31,58,0.35)_0%,rgba(11,31,58,0.78)_62%,rgba(6,12,24,0.92)_100%)]"
          aria-hidden
          data-testid="home-hub-navy-overlay"
        />
        <div className="relative z-10 px-3 text-center">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--eos-gold,#c4a35a)]">
            RTB
          </span>
          <span className="mt-0.5 block text-sm font-semibold leading-tight text-white sm:text-base">
            Engineering OS
          </span>
          <span className="mt-1 block text-[10px] leading-snug text-sky-100/90">
            Process · structural · multi-discipline
          </span>
        </div>
      </div>

      <ul className="absolute inset-0 z-20" data-testid="home-hub-branches" role="list">
        {ENGINEERING_HUB_BRANCHES.map((b, i) => {
          const angleDeg = -90 + (360 / n) * i;
          const rad = (angleDeg * Math.PI) / 180;
          const radius = 44;
          const left = 50 + Math.cos(rad) * radius;
          const top = 50 + Math.sin(rad) * radius;
          const href = `/engineering/projects/${encodeURIComponent(projectId)}/${b.slug}`;
          const Icon = BRANCH_ICONS[b.icon];
          return (
            <li
              key={b.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              <Link
                href={href}
                className="eos-hub-branch group flex w-[9.75rem] min-h-[3.25rem] flex-col gap-0.5 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-left shadow-sm transition hover:border-[color:var(--eos-gold,#c4a35a)] hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--eos-navy,#0b1f3a)] sm:w-[10.5rem]"
                data-testid={`home-hub-${b.id}`}
                aria-label={`${b.label}: ${b.description}`}
                onClick={() => persistEngineeringProjectFilter(projectId)}
              >
                <span className="flex items-start gap-1.5">
                  <Icon
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--eos-navy,#0b1f3a)]"
                    aria-hidden
                    data-testid={`home-hub-icon-${b.id}`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] font-semibold leading-snug text-slate-900">
                      {b.label}
                    </span>
                    <span className="mt-0.5 block text-[9px] leading-snug text-slate-600">
                      {b.description}
                    </span>
                  </span>
                  <ChevronRight
                    className="mt-0.5 h-3 w-3 shrink-0 text-slate-400 group-hover:text-[color:var(--eos-gold,#c4a35a)]"
                    aria-hidden
                  />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
