import { KernelAdminPage } from "@/components/platform/kernel-admin-page";

export default function ModelsPage() {
  return (
    <KernelAdminPage
      title="Model Registry"
      description="Model providers, capabilities, and routing policies"
      apiEndpoint="/api/platform/models"
      emptyMessage="No models registered. Mock provider is the default for local development."
    />
  );
}
