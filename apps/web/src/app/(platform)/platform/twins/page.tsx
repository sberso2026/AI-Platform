"use client";

import { KernelAdminPage } from "@/components/platform/kernel-admin-page";

export default function TwinsPage() {
  return (
    <KernelAdminPage
      title="Digital Twins"
      description="Neutral twin registry for assets, buildings, vehicles, infrastructure, and sensors"
      apiEndpoint="/api/platform/twins"
      emptyMessage="No digital twins registered yet."
      renderItem={(item) => (
        <div>
          <p className="font-medium">{item.name as string}</p>
          <p className="text-xs text-muted-foreground">Type: {item.twin_type as string}</p>
        </div>
      )}
    />
  );
}
