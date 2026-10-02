import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@rtb/database";
import type { CommerceExecutionContext } from "@rtb/types";
import {
  RejectingInferenceProvider,
  asUntrustedDocumentText,
  createReviewFinding,
  createReviewPackage,
  createReviewRun,
  createReviewScope,
  constructFindingFromDetection,
  runDetectors,
  transitionReviewRun,
  verifyFindingEvidence,
  MVP_REVIEW_TYPES,
  MemoryEngineeringReviewStore,
  createSharedReviewMemory,
  createReviewOwnership,
  type EngineeringReviewStore,
  type ReviewAccessPrincipal,
  type ReviewFinding,
  type ReviewInferenceProvider,
  type ReviewPackage,
} from "@rtb/engineering-review";
import { assertEngineeringService } from "../commerce/service-guard";
import { workspaceScopeId } from "../commerce/workspace-scope";
import type { ArtifactStore } from "../artifact-automation/memory-store";
import { SupabaseArtifactStore } from "../artifact-automation/supabase-store";
import type { EngineeringWorkPlan } from "../work-generator/types";
import { MAX_RETURN_BYTES } from "../tool-orchestration/types";
import { MALWARE_SCAN_STATUS } from "../tool-orchestration/return-validation";
import { ARTIFACT_TEMPLATES } from "../artifact-automation/catalog";
import { runDeterministicPreIssueChecks, summarizeResult } from "./checks";
import { compareReviewRuns, evaluateReviewStaleness } from "./comparison";
import { inspectArtifactTransient } from "./inspect";
import { createMemoryPreIssueStore, type PreIssueReviewStore } from "./memory-store";
import { PRE_ISSUE_REVIEW_POLICY } from "./policy";
import { buildReviewSnapshot, selectReviewTarget } from "./snapshot";
import {
  FORBIDDEN_PRE_ISSUE_VERDICTS,
  MAX_REVIEW_EXTRACT_BYTES,
  PRE_ISSUE_AI_BOUNDARY,
  PRE_ISSUE_PRIVACY,
  PRE_ISSUE_REVIEW_RECON,
  type PreIssueCondition,
  type PreIssueReviewRecord,
} from "./types";

export const CALLER_SUPPLIED_REVIEW_KEYS = ["tenantId", "workspaceId", "aal", "approved", "authoritative", "current"] as const;

export type PreIssueEventRecorder = (
  commerce: CommerceExecutionContext,
  tenantId: string,
  input: {
    eventType: "PRE_ISSUE_REVIEW_STARTED" | "PRE_ISSUE_REVIEW_COMPLETED" | "REVIEW_CONDITION_DISPOSITIONED" | "PRE_ISSUE_REVIEW_RERUN";
    projectId: string;
    planId: string;
    artifactId?: string | null;
    actorId?: string | null;
  },
) => Promise<void>;

function reviewPrincipal(tenantId: string, workspaceId: string, userId: string): ReviewAccessPrincipal {
  return {
    userId,
    tenantIds: [tenantId],
    workspaceIds: [workspaceId],
    permissions: [{ resource: "engineering", action: "execute" }],
  };
}

function documentRole(artifactType: string): "calculation" | "specification" | "drawing" | "basis" | "other" {
  if (artifactType === "CALCULATION_WORKBOOK") return "calculation";
  if (artifactType === "SPECIFICATION") return "specification";
  if (artifactType === "DESIGN_REPORT") return "other";
  return "other";
}

export class EngineeringPreIssueReviewService {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly artifacts: ArtifactStore = new SupabaseArtifactStore(supabase),
    private readonly reviews: PreIssueReviewStore = createMemoryPreIssueStore(),
    private readonly reviewStoreFactory: (tenantId: string, workspaceId: string, userId: string) => EngineeringReviewStore = (tenantId, workspaceId, userId) =>
      new MemoryEngineeringReviewStore(reviewPrincipal(tenantId, workspaceId, userId), createSharedReviewMemory()),
    private readonly loadPlan: (id: string) => Promise<EngineeringWorkPlan | null> = async () => null,
    private readonly recordEvent?: PreIssueEventRecorder,
    private readonly inference: ReviewInferenceProvider = new RejectingInferenceProvider(),
  ) {}

  private mtoLoader: ((planId: string) => Promise<{ items: import("../lifecycle-intelligence/quantity-mto").QuantityItem[]; staleness: string } | null>) | null = null;

  bindQuantityMto(loader: (planId: string) => Promise<{ items: import("../lifecycle-intelligence/quantity-mto").QuantityItem[]; staleness: string } | null>) {
    this.mtoLoader = loader;
  }

  catalog() {
    return {
      recon: PRE_ISSUE_REVIEW_RECON,
      policy: PRE_ISSUE_REVIEW_POLICY,
      privacy: PRE_ISSUE_PRIVACY,
      aiBoundary: PRE_ISSUE_AI_BOUNDARY,
      forbiddenVerdicts: FORBIDDEN_PRE_ISSUE_VERDICTS,
      duplicateReviewEngineCreated: false,
      binaryDuplication: "NO",
      artifactBinaryStorageRisk: "HIGH",
      sizeGuardBytes: MAX_REVIEW_EXTRACT_BYTES,
      malwareScanStatus: MALWARE_SCAN_STATUS,
      aal2: "REUSE",
      hostedClamav: MALWARE_SCAN_STATUS,
    };
  }

  rejectCallerClaims(body: Record<string, unknown>) {
    for (const key of CALLER_SUPPLIED_REVIEW_KEYS) {
      if (key in body && body[key] != null && body[key] !== "") return "caller_supplied_authority_rejected";
    }
    return null;
  }

  summary(record: PreIssueReviewRecord | null) {
    if (!record) {
      return {
        headline: "PRE-ISSUE REVIEW",
        attentionRequired: 0,
        passed: 0,
        notEvaluated: 0,
        items: [] as string[],
        resultState: null,
        actions: [
          { code: "RUN_PRE_ISSUE_REVIEW", label: "Run Pre-Issue Review" },
        ],
      };
    }
    const attention = record.conditions.filter((row) => row.materiality !== "REVIEW_CANDIDATE" || true);
    return {
      headline: "PRE-ISSUE REVIEW",
      resultState: record.resultState,
      attentionRequired: record.conditions.length,
      passed: record.passedChecks.length,
      notEvaluated: record.notEvaluated.length,
      reviewingGeneratedDraft: record.reviewingGeneratedDraft,
      targetLineageKind: record.targetLineageKind,
      items: record.conditions.slice(0, 8).map((row) => row.title),
      deterministicReview: record.deterministicReview,
      semanticAiReview: record.semanticAiReview,
      engineeringApproved: false,
      actions: [
        { code: "OPEN_REVIEW", label: "Open Review", href: `/review/${record.reviewPackageId}` },
        { code: "REFRESH_WORK_CONTEXT", label: "Fix Context" },
        { code: "RERUN_REVIEW", label: "Rerun" },
        { code: "CREATE_REVIEW_PACKAGE", label: "Create Review Package" },
      ],
      conditions: attention,
    };
  }

  async run(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: {
      workPlanId: string;
      artifactId?: string | null;
      selectedProjectId?: string | null;
      composePackage?: boolean;
    },
  ) {
    assertEngineeringService(commerce, "work.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const started = Date.now();
    const plan = await this.loadPlan(input.workPlanId);
    if (!plan || plan.tenantId !== tenantId || plan.workspaceId !== workspaceId) throw new Error("not_found");
    const artifacts = await this.artifacts.listArtifacts(workspaceId, plan.id);
    const chosen = input.artifactId
      ? artifacts.find((row) => row.id === input.artifactId) ?? await this.artifacts.getArtifact(input.artifactId)
      : selectReviewTarget(artifacts)?.artifact ?? null;
    const reviewingGeneratedDraft = chosen ? chosen.lineageKind !== "RETURNED_FROM_ENGINEER" : true;
    if (!chosen) throw new Error("artifact_required");
    if (chosen.tenantId !== tenantId || chosen.workspaceId !== workspaceId) throw new Error("not_found");
    if (chosen.projectId !== plan.projectId || chosen.workPlanId !== plan.id) throw new Error("CROSS_PROJECT_MISMATCH");
    const projectId = chosen.projectId;
    const viewMismatch = Boolean(input.selectedProjectId && input.selectedProjectId !== projectId);
    const previous = (await this.reviews.listByPlan(workspaceId, plan.id))[0] ?? null;
    const eventType = previous ? "PRE_ISSUE_REVIEW_RERUN" : "PRE_ISSUE_REVIEW_STARTED";
    await this.recordEvent?.(commerce, tenantId, {
      eventType,
      projectId,
      planId: plan.id,
      artifactId: chosen.id,
      actorId: commerce.actorUserId ?? null,
    });

    const userId = commerce.actorUserId ?? "engineer";
    const store = this.reviewStoreFactory(tenantId, workspaceId, userId);
    const pkg = await this.composePackage(store, plan, artifacts, chosen, userId);
    let run = createReviewRun({
      id: randomUUID(),
      pkg,
      scope: createReviewScope({ reviewTypes: MVP_REVIEW_TYPES, discipline: plan.discipline ?? undefined }),
      rules: PRE_ISSUE_REVIEW_POLICY.checks.map((check) => ({ ruleId: check.checkType, version: PRE_ISSUE_REVIEW_POLICY.version })),
    });
    run = await store.queueReviewRun(run);
    run = await store.startReviewRun(run);

    const extractStarted = Date.now();
    let inspection = null;
    let extractionSkipped: string | null = null;
    let extractionDurationMs = 0;
    try {
      const inspected = await inspectArtifactTransient(chosen);
      inspection = inspected.inspection;
      extractionSkipped = inspected.skipped;
      extractionDurationMs = inspected.durationMs;
    } catch {
      extractionSkipped = "INSPECTION_FAILED";
      extractionDurationMs = Date.now() - extractStarted;
    }

    const mto = this.mtoLoader ? await this.mtoLoader(plan.id).catch(() => null) : null;
    const detStarted = Date.now();
    const deterministic = runDeterministicPreIssueChecks({
      plan,
      target: chosen,
      artifacts,
      inspection,
      extractionSkipped,
      mtoItems: mto?.items,
      mtoStaleness: mto?.staleness,
    });
    const deterministicDurationMs = Date.now() - detStarted;

    for (const artifact of artifacts) {
      store.registerKnownDocument({
        documentId: artifact.id,
        tenantId,
        workspaceId,
        projectId,
      });
    }
    for (const info of plan.context.information) {
      store.registerKnownDocument({
        documentId: info.sourceObjectId ?? `info:${info.title}`,
        tenantId,
        workspaceId,
        projectId,
      });
      store.registerKnownDocument({ documentId: info.title, tenantId, workspaceId, projectId });
    }
    for (const row of [
      ...plan.context.gaps,
      ...plan.context.requirements,
      ...plan.context.assumptions,
      ...plan.context.interfaces,
      ...plan.context.decisions,
      ...plan.context.analyses,
      ...(plan.context.deliverable ? [plan.context.deliverable] : []),
    ]) {
      const objectId = "objectId" in row ? row.objectId : row.title;
      store.registerKnownDocument({ documentId: objectId, tenantId, workspaceId, projectId });
      store.registerKnownDocument({ documentId: row.title, tenantId, workspaceId, projectId });
    }
    store.registerKnownDocument({ documentId: plan.id, tenantId, workspaceId, projectId });
    store.registerKnownDocument({ documentId: "drawing", tenantId, workspaceId, projectId });

    const findings: ReviewFinding[] = [];
    for (const item of deterministic.conditions) {
      const finding = createReviewFinding({
        id: item.id,
        tenantId,
        workspaceId,
        projectId,
        reviewPackageId: pkg.id,
        reviewRunId: run.id,
        category: item.category,
        title: item.title,
        description: item.explanation,
        severity: item.materiality === "REQUIRES_ATTENTION" ? "major" : item.materiality === "STALE_CONTEXT" ? "moderate" : "minor",
        confidence: { band: "high" },
        evidence: item.evidence.map((ev, index) => ({
          evidenceId: `${item.id}:ev:${index}`,
          documentId: ev.artifactId ?? ev.sourceId ?? chosen.id,
          tenantId,
          workspaceId,
          projectId,
          revision: chosen.templateVersion,
          span: ev.statement,
          section: ev.location ?? undefined,
          sourceType: "structured_field" as const,
        })),
        reasoningSummary: item.explanation,
        recommendedAction: item.actions[0]?.label ?? "Human reviewer to disposition",
        provenance: { origin: "detector", ruleId: item.checkType, ruleVersion: PRE_ISSUE_REVIEW_POLICY.version, detectorId: item.code },
      });
      findings.push(verifyFindingEvidence(finding));
    }

    const documents = artifacts.map((artifact) => ({
      ...createReviewOwnership({ tenantId, workspaceId, projectId }),
      documentId: artifact.id,
      revision: artifact.templateVersion,
      role: documentRole(artifact.artifactType),
      documentNumber: artifact.fileName,
      inclusion: "current" as const,
      fields: {
        projectId: artifact.projectId,
        sha256: artifact.sha256,
        lineageKind: artifact.lineageKind,
      },
      extractedText: asUntrustedDocumentText(
        artifact.provenance.information.map((row) => `${row.title} Rev ${row.revision ?? ""}`).join("\n"),
      ),
      requirements: plan.context.requirements.map((row) => ({
        id: row.objectId,
        text: row.title,
        mappedEvidence: artifact.provenance.requirements.includes(row.objectId),
      })),
      assumptions: plan.context.assumptions.map((row) => ({
        id: row.objectId,
        text: row.title,
        supported: !row.stale && !/unsupported|without evidence/i.test(row.whyIncluded),
      })),
    }));
    const detections = runDetectors({
      ownership: createReviewOwnership({ tenantId: pkg.tenantId, workspaceId: pkg.workspaceId, projectId: pkg.projectId }),
      documents,
      scope: run.scope,
    });
    for (const [index, detection] of detections.entries()) {
      const finding = verifyFindingEvidence(constructFindingFromDetection(detection, { run, pkg, documents, now: new Date().toISOString() }, 1000 + index));
      if (finding.status !== "candidate") continue;
      findings.push(finding);
      if (!deterministic.conditions.some((row) => row.title === finding.title)) {
        deterministic.conditions.push({
          id: finding.id,
          findingId: finding.id,
          checkType: "ERA1_DETECTOR",
          code: finding.category === "unsupported_assumption" ? "UNSUPPORTED_ASSUMPTION" : finding.category === "revision_inconsistency" ? "STALE_SOURCE_REFERENCE" : finding.category === "requirement_traceability_gap" ? "REQUIREMENT_TRACEABILITY_INCOMPLETE" : finding.category === "cross_document_inconsistency" ? "CROSS_ARTIFACT_REVISION_INCONSISTENCY" : "POSSIBLE_MISSING_INFORMATION",
          title: finding.title,
          explanation: finding.description,
          materiality: "REVIEW_CANDIDATE",
          origin: "ERA1_DETECTOR",
          category: finding.category,
          status: "candidate",
          engineeringVerdict: null,
          evidence: finding.evidence.map((ev) => ({ artifactId: ev.documentId, location: ev.span ?? null, statement: ev.span ?? finding.reasoningSummary })),
          actions: [{ code: "DISPOSITION", label: "Disposition" }],
        });
      }
    }

    const semanticStarted = Date.now();
    let semanticAiReview: "available" | "unavailable" = "unavailable";
    try {
      const proposed = await this.inference.proposeFindings({
        documents: documents.map((doc) => doc.extractedText),
        scope: run.scope,
      });
      semanticAiReview = this.inference instanceof RejectingInferenceProvider ? "unavailable" : "available";
      for (const [index, candidate] of proposed.entries()) {
        const finding = createReviewFinding({
          id: randomUUID(),
          tenantId,
          workspaceId,
          projectId,
          reviewPackageId: pkg.id,
          reviewRunId: run.id,
          category: candidate.category,
          title: candidate.title,
          description: candidate.description,
          severity: candidate.proposedSeverity,
          confidence: { score: candidate.proposedConfidenceScore },
          evidence: candidate.evidence,
          reasoningSummary: candidate.reasoningSummary,
          recommendedAction: candidate.recommendedAction,
          provenance: { origin: "ai_candidate", modelProvider: "configured", promptVersion: "pre-issue-1" },
        });
        if (finding.status !== "candidate") continue;
        findings.push(finding);
        deterministic.conditions.push({
          id: finding.id,
          findingId: finding.id,
          checkType: "SEMANTIC_AI_REVIEW",
          code: "POSSIBLE_CROSS_DOCUMENT_INCONSISTENCY",
          title: candidate.title,
          explanation: candidate.description,
          materiality: "REVIEW_CANDIDATE",
          origin: "AI_CANDIDATE",
          category: candidate.category,
          status: "candidate",
          engineeringVerdict: null,
          evidence: candidate.evidence.map((ev) => ({ artifactId: ev.documentId, location: ev.span ?? null, statement: ev.span ?? candidate.reasoningSummary })),
          actions: [{ code: "DISPOSITION", label: "Disposition" }],
          modelProvider: "configured",
          promptVersion: "pre-issue-1",
        });
        void index;
      }
    } catch {
      semanticAiReview = "unavailable";
    }
    const semanticAiDurationMs = Date.now() - semanticStarted;
    if (semanticAiReview === "unavailable" && !(this.inference instanceof RejectingInferenceProvider)) {
      semanticAiReview = "unavailable";
    }

    for (const finding of findings) {
      for (const evidence of finding.evidence) {
        store.registerKnownDocument({
          documentId: evidence.documentId,
          tenantId,
          workspaceId,
          projectId,
        });
      }
    }
    await store.persistCandidateFindings(findings);
    run = transitionReviewRun(run, "completed");
    await store.saveReviewRun(run);

    const fingerprintChanged = chosen.provenance.inputFingerprint !== plan.inputFingerprint;
    const resultState = summarizeResult({
      conditions: deterministic.conditions,
      extractionSkipped,
      fingerprintChanged,
    });
    const snapshot = buildReviewSnapshot({ plan, target: chosen, artifacts });
    const record: PreIssueReviewRecord = {
      id: randomUUID(),
      tenantId,
      workspaceId,
      projectId,
      workPlanId: plan.id,
      reviewPackageId: pkg.id,
      reviewRunId: run.id,
      policyCode: PRE_ISSUE_REVIEW_POLICY.code,
      policyVersion: PRE_ISSUE_REVIEW_POLICY.version,
      snapshot,
      targetArtifactId: chosen.id,
      targetArtifactHash: chosen.sha256,
      targetLineageKind: chosen.lineageKind,
      reviewingGeneratedDraft,
      resultState,
      staleness: "CURRENT",
      deterministicReview: "available",
      semanticAiReview,
      conditions: deterministic.conditions,
      passedChecks: deterministic.passedChecks,
      notEvaluated: deterministic.notEvaluated,
      engineeringApproved: false,
      designApproved: false,
      codeCompliant: false,
      ifcReady: false,
      automaticFindings: false,
      binaryDuplication: "NO",
      performance: {
        deterministicDurationMs,
        extractionDurationMs,
        semanticAiDurationMs,
        sourcesEvaluated: plan.context.information.length + artifacts.length,
        checksEvaluated: deterministic.passedChecks.length + deterministic.conditions.filter((row) => row.origin === "DETERMINISTIC").length,
        digitalThreadTraversals: 1,
      },
      createdAt: new Date().toISOString(),
      createdBy: userId,
    };
    await this.reviews.save(record);
    await this.recordEvent?.(commerce, tenantId, {
      eventType: "PRE_ISSUE_REVIEW_COMPLETED",
      projectId,
      planId: plan.id,
      artifactId: chosen.id,
      actorId: userId,
    });

    const comparison = previous
      ? compareReviewRuns(previous.conditions, record.conditions, previous.id, fingerprintChanged)
      : null;

    return {
      ok: true as const,
      review: record,
      package: { id: pkg.id, status: pkg.status, autoSubmitted: false },
      run: { id: run.id, status: run.status },
      findings: findings.map((finding) => ({ id: finding.id, status: finding.status, category: finding.category })),
      summary: this.summary(record),
      comparison,
      view: { projectId, selectedProjectId: input.selectedProjectId ?? null, mismatch: viewMismatch, rewriteMembership: false },
      thread: {
        links: [
          { relationship: "USES", fromType: "engineering_work_plan", fromId: plan.id, toType: "engineering_generated_artifact", toId: chosen.id },
          { relationship: "REVIEWS", fromType: "review_package", fromId: pkg.id, toType: "engineering_generated_artifact", toId: chosen.id },
          { relationship: "REVIEWS", fromType: "review_package", fromId: pkg.id, toType: "engineering_work_plan", toId: plan.id },
          ...findings.slice(0, 12).map((finding) => ({
            relationship: "FOUND_IN",
            fromType: "review_finding",
            fromId: finding.id,
            toType: "review_package",
            toId: pkg.id,
          })),
        ],
      },
      durationMs: Date.now() - started,
      sizeGuardBytes: MAX_RETURN_BYTES,
      template: ARTIFACT_TEMPLATES.find((row) => row.code === chosen.templateCode)?.code ?? null,
    };
  }

  async latest(commerce: CommerceExecutionContext, tenantId: string, workPlanId: string, selectedProjectId?: string | null) {
    assertEngineeringService(commerce, "work.get", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const plan = await this.loadPlan(workPlanId);
    if (!plan || plan.tenantId !== tenantId || plan.workspaceId !== workspaceId) throw new Error("not_found");
    const rows = await this.reviews.listByPlan(workspaceId, plan.id);
    const latest = rows[0] ?? null;
    if (!latest) return { review: null, summary: this.summary(null), history: [] as PreIssueReviewRecord[] };
    const artifacts = await this.artifacts.listArtifacts(workspaceId, plan.id);
    const target = artifacts.find((row) => row.id === latest.targetArtifactId);
    const authorityChanged = latest.snapshot.information.some((cited) => {
      const current = plan.context.information.find((row) => row.title === cited.title);
      return Boolean(current && cited.revision && current.revision && cited.revision !== current.revision);
    });
    const staleness = evaluateReviewStaleness({
      storedFingerprint: latest.snapshot.workPlanFingerprint,
      currentFingerprint: plan.inputFingerprint,
      storedTargetHash: latest.targetArtifactHash,
      currentTargetHash: target?.sha256 ?? latest.targetArtifactHash,
      authorityChanged,
    });
    const live = { ...latest, staleness };
    return {
      review: live,
      summary: this.summary(live),
      history: rows,
      view: {
        projectId: plan.projectId,
        selectedProjectId: selectedProjectId ?? null,
        mismatch: Boolean(selectedProjectId && selectedProjectId !== plan.projectId),
        rewriteMembership: false,
      },
    };
  }

  async dispose(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { findingId: string; action: "accept" | "reject" | "modify" | "close" | "reopen" | "assign"; reason?: string; assignedTo?: string; workPlanId: string },
  ) {
    assertEngineeringService(commerce, "work.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const plan = await this.loadPlan(input.workPlanId);
    if (!plan || plan.tenantId !== tenantId || plan.workspaceId !== workspaceId) throw new Error("not_found");
    const store = this.reviewStoreFactory(tenantId, workspaceId, commerce.actorUserId ?? "engineer");
    const result = await store.recordHumanDisposition({
      findingId: input.findingId,
      action: input.action,
      actorId: commerce.actorUserId ?? "engineer",
      actorKind: "human",
      reason: input.reason,
      assignedTo: input.assignedTo,
    });
    await this.recordEvent?.(commerce, tenantId, {
      eventType: "REVIEW_CONDITION_DISPOSITIONED",
      projectId: plan.projectId,
      planId: plan.id,
      actorId: commerce.actorUserId ?? null,
    });
    return { finding: result.finding, disposition: result.disposition, automaticApproval: false };
  }

  private async composePackage(
    store: EngineeringReviewStore,
    plan: EngineeringWorkPlan,
    artifacts: import("../artifact-automation/types").GeneratedEngineeringArtifact[],
    target: import("../artifact-automation/types").GeneratedEngineeringArtifact,
    createdBy: string,
  ): Promise<ReviewPackage> {
    const documents = artifacts.map((artifact) => ({
      documentId: artifact.id,
      revision: artifact.lineageKind === "RETURNED_FROM_ENGINEER" ? "RETURNED" : "DRAFT",
      role: documentRole(artifact.artifactType),
      documentNumber: artifact.fileName,
      inclusion: "current" as const,
    }));
    if (!documents.some((row) => row.documentId === target.id)) {
      documents.push({
        documentId: target.id,
        revision: target.lineageKind === "RETURNED_FROM_ENGINEER" ? "RETURNED" : "DRAFT",
        role: documentRole(target.artifactType),
        documentNumber: target.fileName,
        inclusion: "current",
      });
    }
    const pkg = createReviewPackage({
      id: randomUUID(),
      tenantId: plan.tenantId,
      workspaceId: plan.workspaceId,
      projectId: plan.projectId,
      name: `Pre-issue ${plan.templateCode} ${plan.id.slice(0, 8)}`,
      documents,
      createdBy,
    });
    return store.saveReviewPackage(pkg);
  }
}

export function createTestPreIssueService(input: {
  artifacts: ArtifactStore;
  loadPlan: (id: string) => Promise<EngineeringWorkPlan | null>;
  recorder?: PreIssueEventRecorder;
  inference?: ReviewInferenceProvider;
  store?: PreIssueReviewStore;
}) {
  const memory = createSharedReviewMemory();
  return new EngineeringPreIssueReviewService(
    { from() { return this; } } as never,
    input.artifacts,
    input.store ?? createMemoryPreIssueStore(),
    (tenantId, workspaceId, userId) => new MemoryEngineeringReviewStore(reviewPrincipal(tenantId, workspaceId, userId), memory),
    input.loadPlan,
    input.recorder,
    input.inference,
  );
}
