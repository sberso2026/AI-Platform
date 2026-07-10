"use client";

import { KernelAdminPage } from "@/components/platform/kernel-admin-page";

export default function PromptsPage() {
  return (
    <KernelAdminPage
      title="Prompt Registry"
      description="Version-controlled prompt templates for agents"
      apiEndpoint="/api/platform/prompts"
      emptyMessage="No prompts registered. platform-assistant prompt is seeded per tenant."
      renderItem={(item) => (
        <div>
          <p className="font-medium">{item.name as string}</p>
          <p className="text-xs text-muted-foreground">
            {(item.prompt_key as string) ?? ""} · {(item.status as string) ?? ""}
          </p>
        </div>
      )}
    />
  );
}
