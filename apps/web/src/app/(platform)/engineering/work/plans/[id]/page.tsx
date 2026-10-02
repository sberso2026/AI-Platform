"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
  lifecycleStage?: string | null;
  relatedObjectType?: string | null;
  relatedObjectId?: string | null;
  relatedChangeId?: string | null;
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
  supersededById?: string | null;
  provenance: {
    inputFingerprint: string;
    engineeringApproved: false;
    templateSourceClass?: string | null;
    templateFallbackUsed?: boolean;
    compositionFingerprint?: string | null;
    mtoRevision?: string | null;
    mtoStatus?: string | null;
    mtoFingerprint?: string | null;
    generatorVersion?: string | null;
    sourceManifest?: Record<string, unknown> | null;
    costStatus?: string | null;
    carbonStatus?: string | null;
  };
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

type PreIssueCondition = {
  code: string;
  title: string;
  explanation: string;
  materiality: string;
  origin: string;
  status: string;
  checkType: string;
  actions: Array<{ code: string; label: string; href?: string | null }>;
};

type PreIssueSummary = {
  headline: string;
  resultState: string | null;
  attentionRequired: number;
  passed: number;
  notEvaluated: number;
  items: string[];
  reviewingGeneratedDraft?: boolean;
  deterministicReview?: string;
  semanticAiReview?: string;
  conditions?: PreIssueCondition[];
};

type ImpactCandidate = {
  id: string;
  objectType: string;
  objectId: string;
  objectCode: string | null;
  title: string | null;
  category: string;
  discipline: string | null;
  reason: string;
  traversalDepth: number;
  disposition: string;
  relationPath: Array<{ objectType: string; objectId: string; relationship?: string; depth: number }>;
};

type ImpactPayload = {
  id: string;
  status: string;
  completeness: string;
  traversalStatus: string;
  staleness: string;
  projectId: string;
  viewProjectMismatch: boolean;
  snapshot: {
    candidates: ImpactCandidate[];
    actions: Array<{ code: string; label: string; completed: boolean }>;
    optionStudy: { automaticWinner: false; humanDecisionRequired: true; selectedOptionId: string | null; criteria: Array<{ label: string; weight: number }>; options: Array<{ id: string; name: string }> } | null;
    construction: { summary: string; missingInformation: string[]; workPlanType: string; technicalSolutionChosen: false } | null;
    humanReviewRequired: true;
    automaticOptionWinner: false;
  };
};

type PreIssuePayload = {
  review?: {
    id: string;
    resultState: string;
    staleness: string;
    targetLineageKind: string;
    reviewingGeneratedDraft: boolean;
    reviewPackageId: string;
    reviewRunId: string;
    policyVersion: string;
    conditions: PreIssueCondition[];
    passedChecks: Array<{ checkType: string; title: string }>;
    notEvaluated: Array<{ checkType: string; reason: string }>;
  } | null;
  summary?: PreIssueSummary;
};

const MTO_OUTPUTS = ["STRUCTURAL_MTO", "CIVIL_MTO", "PIPING_MTO", "ELECTRICAL_MTO", "MULTIDISCIPLINARY_MTO"];

type MtoSummary = {
  id: string;
  revision: string;
  status: string;
  staleness: string;
  itemCount: number;
  progress?: { total: number; verified: number; unverified: number };
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
  CHANGE_ASSESSMENT: [{ artifactType: "TECHNICAL_MEMORANDUM", label: "Generate Impact Report" }],
  HANDOVER_PACKAGE: [{ artifactType: "TECHNICAL_MEMORANDUM", label: "Generate Handover Report" }],
  REVIEW_PACKAGE: [{ artifactType: "TECHNICAL_MEMORANDUM", label: "Generate Review Report" }],
  STRUCTURAL_MTO: [{ artifactType: "QUANTITY_SCHEDULE", label: "Export governed MTO (XLSX)" }],
  CIVIL_MTO: [{ artifactType: "QUANTITY_SCHEDULE", label: "Export governed MTO (XLSX)" }],
  PIPING_MTO: [{ artifactType: "QUANTITY_SCHEDULE", label: "Export governed MTO (XLSX)" }],
  ELECTRICAL_MTO: [{ artifactType: "QUANTITY_SCHEDULE", label: "Export governed MTO (XLSX)" }],
  MULTIDISCIPLINARY_MTO: [{ artifactType: "QUANTITY_SCHEDULE", label: "Export governed MTO (XLSX)" }],
};

function officeLabel(format?: string) {
  if (format === "DOCX") return "Download and Open in Word";
  if (format === "PPTX") return "Download and Open in PowerPoint";
  return "Download and Open in Excel";
}

export default function WorkPlanPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
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
  const [preIssue, setPreIssue] = useState<PreIssuePayload | null>(null);
  const [impact, setImpact] = useState<ImpactPayload | null>(null);
  const [mto, setMto] = useState<MtoSummary | null>(null);
  const [deliverableReadiness, setDeliverableReadiness] = useState<Record<string, string> | null>(null);
  const [templatePreview, setTemplatePreview] = useState<{ template?: { code: string; version: string; name: string }; sourceClass?: string | null; fallbackUsed?: boolean; reason?: string } | null>(null);
  const [externalContext, setExternalContext] = useState<Array<{ id: string; objectType: string; objectNumber: string | null; displayName: string; etag: string | null; presentation?: { title: string; externalSystem: string } }>>([]);
  const [handoff, setHandoff] = useState<{ fromStage?: string; toStage?: string; inheritedContext?: string[]; openAssumptions?: Array<{ title: string; disposition: string }>; outstandingInformation?: string[]; decisions?: string[]; requiredEngineeringWork?: string } | null>(null);
  const [managedRepoId, setManagedRepoId] = useState<string | null>(null);

  async function load() {
    const response = await fetch(`/api/engineering/work?action=plan&id=${encodeURIComponent(params.id)}&selectedProjectId=${encodeURIComponent(selectedProjectId ?? "")}`);
    const json = await parseApiJsonResponse<WorkPlan>(response);
    if (json.errorMessage) setError(json.errorMessage);
    else {
      setPlan(json.data);
      const raw = json.raw as { artifacts?: GeneratedArtifact[]; launcher?: Launcher; tools?: ToolCatalog; preIssue?: PreIssuePayload; impact?: ImpactPayload; mto?: MtoSummary; deliverableReadiness?: Record<string, string>; templatePreview?: { template?: { code: string; version: string; name: string }; sourceClass?: string | null; fallbackUsed?: boolean; reason?: string }; externalContext?: Array<{ id: string; objectType: string; objectNumber: string | null; displayName: string; etag: string | null; presentation?: { title: string; externalSystem: string } }> } | null;
      if (raw?.launcher) setLauncher(raw.launcher);
      if (raw?.tools) setTools(raw.tools);
      if (raw?.preIssue) setPreIssue(raw.preIssue);
      if (raw?.impact) setImpact(raw.impact);
      if (raw?.mto) setMto(raw.mto);
      if (raw?.deliverableReadiness) setDeliverableReadiness(raw.deliverableReadiness);
      if (raw?.templatePreview) setTemplatePreview(raw.templatePreview);
      if (raw?.externalContext) setExternalContext(raw.externalContext);
    }
    const listed = await fetch(`/api/engineering/work?action=artifacts&planId=${encodeURIComponent(params.id)}`);
    const listedJson = await parseApiJsonResponse<GeneratedArtifact[]>(listed);
    if (!listedJson.errorMessage && listedJson.data) setArtifacts(listedJson.data);
    const handoffRes = await fetch(`/api/engineering/work?action=lifecycleHandoff&id=${encodeURIComponent(params.id)}`);
    const handoffJson = await parseApiJsonResponse<{ fromStage?: string; toStage?: string; inheritedContext?: string[]; openAssumptions?: Array<{ title: string; disposition: string }>; outstandingInformation?: string[]; decisions?: string[]; requiredEngineeringWork?: string }>(handoffRes);
    if (!handoffJson.errorMessage && handoffJson.data) setHandoff(handoffJson.data);
    if (json.data?.projectId) {
      const repos = await fetch(`/api/engineering/work?action=repositories&projectId=${encodeURIComponent(json.data.projectId)}`);
      const reposJson = await parseApiJsonResponse<Array<{ id: string; repositoryType: string; enabled?: boolean }>>(repos);
      const sharePoint = (reposJson.data ?? []).find((row) => row.repositoryType === "SHAREPOINT_LIBRARY" && row.enabled !== false);
      setManagedRepoId(sharePoint?.id ?? null);
    }
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
      connectorImplemented?: boolean;
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
      setMessage(
        json.data?.connectorImplemented
          ? "Governing SharePoint source is available to open. This is not engineering approval."
          : "Governing source opened in EOS. Direct private repository URLs are not exposed.",
      );
      return;
    }
    if (action === "openExternalEngineeringSource") {
      setMessage(
        json.data?.ok
          ? "External engineering source is available through the governed link. This is not engineering approval."
          : "External source is not available for this object.",
      );
      return;
    }
    if (action === "publishEngineeringResponse") {
      setMessage("Publication contract accepted. EOS did not automatically issue, close, or approve the external record.");
      return;
    }
    if (action === "publishToManagedRepository") {
      setMessage(
        json.data?.ok
          ? "Generated report published to the approved SharePoint library. This is not engineering approval."
          : "Publish to managed repository is unavailable until an approved SharePoint library is registered.",
      );
      return;
    }
    if (action === "runPreIssueReview") {
      const payload = json.data as { summary?: PreIssueSummary; review?: PreIssuePayload["review"] } | undefined;
      setPreIssue({ review: payload?.review ?? null, summary: payload?.summary });
      setMessage(
        payload?.summary?.reviewingGeneratedDraft
          ? "Pre-issue review completed against the generated draft. Returned artifact is preferred when published."
          : "Pre-issue review completed. Conditions are candidates for human review. This is not engineering approval.",
      );
      await load();
      return;
    }
    if (action === "assessChange" || action === "prepareOptionStudy" || action === "assessFieldChange" || action === "prepareRfiResponse") {
      const payload = json.data as { assessment?: ImpactPayload } | undefined;
      if (payload?.assessment) setImpact(payload.assessment);
      setMessage("Potential impacts prepared for human review. Related is not affected. This is not engineering approval.");
      await load();
      return;
    }
    if (action === "disposeImpact") {
      setImpact(json.data as ImpactPayload);
      setMessage("Impact disposition recorded. EOS did not auto-confirm remaining candidates.");
      return;
    }
    if (action === "recordImpactDecision") {
      setImpact(json.data as ImpactPayload);
      setMessage("Human decision recorded. EOS did not select a winner.");
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
    const json = await parseApiJsonResponse<{ stale?: boolean; message?: string; reason?: string; regenerationRequired?: boolean }>(response);
    setDiff(JSON.stringify(json.data ?? {}, null, 2));
    if (json.data?.stale) setMessage(json.data.message ?? "Artifact generated from older context");
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
        <div className="mt-3 flex flex-wrap gap-2">
          <Link className="rounded border px-3 py-2 text-sm" href="/engineering/work">Back to Work</Link>
          <Link className="rounded border px-3 py-2 text-sm" href="/engineering/work">Continue Engineering Work</Link>
        </div>
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
              {(plan.lifecycleStage ?? "").replaceAll("_", " ")} · {plan.workType.replaceAll("_", " ")} · Status: {plan.readiness.replaceAll("_", " ")} · {plan.status} · {plan.explanations.templateProvenance}
              {plan.systemId ? ` · ${plan.systemId}` : ""}
              {plan.discipline ? ` · ${plan.discipline}` : ""}
            </p>
            {plan.relatedObjectType === "engineering_work_plan" && plan.relatedObjectId ? (
              <p className="mt-2 text-sm text-muted-foreground">Inherited from previous Work Plan {plan.relatedObjectId}. Historical provenance is retained.</p>
            ) : null}
            {handoff && (
              <section className="mt-4 rounded border p-3 text-sm" aria-label="Lifecycle handoff summary">
                <h2 className="font-semibold">Inherited Context</h2>
                <p className="mt-1 text-muted-foreground">{(handoff.fromStage ?? "").replaceAll("_", " ")} → {(handoff.toStage ?? "").replaceAll("_", " ")}. This does not approve the lifecycle gate.</p>
                {handoff.inheritedContext?.length ? <p className="mt-1">Inherited: {handoff.inheritedContext.join("; ")}</p> : null}
                {handoff.openAssumptions?.length ? <p className="mt-1">Open assumptions: {handoff.openAssumptions.map((row) => `${row.title} (${row.disposition.toLowerCase()})`).join("; ")}</p> : null}
                {handoff.outstandingInformation?.length ? <p className="mt-1">Outstanding information: {handoff.outstandingInformation.join("; ")}</p> : null}
                {handoff.decisions?.length ? <p className="mt-1">Decisions: {handoff.decisions.join("; ")}</p> : null}
                {handoff.requiredEngineeringWork ? <p className="mt-1">Required work: {handoff.requiredEngineeringWork}</p> : null}
              </section>
            )}
            {templatePreview?.template && (
              <p className="mt-2 text-sm">
                Template: {templatePreview.template.name} {templatePreview.template.code}@{templatePreview.template.version}
                {templatePreview.sourceClass === "EOS_DEFAULT" || templatePreview.fallbackUsed ? " · Using EOS Default Template" : ` · ${templatePreview.sourceClass?.replaceAll("_", " ")}`}
              </p>
            )}
            {externalContext.length > 0 && (
              <section className="mt-4 text-sm" aria-label="External engineering context">
                <h2 className="font-semibold">EXTERNAL ENGINEERING CONTEXT</h2>
                <ul className="mt-2 space-y-2">
                  {externalContext.map((row) => (
                    <li key={row.id} className="rounded border p-2">
                      <p className="font-medium">{row.presentation?.title ?? row.displayName}</p>
                      <p className="text-muted-foreground">External system: {row.presentation?.externalSystem ?? row.objectType}</p>
                      {(row.objectType === "DRAWING" || row.objectType === "MODEL") && (
                        <button
                          type="button"
                          className="mt-1 mr-2 rounded border px-2 py-0.5"
                          onClick={() => void act("openExternalEngineeringSource", { objectRefId: row.id })}
                        >
                          {row.objectType === "MODEL" ? "Open Model" : "Open Current Drawing"}
                        </button>
                      )}
                      {(row.objectType === "RFI" || row.objectType === "TQ" || row.objectType === "FIELD_CHANGE") && (
                        <button
                          type="button"
                          className="mt-1 rounded border px-2 py-0.5"
                          onClick={() => void act("publishEngineeringResponse", { objectRefId: row.id, preparedEtag: row.etag, humanConfirmed: true, writeAction: "SUBMIT_DRAFT_RESPONSE" })}
                        >
                          Publish Engineering Response
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}
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
              <button type="button" className="rounded border px-3 py-2 text-sm" onClick={() => void act("runPreIssueReview", { workPlanId: plan.id })}>Run Pre-Issue Review</button>
              <button type="button" className="rounded border px-3 py-2 text-sm" onClick={() => void act("assessChange", { workPlanId: plan.id, selectedProjectId })}>Assess Change</button>
              <button type="button" className="rounded border px-3 py-2 text-sm" onClick={() => void act("prepareOptionStudy", { workPlanId: plan.id, selectedProjectId })}>Compare Options</button>
              <button type="button" className="rounded border px-3 py-2 text-sm" onClick={() => void act("prepareRfiResponse", { workPlanId: plan.id, selectedProjectId })}>Prepare RFI/TQ Response</button>
              <button type="button" className="rounded border px-3 py-2 text-sm" onClick={() => void act("assessFieldChange", { workPlanId: plan.id, selectedProjectId })}>Assess Field Change</button>
              <button
                type="button"
                className="rounded border px-3 py-2 text-sm"
                onClick={() => {
                  void (async () => {
                    const response = await fetch("/api/engineering/work", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ action: "continueNextStage", id: plan.id, selectedProjectId, acknowledged: true }),
                    });
                    const json = await parseApiJsonResponse<{ next?: { id: string } }>(response);
                    if (json.errorMessage || !json.data?.next?.id) {
                      setError(json.errorMessage ?? "Cannot create next-stage Work Plan.");
                      return;
                    }
                    router.push(`/engineering/work/plans/${json.data.next.id}`);
                  })();
                }}
              >
                Continue into next lifecycle work
              </button>
            </div>
            {impact && (
              <section className="mt-6 text-sm" aria-label="Change impact">
                <h2 className="font-semibold">CHANGE / POTENTIAL IMPACT</h2>
                <p className="mt-1">
                  {impact.status.replaceAll("_", " ")} · traversal {impact.traversalStatus.replaceAll("_", " ")} · completeness {impact.completeness} · {impact.staleness.replaceAll("_", " ")}
                </p>
                <p className="mt-1 text-muted-foreground">Related is not affected. Potential impact is not confirmed impact. Human engineering review required.</p>
                {impact.viewProjectMismatch && <p className="mt-1">Project view differs from the source object project. Assessment remains on the source project only.</p>}
                {impact.snapshot.construction && (
                  <p className="mt-2">CONSTRUCTION ENGINEERING · {impact.snapshot.construction.summary} · Work Plan {impact.snapshot.construction.workPlanType.replaceAll("_", " ")}</p>
                )}
                <ul className="mt-3 space-y-2">
                  {impact.snapshot.candidates.map((row) => (
                    <li key={row.id} className="rounded border p-3">
                      <p className="font-medium">{row.category} · {row.title ?? row.objectId} · {row.disposition.replaceAll("_", " ")}</p>
                      <p>Reason: {row.reason}</p>
                      <p className="text-muted-foreground">Path: {row.relationPath.map((step) => `${step.objectType}:${step.objectId}${step.relationship ? ` via ${step.relationship}` : ""}`).join(" → ")} · depth {row.traversalDepth}{row.discipline ? ` · ${row.discipline}` : ""}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <button type="button" className="rounded border px-2 py-0.5" onClick={() => void act("disposeImpact", { assessmentId: impact.id, candidateId: row.id, disposition: "CONFIRMED_IMPACT" })}>Confirm Impact</button>
                        <button type="button" className="rounded border px-2 py-0.5" onClick={() => void act("disposeImpact", { assessmentId: impact.id, candidateId: row.id, disposition: "NOT_IMPACTED" })}>Not Impacted</button>
                        <button type="button" className="rounded border px-2 py-0.5" onClick={() => void act("disposeImpact", { assessmentId: impact.id, candidateId: row.id, disposition: "NEEDS_INVESTIGATION" })}>Investigate</button>
                        <button type="button" className="rounded border px-2 py-0.5" onClick={() => void act("disposeImpact", { assessmentId: impact.id, candidateId: row.id, disposition: "DEFERRED" })}>Defer</button>
                      </div>
                    </li>
                  ))}
                </ul>
                {impact.snapshot.optionStudy && (
                  <div className="mt-3 rounded border p-3">
                    <p className="font-medium">OPTIONS</p>
                    <p>Criteria: {impact.snapshot.optionStudy.criteria.map((row) => `${row.label} (weight ${row.weight})`).join(", ")}</p>
                    <p>{impact.snapshot.optionStudy.options.map((row) => row.name).join(" · ")}</p>
                    <p className="text-muted-foreground">No automatic winner. Human Decision required.</p>
                    {impact.snapshot.optionStudy.options.map((row) => (
                      <button key={row.id} type="button" className="mr-2 mt-2 rounded border px-2 py-0.5" onClick={() => void act("recordImpactDecision", { assessmentId: impact.id, optionId: row.id })}>Record Decision: {row.name}</button>
                    ))}
                  </div>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="button" className="rounded border px-3 py-1" onClick={() => void act("generateArtifact", { workPlanId: plan.id, artifactType: "TECHNICAL_MEMORANDUM" })}>Generate Impact Report</button>
                  <button type="button" className="rounded border px-3 py-1" onClick={() => void act("generateArtifact", { workPlanId: plan.id, artifactType: "OPTION_STUDY" })}>Generate Option Study</button>
                  <button type="button" className="rounded border px-3 py-1" onClick={() => void act("runPreIssueReview", { workPlanId: plan.id })}>Run Pre-Issue Review</button>
                </div>
              </section>
            )}
            {preIssue?.summary && (
              <section className="mt-6 text-sm">
                <h2 className="font-semibold">PRE-ISSUE REVIEW</h2>
                <p className="mt-1">
                  {preIssue.review ? preIssue.review.resultState.replaceAll("_", " ") : "Not run"}
                  {preIssue.review?.reviewingGeneratedDraft ? " · reviewing generated draft" : preIssue.review ? " · latest governed returned artifact" : ""}
                  {preIssue.review ? ` · ${preIssue.review.staleness.replaceAll("_", " ")}` : ""}
                </p>
                <p className="mt-1">Attention Required: {preIssue.summary.attentionRequired} · Current / Passed Checks: {preIssue.summary.passed} · Not Evaluated: {preIssue.summary.notEvaluated}</p>
                <p>Deterministic review: {preIssue.summary.deterministicReview ?? "available"} · Semantic AI: {preIssue.summary.semanticAiReview ?? "unavailable"}</p>
                <ol className="mt-2 list-decimal pl-5 space-y-1">
                  {(preIssue.summary.items.length ? preIssue.summary.items : ["No blocking conditions identified"]).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
                <div className="mt-2 flex flex-wrap gap-2">
                  {preIssue.review && (
                    <Link className="rounded border px-3 py-1" href={`/review/${preIssue.review.reviewPackageId}`}>Open Review</Link>
                  )}
                  <button type="button" className="rounded border px-3 py-1" onClick={() => void act("refreshPlan")}>Fix Context</button>
                  <button type="button" className="rounded border px-3 py-1" onClick={() => void act("runPreIssueReview", { workPlanId: plan.id })}>Rerun</button>
                  <button type="button" className="rounded border px-3 py-1" onClick={() => void act("runPreIssueReview", { workPlanId: plan.id, composePackage: true })}>Create Review Package</button>
                </div>
                {preIssue.review?.conditions?.length ? (
                  <ul className="mt-3 space-y-2">
                    {preIssue.review.conditions.map((row) => (
                      <li key={row.code + row.title} className="rounded border p-2">
                        <p className="font-medium">{row.title}</p>
                        <p>{row.explanation}</p>
                        <p className="text-muted-foreground">{row.checkType.replaceAll("_", " ")} · {row.origin} · {row.materiality.replaceAll("_", " ")} · {row.status} · policy {preIssue.review?.policyVersion}</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {row.actions.map((action) => (
                            action.href ? (
                              <Link key={action.code} className="rounded border px-2 py-0.5" href={action.href}>{action.label}</Link>
                            ) : (
                              <button
                                key={action.code}
                                type="button"
                                className="rounded border px-2 py-0.5"
                                onClick={() => {
                                  if (action.code === "REFRESH_WORK_CONTEXT") void act("refreshPlan");
                                  else if (action.code === "RERUN_REVIEW") void act("runPreIssueReview", { workPlanId: plan.id });
                                  else if (action.code === "REQUEST_INFORMATION") void act("openGoverningSource", { workPlanId: plan.id });
                                }}
                              >
                                {action.label}
                              </button>
                            )
                          ))}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <p className="mt-2 text-muted-foreground">Conditions are not approval, safety, or code-compliance verdicts.</p>
              </section>
            )}
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
              {plan.context.expectedOutputs.some((row) => MTO_OUTPUTS.includes(row.outputType)) && (
                <section className="mt-3 rounded border p-3" aria-label="Quantities and MTO">
                  <h3 className="font-semibold">Quantities &amp; MTO</h3>
                  {mto ? (
                    <p className="mt-1 text-sm">Rev {mto.revision} · {mto.status} · {mto.progress ? `${mto.progress.verified}/${mto.progress.total} verified` : `${mto.itemCount} items`} · source {mto.staleness.replaceAll("_", " ")}</p>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">No persisted MTO snapshot yet.</p>
                  )}
                  <Link className="mr-2 mt-2 inline-block rounded border px-3 py-1 text-sm" href={`/engineering/work/plans/${plan.id}/mto`}>
                    {mto ? "Open MTO" : "Create/Open MTO"}
                  </Link>
                  <button
                    type="button"
                    className="mt-2 rounded border px-3 py-1 text-sm"
                    onClick={() => void act("seedMtoDemonstrator", { workPlanId: plan.id })}
                  >
                    Persist Crusher Demonstrator
                  </button>
                </section>
              )}
              <section className="mt-3 rounded border p-3" aria-label="Governed deliverable composition">
                <h3 className="font-semibold">Generate Deliverable</h3>
                <p className="mt-1 text-sm">Evidence-backed draft assembly. Generation cannot verify MTO, accept assumptions, make decisions, or approve the deliverable.</p>
                {deliverableReadiness ? (
                  <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2" aria-label="Source readiness">
                    {Object.entries(deliverableReadiness).map(([key, state]) => (
                      <li key={key}>{key.replace(/([A-Z])/g, " $1").replace(/^./, (ch) => ch.toUpperCase())}: {state}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">Source readiness is computed from governing information, requirements, assumptions, decisions, interfaces, MTO, cost, and carbon. This is not an engineering approval score.</p>
                )}
                {mto ? (
                  <p className="mt-2 text-sm">Bound MTO Rev {mto.revision} · {mto.status}{mto.status !== "VERIFIED" ? " · CONDITIONAL — unverified items remain visible" : ""}</p>
                ) : (
                  <p className="mt-2 text-sm">MTO: MISSING — Design Report quantity section will be QUANTITY_NOT_AVAILABLE.</p>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="button" className="rounded border px-3 py-1 text-sm" onClick={() => void act("generateArtifact", { workPlanId: plan.id, artifactType: "DESIGN_REPORT", projectCode: "ER-A1" })}>Generate Design Report</button>
                  <button type="button" className="rounded border px-3 py-1 text-sm" onClick={() => void act("generateArtifact", { workPlanId: plan.id, artifactType: "TECHNICAL_MEMORANDUM", projectCode: "ER-A1" })}>Generate Technical Note</button>
                  <button type="button" className="rounded border px-3 py-1 text-sm" onClick={() => void act("generateArtifact", { workPlanId: plan.id, artifactType: "QUANTITY_SCHEDULE", projectCode: "ER-A1" })}>Export MTO XLSX</button>
                </div>
                <h4 className="mt-3 font-semibold">Artifact history</h4>
                <ul className="mt-1 space-y-2 text-sm">
                  {artifacts.filter((item) => item.artifactType === "DESIGN_REPORT" || item.artifactType === "TECHNICAL_MEMORANDUM" || item.artifactType === "QUANTITY_SCHEDULE").map((item) => (
                    <li key={`history-${item.id}`} className="rounded border p-2">
                      <p>{item.artifactType.replaceAll("_", " ")} · {item.status.replaceAll("_", " ")} · {item.templateCode}@{item.templateVersion}</p>
                      <p>Generated {item.createdAt} · MTO {item.provenance.mtoRevision ? `Rev ${item.provenance.mtoRevision} (${item.provenance.mtoStatus})` : "not bound"} · fingerprint {(item.provenance.compositionFingerprint ?? item.provenance.inputFingerprint).slice(0, 16)}</p>
                      <p>{item.supersededById ? "SUPERSEDED — prior artifact preserved" : item.status === "SUPERSEDED" ? "SUPERSEDED — prior artifact preserved" : "Current generated draft"} · {item.provenance.costStatus ?? "COST_NOT_CALCULATED"} · {item.provenance.carbonStatus ?? "carbon policy-bound"}</p>
                      <button type="button" className="mr-2 mt-1 rounded border px-2 py-1" onClick={() => setProvenance(JSON.stringify(item.provenance, null, 2))}>What evidence produced this document?</button>
                      <button type="button" className="mr-2 mt-1 rounded border px-2 py-1" onClick={() => void compare(item)}>Compare Context</button>
                      <button type="button" className="mt-1 rounded border px-2 py-1" onClick={() => void download(item.id, officeLabel(item.outputFormat))}>{officeLabel(item.outputFormat)}</button>
                    </li>
                  ))}
                </ul>
              </section>
              <ul className="mt-2 space-y-3">
                {plan.context.expectedOutputs.map((row) => {
                  const generated = artifacts.filter((item) => item.artifactType === row.outputType || (row.outputType === "OPTION_STUDY" && item.artifactType === "OPTION_STUDY_PRESENTATION") || (row.outputType === "CONCEPT_STUDY" && item.artifactType === "TECHNICAL_MEMORANDUM") || (MTO_OUTPUTS.includes(row.outputType) && item.artifactType === "QUANTITY_SCHEDULE") || (row.outputType === "DESIGN_REPORT" && item.artifactType === "DESIGN_REPORT"));
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
                          <span>{item.fileName} · {item.status.replaceAll("_", " ")} · {item.provenance.mtoRevision ? `MTO Rev ${item.provenance.mtoRevision}` : "no MTO"} · {item.lineageKind === "RETURNED_FROM_ENGINEER" ? "returned from engineer" : "generated draft"}</span>
                          <button type="button" className="rounded border px-2 py-1" onClick={() => void download(item.id, officeLabel(item.outputFormat))}>{officeLabel(item.outputFormat)}</button>
                          <button type="button" className="rounded border px-2 py-1" onClick={() => void act("prepareHandoff", { workPlanId: plan.id, artifactId: item.id, mode: "MANAGED_REPOSITORY_OPEN" })}>Prepare Tool Handoff</button>
                          <button type="button" className="rounded border px-2 py-1" onClick={() => setProvenance(JSON.stringify(item.provenance, null, 2))}>View Provenance</button>
                          <button type="button" className="rounded border px-2 py-1" onClick={() => void act("generateArtifact", { workPlanId: plan.id, artifactType: item.artifactType, projectCode: "ER-A1" })}>Regenerate</button>
                          <button type="button" className="rounded border px-2 py-1" onClick={() => void compare(item)}>Compare Context</button>
                          {managedRepoId && (
                            <button
                              type="button"
                              className="rounded border px-2 py-1"
                              onClick={() => void act("publishToManagedRepository", { artifactId: item.id, repositoryId: managedRepoId })}
                            >
                              Publish to Managed Repository
                            </button>
                          )}
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
