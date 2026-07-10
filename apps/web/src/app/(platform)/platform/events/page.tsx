"use client";

import { KernelAdminPage } from "@/components/platform/kernel-admin-page";

export default function EventsPage() {
  return (
    <KernelAdminPage
      title="Platform Events"
      description="Immutable event store — tenant-scoped, replayable by admins"
      apiEndpoint="/api/platform/events"
      emptyMessage="No events published yet."
      renderItem={(item) => (
        <div>
          <p className="font-medium">{item.event_type as string}</p>
          <p className="text-xs text-muted-foreground">Source: {item.source as string}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(item.created_at as string).toLocaleString()}
          </p>
        </div>
      )}
    />
  );
}
