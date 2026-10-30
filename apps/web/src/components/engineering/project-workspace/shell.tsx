"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  PROJECT_WORKSPACE_NAV_GROUPS,
  workspaceHref,
} from "@/lib/engineering/project-workspace-ia";
import { persistEngineeringProjectFilter } from "@/hooks/use-engineering-project-filter";
import { PilotFeedbackPanel } from "./pilot-feedback";
import { useUnsavedChangesGuard } from "./unsaved-changes-guard";

export function ProjectWorkspaceShell({
  projectId,
  children,
  projectLabel,
  setupStatus,
}: {
  projectId: string;
  children: ReactNode;
  projectLabel?: string;
  setupStatus?: string;
}) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  const { isDirty, requestNavigation } = useUnsavedChangesGuard();

  useEffect(() => {
    persistEngineeringProjectFilter(projectId);
  }, [projectId]);

  const activeSlug = useMemo(() => {
    const base = `/engineering/projects/${projectId}`;
    if (pathname === base || pathname === `${base}/`) return "";
    if (pathname.startsWith(`${base}/`)) {
      return pathname.slice(base.length + 1).split("/")[0] ?? "";
    }
    return "";
  }, [pathname, projectId]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row" data-testid="project-workspace-shell">
      <div className="lg:hidden">
        <button
          type="button"
          className="inline-flex min-h-11 items-center rounded-md border border-slate-600 bg-slate-900 px-3 text-sm text-slate-100"
          aria-expanded={navOpen}
          aria-controls="project-workspace-nav"
          onClick={() => setNavOpen((v) => !v)}
        >
          {navOpen ? "Hide project navigation" : "Show project navigation"}
        </button>
      </div>

      <aside
        id="project-workspace-nav"
        className={`${navOpen ? "block" : "hidden"} w-full shrink-0 lg:block lg:w-64`}
        aria-label="Project workspace navigation"
        data-testid="project-workspace-nav"
      >
        <div className="rounded-lg border border-slate-700 bg-slate-950/80 p-3">
          <div className="mb-3 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Project</p>
            <p className="text-sm font-medium text-slate-100">{projectLabel ?? projectId}</p>
            <span
              className="inline-flex items-center rounded border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-200"
              data-testid="pilot-mode-indicator"
            >
              eos-controlled-pilot
            </span>
            {setupStatus === "PROJECT_SETUP_INCOMPLETE" ? (
              <span
                className="ml-2 inline-flex items-center rounded border border-rose-500/40 bg-rose-500/10 px-2 py-0.5 text-[11px] font-medium text-rose-200"
                data-testid="setup-readiness-indicator"
              >
                PROJECT_SETUP_INCOMPLETE
              </span>
            ) : null}
            {isDirty ? (
              <span
                className="ml-2 inline-flex items-center rounded border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-100"
                data-testid="unsaved-dirty-indicator"
              >
                Unsaved changes
              </span>
            ) : null}
          </div>

          <nav className="space-y-4" aria-label="Grouped project capabilities">
            {PROJECT_WORKSPACE_NAV_GROUPS.map((group) => (
              <div key={group.id}>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  {group.label}
                </p>
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const href = workspaceHref(projectId, item.slug);
                    const active = activeSlug === item.slug;
                    return (
                      <li key={item.id}>
                        <Link
                          href={href}
                          className={`block rounded-md px-2 py-2 text-sm min-h-11 leading-7 ${
                            active
                              ? "bg-slate-700 text-white"
                              : "text-slate-300 hover:bg-slate-800 hover:text-white"
                          }`}
                          aria-current={active ? "page" : undefined}
                          data-testid={`nav-${item.id}`}
                          onClick={(e) => {
                            if (!isDirty) {
                              setNavOpen(false);
                              return;
                            }
                            e.preventDefault();
                            setNavOpen(false);
                            requestNavigation(href);
                          }}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          <div className="mt-4 border-t border-slate-800 pt-3">
            <PilotFeedbackPanel projectId={projectId} page={activeSlug || "overview"} />
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1" data-testid="project-workspace-content">
        {children}
      </div>
    </div>
  );
}
