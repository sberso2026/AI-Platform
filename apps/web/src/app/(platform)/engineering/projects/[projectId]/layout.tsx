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

  const code = project ? String(project.project_code ?? "") : "";
  const name = project ? String(project.project_name ?? "Project") : "Project workspace";
  const label = project ? `${code || projectId} — ${name}` : "Project workspace";

  return (
    <UnsavedChangesProvider>
      <div
        className="flex h-full min-h-0 flex-1 flex-col overflow-hidden"
        data-testid="project-workspace-layout"
        data-eos-layout="desktop-engineering"
      >
        <Header
          title={label}
          description="Engineering workspace — work packages, design, and project context"
        />
        <div className="shrink-0 px-4 pt-2 sm:px-6 lg:px-8">
          {error ? (
            <OperationalError message={error} retryHref={`/engineering/projects/${projectId}`} />
          ) : null}
          {!project && !error ? <OperationalSkeleton label="Loading project…" /> : null}
          {project ? (
            <EngineeringBreadcrumb
              items={[
                { href: "/engineering/projects", label: "Projects" },
                { label: code || label },
              ]}
            />
          ) : null}
        </div>
        {project ? (
          <main
            className="flex min-h-0 flex-1 flex-col overflow-hidden px-0 pb-0 pt-2 sm:px-0"
            data-testid="page-main"
          >
            <ProjectWorkspaceShell
              projectId={projectId}
              projectLabel={label}
              setupStatus={snapshot?.setupStatus}
              contextHeader={
                <dl className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm" data-testid="project-context-strip">
                  <div>
                    <dt className="inline text-slate-500">Project: </dt>
                    <dd className="inline font-medium text-slate-900">{code || projectId}</dd>
                  </div>
                  {snapshot?.setup?.site ? (
                    <div>
                      <dt className="inline text-slate-500">Facility / Area: </dt>
                      <dd className="inline font-medium text-slate-900">
                        {String(snapshot.setup.site)}
                      </dd>
                    </div>
                  ) : null}
                  {snapshot?.lifecycle?.currentKey ? (
                    <div>
                      <dt className="inline text-slate-500">Maturity: </dt>
                      <dd className="inline font-medium text-slate-900">
                        {String(snapshot.lifecycle.currentKey)}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              }
            >
              {children}
            </ProjectWorkspaceShell>
          </main>
        ) : null}
      </div>
    </UnsavedChangesProvider>
  );
}
