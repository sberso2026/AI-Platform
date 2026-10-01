"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Button } from "@rtb/ui";
import { EngineeringBreadcrumb } from "@/components/engineering/operational";
import { EngineeringProjectContextBar } from "@/components/engineering/project-context-bar";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import { useResolvedEngineeringProjectId } from "@/hooks/use-engineering-project-filter";

type Requirement = {
  id: string;
  title: string;
  whyRequired: string;
  requirementType: string;
  purpose: string;
  status: string;
  providerDiscipline?: string | null;
  consumerDiscipline?: string | null;
  blocking: boolean;
  workType?: string | null;
  interfaceId?: string | null;
  constructionRequestId?: string | null;
};

type Readiness = {
  state: string;
  explanation: string;
  required: Requirement[];
  available: Array<{ requirementId: string }>;
  missing: Array<{ requirementId: string }>;
  stale: Array<{ requirementId: string }>;
  unaccepted: Array<{ requirementId: string }>;
  engineeringApproved: false;
  projectReadinessScore: null;
};

type Views = {
  neededByMe: Requirement[];
  waitingOnOthers: Requirement[];
  readyToUse: Requirement[];
  needsReview: Requirement[];
  blockingMyWork: Requirement[];
  handoverRequirements: Requirement[];
};

type HandoverPackage = {
  id: string;
  displayName: string;
  state: string;
  systemId?: string | null;
  assetId?: string | null;
  discipline?: string | null;
  lifecycleStage?: string | null;
};

const VIEWS = ["Needed by Me", "Waiting on Others", "Ready to Use", "Needs Review", "Blocking My Work", "Handover Requirements"] as const;

export function InformationRequirementWorkspace() {
  const projectId = useResolvedEngineeringProjectId();
  const [view, setView] = useState<(typeof VIEWS)[number]>("Needed by Me");
  const [workType, setWorkType] = useState("FOUNDATION_CALCULATION");
  const [rows, setRows] = useState<Requirement[]>([]);
  const [views, setViews] = useState<Views | null>(null);
  const [readiness, setReadiness] = useState<Readiness | null>(null);
  const [packages, setPackages] = useState<HandoverPackage[]>([]);
  const [handover, setHandover] = useState<{ completeness?: { completeness: string; explanation: string }; package?: HandoverPackage } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [informationRefId, setInformationRefId] = useState("");
  const [managedRepositoryId, setManagedRepositoryId] = useState("");

  async function reload() {
    if (!projectId) return;
    const listed = await parseApiJsonResponse<Requirement[]>(
      await fetch(`/api/engineering/information-requirements?action=list&projectId=${encodeURIComponent(projectId)}`),
    );
    if (listed.errorMessage) setError(listed.errorMessage);
    setRows(Array.isArray(listed.data) ? listed.data : []);
    const snapshot = await parseApiJsonResponse<{ views: Views; readiness: Readiness }>(
      await fetch(`/api/engineering/information-requirements?action=views&projectId=${encodeURIComponent(projectId)}&workType=${encodeURIComponent(workType)}`),
    );
    if (snapshot.errorMessage) setError(snapshot.errorMessage);
    setViews(snapshot.data?.views ?? null);
    setReadiness(snapshot.data?.readiness ?? null);
    const pkgs = await parseApiJsonResponse<HandoverPackage[]>(
      await fetch(`/api/engineering/information-requirements?action=packages&projectId=${encodeURIComponent(projectId)}`),
    );
    const packageRows = Array.isArray(pkgs.data) ? pkgs.data : [];
    setPackages(packageRows);
    if (packageRows[0]) {
      const evaluated = await parseApiJsonResponse<{ completeness: { completeness: string; explanation: string }; package: HandoverPackage }>(
        await fetch(`/api/engineering/information-requirements?action=handover&projectId=${encodeURIComponent(projectId)}&packageId=${encodeURIComponent(packageRows[0].id)}`),
      );
      setHandover(evaluated.data ?? null);
    }
  }

  useEffect(() => {
    void reload();
  }, [projectId, workType]);

  async function post(body: Record<string, unknown>) {
    const response = await fetch("/api/engineering/information-requirements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, ...body }),
    });
    const json = await parseApiJsonResponse<unknown>(response);
    if (json.errorMessage) setError(json.errorMessage);
    await reload();
    return json;
  }

  const filtered = useMemo(() => {
    if (!views) return rows;
    if (view === "Waiting on Others") return views.waitingOnOthers;
    if (view === "Ready to Use") return views.readyToUse;
    if (view === "Needs Review") return views.needsReview;
    if (view === "Blocking My Work") return views.blockingMyWork;
    if (view === "Handover Requirements") return views.handoverRequirements;
    return views.neededByMe;
  }, [rows, views, view]);

  const startDisabled = Boolean(readiness && readiness.state !== "READY" && readiness.state !== "READY_WITH_CONDITIONS");

  return (
    <>
      <Header title="Information Requirements" description="What information is required to start engineering work, who provides it, and whether it is accepted for purpose. Not a document register and not engineering approval." />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        <EngineeringBreadcrumb items={[{ label: "Engineering", href: "/engineering" }, { label: "Information Requirements" }]} />
        <EngineeringProjectContextBar />
        {error && <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          {VIEWS.map((item) => (
            <button key={item} type="button" className={`eos-select ${view === item ? "font-semibold" : ""}`} onClick={() => setView(item)}>
              {item}
            </button>
          ))}
        </div>
        <section className="mt-4 rounded border p-4 text-sm" aria-label="Work readiness">
          <div className="flex flex-wrap items-center gap-3">
            <label>
              Engineering work
              <select className="eos-select mt-1 block" value={workType} onChange={(event) => setWorkType(event.target.value)} aria-label="Engineering work type">
                <option value="FOUNDATION_CALCULATION">Foundation calculation</option>
                <option value="CROSS_DISCIPLINE_INTERFACE">Cross-discipline interface</option>
                <option value="CONSTRUCTION_CLARIFICATION">Construction clarification</option>
                <option value="SUBSYSTEM_HANDOVER">Subsystem handover</option>
              </select>
            </label>
            <Button type="button" onClick={() => void post({
              action: "instantiate",
              workType,
              lifecycleStage: workType === "CONSTRUCTION_CLARIFICATION" ? "CONSTRUCTION" : workType === "SUBSYSTEM_HANDOVER" ? "COMMISSIONING" : "FEED",
              constructionRequestId: workType === "CONSTRUCTION_CLARIFICATION" ? "rfi-anchor-bolt-location" : null,
            })}>Prepare required information</Button>
            <label>
              Information ref
              <input className="eos-select mt-1 block" value={informationRefId} onChange={(event) => setInformationRefId(event.target.value)} aria-label="Information ref id" />
            </label>
            <label>
              Managed repository
              <input className="eos-select mt-1 block" value={managedRepositoryId} onChange={(event) => setManagedRepositoryId(event.target.value)} aria-label="Managed repository id" />
            </label>
            <Button type="button" disabled={startDisabled} onClick={() => void post({ action: "startWork", workType })}>Start Work</Button>
          </div>
          {readiness && (
            <div className="mt-3 space-y-1">
              <p><strong>{readiness.state}</strong> — {readiness.explanation}</p>
              <p>Required: {readiness.required.length} · Available: {readiness.available.length} · Missing: {readiness.missing.length} · Stale: {readiness.stale.length} · Awaiting acceptance: {readiness.unaccepted.length}</p>
              <p className="text-muted-foreground">Not a project readiness score. ACCEPTED_FOR_PURPOSE is not engineering approval.</p>
            </div>
          )}
        </section>
        <section className="mt-4 space-y-3" aria-label={view}>
          {filtered.map((row) => (
            <article key={row.id} className="rounded border p-3 text-sm">
              <p className="font-medium">{row.title}</p>
              <p>{row.whyRequired}</p>
              <p>{row.status} · {row.requirementType} · {row.purpose}</p>
              <p>Provider {row.providerDiscipline ?? row.requirementType} → Consumer {row.consumerDiscipline ?? "engineering"}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button type="button" onClick={() => void post({ action: "applyAction", requirementId: row.id, workflowAction: "requestInformation" })}>Request Missing Information</Button>
                <Button type="button" onClick={() => void post({ action: "applyAction", requirementId: row.id, workflowAction: "reviewInformation" })}>Review Information</Button>
                <Button type="button" onClick={() => void post({
                  action: "applyAction",
                  requirementId: row.id,
                  workflowAction: "receiveInformation",
                  informationRefId: informationRefId || null,
                  managedRepositoryId: managedRepositoryId || null,
                })}>Receive Information</Button>
                <Button type="button" onClick={() => void post({
                  action: "applyAction",
                  requirementId: row.id,
                  workflowAction: "acceptForPurpose",
                  informationRefId: informationRefId || null,
                  managedRepositoryId: managedRepositoryId || null,
                })}>Accept for Purpose</Button>
                <Button type="button" onClick={() => void post({ action: "applyAction", requirementId: row.id, workflowAction: "rejectRevision" })}>Reject / Request Revision</Button>
                <Link className="font-medium underline-offset-2 hover:underline" href="/engineering/information">Open Source</Link>
              </div>
            </article>
          ))}
          {!filtered.length && <p className="text-sm text-muted-foreground">No information requirements in this view. Prepare required information for the selected engineering work.</p>}
        </section>
        <section className="mt-6 rounded border p-4 text-sm" aria-label="Handover package">
          <p className="font-medium">Handover package</p>
          <Button className="mt-2" type="button" onClick={() => void post({
            action: "assembleHandover",
            displayName: "Subsystem handover",
            requirementIds: (views?.handoverRequirements ?? []).map((row) => row.id),
          })}>Assemble handover package</Button>
          {packages.map((pkg) => (
            <div key={pkg.id} className="mt-3">
              <p>{pkg.displayName} · {pkg.state} · system {pkg.systemId ?? "—"} · discipline {pkg.discipline ?? "—"} · stage {pkg.lifecycleStage ?? "—"}</p>
              {handover?.completeness && (
                <p>{handover.completeness.completeness}: {handover.completeness.explanation}</p>
              )}
              <Button className="mt-2" type="button" onClick={() => void post({ action: "acceptHandover", packageId: pkg.id })}>Accept handover</Button>
            </div>
          ))}
          <p className="mt-2 text-muted-foreground">Human acceptance is required. Completeness is COMPLETE / PARTIAL / INCOMPLETE / STALE / CONFLICTED, not a percentage.</p>
        </section>
      </main>
    </>
  );
}
