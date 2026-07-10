import { KernelInfoPage } from "@/components/platform/kernel-admin-page";

export default function CostsPage() {
  return (
    <KernelInfoPage
      title="Cost Engine"
      description="AI and platform cost tracking by tenant, workspace, agent, and user"
      sections={[
        {
          title: "Cost Events",
          description: "Token usage, tool calls, background jobs, and processing costs",
          items: ["model_call", "tool_call", "background_job", "embedding_generation"],
        },
        {
          title: "Allocations",
          description: "Multi-dimensional cost allocation",
          items: ["tenant", "workspace", "agent", "user", "plugin", "operating_system"],
        },
        {
          title: "Budgets & Alerts",
          description: "Budget limits and threshold alerts",
        },
      ]}
    />
  );
}
