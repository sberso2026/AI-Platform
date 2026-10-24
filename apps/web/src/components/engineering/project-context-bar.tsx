"use client";

import { useEffect, useMemo, useState } from "react";
import {
  persistEngineeringProjectFilter,
  useResolvedEngineeringProjectId,
} from "@/hooks/use-engineering-project-filter";
import { formatProjectContextLabel, isRawUuid } from "@/lib/engineering/module-ops";
import { IdentityAssuranceReadout } from "@/components/engineering/identity-assurance-readout";

type ProjectOption = { id: string; label: string };

export function EngineeringProjectContextBar() {
  const projectId = useResolvedEngineeringProjectId();
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [workspaceLabel, setWorkspaceLabel] = useState("current workspace");

  useEffect(() => {
    fetch("/api/engineering/projects")
      .then((response) => response.json())
      .then((json: { data?: Array<Record<string, unknown>> }) => {
        const rows = Array.isArray(json.data) ? json.data : [];
        setProjects(
          rows.map((row) => ({
            id: String(row.id),
            label: formatProjectContextLabel({
              projectCode:
                typeof row.project_code === "string" && !isRawUuid(row.project_code) ? row.project_code : "",
              projectName:
                typeof row.project_name === "string" && !isRawUuid(row.project_name) ? row.project_name : "",
            }),
          })),
        );
      })
      .catch(() => undefined);

    fetch("/api/platform/active-context", { credentials: "same-origin" })
      .then((response) => response.json())
      .then(
        (body: {
          data?: {
            current?: { tenantSlug?: string; workspaceId?: string } | null;
            memberships?: Array<{ workspaces?: Array<{ workspaceId: string; slug: string }> }>;
          };
        }) => {
          const current = body.data?.current;
          const workspaces = (body.data?.memberships ?? []).flatMap((row) => row.workspaces ?? []);
          const slug = workspaces.find((row) => row.workspaceId === current?.workspaceId)?.slug;
          const label = slug || current?.tenantSlug;
          if (label) setWorkspaceLabel(label);
        },
      )
      .catch(() => undefined);
  }, []);

  const selected = useMemo(
    () => projects.find((row) => row.id === projectId) ?? null,
    [projectId, projects],
  );

  return (
    <div
      className="mb-4 rounded border border-[color:var(--eos-border)] bg-[color:var(--eos-panel)] px-3 py-3 text-sm text-[color:var(--eos-text-primary)]"
      data-testid="engineering-project-context"
    >
      <p>
        Workspace: <span className="font-medium text-[color:var(--eos-text-primary)]">{workspaceLabel}</span>
      </p>
      <p>
        Project:{" "}
        <span
          className={
            selected?.label
              ? "font-medium text-[color:var(--eos-text-primary)]"
              : "font-medium text-[color:var(--eos-text-secondary)]"
          }
          data-testid="engineering-project-context-name"
        >
          {selected?.label || "Select a project"}
        </span>
      </p>
      <IdentityAssuranceReadout />
      <label className="mt-2 block text-[color:var(--eos-text-primary)]" htmlFor="engineering-authorized-project">
        Authorized project
        <select
          id="engineering-authorized-project"
          className="eos-select mt-1 w-full px-3 py-1 text-[color:var(--eos-text-primary)]"
          data-testid="engineering-project-selector"
          data-authorized-count={projects.length}
          aria-label="Authorized project"
          value={projectId ?? ""}
          onChange={(event) => {
            const next = event.target.value || null;
            persistEngineeringProjectFilter(next);
          }}
        >
          <option value="">Select a project</option>
          {projects.map((row) => (
            <option key={row.id} value={row.id}>
              {row.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
