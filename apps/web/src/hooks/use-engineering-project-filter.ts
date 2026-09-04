"use client";

import { useCallback, useEffect, useState } from "react";

import { withProjectQuery } from "@/lib/engineering/load-command-center";

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

export { withProjectQuery };
