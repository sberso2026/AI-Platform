"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { EngineeringBreadcrumb } from "@/components/engineering/operational";
import { EngineeringProjectContextBar } from "@/components/engineering/project-context-bar";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import { persistEngineeringProjectFilter, useResolvedEngineeringProjectId } from "@/hooks/use-engineering-project-filter";

type WorkReference = { objectId: string; title: string; whyIncluded: string };
type WorkAction = { code: string; label: string; availability: string; reason: string };
type WorkPlan = {
  id: string;
  projectId: string;
  workType: string;
  templateCode: string;
  templateVersion: string;
  status: string;
  readiness: string;
  startAllowed: boolean;
  staleness: string;
  discipline?: string | null;
  systemId?: string | null;
  assetId?: string | null;
  explanations: { whyBlocked: string | null; whyConditional: string | null; templateProvenance: string; engineeringApproved: false };
  context: {
    information: Array<{ title: string; whyIncluded: string; freshness?: string | null; authorityOutcome?: string | null }>;
    gaps: Array<{ kind: string; title: string; explanation: string }>;
    requirements: WorkReference[];
    assumptions: WorkReference[];
    interfaces: WorkReference[];
    decisions: WorkReference[];
    analyses: WorkReference[];
    expectedOutputs: Array<{ outputType: string; title: string; generated: boolean }>;
    actions: WorkAction[];
    conditions: string[];
  };
};

type GeneratedArtifact = {
  id: string;
  artifactType: string;
  outputFormat?: string;
  fileName: string;
  status: string;
  templateCode: string;
  templateVersion: string;
  createdAt: string;
  lineageKind?: string;
  originArtifactId?: string | null;
  provenance: { inputFingerprint: string; engineeringApproved: false };
  warnings: string[];
};

type Launcher = {
  steps: string[];
  office: Array<{ artifactId: string; projectId: string; fileName: string; action: string; launchedNativeApplication: boolean; projectViewDiffers: boolean }>;
  governing: Array<{ title: string; action: string }>;
  drawing: { title: string; revision: string | null; action: string; selectedMostRecentlyModified: boolean } | null;
  analysis: { available: boolean; message: string; action: string };
  autocad: { connected: boolean; message: string };
  pdf: { generation: string; sources: Array<{ title: string; actions: string[] }> };
  externalToolCenterHref: string;
};

type ToolCatalog = {
  office: Array<{ name: string; message: string }>;
  spaceGass: { realSolverExecution: string; productionUsePermitted: boolean };
  desktopBridge: { status: string };
};

const OUTPUT_ACTIONS: Record<string, Array<{ artifactType: string; label: string }>> = {
  CALCULATION_WORKBOOK: [{ artifactType: "CALCULATION_WORKBOOK", label: "Generate Calculation Workbook" }],
  DESIGN_REPORT: [{ artifactType: "DESIGN_REPORT", label: "Generate Design Report" }],
  SPECIFICATION: [{ artifactType: "SPECIFICATION", label: "Generate Specification" }],
  OPTION_STUDY: [
    { artifactType: "OPTION_STUDY", label: "Generate Option Study" },
    { artifactType: "OPTION_STUDY_PRESENTATION", label: "Generate Presentation" },
  ],
  RFI_RESPONSE: [{ artifactType: "RFI_RESPONSE", label: "Generate RFI Response" }],
  TQ_RESPONSE: [{ artifactType: "TQ_RESPONSE", label: "Generate TQ Response" }],
  CONCEPT_STUDY: [{ artifactType: "TECHNICAL_MEMORANDUM", label: "Generate Technical Memorandum" }],
};

function officeLabel(format?: string) {
  if (format === "DOCX") return "Download and Open in Word";
  if (format === "PPTX") return "Download and Open in PowerPoint";
  return "Download and Open in Excel";
}

export default function WorkPlanPage() {
  const params = useParams<{ id: string }>();
  const selectedProjectId = useResolvedEngineeringProjectId();
  const [plan, setPlan] = useState<WorkPlan | null>(null);
  const [artifacts, setArtifacts] = useState<GeneratedArtifact[]>([]);
  const [launcher, setLauncher] = useState<Launcher | null>(null);
  const [tools, setTools] = useState<ToolCatalog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [diff, setDiff] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [provenance, setProvenance] = useState<string | null>(null);
  const [projectNotice, setProjectNotice] = useState<string | null>(null);
  const [publishFor, setPublishFor] = useState<string | null>(null);

  async function load() {
    const response = await fetch(`/api/engineering/work?action=plan&id=${encodeURIComponent(params.id)}&selectedProjectId=${encodeURIComponent(selectedProjectId ?? "")}`);
    const json = await parseApiJsonResponse<WorkPlan>(response);
    if (json.errorMessage) setError(json.errorMessage);
    else {
      setPlan(json.data);
      const raw = json.raw as { artifacts?: GeneratedArtifact[]; launcher?: Launcher; tools?: ToolCatalog } | null;
      if (raw?.launcher) setLauncher(raw.launcher);
      if (raw?.tools) setTools(raw.tools);
    }
    const listed = await fetch(`/api/engineering/work?action=artifacts&planId=${encodeURIComponent(params.id)}`);
    const listedJson = await parseApiJsonResponse<GeneratedArtifact[]>(listed);
    if (!listedJson.errorMessage && listedJson.data) setArtifacts(listedJson.data);
  }

  useEffect(() => {
    void load();
  }, [params.id, selectedProjectId]);

  async function act(action: string, extra: Record<string, unknown> = {}) {
    setError(null);
    setMessage(null);
    const response = await fetch("/api/engineering/work", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, id: params.id, selectedProjectId, ...extra }),
    });
    const json = await parseApiJsonResponse<{
      allowed?: boolean;
      reason?: string | null;
      plan?: WorkPlan;
      diff?: Record<string, unknown>;
      next?: WorkPlan;
      ok?: boolean;
      run?: { status: string; explanation?: string | null };
      artifact?: GeneratedArtifact;
      launchedNativeApplication?: boolean;
      downloadAction?: string;
      execution?: { blocked?: boolean; reason?: string };
      view?: { mismatch?: boolean; message?: string };
      originalPreserved?: boolean;
      returned?: GeneratedArtifact;
    }>(response);
    if (json.errorMessage) {
      setError(json.errorMessage);
      return;
    }
    const view = json.data && "view" in json.data ? json.data.view : undefined;
    if (view?.mismatch) setProjectNotice(view.message ?? "This artifact belongs to another project.");
    if (action === "startPlan") {
      if (json.data?.allowed) setMessage("Engineering work started. This is not engineering approval.");
      else setError(json.data?.reason ?? "Start is blocked.");
      if (json.data?.plan) setPlan(json.data.plan);
      return;
    }
    if (action === "refreshPlan" && json.data?.next) {
      setPlan(json.data.next);
      setDiff(JSON.stringify(json.data.diff ?? {}, null, 2));
      setMessage("Engineering context refreshed. Historical plan provenance is retained.");
      return;
    }
    if (action === "generateArtifact") {
      if (json.data?.ok === false) {
        setError(json.data.run?.explanation ?? "Generation blocked. Required information is missing.");
        return;
      }
      setMessage("Draft artifact generated. Engineer review required. This is not engineering approval.");
      await load();
      return;
    }
    if (action === "prepareHandoff") {
      setMessage(
        json.data?.launchedNativeApplication
          ? "Native application launched."
          : `${json.data?.downloadAction ?? "Handoff prepared"}. EOS did not launch Office. Local copies are not monitored after download.`,
      );
      await load();
      return;
    }
    if (action === "prepareAnalysisRequest") {
      setMessage(
        json.data?.execution?.blocked
          ? "Analysis request prepared. Tool execution currently unavailable / external dependency. SPACE GASS remains uncertified."
          : "Analysis request prepared.",
      );
      return;
    }
    if (action === "publishUpdatedArtifact") {
      setMessage(
        json.data?.originalPreserved
          ? "Returned artifact published as a new governed version. Original generated draft is preserved. Review required. Tool use is not engineering approval."
          : "Returned artifact recorded.",
      );
      setPublishFor(null);
      await load();
      return;
    }
    if (action === "openGoverningSource") {
      setMessage("Governing source opened in EOS. Direct private repository URLs are not exposed.");
      return;
    }
    await load();
  }

  async function download(id: string, label?: string) {
    await act("prepareHandoff", { workPlanId: params.id, artifactId: id, mode: "BROWSER_DOWNLOAD" });
    const response = await fetch(`/api/engineering/work?action=downloadArtifact&id=${encodeURIComponent(id)}`);
    if (!response.ok) {
      setError("Download denied.");
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const disposition = response.headers.get("Content-Disposition") ?? "";
    const match = disposition.match(/filename="([^"]+)"/);
    link.download = match?.[1] ?? "ENGINEERING_ARTIFACT_DRAFT";
    link.click();
    URL.revokeObjectURL(url);
    setMessage(`${label ?? "Download"}. EOS does not launch the desktop application and does not monitor the local copy.`);
  }

  async function compare(artifact: GeneratedArtifact) {
    const response = await fetch("/api/engineering/work", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "compareArtifact", id: params.id, artifactId: artifact.id }),
    });
    const json = await parseApiJsonResponse<{ stale?: boolean; message?: string }>(response);
    setDiff(JSON.stringify(json.data ?? {}, null, 2));
    if (json.data?.stale) setMessage("Artifact generated from older context");
  }

  async function publishFile(originArtifactId: string, file: File) {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    const contentBase64 = btoa(binary);
    await act("publishUpdatedArtifact", {
      originArtifactId,
      fileName: file.name,
      contentBase64,
    });
  }

  return (
    <>
      <Header title="Engineering Work Plan" description="Governed context and actions for engineering work. EOS prepares the desk; it does not approve design." />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8">
        <EngineeringBreadcrumb items={[{ label: "Work", href: "/engineering/work" }, { label: "Work plan" }]} />
        <EngineeringProjectContextBar />
        {error && <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>}
        {message && <p className="mt-3 text-sm">{message}</p>}
        {projectNotice && plan && (
          <div className="mt-3 rounded border p-3 text-sm" role="status">
            <p>{projectNotice}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" className="rounded border px-3 py-1" onClick={() => persistEngineeringProjectFilter(plan.projectId)}>Switch EOS View</button>
              <button type="button" className="rounded border px-3 py-1" onClick={() => setProjectNotice(null)}>Continue without switching</button>
            </div>
          </div>
        )}
        {plan && (
          <>
            <p className="mt-4 text-sm">
              {plan.workType.replaceAll("_", " ")} · Status: {plan.readiness.replaceAll("_", " ")} · {plan.status} · {plan.explanations.templateProvenance}
              {plan.systemId ? ` · ${plan.systemId}` : ""}
            </p>
            {plan.explanations.whyBlocked && <p className="mt-2 text-sm">{plan.explanations.whyBlocked}</p>}
            {plan.explanations.whyConditional && <p className="mt-2 text-sm">{plan.explanations.whyConditional}</p>}
            {plan.context.conditions.length > 0 && (
              <ul className="mt-2 list-disc pl-5 text-sm">
                {plan.context.conditions.map((row) => <li key={row}>{row}</li>)}
              </ul>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className="rounded border px-3 py-2 text-sm" onClick={() => void act("startPlan")}>Start Engineering Work</button>
              {plan.readiness === "READY_WITH_CONDITIONS" && (
                <button type="button" className="rounded border px-3 py-2 text-sm" onClick={() => void act("startPlan", { acknowledged: true })}>
                  Acknowledge conditions and start
                </button>
              )}
              <button type="button" className="rounded border px-3 py-2 text-sm" onClick={() => void act("refreshPlan")}>Refresh Engineering Context</button>
            </div>
            {launcher && (
              <section className="mt-6 text-sm">
                <h2 className="font-semibold">Work launcher</h2>
                <ol className="mt-2 list-decimal pl-5 space-y-1">
                  {launcher.steps.map((step) => <li key={step}>{step}</li>)}
                </ol>
                <p className="mt-3">Excel: Available through download/open</p>
                <p>SPACE GASS: Not certified for automated execution</p>
                <p>AutoCAD: {launcher.autocad.message}</p>
                <p>Acrobat/PDF: generation {launcher.pdf.generation.toLowerCase()}. Open current governed PDF only.</p>
                <p>Desktop Bridge: {tools?.desktopBridge.status ?? "CONTRACT_ONLY"}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="button" className="rounded border px-3 py-1" onClick={() => void act("prepareAnalysisRequest", { workPlanId: plan.id })}>Prepare Analysis Request</button>
                  <Link className="rounded border px-3 py-1" href={launcher.externalToolCenterHref}>External Tool Governance</Link>
                </div>
              </section>
            )}
            <section className="mt-6 text-sm">
              <h2 className="font-semibold">Governing Information</h2>
              <p className="mt-1 text-muted-foreground">{plan.context.information.length} governing inputs</p>
              <ul className="mt-2 space-y-1">
                {plan.context.information.map((row) => (
                  <li key={row.title}>
                    {row.title} — {row.whyIncluded}{" "}
                    <button type="button" className="rounded border px-2 py-0.5" onClick={() => void act("openGoverningSource", { workPlanId: plan.id, sourceTitle: row.title })}>Open Governing Source</button>
                  </li>
                ))}
              </ul>
              {launcher?.drawing && (
                <p className="mt-3">
                  Current drawing: {launcher.drawing.title} {launcher.drawing.revision ? `(rev ${launcher.drawing.revision})` : ""} — not the most recently modified file.{" "}
                  <button type="button" className="rounded border px-2 py-0.5" onClick={() => void act("openGoverningSource", { workPlanId: plan.id, sourceTitle: launcher.drawing?.title })}>Open Current Drawing</button>
                </p>
              )}
              {launcher?.pdf.sources.map((row) => (
                <p key={row.title} className="mt-2">
                  {row.title}: {row.actions.join(" · ")}{" "}
                  <button type="button" className="rounded border px-2 py-0.5" onClick={() => void act("openGoverningSource", { workPlanId: plan.id, sourceTitle: row.title })}>Open Current PDF</button>
                </p>
              ))}
              <h2 className="mt-4 font-semibold">Information gaps</h2>
              <ul className="mt-2 space-y-1">{plan.context.gaps.map((row) => <li key={row.title}>{row.kind}: {row.title}</li>)}</ul>
              <h2 className="mt-4 font-semibold">Requirements</h2>
              <ul className="mt-2 space-y-1">{plan.context.requirements.map((row) => <li key={row.objectId}>{row.title} — {row.whyIncluded}</li>)}</ul>
              <h2 className="mt-4 font-semibold">Interfaces</h2>
              <ul className="mt-2 space-y-1">{plan.context.interfaces.map((row) => <li key={row.objectId}>{row.title} — {row.whyIncluded}</li>)}</ul>
              <h2 className="mt-4 font-semibold">Assumptions</h2>
              <ul className="mt-2 space-y-1">{plan.context.assumptions.map((row) => <li key={row.objectId}>{row.title} — {row.whyIncluded}</li>)}</ul>
              <h2 className="mt-4 font-semibold">Decisions</h2>
              <ul className="mt-2 space-y-1">{plan.context.decisions.map((row) => <li key={row.objectId}>{row.title} — {row.whyIncluded}</li>)}</ul>
              <h2 className="mt-4 font-semibold">Expected outputs</h2>
              <ul className="mt-2 space-y-3">
                {plan.context.expectedOutputs.map((row) => {
                  const generated = artifacts.filter((item) => item.artifactType === row.outputType || (row.outputType === "OPTION_STUDY" && item.artifactType === "OPTION_STUDY_PRESENTATION") || (row.outputType === "CONCEPT_STUDY" && item.artifactType === "TECHNICAL_MEMORANDUM"));
                  return (
                    <li key={row.outputType}>
                      <p>{generated.length ? "✓" : "○"} {row.outputType.replaceAll("_", " ")}</p>
                      {(OUTPUT_ACTIONS[row.outputType] ?? []).map((action) => (
                        <button
                          key={action.artifactType}
                          type="button"
                          className="mr-2 mt-1 rounded border px-3 py-1 text-sm"
                          onClick={() => void act("generateArtifact", { workPlanId: plan.id, artifactType: action.artifactType, projectCode: "ER-A1" })}
                        >
                          {action.label.replace("Generate ", "Generate")}
                        </button>
                      ))}
                      {generated.map((item) => (
                        <div key={item.id} className="mt-1 flex flex-wrap items-center gap-2">
                          <span>{item.fileName} · {item.status.replaceAll("_", " ")} · {item.lineageKind === "RETURNED_FROM_ENGINEER" ? "returned from engineer" : "generated draft"}</span>
                          <button type="button" className="rounded border px-2 py-1" onClick={() => void download(item.id, officeLabel(item.outputFormat))}>{officeLabel(item.outputFormat)}</button>
                          <button type="button" className="rounded border px-2 py-1" onClick={() => void act("prepareHandoff", { workPlanId: plan.id, artifactId: item.id, mode: "MANAGED_REPOSITORY_OPEN" })}>Prepare Tool Handoff</button>
                          <button type="button" className="rounded border px-2 py-1" onClick={() => setProvenance(JSON.stringify(item.provenance, null, 2))}>View Provenance</button>
                          <button type="button" className="rounded border px-2 py-1" onClick={() => void act("generateArtifact", { workPlanId: plan.id, artifactType: item.artifactType, projectCode: "ER-A1" })}>Regenerate</button>
                          <button type="button" className="rounded border px-2 py-1" onClick={() => void compare(item)}>Compare Context</button>
                          {item.lineageKind !== "RETURNED_FROM_ENGINEER" && (
                            <>
                              <button type="button" className="rounded border px-2 py-1" onClick={() => setPublishFor(item.id)}>Publish Updated Artifact</button>
                              {publishFor === item.id && (
                                <input
                                  type="file"
                                  accept=".xlsx,.docx,.pptx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                                  onChange={(event) => {
                                    const file = event.target.files?.[0];
                                    if (file) void publishFile(item.id, file);
                                  }}
                                />
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </li>
                  );
                })}
              </ul>
              <h2 className="mt-4 font-semibold">Actions</h2>
              <ul className="mt-2 space-y-1">
                {plan.context.actions.map((row) => (
                  <li key={row.code}>{row.label} · {row.availability.replaceAll("_", " ")} — {row.reason}</li>
                ))}
              </ul>
            </section>
            {diff && <pre className="mt-4 overflow-auto rounded border p-3 text-xs">{diff}</pre>}
            {provenance && <pre className="mt-4 overflow-auto rounded border p-3 text-xs">{provenance}</pre>}
            <p className="mt-4 text-sm text-muted-foreground">Personal/unmanaged files remain outside EOS. Downloaded drafts are not automatically re-ingested or monitored. Tool use is not engineering approval. This is not an employee productivity record.</p>
          </>
        )}
      </main>
    </>
  );
}
