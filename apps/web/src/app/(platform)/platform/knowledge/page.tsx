"use client";

import { KernelAdminPage } from "@/components/platform/kernel-admin-page";

export default function KnowledgePage() {
  return (
    <KernelAdminPage
      title="Knowledge Graph"
      description="Organizational intelligence — nodes, edges, and evidence linking"
      apiEndpoint="/api/platform/knowledge"
      emptyMessage="No knowledge nodes yet. Create nodes to build the organizational graph."
      renderItem={(item) => (
        <div>
          <p className="font-medium">{item.title as string}</p>
          <p className="text-xs text-muted-foreground">Type: {item.node_type as string}</p>
        </div>
      )}
    />
  );
}
