"use client";

import { KernelAdminPage } from "@/components/platform/kernel-admin-page";

export default function PluginRegistryPage() {
  return (
    <KernelAdminPage
      title="Plugin Registry"
      description="Operating system and extension lifecycle — register, version, install, enable, disable"
      apiEndpoint="/api/platform/plugins"
      emptyMessage="No plugins in registry. Operating systems install as versioned plugins."
      renderItem={(item) => (
        <div>
          <p className="font-medium">{(item.name ?? item.plugin_id) as string}</p>
          <p className="text-xs text-muted-foreground">
            {(item.plugin_id ?? item.status) as string}
            {item.author ? ` · ${String(item.author)}` : ""}
          </p>
        </div>
      )}
    />
  );
}
