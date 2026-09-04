"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { fetchPiJson, PiLoadError, PI_UNAVAILABLE } from "@/lib/project-intelligence/pi-api";

export const PI_PROJECT_STORAGE_KEY = "pi.selectedProjectId";
export const PI_ALL_PROJECTS = "__all__";
export const PI_BASE_PATH = "/engineering/apps/project-intelligence";

export type PiListedProject = {
  id: string;
  project_code: string;
  project_name: string;
  project_phase?: string;
  status?: string;
};

type PiProjectContextValue = {
  projects: PiListedProject[];
  projectId: string;
  selectedProject: PiListedProject | null;
  allProjects: boolean;
  loading: boolean;
  error: string | null;
  setProjectId: (next: string) => void;
};

const PiProjectContext = createContext<PiProjectContextValue | null>(null);

function readStoredProjectId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(PI_PROJECT_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredProjectId(value: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (!value) window.localStorage.removeItem(PI_PROJECT_STORAGE_KEY);
    else window.localStorage.setItem(PI_PROJECT_STORAGE_KEY, value);
  } catch {
    /* ignore quota / private mode */
  }
}

export function withPiProjectQuery(href: string, projectId?: string | null): string {
  if (!projectId || projectId === PI_ALL_PROJECTS) return href;
  const [path, existing] = href.split("?");
  const params = new URLSearchParams(existing ?? "");
  params.set("projectId", projectId);
  return `${path}?${params.toString()}`;
}

export function PiProjectContextProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlProjectId = searchParams.get("projectId") ?? "";
  const [projects, setProjects] = useState<PiListedProject[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [allProjects, setAllProjects] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchPiJson<PiListedProject[]>("/api/engineering/projects", "projects")
      .then((data) => {
        if (!cancelled) setProjects(Array.isArray(data) ? data : []);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof PiLoadError ? err.message : PI_UNAVAILABLE.projects);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const replaceProjectId = useCallback(
    (next: string | null, preferAll = false) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next) params.set("projectId", next);
      else params.delete("projectId");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
      if (preferAll) {
        writeStoredProjectId(PI_ALL_PROJECTS);
        setAllProjects(true);
      } else {
        writeStoredProjectId(next);
        setAllProjects(false);
      }
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    if (loading) return;
    if (urlProjectId) {
      writeStoredProjectId(urlProjectId);
      setAllProjects(false);
      return;
    }
    const stored = readStoredProjectId();
    if (stored === PI_ALL_PROJECTS) {
      setAllProjects(true);
      return;
    }
    if (stored && projects.some((project) => project.id === stored)) {
      replaceProjectId(stored);
      return;
    }
    if (projects[0]?.id) {
      replaceProjectId(projects[0].id);
    }
  }, [loading, projects, replaceProjectId, urlProjectId]);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === urlProjectId) ?? null,
    [projects, urlProjectId],
  );

  const value = useMemo<PiProjectContextValue>(
    () => ({
      projects,
      projectId: urlProjectId,
      selectedProject,
      allProjects: allProjects && !urlProjectId,
      loading,
      error,
      setProjectId: (next: string) => {
        if (next === PI_ALL_PROJECTS) replaceProjectId(null, true);
        else replaceProjectId(next || null);
      },
    }),
    [allProjects, error, loading, projects, replaceProjectId, selectedProject, urlProjectId],
  );

  return <PiProjectContext.Provider value={value}>{children}</PiProjectContext.Provider>;
}

export function usePiProjectContext(): PiProjectContextValue {
  const value = useContext(PiProjectContext);
  if (!value) {
    throw new Error("usePiProjectContext must be used within PiProjectContextProvider");
  }
  return value;
}

export function PiProjectSelector({ className }: { className?: string }) {
  const { projects, projectId, allProjects, loading, error, setProjectId } = usePiProjectContext();
  const value = allProjects ? PI_ALL_PROJECTS : projectId;

  return (
    <label className={className ?? "block min-w-[16rem] max-w-xl text-[1rem] text-[color:var(--eos-text-secondary)]"}>
      <span className="text-[0.8125rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--eos-text-secondary)]">Project</span>
      <select
        data-testid="pi-project-select"
        className="eos-select mt-1 w-full px-3 text-[1rem]"
        value={value}
        disabled={loading || Boolean(error)}
        onChange={(event) => setProjectId(event.target.value)}
      >
        {!allProjects && !projectId ? <option value="">Select a project</option> : null}
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.project_code} — {project.project_name}
          </option>
        ))}
        <option value={PI_ALL_PROJECTS}>All Projects</option>
      </select>
      {error ? (
        <p className="mt-1 text-xs text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </label>
  );
}

export function PiPageProjectSelect({ testId }: { testId: string }) {
  const { projects, projectId, loading, error, setProjectId } = usePiProjectContext();

  return (
    <label className="block max-w-md text-[1rem] text-[color:var(--eos-text-secondary)]">
      Project
      <select
        data-testid={testId}
        className="eos-select mt-1 w-full px-3 text-[1rem]"
        value={projectId}
        disabled={loading}
        onChange={(event) => setProjectId(event.target.value)}
      >
        <option value="">Select a project</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.project_code} — {project.project_name}
          </option>
        ))}
      </select>
      {error ? (
        <p className="mt-1 text-xs text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </label>
  );
}
