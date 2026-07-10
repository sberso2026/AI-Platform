"use client";

import { KernelAdminPage } from "@/components/platform/kernel-admin-page";

export default function ApiGatewayPage() {
  return (
    <KernelAdminPage
      title="API Gateway"
      description="API keys, permissions, usage logging, and external integrations"
      apiEndpoint="/api/platform/api-gateway"
      emptyMessage="No API keys created. Secrets are shown once at creation."
      renderItem={(item) => (
        <div>
          <p className="font-medium">{item.name as string}</p>
          <p className="font-mono text-xs text-muted-foreground">{item.key_prefix as string}••••••••</p>
        </div>
      )}
    />
  );
}
