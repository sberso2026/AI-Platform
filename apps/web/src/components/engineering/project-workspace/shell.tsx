"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  PROJECT_WORKSPACE_NAV_GROUPS,
  resolveWorkspaceSlug,
  workspaceHref,
} from "@/lib/engineering/project-workspace-ia";
import { persistEngineeringProjectFilter } from "@/hooks/use-engineering-project-filter";
import { PilotFeedbackPanel } from "./pilot-feedback";
import { useUnsavedChangesGuard } from "./unsaved-changes-guard";

/** Compact pilot feedback is gated; never permanent primary nav. */
export function isPilotFeedbackEnabled(): boolean {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_EOS_PILOT_FEEDBACK === "1") {
    return true;
  }
  if (typeof window !== "undefined") {
    try {
      return window.localStorage.getItem("eos.pilot.feedback") === "1";
    } catch {
      return false;
    }
  }
  return false;
}

export function ProjectWorkspaceShell({
  projectId,
  children,
  projectLabel,
  setupStatus,
  contextHeader,
}: {
  projectId: string;
  children: ReactNode;
  projectLabel?: string;
  setupStatus?: string;
  contextHeader?: ReactNode;
}) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackEnabled, setFeedbackEnabled] = useState(false);
  const { isDirty, requestNavigation } = useUnsavedChangesGuard();

  useEffect(() => {
    persistEngineeringProjectFilter(projectId);
  }, [projectId]);

  useEffect(() => {
    setFeedbackEnabled(isPilotFeedbackEnabled());
  }, []);

  const activeSlug = useMemo(() => {
    const base = `/engineering/projects/${projectId}`;
    if (pathname === base || pathname === `${base}/`) return "";
    if (pathname.startsWith(`${base}/`)) {
      const raw = pathname.slice(base.length + 1).split("/")[0] ?? "";
      return resolveWorkspaceSlug(raw);
    }
    return "";
  }, [pathname, projectId]);

  return (
    <div
      className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row lg:gap-0"
      data-testid="project-workspace-shell"
      data-eos-visual="approved-engineering"
    >
      <div className="lg:hidden">
        <button
          type="button"
          className="inline-flex min-h-11 items-center rounded-md border border-[color:var(--eos-border,#1e3a5f)] bg-[color:var(--eos-navy,#0b1f3a)] px-3 text-sm text-slate-100"
          aria-expanded={navOpen}
          aria-controls="project-workspace-nav"
          onClick={() => setNavOpen((v) => !v)}
        >
          {navOpen ? "Hide project navigation" : "Show project navigation"}
        </button>
      </div>

      <aside
        id="project-workspace-nav"
        className={`${
          navOpen ? "flex" : "hidden"
        } w-full shrink-0 flex-col overflow-hidden border border-[color:var(--eos-border,#1e3a5f)] bg-[color:var(--eos-navy,#0b1f3a)] lg:flex lg:w-64 lg:rounded-none lg:border-y-0 lg:border-l-0 lg:border-r`}
        aria-label="Project workspace navigation"
        data-testid="project-workspace-nav"
      >
        <div className="shrink-0 space-y-1 border-b border-[color:var(--eos-border,#1e3a5f)] p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--eos-gold,#c4a35a)]">
            Project
          </p>
          <p className="text-sm font-medium text-white">{projectLabel ?? projectId}</p>
          <span
            className="inline-flex items-center text-[10px] uppercase tracking-wide text-slate-500"
            data-testid="pilot-mode-indicator"
          >
            Controlled pilot
          </span>
          {setupStatus === "PROJECT_SETUP_INCOMPLETE" ? (
            <span
              className="ml-1 inline-flex items-center rounded border border-rose-500/40 bg-rose-500/10 px-2 py-0.5 text-[11px] font-medium text-rose-200"
              data-testid="setup-readiness-indicator"
            >
              Setup incomplete
            </span>
          ) : null}
          {isDirty ? (
            <span
              className="ml-1 inline-flex items-center rounded border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-100"
              data-testid="unsaved-dirty-indicator"
            >
              Unsaved changes
            </span>
          ) : null}
        </div>

        <nav
          className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3"
          aria-label="Grouped project capabilities"
          data-testid="project-workspace-nav-scroll"
        >
          {PROJECT_WORKSPACE_NAV_GROUPS.map((group) => {
            if (group.advanced) {
              return (
                <div key={group.id}>
                  <button
                    type="button"
                    className="mb-1 flex w-full items-center justify-between text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-300"
                    aria-expanded={advancedOpen}
                    data-testid="nav-advanced-toggle"
                    onClick={() => setAdvancedOpen((v) => !v)}
                  >
                    <span>{group.label}</span>
                    <span aria-hidden>{advancedOpen ? "−" : "+"}</span>
                  </button>
                  {advancedOpen ? (
                    <ul className="space-y-0.5">
                      {group.items.map((item) => (
                        <NavLink
                          key={item.id}
                          projectId={projectId}
                          item={item}
                          active={activeSlug === item.slug}
                          isDirty={isDirty}
                          requestNavigation={requestNavigation}
                          onNavigate={() => setNavOpen(false)}
                        />
                      ))}
                    </ul>
                  ) : null}
                </div>
              );
            }
            return (
              <div key={group.id}>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  {group.label}
                </p>
                <ul className="space-y-0.5">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.id}
                      projectId={projectId}
                      item={item}
                      active={activeSlug === item.slug}
                      isDirty={isDirty}
                      requestNavigation={requestNavigation}
                      onNavigate={() => setNavOpen(false)}
                    />
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>

        {feedbackEnabled ? (
          <div className="shrink-0 border-t border-[color:var(--eos-border,#1e3a5f)] p-3">
            <button
              type="button"
              className="inline-flex min-h-9 w-full items-center justify-center rounded-md border border-slate-600 text-xs text-slate-200 hover:bg-slate-800"
              data-testid="pilot-feedback-control"
              aria-expanded={feedbackOpen}
              onClick={() => setFeedbackOpen((v) => !v)}
            >
              Feedback
            </button>
            {feedbackOpen ? (
              <div className="mt-2" data-testid="pilot-feedback-panel">
                <PilotFeedbackPanel projectId={projectId} page={activeSlug || "overview"} />
              </div>
            ) : null}
          </div>
        ) : null}
      </aside>

      <div
        className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[color:var(--eos-surface,#f4f6f9)]"
        data-testid="project-workspace-content"
      >
        {contextHeader ? (
          <div
            className="shrink-0 border-b border-slate-200 bg-white px-4 py-2 text-sm text-slate-800"
            data-testid="engineering-context-header"
          >
            {contextHeader}
          </div>
        ) : null}
        <div
          className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5"
          data-testid="project-workspace-content-scroll"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function NavLink({
  projectId,
  item,
  active,
  isDirty,
  requestNavigation,
  onNavigate,
}: {
  projectId: string;
  item: { id: string; slug: string; label: string };
  active: boolean;
  isDirty: boolean;
  requestNavigation: (href: string) => void;
  onNavigate: () => void;
}) {
  const href = workspaceHref(projectId, item.slug);
  return (
    <li>
      <Link
        href={href}
        className={`block rounded-md px-2 py-2 text-sm min-h-10 leading-6 ${
          active
            ? "bg-[color:var(--eos-gold,#c4a35a)]/20 text-white ring-1 ring-[color:var(--eos-gold,#c4a35a)]/50"
            : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
        }`}
        aria-current={active ? "page" : undefined}
        data-testid={`nav-${item.id}`}
        onClick={(e) => {
          if (!isDirty) {
            onNavigate();
            return;
          }
          e.preventDefault();
          onNavigate();
          requestNavigation(href);
        }}
      >
        {item.label}
      </Link>
    </li>
  );
}
