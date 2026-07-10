"use client";

import { KernelAdminPage } from "@/components/platform/kernel-admin-page";

export default function EvaluationsPage() {
  return (
    <KernelAdminPage
      title="AI Evaluation"
      description="Evaluate AI output quality and detect regressions"
      apiEndpoint="/api/platform/evaluations"
      emptyMessage="No evaluation runs. Platform smoke test dataset is seeded."
      renderItem={(item) => (
        <div>
          <p className="font-medium">{(item.name ?? item.dataset_key ?? item.case_key) as string}</p>
          <p className="text-xs text-muted-foreground">
            {(item.status as string) ?? "dataset"}
          </p>
        </div>
      )}
    />
  );
}
