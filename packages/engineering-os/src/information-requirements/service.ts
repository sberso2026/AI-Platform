import type { SupabaseClient } from "@rtb/database";
import type { CommerceExecutionContext } from "@rtb/types";
import { assertEngineeringService } from "../commerce/service-guard";
import { workspaceScopeId } from "../commerce/workspace-scope";
import type { EngineeringInformationRef, InformationAuthorityPolicy } from "../information-intelligence/types";
import { A11A_COMPATIBILITY, INFORMATION_REQUIREMENT_TEMPLATES, LIFECYCLE_INFORMATION_PROFILES, templatesForWork } from "./catalog";
import { evaluateHandoverCompleteness, nextHandoverState } from "./handover";
import type { InformationRequirementStore } from "./memory-store";
import { SupabaseInformationRequirementStore } from "./supabase-store";
import { canStartWork, resolveWorkReadiness } from "./readiness";
import { evaluateRequirementSatisfaction } from "./satisfaction";
import {
  FUTURE_ASSURANCE_CONDITIONS,
  INFORMATION_REQUIREMENT_AI_BOUNDARY,
  INFORMATION_REQUIREMENT_TYPES,
  type EngineeringHandoverPackage,
  type EngineeringInformationRequirement,
  type EngineeringWorkType,
  type InformationRequirementSatisfaction,
  type InformationRequirementStatus,
} from "./types";

export const CALLER_SUPPLIED_IR_KEYS = ["tenantId", "workspaceId", "aal", "approved", "authoritative"] as const;

function newId() {
  return crypto.randomUUID();
}

export class EngineeringInformationRequirementService {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly store: InformationRequirementStore = new SupabaseInformationRequirementStore(supabase),
  ) {}

  catalog() {
    return {
      requirementTypes: INFORMATION_REQUIREMENT_TYPES,
      templates: INFORMATION_REQUIREMENT_TEMPLATES,
      lifecycleProfiles: LIFECYCLE_INFORMATION_PROFILES,
      aiBoundary: INFORMATION_REQUIREMENT_AI_BOUNDARY,
      a11a: A11A_COMPATIBILITY,
      futureAssuranceConditions: FUTURE_ASSURANCE_CONDITIONS,
      engineeringRequirementSeparation: true,
      interfaceRemainsSeparate: true,
      noUniversalCompletenessPercent: true,
    };
  }

  rejectCallerClaims(body: Record<string, unknown>) {
    for (const key of CALLER_SUPPLIED_IR_KEYS) {
      if (key in body && body[key] != null && body[key] !== "") return "caller_supplied_authority_rejected";
    }
    return null;
  }

  async list(commerce: CommerceExecutionContext, tenantId: string, projectId: string) {
    assertEngineeringService(commerce, "information-requirements.list", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    return (await this.store.listRequirements(workspaceId, projectId)).filter((row) => row.tenantId === tenantId);
  }

  async get(commerce: CommerceExecutionContext, tenantId: string, id: string) {
    assertEngineeringService(commerce, "information-requirements.get", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const row = await this.store.getRequirement(id);
    if (!row || row.tenantId !== tenantId || row.workspaceId !== workspaceId) return null;
    return row;
  }

  async save(commerce: CommerceExecutionContext, tenantId: string, row: EngineeringInformationRequirement) {
    assertEngineeringService(commerce, "information-requirements.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    if (row.tenantId !== tenantId || row.workspaceId !== workspaceId) throw new Error("workspace_mismatch");
    return this.store.saveRequirement({ ...row, updatedAt: new Date().toISOString() });
  }

  async instantiateWorkRequirements(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: {
      projectId: string;
      workType: EngineeringWorkType;
      lifecycleStage: NonNullable<EngineeringInformationRequirement["lifecycleStage"]>;
      systemId?: string | null;
      interfaceId?: string | null;
      deliverableId?: string | null;
      constructionRequestId?: string | null;
    },
  ) {
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const created: EngineeringInformationRequirement[] = [];
    for (const tpl of templatesForWork(input.workType, input.lifecycleStage)) {
      const row = await this.save(commerce, tenantId, {
        id: newId(),
        tenantId,
        workspaceId,
        projectId: input.projectId,
        requirementType: tpl.requirementType,
        informationType: tpl.informationType,
        purpose: tpl.purpose,
        title: tpl.title,
        whyRequired: tpl.whyRequired,
        providerKind: tpl.providerKind,
        providerDiscipline: tpl.providerDiscipline,
        providerOrg: null,
        providerRole: null,
        consumerKind: tpl.consumerKind,
        consumerDiscipline: tpl.consumerDiscipline,
        consumerOrg: null,
        consumerRole: null,
        systemId: input.systemId ?? null,
        assetId: null,
        packageId: null,
        interfaceId: input.interfaceId ?? null,
        deliverableId: input.deliverableId ?? null,
        lifecycleStage: tpl.lifecycleStage,
        neededBy: null,
        requiredForObjectType: input.workType,
        requiredForObjectId: input.systemId ?? input.projectId,
        workType: tpl.workType,
        acceptanceCriteriaRef: null,
        blocking: tpl.blocking,
        requireAuthoritative: tpl.requireAuthoritative,
        requireManagedSource: true,
        status: "PLANNED",
        constructionRequestId: input.constructionRequestId ?? null,
        createdBy: "eng-admin",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      created.push(row);
    }
    return created;
  }

  async evaluateAll(
    commerce: CommerceExecutionContext,
    tenantId: string,
    projectId: string,
    refs: EngineeringInformationRef[],
    policies: InformationAuthorityPolicy[],
  ) {
    const requirements = await this.list(commerce, tenantId, projectId);
    const workspaceId = workspaceScopeId(commerce)!;
    const satisfactions = await this.store.listSatisfactions(
      workspaceId,
      requirements.map((row) => row.id),
    );
    const started = Date.now();
    const evaluations = requirements.map((requirement) =>
      evaluateRequirementSatisfaction({ requirement, refs, policies, satisfactions }),
    );
    return { requirements, satisfactions, evaluations, durationMs: Date.now() - started };
  }

  getRequiredInformationForWork(
    workType: EngineeringWorkType,
    lifecycleStage: NonNullable<EngineeringInformationRequirement["lifecycleStage"]>,
  ) {
    return templatesForWork(workType, lifecycleStage);
  }

  async resolveWorkReadiness(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: {
      projectId: string;
      workType: EngineeringWorkType;
      refs: EngineeringInformationRef[];
      policies: InformationAuthorityPolicy[];
    },
  ) {
    const evaluated = await this.evaluateAll(commerce, tenantId, input.projectId, input.refs, input.policies);
    return resolveWorkReadiness({
      workType: input.workType,
      projectId: input.projectId,
      requirements: evaluated.requirements,
      evaluations: evaluated.evaluations,
    });
  }

  async applyAction(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: {
      requirementId: string;
      action:
        | "requestInformation"
        | "assignProvider"
        | "reviewInformation"
        | "acceptForPurpose"
        | "rejectRevision"
        | "receiveInformation";
      informationRefId?: string | null;
      managedRepositoryId?: string | null;
      unmanaged?: boolean;
      providerDiscipline?: string | null;
    },
  ) {
    assertEngineeringService(commerce, "information-requirements.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const row = await this.store.getRequirement(input.requirementId);
    if (!row || row.tenantId !== tenantId || row.workspaceId !== workspaceId) throw new Error("not_found");
    const now = new Date().toISOString();
    let status: InformationRequirementStatus = row.status;
    let eventType:
      | "INFORMATION_REQUESTED"
      | "INFORMATION_RECEIVED"
      | "INFORMATION_ACCEPTED"
      | "INFORMATION_OVERDUE"
      | null = null;
    if (input.action === "requestInformation") {
      status = "REQUESTED";
      eventType = "INFORMATION_REQUESTED";
    } else if (input.action === "assignProvider") {
      row.providerDiscipline = input.providerDiscipline ?? row.providerDiscipline;
      status = row.status === "PLANNED" ? "REQUESTED" : row.status;
    } else if (input.action === "reviewInformation") {
      status = "UNDER_REVIEW";
    } else if (input.action === "acceptForPurpose") {
      status = "ACCEPTED_FOR_PURPOSE";
      eventType = "INFORMATION_ACCEPTED";
    } else if (input.action === "rejectRevision") {
      status = "REJECTED";
    } else if (input.action === "receiveInformation") {
      status = "RECEIVED";
      eventType = "INFORMATION_RECEIVED";
    }
    if (input.action === "receiveInformation" || input.action === "acceptForPurpose" || input.action === "rejectRevision") {
      await this.store.saveSatisfaction({
        id: newId(),
        tenantId,
        workspaceId: row.workspaceId,
        requirementId: row.id,
        informationRefId: input.informationRefId ?? "unmanaged",
        managedRepositoryId: input.managedRepositoryId ?? null,
        unmanagedRejected: Boolean(input.unmanaged) || (!input.managedRepositoryId && row.requireManagedSource),
        acceptedForPurpose: input.action === "acceptForPurpose" && !input.unmanaged,
        rejected: input.action === "rejectRevision",
        engineeringApproved: false,
        createdAt: now,
      });
    }
    const saved = await this.store.saveRequirement({ ...row, status, updatedAt: now });
    return { requirement: saved, workEventType: eventType, autoApproved: false };
  }

  async startWork(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: {
      projectId: string;
      workType: EngineeringWorkType;
      refs: EngineeringInformationRef[];
      policies: InformationAuthorityPolicy[];
    },
  ) {
    const readiness = await this.resolveWorkReadiness(commerce, tenantId, input);
    return { allowed: canStartWork(readiness), readiness, autoApproved: false };
  }

  async listPackages(commerce: CommerceExecutionContext, tenantId: string, projectId: string) {
    assertEngineeringService(commerce, "information-requirements.list", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    return (await this.store.listPackages(workspaceId, projectId)).filter((row) => row.tenantId === tenantId);
  }

  async assembleHandoverPackage(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { projectId: string; displayName: string; systemId?: string | null; discipline?: string | null; requirementIds: string[] },
  ) {
    assertEngineeringService(commerce, "information-requirements.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const now = new Date().toISOString();
    const pkg = await this.store.savePackage({
      id: newId(),
      tenantId,
      workspaceId,
      projectId: input.projectId,
      displayName: input.displayName,
      systemId: input.systemId ?? null,
      assetId: null,
      discipline: input.discipline ?? null,
      lifecycleStage: "COMMISSIONING",
      state: "DRAFT",
      acceptedBy: null,
      acceptedAt: null,
      createdBy: "eng-admin",
      createdAt: now,
      updatedAt: now,
    });
    for (const requirementId of input.requirementIds) {
      await this.store.savePackageItem({ id: newId(), packageId: pkg.id, requirementId });
    }
    return pkg;
  }

  async savePackage(commerce: CommerceExecutionContext, tenantId: string, row: EngineeringHandoverPackage) {
    assertEngineeringService(commerce, "information-requirements.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    if (row.tenantId !== tenantId || row.workspaceId !== workspaceId) throw new Error("workspace_mismatch");
    return this.store.savePackage(row);
  }

  async evaluateHandover(
    commerce: CommerceExecutionContext,
    tenantId: string,
    packageId: string,
    refs: EngineeringInformationRef[],
    policies: InformationAuthorityPolicy[],
  ) {
    assertEngineeringService(commerce, "information-requirements.get", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const pkg = await this.store.getPackage(packageId);
    if (!pkg || pkg.tenantId !== tenantId || pkg.workspaceId !== workspaceId) throw new Error("not_found");
    const items = await this.store.listPackageItems(packageId);
    const requirements = (await this.store.listRequirements(workspaceId, pkg.projectId)).filter((row) =>
      items.some((item) => item.requirementId === row.id),
    );
    const satisfactions = await this.store.listSatisfactions(
      workspaceId,
      requirements.map((row) => row.id),
    );
    const evaluations = requirements.map((requirement) =>
      evaluateRequirementSatisfaction({ requirement, refs, policies, satisfactions }),
    );
    const completeness = evaluateHandoverCompleteness({ pkg, requirements, evaluations });
    const nextState = nextHandoverState(completeness.completeness, pkg.state);
    if (nextState !== pkg.state && pkg.state !== "ACCEPTED") {
      await this.store.savePackage({ ...pkg, state: nextState, updatedAt: new Date().toISOString() });
    }
    return { package: { ...pkg, state: nextState }, completeness, evaluations };
  }

  async acceptHandover(commerce: CommerceExecutionContext, tenantId: string, packageId: string, actorId: string) {
    assertEngineeringService(commerce, "information-requirements.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const pkg = await this.store.getPackage(packageId);
    if (!pkg || pkg.tenantId !== tenantId || pkg.workspaceId !== workspaceId) throw new Error("not_found");
    if (pkg.state !== "READY_FOR_REVIEW" && pkg.state !== "UNDER_REVIEW") {
      throw new Error("handover_not_ready_for_acceptance");
    }
    return this.store.savePackage({
      ...pkg,
      state: "ACCEPTED",
      acceptedBy: actorId,
      acceptedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  views(requirements: EngineeringInformationRequirement[], evaluations: ReturnType<typeof evaluateRequirementSatisfaction>[], consumerDiscipline?: string) {
    const byId = new Map(evaluations.map((row) => [row.requirementId, row]));
    const neededByMe = requirements.filter((row) => !consumerDiscipline || row.consumerDiscipline === consumerDiscipline);
    return {
      neededByMe,
      waitingOnOthers: neededByMe.filter((row) => ["PLANNED", "REQUESTED", "AWAITING_INFORMATION"].includes(row.status)),
      readyToUse: neededByMe.filter((row) => byId.get(row.id)?.satisfied),
      needsReview: neededByMe.filter((row) => row.status === "RECEIVED" || row.status === "UNDER_REVIEW"),
      blockingMyWork: neededByMe.filter((row) => row.blocking && !byId.get(row.id)?.satisfied),
      handoverRequirements: neededByMe.filter((row) => row.requirementType === "HANDOVER_INFORMATION" || row.requirementType === "COMMISSIONING_INFORMATION"),
    };
  }
}

export type { InformationRequirementSatisfaction };
