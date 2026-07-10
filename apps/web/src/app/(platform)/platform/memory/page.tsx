"use client";

import { KernelAdminPage } from "@/components/platform/kernel-admin-page";

export default function MemoryPage() {
  return (
    <KernelAdminPage
      title="AI Memory"
      description="Scoped conversation, workspace, project, and agent memory"
      apiEndpoint="/api/platform/memory"
      emptyMessage="No memories stored yet."
      renderItem={(item) => (
        <div>
          <p className="text-sm">{item.content as string}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {item.scope_key as string} · {item.classification as string}
          </p>
        </div>
      )}
    />
  );
}
