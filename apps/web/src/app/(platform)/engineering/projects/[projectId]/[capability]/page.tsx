"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { OperationalSkeleton } from "@/components/engineering/operational";
import { ProjectCapabilityView } from "@/components/engineering/project-workspace/capability-view";

export default function ProjectCapabilityPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const capability = params.capability as string;

  return (
    <Suspense fallback={<OperationalSkeleton label="Loading capability…" />}>
      <ProjectCapabilityView projectId={projectId} slug={capability} />
    </Suspense>
  );
}
