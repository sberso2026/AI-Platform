"use client";

import { useEffect, useState } from "react";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";

type ThreadPayload = {
  nodes?: Array<Record<string, unknown>>;
  relationships?: Array<Record<string, unknown>>;
  truncated?: boolean;
  truncationReason?: string;
  cycleDetected?: boolean;
  explanations?: string[];
  gaps?: Array<Record<string, unknown>>;
  blockedAnalysis?: Record<string, unknown>;
};

export function ObjectThreadPanel({ objectType, objectId }: { objectType: string; objectId: string }) {
  const [payload, setPayload] = useState<ThreadPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError(null);
      const response = await fetch(
        `/api/engineering/thread?objectType=${encodeURIComponent(objectType)}&objectId=${encodeURIComponent(objectId)}&depth=1&direction=both`,
      );
      const parsed = await parseApiJsonResponse(response);
      if (cancelled) return;
      if (!parsed.ok) {
        setPayload(null);
        setError(parsed.errorMessage ?? "Unable to load Digital Thread");
        return;
      }
      setPayload((parsed.data as ThreadPayload) ?? null);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [objectType, objectId]);

  const relationships = payload?.relationships ?? [];
  const upstream = relationships.filter((rel) => String(rel.toType) === objectType && String(rel.toId) === objectId);
  const downstream = relationships.filter((rel) => String(rel.fromType) === objectType && String(rel.fromId) === objectId);

  return (
    <section className="space-y-2 rounded border p-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-medium">Digital Thread</h3>
        <a className="underline" href={`/engineering/thread?objectType=${encodeURIComponent(objectType)}&objectId=${encodeURIComponent(objectId)}`}>
          View Full Thread
        </a>
      </div>
      {error ? <p className="text-destructive">{error}</p> : null}
      {payload?.truncated ? <p>Trace truncated ({payload.truncationReason ?? "limit reached"}).</p> : null}
      <p className="text-muted-foreground">Direct upstream</p>
      {upstream.length ? upstream.map((rel, i) => (
        <p key={`up-${i}`}>{String(rel.fromType)} {String(rel.fromId)} — {String(rel.relationship)}</p>
      )) : <p className="text-muted-foreground">None in authorized scope.</p>}
      <p className="text-muted-foreground">Direct downstream</p>
      {downstream.length ? downstream.map((rel, i) => (
        <p key={`down-${i}`}>{String(rel.relationship)} → {String(rel.toType)} {String(rel.toId)}</p>
      )) : <p className="text-muted-foreground">None in authorized scope.</p>}
    </section>
  );
}
