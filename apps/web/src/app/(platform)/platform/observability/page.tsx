import { KernelInfoPage } from "@/components/platform/kernel-admin-page";

export default function ObservabilityPage() {
  return (
    <KernelInfoPage
      title="Observability"
      description="Traces, spans, metrics, and error events for AI operations"
      sections={[
        {
          title: "Traces & Spans",
          description: "Agent runs, tool calls, and workflow steps emit structured traces",
        },
        {
          title: "Metrics",
          description: "Platform performance and quality metrics",
          items: [
            "agent_latency",
            "tool_latency",
            "token_usage",
            "failure_rate",
            "policy_violation_rate",
          ],
        },
        {
          title: "Error Events",
          description: "Structured, searchable error logging",
        },
      ]}
    />
  );
}
