"use client";

import { KernelAdminPage } from "@/components/platform/kernel-admin-page";

export default function PoliciesPage() {
  return (
    <KernelAdminPage
      title="Policy Engine"
      description="Configurable governance policies for AI and workflow safety"
      apiEndpoint="/api/platform/policies"
      emptyMessage="No policies configured. Platform default policies are seeded."
      renderItem={(item) => (
        <div>
          <p className="font-medium">{item.name as string}</p>
          <p className="text-xs text-muted-foreground">
            {(item.policy_key as string) ?? ""} · priority {(item.priority as number) ?? ""}
          </p>
        </div>
      )}
    />
  );
}
