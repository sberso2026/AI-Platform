import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@rtb/database";
import type { CommerceExecutionContext } from "@rtb/types";
import { assertEngineeringService } from "../commerce/service-guard";
import { workspaceScopeId } from "../commerce/workspace-scope";
import type { EngineeringDigitalThreadService } from "../digital-thread/service";
import type { ThreadAuthorization, ThreadGraphInput } from "../digital-thread/types";
import { suggestedActionsFor } from "./actions";
import { compareAssessments, restoreSafeDispositions } from "./comparison";
import { assembleConstructionContext } from "./construction";
import { discoverPotentialEngineeringImpacts } from "./discover";
import { assessmentSourceFingerprint, graphFingerprint } from "./fingerprint";
import { createMemoryImpactAssessmentStore, type ImpactAssessmentStore } from "./memory-store";
import { composeOptionStudy } from "./option-study";
import { IMPACT_ASSESSMENT_POLICY, resolveImpactPolicy } from "./policy";
import { composePotentialValueImpacts, valuePolicyForProject } from "../lifecycle-intelligence/cross-lifecycle-value";
import { SupabaseImpactAssessmentStore } from "./supabase-store";
import {
  CHANGE_WORKBENCH_AI_BOUNDARY,
  CHANGE_WORKBENCH_PRIVACY,
  CHANGE_WORKBENCH_RECON,
  FUTURE_A11E_ASSURANCE_CONDITIONS,
  FORBIDDEN_IMPACT_ASSESSMENT_STATES,
  type ConstructionWorkbenchContext,
  type EngineeringImpactAssessment,
  type ImpactDisposition,
  type ImpactWorkflow,
  type OptionAlternative,
  type OptionCriterion,
} from "./types";

export const CALLER_SUPPLIED_IMPACT_KEYS = ["tenantId", "workspaceId", "aal", "approved", "winner", "confirmedImpact"] as const;

export type ChangeWorkbenchEventRecorder = (
  commerce: CommerceExecutionContext,
  tenantId: string,
  input: {
    eventType: "IMPACT_ASSESSMENT_STARTED" | "IMPACT_ASSESSMENT_COMPLETED" | "IMPACT_CONFIRMED" | "OPTION_STUDY_CREATED" | "RFI_ENGINEERING_RESPONSE_PREPARED" | "FIELD_CHANGE_ASSESSED";
    projectId: string;
    assessmentId: string;
    actorId?: string | null;
  },
) => Promise<void>;

function authFromGraph(graph: ThreadGraphInput, tenantId: string, workspaceId: string): ThreadAuthorization {
  return {
    tenantId,
    allowedWorkspaceIds: [workspaceId],
    role: "member",
    nodeAccess: new Map(
      graph.nodes
        .filter((n) => n.tenantId === tenantId && n.workspaceId === workspaceId)
        .map((n) => [`${n.objectType}:${n.objectId}`, { tenantId: n.tenantId, workspaceId: n.workspaceId }]),
    ),
  };
}

function packFor(assessmentId: string, projectId: string, sourceObjectType: string, sourceObjectId: string, candidates: EngineeringImpactAssessment["snapshot"]["candidates"]): EngineeringImpactAssessment["snapshot"]["pack"] {
  return {
    kind: "ENGINEERING_IMPACT_PACK",
    binaryContentCopied: false,
    source: { objectType: sourceObjectType, objectId: sourceObjectId, projectId },
    assessmentId,
    references: [
      { objectType: sourceObjectType, objectId: sourceObjectId, role: "source" },
      ...candidates.map((row) => ({ objectType: row.objectType, objectId: row.objectId, role: row.disposition.toLowerCase() })),
    ],
    relationPaths: candidates.map((row) => row.relationPath),
  };
}

export class EngineeringChangeWorkbenchService {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly store: ImpactAssessmentStore = new SupabaseImpactAssessmentStore(supabase),
    private readonly loadGraph?: (tenantId: string, workspaceId: string) => Promise<ThreadGraphInput>,
    private readonly recorder?: ChangeWorkbenchEventRecorder,
  ) {}

  catalog() {
    return {
      recon: CHANGE_WORKBENCH_RECON,
      policy: IMPACT_ASSESSMENT_POLICY,
      aiBoundary: CHANGE_WORKBENCH_AI_BOUNDARY,
      privacy: CHANGE_WORKBENCH_PRIVACY,
      forbiddenAssessmentStates: FORBIDDEN_IMPACT_ASSESSMENT_STATES,
      futureAssuranceConditions: FUTURE_A11E_ASSURANCE_CONDITIONS,
      duplicateChangeDomainCreated: false,
      duplicateOptimizationEngineCreated: false,
      duplicateDecisionDomainCreated: false,
      duplicateReviewEngineCreated: false,
      binaryDuplication: "NO" as const,
      artifactBinaryStorageRisk: "HIGH" as const,
      automaticOptionWinner: false,
      autonomousChangeApproval: false,
      autonomousFieldChangeApproval: false,
      humanReviewRequired: true,
      relatedIsNotAffected: true,
      potentialIsNotConfirmed: true,
      aal2: "REUSE" as const,
    };
  }

  rejectCallerClaims(body: Record<string, unknown>) {
    for (const key of CALLER_SUPPLIED_IMPACT_KEYS) {
      if (key in body && body[key] != null && body[key] !== "") return "caller_supplied_authority_rejected";
    }
    if (body.automaticWinner === true || body.selectWinner === true) return "caller_supplied_authority_rejected";
    return null;
  }

  async assess(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: {
      sourceObjectType: string;
      sourceObjectId: string;
      sourceChangeId?: string | null;
      sourceTitle?: string | null;
      sourceRevision?: string | null;
      sourceStatus?: string | null;
      projectId: string;
      selectedProjectId?: string | null;
      workflow?: ImpactWorkflow;
      graph?: ThreadGraphInput;
      constructionQuery?: {
        id: string;
        type: ConstructionWorkbenchContext["queryType"];
        summary: string;
        location?: string | null;
      };
      optionStudy?: { title: string; options: OptionAlternative[]; criteria?: OptionCriterion[] };
      maxDepth?: number;
    },
  ) {
    assertEngineeringService(commerce, "work.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    if (!input.projectId) throw new Error("project_required");
    if (!input.sourceObjectType || !input.sourceObjectId) throw new Error("source_required");
    const graph = input.graph ?? (this.loadGraph ? await this.loadGraph(tenantId, workspaceId) : { nodes: [], links: [] });
    const sourceNode = graph.nodes.find((n) => n.objectType === input.sourceObjectType && n.objectId === input.sourceObjectId);
    const projectId = sourceNode?.projectId ?? input.projectId;
    if (projectId !== input.projectId) {
      throw new Error("CROSS_PROJECT_MISMATCH");
    }
    const viewProjectMismatch = Boolean(input.selectedProjectId && input.selectedProjectId !== projectId);
    const policy = resolveImpactPolicy({ maxDepth: input.maxDepth });
    const previous = (await this.store.listBySource(workspaceId, input.sourceObjectType, input.sourceObjectId)).find(
      (row) => row.tenantId === tenantId && row.projectId === projectId && row.status !== "CANCELLED",
    ) ?? null;
    const sourceFingerprint = assessmentSourceFingerprint({
      sourceObjectType: input.sourceObjectType,
      sourceObjectId: input.sourceObjectId,
      sourceRevision: input.sourceRevision ?? sourceNode?.revision ?? null,
      sourceTitle: input.sourceTitle ?? sourceNode?.title ?? null,
      sourceStatus: input.sourceStatus ?? sourceNode?.status ?? null,
      policyVersion: policy.version,
    });
    const gfp = graphFingerprint(graph);
    await this.recorder?.(commerce, tenantId, {
      eventType: "IMPACT_ASSESSMENT_STARTED",
      projectId,
      assessmentId: previous?.id ?? "pending",
      actorId: commerce.actorUserId ?? null,
    });
    const discovery = discoverPotentialEngineeringImpacts({
      graph,
      source: { objectType: input.sourceObjectType, objectId: input.sourceObjectId, projectId },
      tenantId,
      workspaceId,
      policy,
      authorization: authFromGraph(graph, tenantId, workspaceId),
    });
    const candidates = restoreSafeDispositions(previous, discovery.candidates);
    let optionStudy = input.optionStudy ? composeOptionStudy(input.optionStudy) : null;
    const optionStarted = Date.now();
    if (optionStudy) discovery.performance.optionStudyPreparationMs = Date.now() - optionStarted;
    let construction = input.constructionQuery
      ? assembleConstructionContext({
          graph,
          query: { ...input.constructionQuery, projectId },
        })
      : null;
    const constructionStarted = Date.now();
    if (construction) discovery.performance.constructionResponsePreparationMs = Date.now() - constructionStarted;
    const id = randomUUID();
    const assessment: EngineeringImpactAssessment = {
      id,
      tenantId,
      workspaceId,
      projectId,
      sourceObjectType: input.sourceObjectType,
      sourceObjectId: input.sourceObjectId,
      sourceChangeId: input.sourceChangeId ?? (input.sourceObjectType === "change" ? input.sourceObjectId : null),
      workflow: input.workflow ?? "CHANGE_IMPACT",
      policyCode: policy.code,
      policyVersion: policy.version,
      status: "REVIEW_REQUIRED",
      completeness: discovery.completeness,
      traversalStatus: discovery.traversalStatus,
      staleness: previous && previous.sourceFingerprint !== sourceFingerprint ? "RERUN_REQUIRED" : "CURRENT",
      sourceFingerprint,
      graphFingerprint: gfp,
      snapshot: {
        sourceTitle: input.sourceTitle ?? sourceNode?.title ?? null,
        candidates,
        actions: suggestedActionsFor(candidates),
        pack: packFor(id, projectId, input.sourceObjectType, input.sourceObjectId, candidates),
        optionStudy,
        construction,
        disciplines: discovery.disciplines,
        systems: discovery.systems,
        performance: discovery.performance,
        humanReviewRequired: true,
        relatedIsNotAffected: true,
        potentialIsNotConfirmed: true,
        automaticImpactConfirmation: false,
        automaticOptionWinner: false,
        automaticCostAcceptance: false,
        automaticConstructabilityAcceptance: false,
        automaticCarbonAcceptance: false,
        valueImpacts: composePotentialValueImpacts({
          candidates,
          policy: valuePolicyForProject(projectId),
        }),
        semanticCandidatesDistinguished: true,
        binaryDuplication: "NO",
      },
      supersedesAssessmentId: previous?.id ?? null,
      viewProjectMismatch,
      createdAt: new Date().toISOString(),
      createdBy: commerce.actorUserId ?? null,
    };
    if (previous && previous.status !== "SUPERSEDED") {
      await this.store.save({ ...previous, status: "SUPERSEDED", staleness: previous.sourceFingerprint === sourceFingerprint ? "CURRENT" : "STALE", createdAt: previous.createdAt });
    }
    if (previous && previous.sourceFingerprint !== sourceFingerprint) {
      assessment.staleness = "CURRENT";
    } else if (previous && previous.graphFingerprint !== gfp) {
      assessment.staleness = "CURRENT";
    }
    await this.store.save(assessment);
    const eventType =
      input.workflow === "OPTION_STUDY"
        ? "OPTION_STUDY_CREATED"
        : input.workflow === "FIELD_CHANGE"
          ? "FIELD_CHANGE_ASSESSED"
          : input.workflow === "CONSTRUCTION_RFI"
            ? "RFI_ENGINEERING_RESPONSE_PREPARED"
            : "IMPACT_ASSESSMENT_COMPLETED";
    await this.recorder?.(commerce, tenantId, {
      eventType,
      projectId,
      assessmentId: id,
      actorId: commerce.actorUserId ?? null,
    });
    return {
      assessment,
      comparison: compareAssessments(previous, assessment),
      historicalPreserved: Boolean(previous),
      viewProjectMismatch,
      crossProjectContamination: false,
      humanReviewRequired: true as const,
      completenessNote: "Completeness is traversal/evaluation completeness, not a claim that all real engineering impacts were discovered.",
    };
  }

  async dispose(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: {
      assessmentId: string;
      candidateIds: string[];
      disposition: ImpactDisposition;
      rationale?: string | null;
    },
  ) {
    assertEngineeringService(commerce, "work.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    if (input.disposition === "CONFIRMED_IMPACT" && CHANGE_WORKBENCH_AI_BOUNDARY.mayConfirmImpact) {
      throw new Error("AI_IMPACT_CONFIRMATION_FORBIDDEN");
    }
    const row = await this.store.get(input.assessmentId);
    if (!row || row.tenantId !== tenantId || row.workspaceId !== workspaceId) throw new Error("not_found");
    const targets = row.snapshot.candidates.filter((c) => input.candidateIds.includes(c.id));
    if (input.candidateIds.length > 1) {
      const fingerprints = new Set(targets.map((c) => c.evidenceFingerprint));
      if (fingerprints.size > 1) throw new Error("BULK_CONFIRMATION_UNSAFE");
    }
    const candidates = row.snapshot.candidates.map((candidate) =>
      input.candidateIds.includes(candidate.id)
        ? { ...candidate, disposition: input.disposition, autoConfirmed: false as const, rationale: input.rationale ?? candidate.rationale }
        : candidate,
    );
    const confirmed = candidates.filter((c) => c.disposition === "CONFIRMED_IMPACT");
    const next: EngineeringImpactAssessment = {
      ...row,
      status: confirmed.length && candidates.every((c) => c.disposition !== "POTENTIAL_IMPACT") ? "CONFIRMED" : "IN_REVIEW",
      snapshot: {
        ...row.snapshot,
        candidates,
        actions: suggestedActionsFor(candidates),
        pack: packFor(row.id, row.projectId, row.sourceObjectType, row.sourceObjectId, candidates),
        automaticImpactConfirmation: false,
      },
    };
    await this.store.save(next);
    if (input.disposition === "CONFIRMED_IMPACT") {
      await this.recorder?.(commerce, tenantId, {
        eventType: "IMPACT_CONFIRMED",
        projectId: row.projectId,
        assessmentId: row.id,
        actorId: commerce.actorUserId ?? null,
      });
    }
    return next;
  }

  async recordHumanDecision(commerce: CommerceExecutionContext, tenantId: string, assessmentId: string, optionId: string, decisionId?: string | null) {
    assertEngineeringService(commerce, "work.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const row = await this.store.get(assessmentId);
    if (!row || row.tenantId !== tenantId || row.workspaceId !== workspaceId) throw new Error("not_found");
    if (!row.snapshot.optionStudy) throw new Error("option_study_required");
    const option = row.snapshot.optionStudy.options.find((o) => o.id === optionId);
    if (!option) throw new Error("option_not_found");
    const next: EngineeringImpactAssessment = {
      ...row,
      snapshot: {
        ...row.snapshot,
        optionStudy: {
          ...row.snapshot.optionStudy,
          selectedOptionId: optionId,
          humanDecisionRecorded: true,
          humanDecisionRequired: true,
          automaticWinner: false,
          decisionId: decisionId ?? row.snapshot.optionStudy.decisionId,
        },
        automaticOptionWinner: false,
      },
    };
    await this.store.save(next);
    return next;
  }

  async latest(commerce: CommerceExecutionContext, tenantId: string, sourceObjectType: string, sourceObjectId: string) {
    assertEngineeringService(commerce, "work.list", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const rows = (await this.store.listBySource(workspaceId, sourceObjectType, sourceObjectId)).filter((row) => row.tenantId === tenantId);
    return rows[0] ?? null;
  }

  async listByProject(commerce: CommerceExecutionContext, tenantId: string, projectId: string) {
    assertEngineeringService(commerce, "work.list", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    if (!projectId) throw new Error("project_required");
    return (await this.store.listByProject(workspaceId, projectId)).filter((row) => row.tenantId === tenantId);
  }

  async get(commerce: CommerceExecutionContext, tenantId: string, id: string) {
    assertEngineeringService(commerce, "work.list", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const row = await this.store.get(id);
    if (!row || row.tenantId !== tenantId || row.workspaceId !== workspaceId) return null;
    return row;
  }

  artifactContracts() {
    return {
      impactReport: {
        artifactType: "TECHNICAL_MEMORANDUM",
        templateCode: "EAT-IMPACT-REPORT",
        status: "DRAFT",
        engineerReviewRequired: true,
        engineeringApproved: false,
        binaryDuplication: "NO",
      },
      optionStudy: {
        artifactType: "OPTION_STUDY",
        templateCode: "EAT-OPTION-WB",
        status: "DRAFT",
        engineerReviewRequired: true,
        engineeringApproved: false,
        automaticWinner: false,
        binaryDuplication: "NO",
      },
      rfiResponse: {
        artifactType: "RFI_RESPONSE",
        templateCode: "EAT-RFI-DRAFT",
        status: "DRAFT",
        engineerReviewRequired: true,
        label: "DRAFT FOR ENGINEER REVIEW",
        issued: false,
        binaryDuplication: "NO",
      },
      preIssueReviewReused: true,
    };
  }
}

export function createTestChangeWorkbenchService(input?: {
  store?: ImpactAssessmentStore;
  graph?: ThreadGraphInput;
  recorder?: ChangeWorkbenchEventRecorder;
  digitalThread?: EngineeringDigitalThreadService;
}) {
  const loadGraph = input?.digitalThread
    ? (tenantId: string, workspaceId: string) => input.digitalThread!.loadAuthorizedWorkspaceGraph(tenantId, workspaceId)
    : input?.graph
      ? async () => input.graph!
      : undefined;
  return new EngineeringChangeWorkbenchService(
    { from() { return this; } } as never,
    input?.store ?? createMemoryImpactAssessmentStore(),
    loadGraph,
    input?.recorder,
  );
}
