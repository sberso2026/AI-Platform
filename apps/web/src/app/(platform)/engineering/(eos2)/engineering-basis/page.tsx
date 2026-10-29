"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { PilotWorkflowPanel } from "@/components/engineering/pilot-workflow-panel";

type View = {
  stage: string;
  jurisdictionProfile: string | null;
  baselineId: string | null;
  basisCount: number;
  disciplines: string[];
  unresolvedBasis: number;
  unresolvedAssumptions: number;
  requirementCount: number;
  unverifiedRequirements: number;
  staleReferences: number;
  supersededInUse: string[];
  advisory: string;
};

const SECTIONS = ["Overview", "Design Basis", "Requirements", "Assumptions", "Criteria", "Engineering Inputs", "Sources", "Standards", "Traceability", "Reviews"] as const;

export default function EngineeringBasisPage() {
  const [view, setView] = useState<View | null>(null);
  const [persistedBasisSetCount, setPersistedBasisSetCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [section, setSection] = useState<(typeof SECTIONS)[number]>("Overview");
  const [discipline, setDiscipline] = useState("all");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    void fetch("/api/engineering/engineering-basis")
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) {
          setError(body.error ?? "Engineering basis is not available.");
          return;
        }
        setView(body.data.view as View);
        setPersistedBasisSetCount(
          typeof body.data.persistedBasisSetCount === "number"
            ? body.data.persistedBasisSetCount
            : Array.isArray(body.data.rows)
              ? body.data.rows.length
              : 0,
        );
      })
      .catch(() => setError("Engineering basis is not available."));
  }, []);

  const matrix = useMemo(() => {
    if (!view) return [];
    return [{
      id: "none",
      requirement: view.requirementCount ? "Requirements are stored on the basis set." : "No basis-chain requirement is recorded.",
      source: "Not copied from legacy requirements.",
      discipline,
      stage: view.stage,
      status,
      verificationMethod: "unassigned",
      verificationStatus: view.unverifiedRequirements ? "unverified" : "none",
      evidence: "none",
      owner: "unassigned",
    }];
  }, [view, discipline, status]);

  return (
    <>
      <Header
        title="Engineering basis"
        description="Design basis, requirements, criteria, assumptions, and inputs stay separate. Stage acceptance is not engineering approval."
        wrapDescription
      />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8">
        <PilotWorkflowPanel />
        <p className="mb-4 text-sm">
          <Link className="underline" href="/engineering/delivery-lifecycle">Delivery lifecycle</Link>
          {" · "}
          <Link className="underline" href="/engineering/structural">Structural delivery</Link>
        </p>
        <div className="mb-4 flex flex-wrap gap-2">
          {SECTIONS.map((item) => (
            <button key={item} type="button" className="text-sm underline" onClick={() => setSection(item)}>{item}</button>
          ))}
        </div>
        <div className="mb-4 flex flex-wrap gap-3 text-sm">
          <label>Discipline <select value={discipline} onChange={(event) => setDiscipline(event.target.value)}><option value="all">All</option><option value="common">Common</option></select></label>
          <label>Status <select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All</option><option value="current">Current</option><option value="superseded">Superseded</option></select></label>
        </div>
        {error ? <p className="text-sm">{error}</p> : null}
        {view && section === "Overview" ? (
          <section className="max-w-3xl space-y-2 text-sm" data-testid="engineering-basis-overview">
            <p data-testid="engineering-basis-overview-scope">
              Scaffold overview (not EOS 2 pilot persistence counts). Authoritative controlled-pilot state is in the
              Controlled production pilot validation panel above. Persisted basis sets visible to this workspace API: {persistedBasisSetCount}.
            </p>
            <p>Lifecycle stage: {view.stage === "not_classified" ? "Not classified." : view.stage}</p>
            <p>Design basis items: {view.basisCount}. Disciplines: {view.disciplines.length ? view.disciplines.join(", ") : "None declared."}</p>
            <p>Unresolved basis items: {view.unresolvedBasis}. Unresolved assumptions: {view.unresolvedAssumptions}.</p>
            <p>Requirements: {view.requirementCount}. Unverified: {view.unverifiedRequirements}.</p>
            <p>Stale references: {view.staleReferences}. Superseded references still in use: {view.supersededInUse.length}.</p>
            <p>Configuration baseline: {view.baselineId ?? "None."}</p>
            <p>Jurisdiction profile: {view.jurisdictionProfile ?? "Not set. No jurisdiction is universal."}</p>
            <p>{view.advisory}</p>
          </section>
        ) : null}
        {view && section === "Requirements" ? (
          <table className="text-sm" data-testid="requirements-matrix">
            <thead>
              <tr>
                <th>ID</th><th>Requirement</th><th>Source</th><th>Discipline</th><th>Stage</th><th>Status</th><th>Verification method</th><th>Verification status</th><th>Evidence</th><th>Owner</th>
              </tr>
            </thead>
            <tbody>
              {matrix.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td><td>{row.requirement}</td><td>{row.source}</td><td>{row.discipline}</td><td>{row.stage}</td><td>{row.status}</td><td>{row.verificationMethod}</td><td>{row.verificationStatus}</td><td>{row.evidence}</td><td>{row.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
        {view && section === "Traceability" ? (
          <p className="max-w-3xl text-sm">Select a requirement or design basis item from its register. Upstream and downstream links are listed as a bounded chain: source, requirement, basis, criterion, assumption, input, calculation or model, deliverable, and verification evidence.</p>
        ) : null}
        {view && section !== "Overview" && section !== "Requirements" && section !== "Traceability" ? (
          <p className="max-w-3xl text-sm">{section} uses the same basis set. Records appear here after they are created for this workspace. Nothing in this view approves the basis.</p>
        ) : null}
      </main>
    </>
  );
}
