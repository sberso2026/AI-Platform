"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, Badge } from "@rtb/ui";

export default function TimelinePage() {
  const [events, setEvents] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/engineering/timeline")
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
        title="Engineering Timeline"
        description="Aggregated engineering activity across projects, assets, registers, and documents"
      />
              <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        {loading && <p className="text-sm text-muted-foreground">Loading timeline...</p>}
        <div className="relative space-y-4 border-l pl-6">
          {events.map((event) => (
            <Card key={event.id as string} className="relative">
              <span className="absolute -left-[31px] top-5 h-3 w-3 rounded-full border-2 border-primary bg-background" />
              <CardContent className="p-4">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <p className="font-medium text-sm">{(event.title as string) ?? ""}</p>
                  <Badge variant="outline">{(event.event_type as string) ?? "event"}</Badge>
                  {event.object_type ? (
                    <Badge variant="secondary">{event.object_type as string}</Badge>
                  ) : null}
                </div>
                {event.summary ? (
                  <p className="text-sm text-muted-foreground">{event.summary as string}</p>
                ) : null}
                <p className="mt-2 text-xs text-muted-foreground">
                  {(event.occurred_at ?? event.created_at)
                    ? new Date((event.occurred_at ?? event.created_at) as string).toLocaleString()
                    : ""}
                </p>
              </CardContent>
            </Card>
          ))}
          {!loading && events.length === 0 && (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                No timeline events yet. Register activity will appear here automatically.
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      </>
  );
}
