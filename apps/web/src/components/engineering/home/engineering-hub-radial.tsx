"use client";

import Link from "next/link";
import { ENGINEERING_HUB_BRANCHES } from "@/lib/engineering/project-workspace-ia";
import { persistEngineeringProjectFilter } from "@/hooks/use-engineering-project-filter";

type Props = {
  projectId: string;
};

/**
 * Central Engineering Hub — ten real, keyboard-accessible branch controls
 * arranged around RTB Engineering OS. Not a raster/image map.
 */
export function EngineeringHubRadial({ projectId }: Props) {
  const n = ENGINEERING_HUB_BRANCHES.length;
  return (
    <section
      className="eos-engineering-hub relative mx-auto flex min-h-[420px] w-full max-w-[560px] items-center justify-center"
      data-testid="home-engineering-hub"
      data-eos-hub-branch-count={String(n)}
      aria-label="Central Engineering Hub"
    >
      <div
        className="absolute inset-[12%] rounded-full border border-[color:var(--eos-gold,#c4a35a)]/35 bg-[color:var(--eos-navy,#0b1f3a)]/5"
        aria-hidden
      />
      <div
        className="relative z-10 flex h-36 w-36 flex-col items-center justify-center rounded-full border-2 border-[color:var(--eos-gold,#c4a35a)] bg-[color:var(--eos-navy,#0b1f3a)] text-center shadow-md"
        data-testid="home-hub-centre"
      >
        <span className="px-2 text-[11px] font-semibold uppercase tracking-wide text-[color:var(--eos-gold,#c4a35a)]">
          RTB
        </span>
        <span className="px-2 text-xs font-semibold leading-tight text-white">Engineering OS</span>
      </div>

      <ul className="absolute inset-0" data-testid="home-hub-branches" role="list">
        {ENGINEERING_HUB_BRANCHES.map((b, i) => {
          const angleDeg = -90 + (360 / n) * i;
          const rad = (angleDeg * Math.PI) / 180;
          const radius = 42; // % from centre
          const left = 50 + Math.cos(rad) * radius;
          const top = 50 + Math.sin(rad) * radius;
          const href = `/engineering/projects/${encodeURIComponent(projectId)}/${b.slug}`;
          return (
            <li
              key={b.id}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              <Link
                href={href}
                className="eos-hub-branch inline-flex max-w-[9.5rem] min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-center text-[11px] font-semibold leading-snug text-slate-900 shadow-sm hover:border-[color:var(--eos-gold,#c4a35a)] hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--eos-navy,#0b1f3a)]"
                data-testid={`home-hub-${b.id}`}
                aria-label={`${b.label} — open for current project`}
                onClick={() => persistEngineeringProjectFilter(projectId)}
              >
                {b.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
