"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ContextTabs, ProvenanceLink } from "@/components/engineering/operational";

const primaryTabs = [
  { href: "/engineering/apps/project-intelligence", label: "Project status", exact: true, testId: "project-intelligence-nav-overview" },
  { href: "/engineering/apps/project-intelligence/documents", label: "Documents", testId: "project-intelligence-nav-documents" },
  { href: "/engineering/apps/project-intelligence/meetings", label: "Meetings", testId: "project-intelligence-nav-meetings" },
  { href: "/engineering/apps/project-intelligence/findings", label: "Findings", testId: "project-intelligence-nav-findings" },
  { href: "/engineering/apps/project-intelligence/reports", label: "Reports", testId: "project-intelligence-nav-reports" },
  { href: "/engineering/apps/project-intelligence/reasoning", label: "AI Project Analyst", testId: "project-intelligence-nav-reasoning" },
] as const;

const moreTabs = [
  { href: "/engineering/apps/project-intelligence/knowledge", label: "Knowledge", testId: "project-intelligence-nav-knowledge" },
  { href: "/engineering/apps/project-intelligence/health", label: "Health", testId: "project-intelligence-nav-health" },
  { href: "/engineering/apps/project-intelligence/settings", label: "Governance", testId: "project-intelligence-nav-settings" },
  { href: "/engineering/apps/project-intelligence/migration", label: "Migration", testId: "project-intelligence-nav-migration" },
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
  const pathname = usePathname() ?? "";
  const params = useSearchParams();
  const requestedState = params.get("certState");
  const resolvedState: ProjectIntelligenceShellState =
    requestedState && requestedState in stateMessages
      ? (requestedState as Exclude<ProjectIntelligenceShellState, "ready">)
      : state;
  const ready = resolvedState === "ready";

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50" data-testid="project-intelligence-shell">
      <header className="border-b border-slate-200 bg-white px-4 py-5 sm:px-8">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Engineering OS</p>
        <h1 className="mt-1 text-xl font-semibold text-slate-900">Project Intelligence</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          Project status, schedule and cost signals, risks, queries, and recent activity — from
          recorded engineering evidence.
        </p>
        <div className="mt-2">
          <ProvenanceLink
            href="/engineering/apps/project-intelligence/settings"
            label="About this insight · Methodology · Governance"
          />
        </div>
        <ContextTabs links={primaryTabs} ariaLabel="Project Intelligence" />
        <nav className="mt-2 flex flex-wrap gap-3 text-xs text-slate-600" aria-label="Project Intelligence more">
          {moreTabs.map((tab) => {
            const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                data-testid={tab.testId}
                className={active ? "font-semibold text-slate-900" : "hover:underline"}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="px-4 py-6 sm:px-8">
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
