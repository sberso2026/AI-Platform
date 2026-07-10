"use client";

import { KernelAdminPage } from "@/components/platform/kernel-admin-page";

export default function TelemetryPage() {
  return (
    <KernelAdminPage
      title="Telemetry"
      description="Sensor registry and ingestion-ready telemetry framework"
      apiEndpoint="/api/platform/telemetry"
      emptyMessage="No sensors registered yet."
      renderItem={(item) => (
        <div>
          <p className="font-medium">{item.name as string}</p>
          <p className="text-xs text-muted-foreground">Type: {item.sensor_type as string}</p>
        </div>
      )}
    />
  );
}
