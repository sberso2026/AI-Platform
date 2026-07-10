"use client";

import { KernelAdminPage } from "@/components/platform/kernel-admin-page";

export default function AgentsPage() {
  return (
    <KernelAdminPage
      title="Agents"
      description="Registered AI agents for tenant orchestration"
      apiEndpoint="/api/platform/agents"
      emptyMessage="No agents registered. Agents are auto-provisioned per tenant."
      renderItem={(item) => (
        <div>
          <p className="font-medium">{item.name as string}</p>
          <p className="text-xs text-muted-foreground">{item.slug as string} · {item.agent_type as string}</p>
          {item.description ? <p className="mt-1 text-sm text-muted-foreground">{String(item.description)}</p> : null}
        </div>
      )}
    />
  );
}
