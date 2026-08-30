"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Activity,
  ArrowRightLeft,
  BarChart3,
  CalendarClock,
  CircleDollarSign,
  ClipboardList,
  FileText,
  LineChart,
  MessageSquare,
  Network,
  SearchCheck,
  Settings,
  ShieldAlert,
  Sparkles,
  Bot,
  Users,
} from "lucide-react";

const primaryTabs = [
  { href: "/engineering/apps/project-intelligence", label: "Command Centre", icon: BarChart3 },
  {
    href: "/engineering/apps/project-intelligence/schedule",
    label: "Schedule Intelligence",
    icon: CalendarClock,
  },
  {
    href: "/engineering/apps/project-intelligence/cost-progress",
    label: "Cost & Progress",
    icon: CircleDollarSign,
  },
  {
    href: "/engineering/apps/project-intelligence/risk-change",
    label: "Risk & Change",
    icon: ShieldAlert,
  },
  {
    href: "/engineering/apps/project-intelligence/queries-decisions",
    label: "Queries & Decisions",
    icon: MessageSquare,
  },
  {
    href: "/engineering/apps/project-intelligence/forecasting",
    label: "Forecasting",
    icon: LineChart,
  },
  {
    href: "/engineering/apps/project-intelligence/analyst",
    label: "AI Project Analyst",
    icon: Bot,
  },
  {
    href: "/engineering/apps/project-intelligence/documents",
    label: "Document Intelligence",
    icon: FileText,
  },
  {
    href: "/engineering/apps/project-intelligence/meetings",
    label: "Meeting Intelligence",
    icon: Users,
  },
  {
    href: "/engineering/apps/project-intelligence/findings",
    label: "Findings Intelligence",
    icon: SearchCheck,
  },
  {
    href: "/engineering/apps/project-intelligence/reports",
    label: "Reporting Intelligence",
    icon: ClipboardList,
  },
  {
    href: "/engineering/apps/project-intelligence/knowledge",
    label: "Knowledge Intelligence",
    icon: Network,
  },
  {
    href: "/engineering/apps/project-intelligence/reasoning",
    label: "Reasoning Assistant",
    icon: Sparkles,
  },
] as const;

const secondaryTabs = [
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

function navTestId(href: string): string | undefined {
  if (href === "/engineering/apps/project-intelligence") return "project-intelligence-nav-overview";
  if (href.endsWith("/schedule")) return "project-intelligence-nav-schedule";
  if (href.endsWith("/cost-progress")) return "project-intelligence-nav-cost-progress";
  if (href.endsWith("/risk-change")) return "project-intelligence-nav-risk-change";
  if (href.endsWith("/queries-decisions")) return "project-intelligence-nav-queries-decisions";
  if (href.endsWith("/forecasting")) return "project-intelligence-nav-forecasting";
  if (href.endsWith("/analyst")) return "project-intelligence-nav-analyst";
  if (href.endsWith("/documents")) return "project-intelligence-nav-documents";
  if (href.endsWith("/meetings")) return "project-intelligence-nav-meetings";
  if (href.endsWith("/findings")) return "project-intelligence-nav-findings";
  if (href.endsWith("/reports")) return "project-intelligence-nav-reports";
  if (href.endsWith("/knowledge")) return "project-intelligence-nav-knowledge";
  if (href.endsWith("/reasoning")) return "project-intelligence-nav-reasoning";
  if (href.endsWith("/migration")) return "project-intelligence-nav-migration";
  if (href.endsWith("/health")) return "project-intelligence-nav-health";
  if (href.endsWith("/settings")) return "project-intelligence-nav-settings";
  return undefined;
}

function NavLink({
  href,
  label,
  icon: Icon,
  pathname,
  projectId,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  pathname: string;
  projectId?: string | null;
}) {
  const active =
    href === "/engineering/apps/project-intelligence"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);
  const testId = navTestId(href);
  const nextHref = projectId ? `${href}?projectId=${encodeURIComponent(projectId)}` : href;
  return (
    <Link
      href={nextHref}
      {...(testId ? { "data-testid": testId } : {})}
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
}

export function ProjectIntelligenceShell({
  children,
  state = "ready",
}: {
  children: React.ReactNode;
  state?: ProjectIntelligenceShellState;
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  const projectId = params.get("projectId");
  const requestedState = params.get("certState");
  const resolvedState: ProjectIntelligenceShellState =
    requestedState && requestedState in stateMessages
      ? (requestedState as Exclude<ProjectIntelligenceShellState, "ready">)
      : state;
  const ready = resolvedState === "ready";

  return (
    <div
      className="min-h-[calc(100vh-4rem)] bg-slate-100 lg:grid lg:grid-cols-[15rem_1fr]"
      data-testid="project-intelligence-shell"
    >
      <aside className="bg-slate-950 px-4 py-6 text-slate-100">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Engineering OS</p>
        <h1 className="mt-2 text-xl font-semibold">Project Intelligence</h1>
        <p className="mt-2 text-sm text-slate-400">
          Production module — documents, meetings, findings, reporting, knowledge, and reasoning.
        </p>
        <nav className="mt-8 space-y-1" aria-label="Project Intelligence features">
          {primaryTabs.map((tab) => (
            <NavLink key={tab.href} {...tab} pathname={pathname} projectId={projectId} />
          ))}
        </nav>
        <p className="mt-8 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Operations
        </p>
        <nav className="mt-2 space-y-1" aria-label="Project Intelligence operations">
          {secondaryTabs.map((tab) => (
            <NavLink key={tab.href} {...tab} pathname={pathname} projectId={projectId} />
          ))}
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
