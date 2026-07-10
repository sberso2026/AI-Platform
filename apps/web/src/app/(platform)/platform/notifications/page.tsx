"use client";

import { KernelAdminPage } from "@/components/platform/kernel-admin-page";

export default function NotificationsPage() {
  return (
    <KernelAdminPage
      title="Notifications"
      description="In-app notifications triggered by platform events"
      apiEndpoint="/api/platform/notifications"
      emptyMessage="No notifications yet."
      renderItem={(item) => (
        <div>
          <p className="font-medium">{item.title as string}</p>
          {item.body ? <p className="text-sm text-muted-foreground">{String(item.body)}</p> : null}
          <p className="text-xs text-muted-foreground">{item.type as string} · {item.priority as string}</p>
        </div>
      )}
    />
  );
}
