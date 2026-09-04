"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  ArrowRightLeft,
  BarChart3,
  Bot,
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
  Users,
  Wrench,
} from "lucide-react";
import {
  PI_BASE_PATH,
  PiProjectContextProvider,
  PiProjectSelector,
  usePiProjectContext,
  withPiProjectQuery,
} from "./pi-project-context";

const primaryTabs = [
  { href: PI_BASE_PATH, label: "Overview", icon: BarChart3 },
  { href: `${PI_BASE_PATH}/schedule`, label: "Schedule", icon: CalendarClock },
  { href: `${PI_BASE_PATH}/cost-progress`, label: "Cost", icon: CircleDollarSign },
  { href: `${PI_BASE_PATH}/risk-change`, label: "Risk & Change", icon: ShieldAlert },
  { href: `${PI_BASE_PATH}/engineering`, label: "Engineering", icon: Wrench },
  { href: `${PI_BASE_PATH}/decisions`, label: "Decisions", icon: MessageSquare },
  { href: `${PI_BASE_PATH}/reports`, label: "Reports", icon: ClipboardList },
] as const;

const askTab = {
  href: `${PI_BASE_PATH}/analyst`,
  label: "Ask Project Intelligence",
  icon: Bot,
} as const;

const drilldownTabs = [
  { href: `${PI_BASE_PATH}/documents`, label: "Documents", icon: FileText },
  { href: `${PI_BASE_PATH}/meetings`, label: "Meetings", icon: Users },
  { href: `${PI_BASE_PATH}/findings`, label: "Findings", icon: SearchCheck },
  { href: `${PI_BASE_PATH}/queries-decisions`, label: "Queries", icon: MessageSquare },
] as const;

const diagnosticsTabs = [
  { href: `${PI_BASE_PATH}/diagnostics`, label: "Diagnostics", icon: Activity },
  { href: `${PI_BASE_PATH}/knowledge`, label: "Knowledge", icon: Network },
  { href: `${PI_BASE_PATH}/health`, label: "Health", icon: Activity },
  { href: `${PI_BASE_PATH}/settings`, label: "Governance", icon: Settings },
  { href: `${PI_BASE_PATH}/migration`, label: "Migration", icon: ArrowRightLeft },
  { href: `${PI_BASE_PATH}/reasoning`, label: "Reasoning", icon: Sparkles },
  { href: `${PI_BASE_PATH}/forecasting`, label: "Forecasting", icon: LineChart },
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
  degraded: "Project Intelligence is degraded. Review diagnostics before continuing.",
  failed: "Project Intelligence is currently unavailable.",
};

function navTestId(href: string): string | undefined {
  if (href === PI_BASE_PATH) return "project-intelligence-nav-overview";
  if (href.endsWith("/schedule")) return "project-intelligence-nav-schedule";
  if (href.endsWith("/cost-progress")) return "project-intelligence-nav-cost-progress";
  if (href.endsWith("/risk-change")) return "project-intelligence-nav-risk-change";
  if (href.endsWith("/engineering")) return "project-intelligence-nav-engineering";
  if (href.endsWith("/decisions")) return "project-intelligence-nav-decisions";
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
  if (href.endsWith("/diagnostics")) return "project-intelligence-nav-diagnostics";
  return undefined;
}

function isActive(href: string, pathname: string): boolean {
  if (href === PI_BASE_PATH) return pathname === href;
  if (href.endsWith("/engineering")) {
    return (
      pathname === href ||
      pathname.startsWith(`${href}/`) ||
      pathname.startsWith(`${PI_BASE_PATH}/documents`) ||
      pathname.startsWith(`${PI_BASE_PATH}/meetings`) ||
      pathname.startsWith(`${PI_BASE_PATH}/findings`)
    );
  }
  if (href.endsWith("/decisions")) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  href,
  label,
  icon: Icon,
  pathname,
  projectId,
  emphasis = false,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  pathname: string;
  projectId?: string | null;
  emphasis?: boolean;
}) {
  const active = isActive(href, pathname);
  const testId = navTestId(href);
  const nextHref = projectId ? `${href}?projectId=${encodeURIComponent(projectId)}` : href;
  return (
    <Link
      href={nextHref}
      {...(testId ? { "data-testid": testId } : {})}
      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
        active
          ? "bg-cyan-400/15 font-medium text-cyan-200"
          : emphasis
            ? "border border-cyan-400/30 text-cyan-100 hover:bg-slate-800"
            : "text-slate-300 hover:bg-slate-800 hover:text-white"
      }`}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}

function ProjectIntelligenceShellInner({
  children,
  state = "ready",
}: {
  children: React.ReactNode;
  state?: ProjectIntelligenceShellState;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const { projectId, selectedProject, allProjects } = usePiProjectContext();
  const requestedState = params.get("certState");
  const resolvedState: ProjectIntelligenceShellState =
    requestedState && requestedState in stateMessages
      ? (requestedState as Exclude<ProjectIntelligenceShellState, "ready">)
      : state;
  const ready = resolvedState === "ready";
  const overviewHref = withPiProjectQuery(PI_BASE_PATH, projectId);

  return (
    <div
      className="flex h-full min-h-0 flex-1 overflow-hidden bg-slate-100"
      data-testid="project-intelligence-shell"
    >
      <aside className="hidden h-full min-h-0 w-60 shrink-0 overflow-y-auto bg-slate-950 px-4 py-6 text-slate-100 lg:block">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Project Intelligence</p>
        <h1 className="mt-2 text-xl font-semibold">Management view</h1>
        <p className="mt-2 text-sm text-slate-400">
          Reasoning over existing project evidence. Systems of record remain authoritative.
        </p>
        <nav className="mt-8 space-y-1" aria-label="Project Intelligence features">
          {primaryTabs.map((tab) => (
            <NavLink key={tab.href} {...tab} pathname={pathname} projectId={projectId} />
          ))}
        </nav>
        <p className="mt-8 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-500">Ask</p>
        <nav className="mt-2 space-y-1" aria-label="Ask Project Intelligence">
          <NavLink {...askTab} pathname={pathname} projectId={projectId} emphasis />
        </nav>
        <p className="mt-8 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Records
        </p>
        <nav className="mt-2 space-y-1" aria-label="Project Intelligence drill-down">
          {drilldownTabs.map((tab) => (
            <NavLink key={tab.href} {...tab} pathname={pathname} projectId={projectId} />
          ))}
        </nav>
        <p className="mt-8 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Administration / Diagnostics
        </p>
        <nav className="mt-2 space-y-1" aria-label="Project Intelligence diagnostics">
          <NavLink
            href={`${PI_BASE_PATH}/diagnostics`}
            label="Diagnostics"
            icon={Activity}
            pathname={pathname}
            projectId={projectId}
          />
          <details className="rounded-md px-1 py-1 text-slate-400">
            <summary className="cursor-pointer px-2 py-1 text-[0.7rem] uppercase tracking-wide">Advanced</summary>
            <div className="mt-1 space-y-1">
              {diagnosticsTabs
                .filter((tab) => !tab.href.endsWith("/diagnostics"))
                .map((tab) => (
                  <NavLink key={tab.href} {...tab} pathname={pathname} projectId={projectId} />
                ))}
            </div>
          </details>
        </nav>
      </aside>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white">
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 lg:px-8">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <button
              type="button"
              data-testid="pi-shell-back"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-slate-950"
              onClick={() => {
                if (typeof window !== "undefined" && window.history.length > 1) router.back();
                else router.push(overviewHref);
              }}
            >
              <ArrowLeft className="size-4" />
              Back
            </button>
            <Link href={overviewHref} className="text-sm text-cyan-800 hover:underline" data-testid="pi-shell-return">
              Return
            </Link>
            <p className="truncate text-sm text-slate-600" data-testid="pi-shell-project-label">
              {allProjects
                ? "All Projects"
                : selectedProject
                  ? `Project: ${selectedProject.project_name}`
                  : "Project Intelligence"}
            </p>
          </div>
          <PiProjectSelector className="min-w-[14rem] max-w-md text-sm text-slate-700" />
        </header>
        <main
          className="page-main min-h-0 flex-1 overflow-y-auto bg-white p-6 lg:p-10"
          data-testid="project-intelligence-main"
        >
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
    </div>
  );
}

export function ProjectIntelligenceShell({
  children,
  state = "ready",
}: {
  children: React.ReactNode;
  state?: ProjectIntelligenceShellState;
}) {
  return (
    <PiProjectContextProvider>
      <ProjectIntelligenceShellInner state={state}>{children}</ProjectIntelligenceShellInner>
    </PiProjectContextProvider>
  );
}
