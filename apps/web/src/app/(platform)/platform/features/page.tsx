"use client";

import { KernelAdminPage } from "@/components/platform/kernel-admin-page";

export default function FeaturesPage() {
  return (
    <KernelAdminPage
      title="Feature Flags"
      description="Tenant-aware feature rollout and Operating System enablement"
      apiEndpoint="/api/platform/features"
      emptyMessage="No feature flags configured."
      renderItem={(item) => (
        <div>
          <p className="font-medium">{(item.name ?? item.feature_key) as string}</p>
          <p className="text-xs text-muted-foreground">
            {(item.feature_key as string) ?? ""}
            {item.is_experimental !== undefined ? ` · experimental: ${String(item.is_experimental)}` : ""}
          </p>
        </div>
      )}
    />
  );
}
