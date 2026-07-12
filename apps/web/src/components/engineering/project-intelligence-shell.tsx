"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Activity, ArrowRightLeft, BarChart3, Settings } from "lucide-react";

const tabs = [
  { href: "/engineering/apps/project-intelligence", label: "Overview", icon: BarChart3 },
  { href: "/engineering/apps/project-intelligence/migration", label: "Migration", icon: ArrowRightLeft },
  { href: "/engineering/apps/project-intelligence/health", label: "Health", icon: Activity },
  { href: "/engineering/apps/project-intelligence/settings", label: "Settings", icon: Settings },
] as const;

export type ProjectIntelligenceShellState =
  | "loading"
  | "unauthorized"
  | "not-installed"
  | "licence-suspended"
  | "seat-unassigned"
  | "workspace-unassigned"
  | "configuration-incomplete"
  | "degraded"
  | "failed"
  | "ready";

const stateMessages: Record<Exclude<ProjectIntelligenceShellState, "ready">, string> = {
  loading: "Checking Project Intelligence access…",
  unauthorized: "You are not authorized to access Project Intelligence.",
  "not-installed": "Project Intelligence is not installed for this workspace.",
  "licence-suspended": "The Project Intelligence licence is suspended.",
  "seat-unassigned": "A Project Intelligence seat is required.",
  "workspace-unassigned": "Select a workspace assigned to Project Intelligence.",
  "configuration-incomplete": "Project Intelligence configuration is incomplete.",
  degraded: "Project Intelligence is degraded. Review health before continuing.",
  failed: "Project Intelligence is currently unavailable.",
};

export function ProjectIntelligenceShell({
  children,
  state = "ready",
}: {
  children: React.ReactNode;
  state?: ProjectIntelligenceShellState;
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  const requestedState = params.get("certState");
  const resolvedState: ProjectIntelligenceShellState =
    requestedState && requestedState in stateMessages
      ? requestedState as Exclude<ProjectIntelligenceShellState, "ready">
      : state;
  const ready = resolvedState === "ready";

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-100 lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="bg-slate-950 px-4 py-6 text-slate-100">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Engineering OS</p>
        <h1 className="mt-2 text-xl font-semibold">Project Intelligence</h1>
        <p className="mt-2 text-sm text-slate-400">Migration review and project state insight.</p>
        <nav className="mt-8 space-y-1" aria-label="Project Intelligence">
          {tabs.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                {...(href.endsWith("/migration")
                  ? { "data-testid": "project-intelligence-nav-migration" }
                  : href === "/engineering/apps/project-intelligence"
                    ? { "data-testid": "project-intelligence-nav-overview" }
                    : {})}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                  active
                    ? "bg-cyan-400/15 font-medium text-cyan-200"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="bg-white p-6 lg:p-10">
        {!ready && (
          <div
            data-testid={`project-intelligence-state-${resolvedState}`}
            role={resolvedState === "loading" ? "status" : "alert"}
            className="mb-6 rounded-md border border-amber-300 bg-amber-50 p-4 text-amber-950"
          >
            {stateMessages[resolvedState]}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
