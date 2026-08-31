"use client";

import Link from "next/link";
import { Badge } from "@rtb/ui";
import { EngineeringListPage } from "@/components/engineering/engineering-list-page";

export default function EngineeringProjectsPage() {
  return (
    <EngineeringListPage
      title="Projects"
      description="Select a project to open the workspace — status, documents, risks, TQs, and actions"
      apiEndpoint="/api/engineering/projects"
      createHref="/engineering/projects/new"
      createLabel="New Project"
      emptyMessage="No projects yet. Create your first engineering project."
      renderItem={(item) => (
        <Link
          href={`/engineering/projects/${item.id}`}
          className="flex items-start justify-between gap-4"
        >
          <div>
            <p className="font-medium">
              {(item.project_code as string) ?? ""} — {(item.project_name as string) ?? ""}
            </p>
            <p className="text-xs text-muted-foreground">
              {(item.client_name as string) ?? "No client"} · {(item.project_phase as string) ?? ""}
            </p>
          </div>
          <Badge variant={item.status === "active" ? "success" : "secondary"}>
            {item.status as string}
          </Badge>
        </Link>
      )}
    />
  );
}
