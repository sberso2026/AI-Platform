"use client";

import { KernelAdminPage } from "@/components/platform/kernel-admin-page";

export default function CapabilitiesPage() {
  return (
    <KernelAdminPage
      title="Capability Registry"
      description="Platform and plugin capabilities for AI Director routing"
      apiEndpoint="/api/platform/capabilities"
      emptyMessage="No capabilities installed. Platform templates are seeded globally."
      renderItem={(item) => (
        <div>
          <p className="font-medium">{item.name as string}</p>
          <p className="text-xs text-muted-foreground">
            {(item.capability_key as string) ?? ""}
            {item.operating_system ? ` · ${item.operating_system as string}` : ""}
          </p>
        </div>
      )}
    />
  );
}
