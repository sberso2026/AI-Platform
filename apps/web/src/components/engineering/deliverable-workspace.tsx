"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@rtb/ui";
import { Header } from "@/components/layout/header";
import {
  EmptyOperationalState,
  EngineeringBreadcrumb,
  OperationalError,
} from "@/components/engineering/operational";
import { EngineeringProjectContextBar } from "@/components/engineering/project-context-bar";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import { useResolvedEngineeringProjectId } from "@/hooks/use-engineering-project-filter";
import { useIdentityAssurance } from "@/hooks/use-identity-assurance";
import { useEngineeringWriteAccess } from "@/hooks/use-engineering-write-access";

type Listed = {
  id: string;
  definitionCode: string;
  lifecycleStage: string;
  responsibleDiscipline: string;
  contributingDisciplines: string[];
  intendedPurpose: string;
  requirementState: string;
  scopeType: string;
  scopeId: string;
  boundCount: number;
  status: string;
  adoptedFromTemplate?: boolean;
  latest?: {
    completeness: string;
    readiness: string;
    stale: boolean;
    dimensions: Array<{ dimension: string; state: string; explanation: string; waived?: boolean }>;
    digitalThread: string;
    assuranceSignals: Array<{ conditionType: string; explanation: string }>;
    evidenceFingerprint?: string;
  } | null;
};

type Template = {
  definitionId: string;
  code: string;
  name: string;
  origin: string;
  responsibleDiscipline: string;
  lifecycleStages: string[];
  adopted?: boolean;
  notApplicable?: boolean;
};

type Binding = {
  artifactClass: string;
  artifactId: string;
  artifactRole: string;
  revisionPolicy?: string | null;
  revisionRef?: string | null;
  resolvedRevision?: string | null;
  rawStatusCode?: string | null;
  mappedSemantic?: string | null;
};

const VIEWS = [
  { id: "active", label: "Active Deliverables" },
  { id: "templates", label: "Templates Available" },
  { id: "missing", label: "Missing Required Deliverables" },
  { id: "maturity", label: "Maturity" },
  { id: "stale", label: "Stale" },
  { id: "discipline", label: "By Discipline" },
  { id: "stage", label: "By Lifecycle Stage" },
] as const;

export function DeliverableWorkspace() {
  const params = typeof window === "undefined" ? null : new URLSearchParams(window.location.search);
  const [view, setView] = useState<(typeof VIEWS)[number]["id"]>((params?.get("view") as (typeof VIEWS)[number]["id"]) ?? "active");
  const projectId = useResolvedEngineeringProjectId();
  const assurance = useIdentityAssurance();
  const { canMutate } = useEngineeringWriteAccess();
  const [note, setNote] = useState("");
  const [rows, setRows] = useState<Listed[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selected, setSelected] = useState<Listed | null>(null);
  const [detail, setDetail] = useState<{
    definition?: { origin?: string; definitionVersion?: string; name?: string };
    bindings?: Binding[];
    expectation?: Listed;
    latest?: Listed["latest"];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const aal2 = assurance.aal === "aal2";
  const canAdopt = Boolean(projectId) && aal2 && canMutate;

  const visible = useMemo(() => {
    if (view === "missing") return rows.filter((row) => row.requirementState === "REQUIRED" && row.status === "MISSING");
    if (view === "maturity") return rows.filter((row) => row.latest);
    if (view === "stale") return rows.filter((row) => row.status === "STALE" || row.latest?.stale);
    return rows;
  }, [rows, view]);

  async function load() {
    if (!projectId) {
      setRows([]);
      setTemplates([]);
      setNote("");
      return;
    }
    setError(null);
    const parsed = await parseApiJsonResponse(
      await fetch(`/api/engineering/deliverables?action=list&projectId=${encodeURIComponent(projectId)}`),
    );
    if (!parsed.ok) {
      setError(parsed.errorMessage ?? "Unable to load deliverables");
      return;
    }
    const data = parsed.data as { expected?: Listed[]; templates?: Template[]; note?: string };
    setRows(data.expected ?? []);
    setTemplates(data.templates ?? []);
    setNote(data.note ?? "");
  }

  useEffect(() => {
    void load();
  }, [projectId]);

  async function evaluate(id: string) {
    const parsed = await parseApiJsonResponse(
      await fetch("/api/engineering/deliverables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "evaluate", expectationId: id }),
      }),
    );
    if (!parsed.ok) {
      setError(parsed.errorMessage ?? "Unable to evaluate deliverable");
      return;
    }
    await load();
  }

  async function adopt(code: string) {
    if (!canAdopt || !projectId) {
      setError("Template adoption requires an authorized AAL2 session and a selected project.");
      return;
    }
    const parsed = await parseApiJsonResponse(
      await fetch("/api/engineering/deliverables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "adopt", projectId, code }),
      }),
    );
    if (!parsed.ok) {
      setError(parsed.errorMessage ?? "Unable to adopt template");
      return;
    }
    await load();
    setView("active");
  }

  async function openDetail(row: Listed) {
    setSelected(row);
    const parsed = await parseApiJsonResponse(
      await fetch(`/api/engineering/deliverables?action=detail&id=${encodeURIComponent(row.id)}`),
    );
    if (!parsed.ok) {
      setError(parsed.errorMessage ?? "Unable to load deliverable detail");
      return;
    }
    setDetail(parsed.data as never);
  }

  return (
    <>
      <Header
        title="Deliverable Intelligence"
        description="Active expectations are separate from templates. Document status is not engineering approval."
        wrapDescription
      />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8">
        <EngineeringBreadcrumb items={[{ label: "Engineering", href: "/engineering" }, { label: "Deliverables" }]} />
        <EngineeringProjectContextBar />
        {error ? <OperationalError message={error} /> : null}
        <div className="mb-4 flex flex-wrap gap-2">
          {VIEWS.map((item) => (
            <Button key={item.id} size="sm" variant="secondary" onClick={() => setView(item.id)}>
              {item.label}
            </Button>
          ))}
        </div>
        <p className="mb-4 text-sm">
          {note ||
            "Template → adopt into the selected project → active Deliverable Expectation. Catalog examples are not mandatory until adopted."}
        </p>
        {!projectId ? (
          <EmptyOperationalState
            title="Select a project"
            description="Deliverables use the authorized project selector. Arbitrary project IDs are not mutation authority."
          />
        ) : null}
        {view === "templates" ? (
          <ul className="space-y-2 text-sm">
            {templates.map((row) => (
              <li key={row.definitionId} className="rounded border p-2">
                {row.code} — {row.name} ({row.origin}
                {row.adopted ? ", adopted" : ", not adopted"}
                {row.notApplicable ? ", not applicable" : ""})
                {!row.adopted && !row.notApplicable ? (
                  <Button className="ml-2" size="sm" disabled={!canAdopt} onClick={() => void adopt(row.code)}>
                    Adopt template
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
        {projectId && view !== "templates" && !visible.length ? (
          <EmptyOperationalState
            title="No active deliverable expectations"
            description="Adopt a template into this project. Catalog examples are not project requirements until adopted."
            action={
              <Button size="sm" data-testid="browse-templates" onClick={() => setView("templates")}>
                Browse Templates
              </Button>
            }
          />
        ) : null}
        {view === "discipline" ? (
          <ul className="space-y-2 text-sm">
            {visible.map((row) => (
              <li key={row.id} className="rounded border p-2">
                {row.responsibleDiscipline} owns {row.definitionCode}; contributing {row.contributingDisciplines.join(", ") || "none"}
              </li>
            ))}
          </ul>
        ) : null}
        {view === "stage" ? (
          <ul className="space-y-2 text-sm">
            {visible.map((row) => (
              <li key={row.id} className="rounded border p-2">
                {row.lifecycleStage}: {row.definitionCode} ({row.status})
              </li>
            ))}
          </ul>
        ) : null}
        {view !== "templates" && view !== "discipline" && view !== "stage" ? (
          <ul className="space-y-2 text-sm">
            {visible.map((row) => (
              <li key={row.id} className="rounded border p-2">
                <button type="button" className="underline" onClick={() => void openDetail(row)}>
                  {row.definitionCode}
                </button>{" "}
                {row.status} · {row.responsibleDiscipline} · {row.intendedPurpose}
                <Button className="ml-2" size="sm" disabled={!aal2} onClick={() => void evaluate(row.id)}>
                  Evaluate from canonical evidence
                </Button>
              </li>
            ))}
          </ul>
        ) : null}
        {selected ? (
          <section className="mt-6 space-y-2 rounded border p-3 text-sm" data-testid="deliverable-digital-thread">
            <p className="font-medium">{selected.definitionCode}</p>
            <p>Definition / version: {detail?.definition?.name ?? selected.definitionCode} {detail?.definition?.definitionVersion ?? ""}</p>
            <p>Template or project-specific: {detail?.definition?.origin ?? (selected.adoptedFromTemplate ? "TEMPLATE adopted" : "project")}</p>
            <p>Stage: {selected.lifecycleStage}</p>
            <p>Scope: {selected.scopeType} {selected.scopeId}</p>
            <p>Responsible: {selected.responsibleDiscipline}</p>
            <p>Contributing: {selected.contributingDisciplines.join(", ") || "none"}</p>
            <p>Required: {selected.requirementState}</p>
            <p>Purpose: {selected.intendedPurpose}</p>
            {(detail?.bindings ?? []).map((row) => (
              <p key={`${row.artifactClass}:${row.artifactId}:${row.artifactRole}`}>
                Binding {row.artifactRole} {row.artifactClass} {row.artifactId} · policy {row.revisionPolicy ?? "n/a"} · resolved {row.resolvedRevision ?? row.revisionRef ?? "n/a"} · raw {row.rawStatusCode ?? "n/a"} · mapped {row.mappedSemantic ?? "n/a"}
              </p>
            ))}
            <p>Readiness: {selected.latest?.readiness ?? "NOT_EVALUATED"}</p>
            <p>Completeness: {selected.latest?.completeness ?? "not assessed"}</p>
            <p>Stale: {selected.latest?.stale ? "yes" : "no"}</p>
            <p>Fingerprint: {selected.latest?.evidenceFingerprint ?? "none"}</p>
            <p>Thread: {selected.latest?.digitalThread ?? "none"}</p>
            {(selected.latest?.dimensions ?? []).map((row) => (
              <p key={row.dimension}>
                {row.dimension}: {row.state}
                {row.waived ? " (WAIVED)" : ""} — {row.explanation}
              </p>
            ))}
            {(selected.latest?.assuranceSignals ?? []).map((row) => (
              <p key={row.conditionType}>
                {row.conditionType}: {row.explanation}
              </p>
            ))}
          </section>
        ) : null}
      </main>
    </>
  );
}
