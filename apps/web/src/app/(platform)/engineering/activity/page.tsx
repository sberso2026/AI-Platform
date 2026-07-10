"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, Badge } from "@rtb/ui";

const SEVERITY_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  info: "secondary",
  warning: "outline",
  critical: "destructive",
  success: "default",
};

export default function ActivityPage() {
  const [events, setEvents] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/engineering/activity")
      .then((r) => r.json())
      .then((j) => {
        setEvents(Array.isArray(j.data) ? j.data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
      <>
        <Header
        title="Engineering Activity Feed"
        description="Real-time engineering events — approvals, register changes, AI recommendations"
      />
              <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        {loading && <p className="text-sm text-muted-foreground">Loading activity...</p>}
        <div className="grid gap-2">
          {events.map((event) => {
            const severity = (event.severity as string) ?? "info";
            return (
              <Card key={event.id as string}>
                <CardContent className="flex items-start justify-between gap-4 p-4">
                  <div>
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <p className="font-medium text-sm">{(event.title as string) ?? ""}</p>
                      <Badge variant={SEVERITY_VARIANT[severity] ?? "secondary"}>
                        {severity}
                      </Badge>
                      {event.activity_type ? (
                        <Badge variant="outline">{event.activity_type as string}</Badge>
                      ) : null}
                    </div>
                    {event.body ? (
                      <p className="text-sm text-muted-foreground">{event.body as string}</p>
                    ) : null}
                    <p className="mt-2 text-xs text-muted-foreground">
                      {event.created_at
                        ? new Date(event.created_at as string).toLocaleString()
                        : ""}
                    </p>
                  </div>
                  {event.object_type ? (
                    <Badge variant="secondary">{event.object_type as string}</Badge>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
          {!loading && events.length === 0 && (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                No activity yet. Engineering events will stream here as registers are used.
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      </>
  );
}
