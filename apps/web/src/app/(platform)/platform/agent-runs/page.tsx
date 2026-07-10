"use client";

import { KernelAdminPage } from "@/components/platform/kernel-admin-page";
import { Badge } from "@rtb/ui";

export default function AgentRunsPage() {
  return (
    <KernelAdminPage
      title="Agent Runs"
      description="Immutable log of all AI agent executions"
      apiEndpoint="/api/platform/agent-runs"
      emptyMessage="No agent runs yet. Use the Command Centre to start a run."
      renderItem={(item) => (
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium">Run {String(item.id).slice(0, 8)}</p>
            <p className="text-xs text-muted-foreground">
              Intent: {item.intent as string} · {item.model_provider as string}/{item.model_name as string}
            </p>
            {item.confidence != null && (
              <p className="text-xs text-muted-foreground">Confidence: {Number(item.confidence).toFixed(2)}</p>
            )}
          </div>
          <Badge variant={item.status === "completed" ? "success" : item.status === "review_required" ? "warning" : "secondary"}>
            {item.status as string}
          </Badge>
        </div>
      )}
    />
  );
}
