"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@rtb/ui";
import { Header } from "@/components/layout/header";
import {
  EmptyOperationalState,
  EngineeringBreadcrumb,
  OperationalError,
} from "@/components/engineering/operational";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";

const VIEWS = ["trace", "upstream", "downstream", "evidence", "changes", "configuration", "assurance"] as const;
type ViewId = (typeof VIEWS)[number];

const ROOT_TYPES = [
  "requirement",
  "system",
  "asset",
  "interface",
  "assumption",
  "analysis_request",
  "analysis_result",
  "review_package",
  "decision",
  "change",
  "impact",
  "configuration_baseline",
  "optimization_study",
  "optimization_run",
  "document",
] as const;

export function ThreadWorkspace() {
  const params = typeof window === "undefined" ? null : new URLSearchParams(window.location.search);
  const [objectType, setObjectType] = useState(params?.get("objectType") ?? "requirement");
  const [objectId, setObjectId] = useState(params?.get("objectId") ?? "");
  const [view, setView] = useState<ViewId>("trace");
  const [payload, setPayload] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    void (async () => {
      const response = await fetch("/api/engineering/thread?action=health");
      const parsed = await parseApiJsonResponse(response);
      if (parsed.ok) setHealth((parsed.data as Record<string, unknown>) ?? null);
    })();
  }, []);

  const action = useMemo(() => {
    if (view === "upstream") return "upstream";
    if (view === "downstream") return "downstream";
    if (view === "assurance") return "coverage";
    if (view === "changes") return "change";
    if (view === "configuration") return "configuration";
    if (view === "evidence") return "trace";
    return objectType === "requirement" || objectType === "decision" || objectType === "analysis_request" || objectType === "change" || objectType === "configuration_baseline"
      ? objectType === "analysis_request"
        ? "analysis"
        : objectType === "configuration_baseline"
          ? "configuration"
          : objectType
      : "trace";
  }, [view, objectType]);

  async function load() {
    setError(null);
    if (view === "assurance") {
      const response = await fetch("/api/engineering/thread?action=coverage");
      const parsed = await parseApiJsonResponse(response);
      if (!parsed.ok) {
        setPayload(null);
        setError(parsed.errorMessage ?? "Coverage query failed");
        return;
      }
      setPayload((parsed.data as Record<string, unknown>) ?? null);
      return;
    }
    if (!objectId.trim()) {
      setError("Select a canonical object id. Digital Thread does not duplicate global search.");
      return;
    }
    const direction = view === "upstream" ? "upstream" : view === "downstream" ? "downstream" : "both";
    const response = await fetch(
      `/api/engineering/thread?action=${encodeURIComponent(action)}&objectType=${encodeURIComponent(objectType)}&objectId=${encodeURIComponent(objectId)}&direction=${direction}&depth=4`,
    );
    const parsed = await parseApiJsonResponse(response);
    if (!parsed.ok) {
      setPayload(null);
      setError(parsed.errorMessage ?? "Thread query failed");
      return;
    }
    setPayload((parsed.data as Record<string, unknown>) ?? null);
  }

  const relationships = Array.isArray(payload?.relationships) ? (payload?.relationships as Array<Record<string, unknown>>) : [];
  const nodes = Array.isArray(payload?.nodes) ? (payload?.nodes as Array<Record<string, unknown>>) : Array.isArray((payload?.traversal as { nodes?: unknown[] } | undefined)?.nodes) ? ((payload?.traversal as { nodes: Array<Record<string, unknown>> }).nodes) : [];
  const explanations = Array.isArray(payload?.explanations) ? (payload.explanations as string[]) : [];
  const gaps = Array.isArray(payload?.gaps) ? (payload.gaps as Array<Record<string, unknown>>) : [];
  const findings = Array.isArray(payload?.findings) ? (payload.findings as Array<Record<string, unknown>>) : [];
  const truncated = payload?.truncated === true || (payload?.traversal as { truncated?: boolean } | undefined)?.truncated === true;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-6">
        <EngineeringBreadcrumb items={[{ label: "Engineering", href: "/engineering" }, { label: "Digital Thread" }]} />
        <h1 className="text-2xl font-semibold">Engineering Digital Thread</h1>
        <p className="text-sm text-muted-foreground">
          Traceability over canonical engineering objects and governed relations. Not a Digital Twin. Not a universal
          correctness score. Missing relations are reported as gaps — they are not inferred.
        </p>
        {health ? (
          <p className="text-sm text-muted-foreground">
            Source: Canonical. Projection: {String(health.status ?? "UNKNOWN")}. Last synchronized:{" "}
            {health.lastProjectedAt ? String(health.lastProjectedAt) : "n/a"}.
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {VIEWS.map((id) => (
            <Button key={id} variant={view === id ? "primary" : "secondary"} onClick={() => setView(id)}>
              {id === "assurance" ? "Assurance Gaps" : id[0].toUpperCase() + id.slice(1)}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="grid gap-1 text-sm">
            Object type
            <select className="rounded border p-2" value={objectType} onChange={(e) => setObjectType(e.target.value)}>
              {ROOT_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            Object id
            <input className="rounded border p-2" value={objectId} onChange={(e) => setObjectId(e.target.value)} placeholder="Canonical UUID" />
          </label>
          <Button onClick={() => void load()}>Open trace</Button>
        </div>
        {error ? <OperationalError message={error} /> : null}
        {!payload && !error ? (
          <EmptyOperationalState title="No thread loaded" body="Select a canonical object and open its authorized trace." />
        ) : null}
        {truncated ? <p className="text-sm">Trace truncated — increase is capped server-side (default depth 4, hard maximum 8).</p> : null}
        {explanations.length ? (
          <section className="space-y-1 rounded border p-4">
            <h2 className="font-medium">Explanation</h2>
            {explanations.map((line) => <p key={line}>{line}</p>)}
          </section>
        ) : null}
        {gaps.length ? (
          <section className="space-y-1 rounded border p-4">
            <h2 className="font-medium">Trace gaps</h2>
            {gaps.map((gap, i) => (
              <p key={i}>{String(gap.expectedStep)} — {String(gap.expectedRelation ?? "relation not present")} (not inferred)</p>
            ))}
          </section>
        ) : null}
        {findings.length ? (
          <section className="space-y-1 rounded border p-4">
            <h2 className="font-medium">Assurance conditions</h2>
            <p className="text-sm text-muted-foreground">These are review conditions, not automatic engineering defects. No universal score is computed.</p>
            {findings.map((finding, i) => (
              <p key={i}>{String(finding.code)}: {String(finding.condition)}</p>
            ))}
          </section>
        ) : null}
        {nodes.length ? (
          <section className="space-y-1 rounded border p-4">
            <h2 className="font-medium">Authorized objects</h2>
            <ul className="list-disc pl-5 text-sm">
              {nodes.map((node) => (
                <li key={`${String(node.objectType)}:${String(node.objectId)}`}>
                  {String(node.objectType)} {String(node.objectCode ?? node.objectId)} {node.stale ? "(stale)" : ""} {node.superseded ? "(superseded)" : ""}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {relationships.length ? (
          <section className="space-y-1 rounded border p-4">
            <h2 className="font-medium">Governed relations</h2>
            <ul className="list-disc pl-5 text-sm">
              {relationships.map((rel, i) => (
                <li key={i}>{String(rel.fromType)} {String(rel.fromId)} — {String(rel.relationship)} → {String(rel.toType)} {String(rel.toId)}</li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
    </div>
  );
}
