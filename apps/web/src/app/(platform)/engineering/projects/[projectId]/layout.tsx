"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import { ProjectWorkspaceShell } from "@/components/engineering/project-workspace/shell";
import {
  EngineeringBreadcrumb,
  OperationalError,
  OperationalSkeleton,
} from "@/components/engineering/operational";
import { useProjectWorkspace } from "@/components/engineering/project-workspace/use-workspace";
import { UnsavedChangesProvider } from "@/components/engineering/project-workspace/unsaved-changes-guard";

export default function ProjectWorkspaceLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const projectId = params.projectId as string;
  const [project, setProject] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { snapshot } = useProjectWorkspace(projectId);

  useEffect(() => {
    fetch(`/api/engineering/projects/${projectId}`)
      .then((r) => parseApiJsonResponse<{ project: Record<string, unknown> }>(r))
      .then((parsed) => {
        if (!parsed.ok || !parsed.data?.project) {
          setError(parsed.errorMessage ?? "Failed to load project");
          return;
        }
        setProject(parsed.data.project);
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Failed to load project"),
      );
  }, [projectId]);

  const label = project
    ? `${String(project.project_code ?? "")} — ${String(project.project_name ?? "Project")}`
    : "Project workspace";

  return (
    <UnsavedChangesProvider>
      <Header title={label} description="EOS project workspace — grouped engineering capabilities" />
      <main className="page-main flex-1 overflow-y-auto px-4 pb-8 pt-4 sm:px-6 lg:px-8" data-testid="page-main">
        {error ? <OperationalError message={error} retryHref={`/engineering/projects/${projectId}`} /> : null}
        {!project && !error ? <OperationalSkeleton label="Loading project…" /> : null}
        {project ? (
          <>
            <EngineeringBreadcrumb
              items={[
                { href: "/engineering/projects", label: "Projects" },
                { label },
              ]}
            />
            <ProjectWorkspaceShell
              projectId={projectId}
              projectLabel={label}
              setupStatus={snapshot?.setupStatus}
            >
              {children}
            </ProjectWorkspaceShell>
          </>
        ) : null}
      </main>
    </UnsavedChangesProvider>
  );
}
