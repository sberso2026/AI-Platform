import { KernelAdminPage } from "@/components/platform/kernel-admin-page";

export default function WorkflowsPage() {
  return (
    <KernelAdminPage
      title="Workflows"
      description="Versioned workflow definitions and running instances"
      apiEndpoint="/api/platform/workflows"
      emptyMessage="No workflow instances. Pre-seeded definitions: human-review, agent-answer-approval."
    />
  );
}
