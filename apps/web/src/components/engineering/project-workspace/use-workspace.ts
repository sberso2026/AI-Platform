"use client";

import { useCallback, useEffect, useState } from "react";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import type { WorkspaceSnapshot } from "@/lib/engineering/eos3-project-workspace-service";

export function useProjectWorkspace(projectId: string) {
  const [snapshot, setSnapshot] = useState<WorkspaceSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/engineering/projects/${projectId}/workspace`)
      .then((r) => parseApiJsonResponse<WorkspaceSnapshot>(r))
      .then((parsed) => {
        if (!parsed.ok || !parsed.data) {
          setError(parsed.errorMessage ?? "Failed to load project workspace");
          setSnapshot(null);
        } else {
          setSnapshot(parsed.data);
        }
        setLoading(false);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Failed to load project workspace");
        setLoading(false);
      });
  }, [projectId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const post = useCallback(
    async (body: Record<string, unknown>) => {
      const res = await fetch(`/api/engineering/projects/${projectId}/workspace`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const parsed = await parseApiJsonResponse(res);
      if (!parsed.ok) {
        throw new Error(parsed.errorMessage ?? `Request failed (${parsed.status})`);
      }
      reload();
      return parsed.data;
    },
    [projectId, reload],
  );

  return { snapshot, error, loading, reload, post };
}
