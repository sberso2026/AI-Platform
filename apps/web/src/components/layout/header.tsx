"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, PageHeader, SearchInput, SPACING, cn } from "@rtb/ui";
import { Bell, LogOut, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { EosAiCore } from "@/components/layout/eos-ai-core";

interface HeaderProps {
  title: string;
  description?: string;
  showEngineeringChrome?: boolean;
}

const PROJECT_FILTER_KEY = "rtb.engineering.selectedProjectId";
const CONTROL_H = "h-12";

export function Header({ title, description, showEngineeringChrome }: HeaderProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<{ id: string; label: string }[]>([]);
  const [projectId, setProjectId] = useState("all");
  const [query, setQuery] = useState("");

  const engineeringChrome = showEngineeringChrome ?? true;
  const selectedLabel =
    projectId === "all"
      ? "All Projects"
      : projects.find((project) => project.id === projectId)?.label || "Project";

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(PROJECT_FILTER_KEY);
      if (stored) setProjectId(stored);
    } catch {
      // ignore
    }

    fetch("/api/engineering/projects")
      .then((r) => r.json())
      .then((json) => {
        const rows = Array.isArray(json.data) ? json.data : [];
        setProjects(
          rows.map((p: Record<string, unknown>) => ({
            id: String(p.id),
            label: `${p.project_code ?? ""} — ${p.project_name ?? ""}`.trim(),
          }))
        );
      })
      .catch(() => undefined);
  }, []);

  const projectOptions = useMemo(
    () => [{ id: "all", label: "All Projects" }, ...projects],
    [projects]
  );

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function onProjectChange(value: string) {
    setProjectId(value);
    try {
      sessionStorage.setItem(PROJECT_FILTER_KEY, value);
    } catch {
      // ignore
    }
    window.dispatchEvent(
      new CustomEvent("rtb:project-filter", { detail: { projectId: value === "all" ? null : value } })
    );
  }

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) {
      router.push("/engineering/search");
      return;
    }
    const params = new URLSearchParams({ q });
    if (projectId !== "all") params.set("projectId", projectId);
    router.push(`/engineering/search?${params.toString()}`);
  }

  return (
    <header
      className="flex min-h-[5rem] shrink-0 flex-col gap-4 border-b border-[color:var(--eos-border)] bg-[color:var(--eos-bg-secondary)] px-6 py-4 sm:px-8 lg:flex-row lg:items-center lg:gap-6 lg:justify-between"
      data-testid="app-header"
    >
      <PageHeader title={title} description={description} className="max-w-xl shrink-0" />

      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-3 lg:gap-3">
        {engineeringChrome && (
          <>
            <EosAiCore compact className="hidden xl:flex" projectLabel={selectedLabel} />
            <div
              className={cn(
                CONTROL_H,
                "flex shrink-0 items-center gap-2 rounded-lg border border-[color:var(--eos-border)] bg-[color:var(--eos-panel)] px-3"
              )}
              data-testid="workspace-selector"
            >
              <span className="hidden text-[0.8125rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--eos-text-secondary)] sm:inline">
                Workspace
              </span>
              <span className="text-[1rem] font-medium text-[color:var(--eos-text-primary)]">RTB Engineering</span>
            </div>

            <label className="sr-only" htmlFor="project-selector">
              Project filter
            </label>
            <select
              id="project-selector"
              data-testid="project-selector"
              className={cn(
                CONTROL_H,
                "eos-select max-w-[280px] shrink-0 px-3 text-[1rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--eos-accent)]"
              )}
              value={projectId}
              onChange={(e) => onProjectChange(e.target.value)}
              aria-label="Project"
            >
              {projectOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id === "all" ? "All Projects" : p.label || p.id}
                </option>
              ))}
            </select>

            <form
              onSubmit={onSearchSubmit}
              className={cn(
                "relative w-full min-w-[240px] flex-1 basis-full sm:basis-[320px] sm:min-w-[320px]",
                SPACING.globalSearchMax
              )}
              role="search"
              data-testid="global-search"
            >
              <SearchInput
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search projects, assets, documents, and risks"
              />
            </form>
          </>
        )}

        <div className="flex h-12 shrink-0 items-center gap-1 border-l border-[color:var(--eos-border)] pl-3 sm:pl-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 text-[color:var(--eos-text-secondary)] hover:text-[color:var(--eos-text-primary)]"
            aria-label="Notifications"
            onClick={() => router.push("/platform/notifications")}
          >
            <Bell className="h-5 w-5" />
          </Button>
          <span
            className="hidden h-12 items-center gap-2 rounded-lg px-2 text-[0.9375rem] text-[color:var(--eos-text-secondary)] lg:inline-flex"
            data-testid="header-user"
            aria-label="User profile"
          >
            <UserRound className="h-5 w-5" aria-hidden />
            <span>User</span>
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 text-[color:var(--eos-text-secondary)] hover:text-[color:var(--eos-text-primary)]"
            onClick={handleSignOut}
            aria-label="Sign out"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
