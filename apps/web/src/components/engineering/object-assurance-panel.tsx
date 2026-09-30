"use client";

import { useEffect, useState } from "react";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";

type Condition = {
  id: string;
  status: string;
  conditionType: string;
  materiality: string;
  ruleId: string;
  explanation: string;
};

export function ObjectAssurancePanel({ objectType, objectId }: { objectType: string; objectId: string }) {
  const [rows, setRows] = useState<Condition[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError(null);
      const response = await fetch(
        `/api/engineering/assurance?objectType=${encodeURIComponent(objectType)}&objectId=${encodeURIComponent(objectId)}`,
      );
      const parsed = await parseApiJsonResponse(response);
      if (cancelled) return;
      if (!parsed.ok) {
        setRows([]);
        setError(parsed.errorMessage ?? "Unable to load assurance conditions");
        return;
      }
      setRows(Array.isArray(parsed.data) ? (parsed.data as Condition[]) : []);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [objectType, objectId]);

  const open = rows.filter((row) => row.status === "OPEN" || row.status === "ACKNOWLEDGED" || row.status === "UNDER_REVIEW");

  return (
    <section className="space-y-2 rounded border p-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-medium">Assurance</h3>
        <a
          className="underline"
          href={`/engineering/assurance?objectType=${encodeURIComponent(objectType)}&objectId=${encodeURIComponent(objectId)}`}
        >
          View workspace
        </a>
      </div>
      {error ? <p className="text-destructive">{error}</p> : null}
      <p className="text-muted-foreground">{open.length} open condition{open.length === 1 ? "" : "s"} on this object.</p>
      {open.length
        ? open.map((row) => (
            <p key={row.id}>
              {row.conditionType} · {row.materiality} · {row.ruleId}: {row.explanation}
            </p>
          ))
        : <p className="text-muted-foreground">No open Assurance Conditions in authorized scope.</p>}
    </section>
  );
}
