"use client";

import { useCallback, useEffect, useState } from "react";

export const ENGINEERING_PROJECT_FILTER_KEY = "rtb.engineering.selectedProjectId";

/**
 * Honor Engineering OS header project context without duplicating ownership.
 * "all" / missing → null (unscoped). Specific UUID → scoped.
 */
export function useEngineeringProjectFilter(): string | null {
  const [projectId, setProjectId] = useState<string | null>(null);

  const readStored = useCallback(() => {
    try {
      const stored = sessionStorage.getItem(ENGINEERING_PROJECT_FILTER_KEY);
      if (!stored || stored === "all") {
        setProjectId(null);
        return;
      }
      setProjectId(stored);
    } catch {
      setProjectId(null);
    }
  }, []);

  useEffect(() => {
    readStored();
    const onFilter = (event: Event) => {
      const detail = (event as CustomEvent<{ projectId?: string | null }>).detail;
      const next = detail?.projectId ?? null;
      setProjectId(next && next !== "all" ? next : null);
    };
    window.addEventListener("rtb:project-filter", onFilter as EventListener);
    return () => {
      window.removeEventListener("rtb:project-filter", onFilter as EventListener);
    };
  }, [readStored]);

  return projectId;
}

export function withProjectQuery(endpoint: string, projectId: string | null): string {
  if (!projectId) return endpoint;
  const url = new URL(endpoint, "http://local.invalid");
  url.searchParams.set("projectId", projectId);
  return `${url.pathname}${url.search}`;
}

export function persistEngineeringProjectFilter(projectId: string | null): void {
  const value = projectId && projectId !== "all" ? projectId : "all";
  try {
    sessionStorage.setItem(ENGINEERING_PROJECT_FILTER_KEY, value);
  } catch {
    // ignore
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("rtb:project-filter", {
        detail: { projectId: value === "all" ? null : value },
      }),
    );
  }
}
