"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@rtb/ui";
import { Header } from "@/components/layout/header";
import { EngineeringBreadcrumb } from "@/components/engineering/operational";
import { EngineeringProjectContextBar } from "@/components/engineering/project-context-bar";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import { useResolvedEngineeringProjectId } from "@/hooks/use-engineering-project-filter";
import { useIdentityAssurance } from "@/hooks/use-identity-assurance";

type InfoRef = {
  id: string;
  sourceObjectType: string;
  sourceObjectId: string;
  informationType: string;
  sourceKind: string;
  discipline?: string | null;
  responsibleDiscipline?: string | null;
  lifecycleStage?: string | null;
  purpose: string;
  eligibility: string;
  sourceFacts?: { revision?: string | null; superseded?: boolean; stale?: boolean };
};

type Resolution = {
  id: string;
  outcome: string;
  authorityState: string;
  freshness: string;
  selectedRefId: string | null;
  policyId: string | null;
  policyVersion: string | null;
  explanation: {
    whyApplies: string;
    policy: string;
    scope: string;
    revision: string;
    alternatives: string[];
    ineligible: string[];
    conflictOrAmbiguity: string | null;
    engineeringApproved: false;
  };
};

const VIEWS = [
  "Current Information",
  "Authoritative Sources",
  "Working Information",
  "Stale",
  "Superseded",
  "Authority Conflicts",
  "By Discipline",
  "By System",
  "By Lifecycle Stage",
] as const;

export function InformationWorkspace() {
  const projectId = useResolvedEngineeringProjectId();
  const assurance = useIdentityAssurance();
  const [view, setView] = useState<(typeof VIEWS)[number]>("Current Information");
  const [rows, setRows] = useState<InfoRef[]>([]);
  const [resolution, setResolution] = useState<Resolution | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [purpose, setPurpose] = useState("FOR_ENGINEERING_REVIEW");
  const [informationType, setInformationType] = useState("DESIGN_CRITERIA");

  useEffect(() => {
    if (!projectId) return;
    fetch(`/api/engineering/information?action=list&projectId=${encodeURIComponent(projectId)}`)
      .then((response) => parseApiJsonResponse<InfoRef[]>(response))
      .then((json) => {
        if (!json.ok) {
          setError(json.errorMessage ?? "Failed to load information references");
          setRows([]);
          return;
        }
        setRows(Array.isArray(json.data) ? json.data : []);
      })
      .catch((err: Error) => setError(err.message));
  }, [projectId]);

  const filtered = useMemo(() => {
    if (view === "Authoritative Sources") return rows.filter((row) => row.eligibility === "ELIGIBLE_AUTHORITATIVE");
    if (view === "Working Information") return rows.filter((row) => row.eligibility === "WORKING");
    if (view === "Stale") return rows.filter((row) => row.sourceFacts?.stale);
    if (view === "Superseded") return rows.filter((row) => row.sourceFacts?.superseded);
    if (view === "Authority Conflicts") return resolution?.outcome === "CONFLICT" ? rows.filter((row) => row.eligibility === "ELIGIBLE_AUTHORITATIVE") : [];
    if (view === "By Discipline") return [...rows].sort((a, b) => String(a.responsibleDiscipline ?? "").localeCompare(String(b.responsibleDiscipline ?? "")));
    if (view === "By Lifecycle Stage") return [...rows].sort((a, b) => String(a.lifecycleStage ?? "").localeCompare(String(b.lifecycleStage ?? "")));
    return rows;
  }, [rows, view, resolution]);

  async function resolveAuthority() {
    if (!projectId) return;
    const response = await fetch("/api/engineering/information", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "resolve", projectId, informationType, purpose }),
    });
    const json = await parseApiJsonResponse<Resolution>(response);
    if (!json.ok) {
      setError(json.errorMessage ?? "Failed to resolve information authority");
      setResolution(null);
      return;
    }
    setResolution(json.data ?? null);
  }

  return (
    <>
      <Header title="Engineering Information" description="Governed information context, authority, applicability, and provenance. Not a document store." />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        <EngineeringBreadcrumb items={[{ label: "Engineering", href: "/engineering" }, { label: "Information" }]} />
        <EngineeringProjectContextBar />
        {error && <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>}
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="text-sm">
            View
            <select className="eos-select mt-1 block" value={view} onChange={(event) => setView(event.target.value as (typeof VIEWS)[number])} aria-label="Information view">
              {VIEWS.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Information type
            <select className="eos-select mt-1 block" value={informationType} onChange={(event) => setInformationType(event.target.value)} aria-label="Information type">
              <option value="DESIGN_CRITERIA">DESIGN_CRITERIA</option>
              <option value="LOAD_DATA">LOAD_DATA</option>
              <option value="MATERIAL_PROPERTY">MATERIAL_PROPERTY</option>
            </select>
          </label>
          <label className="text-sm">
            Purpose
            <select className="eos-select mt-1 block" value={purpose} onChange={(event) => setPurpose(event.target.value)} aria-label="Authority purpose">
              <option value="FOR_ENGINEERING_REVIEW">FOR_ENGINEERING_REVIEW</option>
              <option value="FOR_DESIGN_INPUT">FOR_DESIGN_INPUT</option>
              <option value="FOR_CONFIGURATION">FOR_CONFIGURATION</option>
            </select>
          </label>
          <Button type="button" onClick={() => void resolveAuthority()} disabled={assurance.aal !== "aal2"}>
            Resolve authority
          </Button>
        </div>
        {resolution && (
          <section className="mt-4 rounded border p-4 text-sm" aria-label="Authority explanation">
            <p><strong>Outcome:</strong> {resolution.outcome} · <strong>Authority:</strong> {resolution.authorityState} · <strong>Freshness:</strong> {resolution.freshness}</p>
            <p className="mt-2">{resolution.explanation.whyApplies}</p>
            <p className="mt-1">Policy {resolution.explanation.policy}. Scope {resolution.explanation.scope}. Revision {resolution.explanation.revision}.</p>
            {resolution.explanation.conflictOrAmbiguity && <p className="mt-1" role="status">{resolution.explanation.conflictOrAmbiguity}</p>}
            <p className="mt-1 text-muted-foreground">Authority is not engineering approval, safety, or compliance.</p>
          </section>
        )}
        <ul className="mt-4 space-y-2">
          {filtered.map((row) => (
            <li key={row.id} className="rounded border p-3 text-sm">
              <Link className="font-medium underline-offset-2 hover:underline" href={`/engineering/information/${row.id}`}>
                {row.informationType} · {row.sourceObjectType}:{row.sourceObjectId}
              </Link>
              <p className="mt-1">
                Eligibility {row.eligibility}
                {row.sourceFacts?.revision ? ` · Rev ${row.sourceFacts.revision}` : ""}
                {row.responsibleDiscipline ? ` · ${row.responsibleDiscipline}` : ""}
                {row.sourceFacts?.superseded ? " · superseded" : ""}
                {row.sourceFacts?.stale ? " · stale" : ""}
              </p>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
