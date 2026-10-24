"use client";

import Link from "next/link";
import { StatusChip } from "@rtb/ui";
import { EngineeringListPage } from "@/components/engineering/engineering-list-page";
import { persistEngineeringProjectFilter } from "@/hooks/use-engineering-project-filter";

export default function EngineeringProjectsPage() {
  return (
    <EngineeringListPage
      title="Projects"
      description="Select a project to open the workspace — status, documents, risks, TQs, and actions"
      apiEndpoint="/api/engineering/projects"
      createHref="/engineering/projects/new"
      createLabel="New Project"
      emptyTitle="No projects yet"
      emptyDescription="No engineering projects exist in this workspace yet. Create a project to start work."
      columns={[
        { key: "project", label: "Project", hrefKey: true },
        { key: "client_name", label: "Client" },
        { key: "project_phase", label: "Phase" },
        { key: "status", label: "Status", status: true },
        { key: "updated", label: "Last update" },
      ]}
      rowHref={(item) => `/engineering/projects/${item.id}`}
      renderItem={(item) => (
        <Link
          href={`/engineering/projects/${item.id}`}
          className="flex items-start justify-between gap-4"
          onClick={() => persistEngineeringProjectFilter(String(item.id))}
        >
          <div>
            <p className="font-medium">
              {(item.project_code as string) ?? ""} — {(item.project_name as string) ?? ""}
            </p>
            <p className="text-xs text-muted-foreground">
              {(item.client_name as string) ?? "No client"} · {(item.project_phase as string) ?? ""}
            </p>
          </div>
          <StatusChip value={(item.status as string) ?? ""} />
        </Link>
      )}
    />
  );
}
