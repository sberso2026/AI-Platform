"use client";

import { KernelAdminPage } from "@/components/platform/kernel-admin-page";

export default function ToolsPage() {
  return (
    <KernelAdminPage
      title="AI Tool Registry"
      description="Platform-wide registry of tools AI agents can safely use"
      apiEndpoint="/api/platform/tools"
      emptyMessage="No tools registered. Default document_search tool is seeded per tenant."
      renderItem={(item) => (
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium">{item.name as string}</p>
            <p className="text-xs text-muted-foreground">
              {(item.tool_key as string) ?? ""} · {(item.category as string) ?? ""}
            </p>
          </div>
          <span className="text-xs text-muted-foreground">{item.risk_level as string}</span>
        </div>
      )}
    />
  );
}
