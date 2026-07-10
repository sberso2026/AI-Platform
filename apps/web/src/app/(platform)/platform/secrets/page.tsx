"use client";

import { KernelAdminPage } from "@/components/platform/kernel-admin-page";

export default function SecretsPage() {
  return (
    <KernelAdminPage
      title="Secret Management"
      description="Secure secret metadata registry — values are never exposed in UI"
      apiEndpoint="/api/platform/secrets"
      emptyMessage="No secrets registered. Secret values are encrypted or externally referenced."
      renderItem={(item) => (
        <div>
          <p className="font-medium">{item.name as string}</p>
          <p className="text-xs text-muted-foreground">
            {(item.secret_key as string) ?? ""} · scope: {(item.scope as string) ?? ""}
          </p>
        </div>
      )}
    />
  );
}
