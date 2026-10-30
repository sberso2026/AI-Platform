"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import {
  OperationalError,
  OperationalSkeleton,
  ProjectContextHeader,
} from "@/components/engineering/operational";
import { ProjectOverviewPanel } from "@/components/engineering/project-workspace/overview";

type ProjectPayload = {
  project: Record<string, unknown>;
};

export default function EngineeringProjectDetailPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [project, setProject] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const started = performance.now();
    fetch(`/api/engineering/projects/${projectId}`)
      .then((r) => parseApiJsonResponse<ProjectPayload>(r))
      .then((parsed) => {
        if (!parsed.ok || !parsed.data?.project) {
          setError(parsed.errorMessage ?? "Failed to load project");
          return;
        }
        setProject(parsed.data.project);
        if (typeof window !== "undefined") {
          console.info(
            `[eos-pilot-ui-1] project-overview wall_ms=${Math.round(performance.now() - started)}`,
          );
        }
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Failed to load project"),
      );
  }, [projectId]);

  if (error) {
    return <OperationalError message={error} retryHref={`/engineering/projects/${projectId}`} />;
  }
  if (!project) {
    return <OperationalSkeleton label="Loading project overview…" />;
  }

  return (
    <div data-testid="project-workspace">
      <ProjectContextHeader
        code={project.project_code as string}
        name={project.project_name as string}
        status={project.status as string}
        phase={project.project_phase as string}
        projectId={projectId}
      />
      <ProjectOverviewPanel projectId={projectId} project={project} />
    </div>
  );
}
