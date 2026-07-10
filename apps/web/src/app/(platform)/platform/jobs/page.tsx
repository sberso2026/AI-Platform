import { KernelAdminPage } from "@/components/platform/kernel-admin-page";

export default function JobsPage() {
  return (
    <KernelAdminPage
      title="Background Jobs"
      description="Long-running work queue — document indexing, AI runs, reports, telemetry"
      apiEndpoint="/api/platform/jobs"
      emptyMessage="No background jobs yet."
    />
  );
}
