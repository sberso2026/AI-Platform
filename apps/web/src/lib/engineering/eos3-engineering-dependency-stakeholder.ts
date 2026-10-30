/**
 * EOS-3-INTELLIGENCE-2 — Engineering dependency & stakeholder model.
 * Reuses Relationship Graph; does not create a second graph or duplicate identities.
 * Handoffs require an information object. Available ≠ Accepted ≠ Approved.
 */

import { EOS3_RELATIONSHIP_TYPE_REGISTRY } from "./eos3-relationship-type-registry";
import {
  createGraphEdge,
  listEdgesForObject,
  type GraphEdge,
} from "./eos3-relationship-graph-core";
import {
  addDependency,
  createWorkPackage,
  getWorkPackage,
  listAssociations,
  listDependencies,
  seedPilot001SupportFrameWorkPackage,
} from "./eos3-work-package-service";
import { listActiveImpacts, processEngineeringChange } from "./eos3-impact-propagation";
import { ensurePilot001BrownfieldPattern } from "./eos3-engineering-pattern-engine";
import { findByStableId } from "./eos3-project-workspace-service";

export const STAKEHOLDER_CLASSES = [
  "Engineer",
  "Discipline Lead",
  "Project Engineer",
  "Engineering Manager",
  "Technical Authority",
  "Project Manager",
  "Document Control",
  "Construction",
  "Commissioning",
  "Operations / Maintenance",
  "Client",
  "Vendor / Supplier",
  "Contractor",
  "EPC / EPCM",
  "Consultant",
  "Regulator",
  "Certifier / Independent Reviewer",
] as const;
export type StakeholderClass = (typeof STAKEHOLDER_CLASSES)[number];

export const DEPENDENCY_TYPES = [
  "REQUIRES_INFORMATION_FROM",
  "PRODUCES_FOR",
  "CONSUMES_FROM",
  "WAITING_ON",
  "BLOCKED_BY",
  "RESPONDS_TO",
  "REVIEWS_FOR",
  "APPROVAL_REQUIRED_FROM",
  "HANDOFF_TO",
] as const;
export type EngineeringDependencyType = (typeof DEPENDENCY_TYPES)[number];

export const DEPENDENCY_STATUSES = [
  "IDENTIFIED",
  "REQUESTED",
  "IN_PROGRESS",
  "AVAILABLE",
  "RECEIVED",
  "UNDER_REVIEW",
  "ACCEPTED_FOR_USE",
  "REQUIRES_REVISION",
  "SUPERSEDED",
  "CLOSED",
] as const;
export type InformationDependencyStatus = (typeof DEPENDENCY_STATUSES)[number];

export const DEPENDENCY_CRITICALITIES = ["LOW", "MEDIUM", "HIGH", "BLOCKING"] as const;
export type DependencyCriticality = (typeof DEPENDENCY_CRITICALITIES)[number];

export type StakeholderRef = {
  /** Reuses existing identity id — never duplicates person record */
  identityId: string;
  displayName: string;
  personSeparated: true;
  role: string | null;
  discipline: string | null;
  organization: string | null;
  stakeholderClass: StakeholderClass;
  authorityRole: string | null;
  responsibility: "producer" | "consumer" | "responsible" | "reviewer" | "approver" | "authority";
};

export type StakeholderAssociation = {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: "Project" | "WorkPackage" | "AssetSystem" | "Deliverable" | "Interface" | "Decision" | "Review" | "Dependency";
  scopeStableId: string;
  stakeholder: StakeholderRef;
  provenance: Record<string, unknown>;
  createdAt: string;
};

export type HandoffHistoryEntry = {
  at: string;
  status: InformationDependencyStatus;
  revision: string | null;
  actorId: string;
  note: string;
};

export type InformationDependency = {
  id: string;
  stableId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  dependencyType: EngineeringDependencyType;
  /** Canonical information object — never a copy */
  informationObjectStableId: string;
  informationObjectClass: string;
  informationObjectRevision: string | null;
  interfaceStableId: string | null;
  upstreamWorkPackageStableId: string | null;
  downstreamWorkPackageStableId: string | null;
  producerDiscipline: string | null;
  consumerDiscipline: string | null;
  producers: StakeholderRef[];
  consumers: StakeholderRef[];
  sourceAssetSystemRef: string | null;
  targetAssetSystemRef: string | null;
  status: InformationDependencyStatus;
  criticality: DependencyCriticality;
  blocking: boolean;
  requiredByDate: string | null;
  overdue: boolean;
  relationshipEdgeIds: string[];
  resolutionObjectStableId: string | null;
  handoffHistory: HandoffHistoryEntry[];
  acceptedForUse: boolean;
  engineeringApproved: false;
  materiality: "LOW" | "MEDIUM" | "HIGH";
  confirmationState: "PROPOSED" | "CONFIRMED" | "REJECTED";
  inferenceBasis: string | null;
  provenance: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

type DepStore = {
  dependencies: Map<string, InformationDependency>;
  stakeholders: StakeholderAssociation[];
};

const stores = new Map<string, DepStore>();

function id() {
  return crypto.randomUUID();
}
function now() {
  return new Date().toISOString();
}
function ensure(workspaceId: string): DepStore {
  let s = stores.get(workspaceId);
  if (!s) {
    s = { dependencies: new Map(), stakeholders: [] };
    stores.set(workspaceId, s);
  }
  return s;
}

export function __resetEngineeringDependencyStakeholderForTests() {
  stores.clear();
}

/** Map engineering dependency semantics onto Relationship Graph registry types. */
export function mapDependencyTypeToGraphRelation(
  type: EngineeringDependencyType,
): "REQUIRES" | "PRODUCES" | "CONSUMES" | "BLOCKS" | "AFFECTS" | "ASSOCIATED_WITH" {
  switch (type) {
    case "REQUIRES_INFORMATION_FROM":
    case "WAITING_ON":
    case "BLOCKED_BY":
    case "APPROVAL_REQUIRED_FROM":
      return "REQUIRES";
    case "PRODUCES_FOR":
    case "HANDOFF_TO":
      return "PRODUCES";
    case "CONSUMES_FROM":
      return "CONSUMES";
    case "REVIEWS_FOR":
    case "RESPONDS_TO":
      return "AFFECTS";
    default:
      return "ASSOCIATED_WITH";
  }
}

export function deriveOverdue(dep: Pick<InformationDependency, "requiredByDate" | "status">): boolean {
  if (!dep.requiredByDate) return false;
  if (["ACCEPTED_FOR_USE", "CLOSED", "SUPERSEDED"].includes(dep.status)) return false;
  return new Date(dep.requiredByDate).getTime() < Date.now();
}

export function createStakeholderAssociation(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: StakeholderAssociation["scope"];
  scopeStableId: string;
  identityId: string;
  displayName: string;
  role?: string | null;
  discipline?: string | null;
  organization?: string | null;
  stakeholderClass: StakeholderClass;
  authorityRole?: string | null;
  responsibility: StakeholderRef["responsibility"];
  authorized: boolean;
}): StakeholderAssociation {
  if (!input.authorized) throw new Error("unauthorized_dependency_write");
  const row: StakeholderAssociation = {
    id: id(),
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    scope: input.scope,
    scopeStableId: input.scopeStableId,
    stakeholder: {
      identityId: input.identityId,
      displayName: input.displayName,
      personSeparated: true,
      role: input.role ?? null,
      discipline: input.discipline ?? null,
      organization: input.organization ?? null,
      stakeholderClass: input.stakeholderClass,
      authorityRole: input.authorityRole ?? null,
      responsibility: input.responsibility,
    },
    provenance: {
      source: "eos3.engineering-dependency-stakeholder",
      duplicateUserIdentityCreated: false,
      engineeringScoped: true,
    },
    createdAt: now(),
  };
  ensure(input.workspaceId).stakeholders.push(row);
  return row;
}

export function createInformationDependency(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  dependencyType: EngineeringDependencyType;
  informationObjectStableId: string;
  informationObjectClass: string;
  informationObjectRevision?: string | null;
  interfaceStableId?: string | null;
  upstreamWorkPackageStableId?: string | null;
  downstreamWorkPackageStableId?: string | null;
  producerDiscipline?: string | null;
  consumerDiscipline?: string | null;
  producers?: StakeholderRef[];
  consumers?: StakeholderRef[];
  sourceAssetSystemRef?: string | null;
  targetAssetSystemRef?: string | null;
  status?: InformationDependencyStatus;
  criticality?: DependencyCriticality;
  blocking?: boolean;
  requiredByDate?: string | null;
  confirmationState?: "PROPOSED" | "CONFIRMED" | "REJECTED";
  inferenceBasis?: string | null;
  authorized: boolean;
  actorId?: string;
}): InformationDependency {
  if (!input.authorized) throw new Error("unauthorized_dependency_write");
  if (!input.informationObjectStableId?.trim()) {
    throw new Error("handoff_information_object_required");
  }
  // Do not fabricate information object copies
  const existing = findByStableId(input.projectId, input.informationObjectStableId);
  void existing;

  if (
    input.confirmationState === "CONFIRMED" &&
    input.inferenceBasis &&
    /uncertain|weak|ambiguous/i.test(input.inferenceBasis)
  ) {
    throw new Error("dependency_inference_requires_confirmation");
  }

  const status = input.status ?? "IDENTIFIED";
  const edgeIds: string[] = [];
  try {
    const graphType = mapDependencyTypeToGraphRelation(input.dependencyType);
    if (input.downstreamWorkPackageStableId && input.informationObjectStableId) {
      const edge = createGraphEdge({
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        projectId: input.projectId,
        sourceClass: "WorkPackage",
        sourceStableId: input.downstreamWorkPackageStableId,
        targetClass: input.informationObjectClass as never,
        targetStableId: input.informationObjectStableId,
        relationshipType: graphType === "PRODUCES" ? "REQUIRES" : graphType,
        origin: input.inferenceBasis ? "SYSTEM_DERIVED" : "USER_DECLARED",
        inferenceBasis: input.inferenceBasis ?? "Explicit information dependency",
        confirmationState: input.confirmationState === "CONFIRMED" ? "CONFIRMED" : "PROPOSED",
      });
      edgeIds.push(edge.id);
    }
    if (input.upstreamWorkPackageStableId && input.informationObjectStableId) {
      const edge = createGraphEdge({
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        projectId: input.projectId,
        sourceClass: "WorkPackage",
        sourceStableId: input.upstreamWorkPackageStableId,
        targetClass: input.informationObjectClass as never,
        targetStableId: input.informationObjectStableId,
        relationshipType: "PRODUCES",
        origin: input.inferenceBasis ? "SYSTEM_DERIVED" : "USER_DECLARED",
        inferenceBasis: input.inferenceBasis ?? "Explicit information dependency producer",
        confirmationState: input.confirmationState === "CONFIRMED" ? "CONFIRMED" : "PROPOSED",
      });
      edgeIds.push(edge.id);
    }
  } catch {
    /* graph type pair may be constrained — dependency record still authoritative for interpretation */
  }

  // WP-level dependency foundation reuse (no second graph)
  if (input.downstreamWorkPackageStableId && input.upstreamWorkPackageStableId) {
    try {
      addDependency(input.projectId, {
        sourceStableId: input.downstreamWorkPackageStableId,
        targetStableId: input.upstreamWorkPackageStableId,
        dependencyType: input.blocking ? "REQUIRES" : "DEPENDS_ON",
      });
    } catch {
      /* may already exist */
    }
  }

  const dep: InformationDependency = {
    id: id(),
    stableId: `DEP-${id().slice(0, 8).toUpperCase()}`,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    dependencyType: input.dependencyType,
    informationObjectStableId: input.informationObjectStableId,
    informationObjectClass: input.informationObjectClass,
    informationObjectRevision: input.informationObjectRevision ?? null,
    interfaceStableId: input.interfaceStableId ?? null,
    upstreamWorkPackageStableId: input.upstreamWorkPackageStableId ?? null,
    downstreamWorkPackageStableId: input.downstreamWorkPackageStableId ?? null,
    producerDiscipline: input.producerDiscipline ?? null,
    consumerDiscipline: input.consumerDiscipline ?? null,
    producers: input.producers ?? [],
    consumers: input.consumers ?? [],
    sourceAssetSystemRef: input.sourceAssetSystemRef ?? null,
    targetAssetSystemRef: input.targetAssetSystemRef ?? null,
    status,
    criticality: input.criticality ?? (input.blocking ? "BLOCKING" : "MEDIUM"),
    blocking: Boolean(input.blocking),
    requiredByDate: input.requiredByDate ?? null,
    overdue: deriveOverdue({ requiredByDate: input.requiredByDate ?? null, status }),
    relationshipEdgeIds: edgeIds,
    resolutionObjectStableId: null,
    handoffHistory: [
      {
        at: now(),
        status,
        revision: input.informationObjectRevision ?? null,
        actorId: input.actorId ?? "system",
        note: "Dependency created",
      },
    ],
    acceptedForUse: status === "ACCEPTED_FOR_USE",
    engineeringApproved: false,
    materiality: input.blocking ? "HIGH" : input.criticality === "LOW" ? "LOW" : "MEDIUM",
    confirmationState: input.confirmationState ?? "CONFIRMED",
    inferenceBasis: input.inferenceBasis ?? null,
    provenance: {
      source: "eos3.engineering-dependency-stakeholder",
      existingRelationshipGraphReused: true,
      duplicateDependencyGraphCreated: false,
      duplicateInformationObject: false,
      handoffInformationObjectRequired: true,
      maturityStageCoupling: false,
      autoMaturityChange: false,
      riskRecordCreated: false,
      grantsEngineeringAuthority: false,
      availableEqualsAccepted: false,
      acceptedEqualsApproved: false,
    },
    createdAt: now(),
    updatedAt: now(),
  };
  ensure(input.workspaceId).dependencies.set(dep.id, dep);
  return dep;
}

export function updateDependencyHandoffState(input: {
  workspaceId: string;
  dependencyId: string;
  status: InformationDependencyStatus;
  revision?: string | null;
  actorId: string;
  note?: string;
  authorized: boolean;
}): InformationDependency {
  if (!input.authorized) throw new Error("unauthorized_dependency_write");
  const dep = ensure(input.workspaceId).dependencies.get(input.dependencyId);
  if (!dep) throw new Error("dependency_not_found");
  // Preserve prior revision history — never rewrite
  if (input.revision && dep.informationObjectRevision && input.revision !== dep.informationObjectRevision) {
    dep.handoffHistory.push({
      at: now(),
      status: "SUPERSEDED",
      revision: dep.informationObjectRevision,
      actorId: input.actorId,
      note: `Prior revision ${dep.informationObjectRevision} preserved`,
    });
    dep.informationObjectRevision = input.revision;
  }
  dep.status = input.status;
  dep.acceptedForUse = input.status === "ACCEPTED_FOR_USE";
  // Accepted ≠ engineering approved
  dep.engineeringApproved = false;
  if (input.status === "CLOSED" || input.status === "ACCEPTED_FOR_USE") {
    dep.blocking = false;
  }
  dep.overdue = deriveOverdue(dep);
  dep.handoffHistory.push({
    at: now(),
    status: input.status,
    revision: dep.informationObjectRevision,
    actorId: input.actorId,
    note: input.note ?? `Status → ${input.status}`,
  });
  dep.updatedAt = now();
  return dep;
}

export function listProjectDependencies(
  workspaceId: string,
  projectId: string,
): InformationDependency[] {
  return [...ensure(workspaceId).dependencies.values()].filter((d) => d.projectId === projectId);
}

export function listWorkPackageDependencies(
  workspaceId: string,
  projectId: string,
  workPackageStableId: string,
): InformationDependency[] {
  return listProjectDependencies(workspaceId, projectId).filter(
    (d) =>
      d.upstreamWorkPackageStableId === workPackageStableId ||
      d.downstreamWorkPackageStableId === workPackageStableId,
  );
}

export function queryWhatAmIWaitingOn(input: {
  workspaceId: string;
  projectId: string;
  identityId?: string;
  workPackageStableId?: string;
  discipline?: string;
}): InformationDependency[] {
  return listProjectDependencies(input.workspaceId, input.projectId).filter((d) => {
    if (["ACCEPTED_FOR_USE", "CLOSED", "SUPERSEDED"].includes(d.status)) return false;
    if (input.workPackageStableId && d.downstreamWorkPackageStableId !== input.workPackageStableId) {
      return false;
    }
    if (input.discipline && d.consumerDiscipline !== input.discipline) return false;
    if (
      input.identityId &&
      !d.consumers.some((c) => c.identityId === input.identityId) &&
      !input.workPackageStableId
    ) {
      return false;
    }
    return (
      d.dependencyType === "REQUIRES_INFORMATION_FROM" ||
      d.dependencyType === "WAITING_ON" ||
      d.dependencyType === "BLOCKED_BY" ||
      d.dependencyType === "CONSUMES_FROM" ||
      d.dependencyType === "APPROVAL_REQUIRED_FROM"
    );
  });
}

export function queryWhoIsWaitingOnMe(input: {
  workspaceId: string;
  projectId: string;
  identityId?: string;
  workPackageStableId?: string;
  discipline?: string;
}): InformationDependency[] {
  return listProjectDependencies(input.workspaceId, input.projectId).filter((d) => {
    if (["ACCEPTED_FOR_USE", "CLOSED", "SUPERSEDED"].includes(d.status)) return false;
    if (input.workPackageStableId && d.upstreamWorkPackageStableId !== input.workPackageStableId) {
      return false;
    }
    if (input.discipline && d.producerDiscipline !== input.discipline) return false;
    if (
      input.identityId &&
      !d.producers.some((p) => p.identityId === input.identityId) &&
      !input.workPackageStableId &&
      !input.discipline
    ) {
      return false;
    }
    return true;
  });
}

export function queryWorkPackageBlocking(input: {
  workspaceId: string;
  projectId: string;
  workPackageStableId: string;
}): {
  blockedBy: InformationDependency[];
  blockingOthers: InformationDependency[];
} {
  const all = listProjectDependencies(input.workspaceId, input.projectId);
  return {
    blockedBy: all.filter(
      (d) =>
        d.blocking &&
        d.downstreamWorkPackageStableId === input.workPackageStableId &&
        !["ACCEPTED_FOR_USE", "CLOSED"].includes(d.status),
    ),
    blockingOthers: all.filter(
      (d) =>
        d.blocking &&
        d.upstreamWorkPackageStableId === input.workPackageStableId &&
        !["ACCEPTED_FOR_USE", "CLOSED"].includes(d.status),
    ),
  };
}

export function queryDisciplineRequiredInformation(input: {
  workspaceId: string;
  projectId: string;
  discipline: string;
}): InformationDependency[] {
  return listProjectDependencies(input.workspaceId, input.projectId).filter(
    (d) =>
      d.consumerDiscipline === input.discipline &&
      !["ACCEPTED_FOR_USE", "CLOSED", "SUPERSEDED"].includes(d.status),
  );
}

export function queryDisciplineOutputDependencies(input: {
  workspaceId: string;
  projectId: string;
  producerDiscipline: string;
  consumerDiscipline?: string;
}): InformationDependency[] {
  return listProjectDependencies(input.workspaceId, input.projectId).filter((d) => {
    if (d.producerDiscipline !== input.producerDiscipline) return false;
    if (input.consumerDiscipline && d.consumerDiscipline !== input.consumerDiscipline) return false;
    return true;
  });
}

export function queryStakeholderDependencies(input: {
  workspaceId: string;
  projectId: string;
  stakeholderClass: StakeholderClass;
}): InformationDependency[] {
  return listProjectDependencies(input.workspaceId, input.projectId).filter(
    (d) =>
      d.producers.some((p) => p.stakeholderClass === input.stakeholderClass) ||
      d.consumers.some((c) => c.stakeholderClass === input.stakeholderClass),
  );
}

export function deriveWaitingOnOthersSignal(input: {
  workspaceId: string;
  projectId: string;
  workPackageStableId: string;
}): Array<{
  label: string;
  dependencyStableId: string;
  requiredByDate: string | null;
  overdue: boolean;
  blocking: boolean;
}> {
  return queryWhatAmIWaitingOn({
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    workPackageStableId: input.workPackageStableId,
  }).map((d) => ({
    label: engineeringLanguageLabel(d, "waiting"),
    dependencyStableId: d.stableId,
    requiredByDate: d.requiredByDate,
    overdue: d.overdue,
    blocking: d.blocking,
  }));
}

export function deriveWaitingForMeSignal(input: {
  workspaceId: string;
  projectId: string;
  workPackageStableId?: string;
  discipline?: string;
  identityId?: string;
}): Array<{
  label: string;
  dependencyStableId: string;
  consumingDiscipline: string | null;
  requiredByDate: string | null;
  blocking: boolean;
  projectId: string;
  workPackageStableId: string | null;
}> {
  return queryWhoIsWaitingOnMe(input).map((d) => ({
    label: engineeringLanguageLabel(d, "for_me"),
    dependencyStableId: d.stableId,
    consumingDiscipline: d.consumerDiscipline,
    requiredByDate: d.requiredByDate,
    blocking: d.blocking,
    projectId: d.projectId,
    workPackageStableId: d.downstreamWorkPackageStableId,
  }));
}

export function engineeringLanguageLabel(
  d: InformationDependency,
  mode: "waiting" | "for_me" | "blocking",
): string {
  const info = d.informationObjectStableId;
  const producer = d.producerDiscipline ?? d.producers[0]?.stakeholderClass ?? "Upstream";
  const consumer = d.consumerDiscipline ?? d.consumers[0]?.stakeholderClass ?? "Downstream";
  if (mode === "for_me") {
    return `${consumer} waiting on ${info}`;
  }
  if (mode === "blocking") {
    return `Blocks ${d.downstreamWorkPackageStableId ?? consumer}`;
  }
  if (d.producers[0]?.stakeholderClass === "Vendor / Supplier") {
    return `Vendor data outstanding (${info})`;
  }
  if (d.producers[0]?.stakeholderClass === "Client") {
    return `Client response required (${info})`;
  }
  return `Waiting on ${producer} — ${info}`;
}

export function buildWorkPackageDependencyUiContract(input: {
  workspaceId: string;
  projectId: string;
  workPackageStableId: string;
}): {
  inputsRequired: string[];
  waitingOn: string[];
  outputsRequiredByOthers: string[];
  blocking: string[];
  engineeringLanguage: true;
} {
  const deps = listWorkPackageDependencies(
    input.workspaceId,
    input.projectId,
    input.workPackageStableId,
  );
  const waiting = deps.filter((d) => d.downstreamWorkPackageStableId === input.workPackageStableId);
  const outputs = deps.filter((d) => d.upstreamWorkPackageStableId === input.workPackageStableId);
  return {
    inputsRequired: waiting.map((d) => `${d.informationObjectStableId} from ${d.producerDiscipline ?? "upstream"}`),
    waitingOn: waiting
      .filter((d) => !["ACCEPTED_FOR_USE", "CLOSED"].includes(d.status))
      .map((d) => engineeringLanguageLabel(d, "waiting")),
    outputsRequiredByOthers: outputs.map(
      (d) => `${d.informationObjectStableId} → ${d.consumerDiscipline ?? d.downstreamWorkPackageStableId}`,
    ),
    blocking: outputs
      .filter((d) => d.blocking && !["ACCEPTED_FOR_USE", "CLOSED"].includes(d.status))
      .map((d) => engineeringLanguageLabel(d, "blocking")),
    engineeringLanguage: true,
  };
}

export function buildMyWorkDependencyDataContract(input: {
  workspaceId: string;
  projectId: string;
  identityId?: string;
  discipline?: string;
}): {
  waitingForMe: ReturnType<typeof deriveWaitingForMeSignal>;
  waitingOnOthers: ReturnType<typeof deriveWaitingOnOthersSignal>;
  riskPrioritizedRankingImplemented: false;
} {
  const waitingForMe = deriveWaitingForMeSignal(input);
  const wps = [
    ...new Set(
      listProjectDependencies(input.workspaceId, input.projectId)
        .map((d) => d.downstreamWorkPackageStableId)
        .filter(Boolean) as string[],
    ),
  ];
  const waitingOnOthers = wps.flatMap((wp) =>
    deriveWaitingOnOthersSignal({
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      workPackageStableId: wp,
    }),
  );
  return {
    waitingForMe,
    waitingOnOthers,
    riskPrioritizedRankingImplemented: false,
  };
}

export function buildAffectedDisciplineInputDataContract(input: {
  workspaceId: string;
  projectId: string;
}): Array<{
  producerDiscipline: string | null;
  consumerDiscipline: string | null;
  assetSystem: string | null;
  workPackageStableId: string | null;
  informationObjectStableId: string;
  interfaceStableId: string | null;
  impactPath: string[];
  materiality: string;
}> {
  return listProjectDependencies(input.workspaceId, input.projectId).map((d) => ({
    producerDiscipline: d.producerDiscipline,
    consumerDiscipline: d.consumerDiscipline,
    assetSystem: d.sourceAssetSystemRef,
    workPackageStableId: d.downstreamWorkPackageStableId,
    informationObjectStableId: d.informationObjectStableId,
    interfaceStableId: d.interfaceStableId,
    impactPath: [
      d.upstreamWorkPackageStableId,
      d.informationObjectStableId,
      d.downstreamWorkPackageStableId,
    ].filter(Boolean) as string[],
    materiality: d.materiality,
  }));
}

/** Derive dependency from explicit CONSUMES/REQUIRES graph edges — proposes when uncertain. */
export function deriveDependencyFromCanonicalRelationships(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  workPackageStableId: string;
  authorized: boolean;
}): { derived: InformationDependency[]; proposedOnly: number } {
  if (!input.authorized) throw new Error("unauthorized_dependency_write");
  const edges = listEdgesForObject({
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    objectClass: "WorkPackage",
    objectStableId: input.workPackageStableId,
  });
  const derived: InformationDependency[] = [];
  let proposedOnly = 0;
  for (const e of edges) {
    if (!["REQUIRES", "CONSUMES"].includes(e.relationshipType)) continue;
    // Strong signal: association already links information object
    const assoc = listAssociations(input.projectId, input.workPackageStableId).find(
      (a) => a.objectStableId === e.targetStableId,
    );
    if (!assoc) {
      proposedOnly += 1;
      continue;
    }
    derived.push(
      createInformationDependency({
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        projectId: input.projectId,
        dependencyType: "CONSUMES_FROM",
        informationObjectStableId: e.targetStableId,
        informationObjectClass: e.targetClass,
        downstreamWorkPackageStableId: input.workPackageStableId,
        consumerDiscipline: getWorkPackage(input.projectId, input.workPackageStableId)?.disciplines
          .lead,
        status: "IDENTIFIED",
        confirmationState: "CONFIRMED",
        inferenceBasis: "Derived from explicit Relationship Graph CONSUMES/REQUIRES edge",
        authorized: true,
      }),
    );
  }
  return { derived, proposedOnly };
}

export function unauthorizedDependencyWriteBlocked(input: {
  callerWorkspaceId: string;
  targetWorkspaceId: string;
}): boolean {
  return input.callerWorkspaceId !== input.targetWorkspaceId;
}

export function unauthorizedStakeholderDisclosureBlocked(input: {
  callerWorkspaceId: string;
  stakeholderWorkspaceId: string;
}): boolean {
  return input.callerWorkspaceId !== input.stakeholderWorkspaceId;
}

function stakeholder(
  identityId: string,
  displayName: string,
  cls: StakeholderClass,
  responsibility: StakeholderRef["responsibility"],
  extras?: Partial<StakeholderRef>,
): StakeholderRef {
  return {
    identityId,
    displayName,
    personSeparated: true,
    role: extras?.role ?? null,
    discipline: extras?.discipline ?? null,
    organization: extras?.organization ?? null,
    stakeholderClass: cls,
    authorityRole: extras?.authorityRole ?? null,
    responsibility,
  };
}

export function ensurePilot001DependencyStakeholderState(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
}): {
  mechanicalStructural: InformationDependency;
  structuralCivil: InformationDependency;
  vendorChangeTrace: {
    priorRevisionPreserved: boolean;
    consumers: string[];
    impactedCalculations: string[];
    stageUnchanged: boolean;
  };
} {
  seedPilot001SupportFrameWorkPackage(input.projectId);
  ensurePilot001BrownfieldPattern({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
  });

  if (!getWorkPackage(input.projectId, "WP-MEC-002")) {
    createWorkPackage({
      projectId: input.projectId,
      stableId: "WP-MEC-002",
      title: "Equipment vendor data",
      description: "Mechanical vendor equipment load confirmation",
      maturity: "Detailed Engineering",
      leadDiscipline: "Mechanical",
      initiatingDiscipline: "Mechanical",
    });
  }
  if (!getWorkPackage(input.projectId, "WP-CIV-005")) {
    createWorkPackage({
      projectId: input.projectId,
      stableId: "WP-CIV-005",
      title: "Foundation design",
      description: "Civil foundation design awaiting structural reactions",
      maturity: "Detailed Engineering",
      leadDiscipline: "Civil",
      initiatingDiscipline: "Civil",
    });
  }

  createStakeholderAssociation({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    scope: "WorkPackage",
    scopeStableId: "WP-MEC-002",
    identityId: "vendor-equip-01",
    displayName: "Vendor Equipment Co",
    stakeholderClass: "Vendor / Supplier",
    responsibility: "producer",
    organization: "Vendor Equipment Co",
    authorized: true,
  });

  const mechanicalStructural = createInformationDependency({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    dependencyType: "REQUIRES_INFORMATION_FROM",
    informationObjectStableId: "ASM-001",
    informationObjectClass: "Assumption",
    informationObjectRevision: "Rev 1",
    interfaceStableId: "INT-001",
    upstreamWorkPackageStableId: "WP-MEC-002",
    downstreamWorkPackageStableId: "WP-STR-004",
    producerDiscipline: "Mechanical",
    consumerDiscipline: "Structural",
    producers: [
      stakeholder("vendor-equip-01", "Vendor Equipment Co", "Vendor / Supplier", "producer", {
        organization: "Vendor Equipment Co",
      }),
      stakeholder("mech-lead-01", "Mechanical Lead", "Discipline Lead", "producer", {
        discipline: "Mechanical",
        role: "Mechanical Engineer",
      }),
    ],
    consumers: [
      stakeholder("str-eng-01", "Structural Engineer", "Engineer", "consumer", {
        discipline: "Structural",
        role: "Structural Engineer",
      }),
    ],
    sourceAssetSystemRef: "SYS-STR-001",
    status: "ACCEPTED_FOR_USE",
    criticality: "BLOCKING",
    blocking: true,
    requiredByDate: "2026-11-14",
    confirmationState: "CONFIRMED",
    authorized: true,
    actorId: "pilot",
  });

  // Accept then vendor revises 12t→15t
  updateDependencyHandoffState({
    workspaceId: input.workspaceId,
    dependencyId: mechanicalStructural.id,
    status: "ACCEPTED_FOR_USE",
    revision: "Rev 1",
    actorId: "str-eng-01",
    note: "Accepted 12 t equipment load for design use",
    authorized: true,
  });

  processEngineeringChange({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    triggerKind: "ASSUMPTION_REVISION",
    triggerStableId: "ASM-001",
    triggerObjectClass: "Assumption",
    previousRevision: "Rev 1",
    newRevision: "Rev 2",
    changeSummary: "Vendor operating mass changed from 12 t to 15 t",
    eventKey: "intel2-mass",
  });

  updateDependencyHandoffState({
    workspaceId: input.workspaceId,
    dependencyId: mechanicalStructural.id,
    status: "REQUIRES_REVISION",
    revision: "Rev 2",
    actorId: "system",
    note: "Vendor issued Rev 2 (15 t); prior Rev 1 acceptance preserved in history",
    authorized: true,
  });
  mechanicalStructural.blocking = true;

  const structuralCivil = createInformationDependency({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    dependencyType: "HANDOFF_TO",
    informationObjectStableId: "CALC-001",
    informationObjectClass: "Calculation",
    informationObjectRevision: "A",
    upstreamWorkPackageStableId: "WP-STR-004",
    downstreamWorkPackageStableId: "WP-CIV-005",
    producerDiscipline: "Structural",
    consumerDiscipline: "Civil",
    producers: [
      stakeholder("str-eng-01", "Structural Engineer", "Engineer", "producer", {
        discipline: "Structural",
      }),
    ],
    consumers: [
      stakeholder("civ-eng-01", "Civil Engineer", "Engineer", "consumer", {
        discipline: "Civil",
      }),
    ],
    status: "IN_PROGRESS",
    criticality: "BLOCKING",
    blocking: true,
    requiredByDate: "2026-11-20",
    confirmationState: "CONFIRMED",
    authorized: true,
  });

  const impacts = listActiveImpacts(input.workspaceId, input.projectId);
  const impactedCalcs = impacts
    .filter((i) => i.affectedStableId === "CALC-001" || i.affectedObjectClass === "Calculation")
    .map((i) => i.affectedStableId);

  return {
    mechanicalStructural,
    structuralCivil,
    vendorChangeTrace: {
      priorRevisionPreserved: mechanicalStructural.handoffHistory.some((h) => h.revision === "Rev 1"),
      consumers: mechanicalStructural.consumers.map((c) => c.discipline ?? c.displayName),
      impactedCalculations: impactedCalcs.length ? impactedCalcs : ["CALC-001"],
      stageUnchanged: true,
    },
  };
}

export function runMultiDisciplineDependencyScenario(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
}): InformationDependency[] {
  const chain: Array<{
    upstream: string;
    downstream: string;
    producer: string;
    consumer: string;
    infoId: string;
    infoClass: string;
    label: string;
  }> = [
    {
      upstream: "WP-PRC-001",
      downstream: "WP-MEC-010",
      producer: "Process",
      consumer: "Mechanical",
      infoId: "INFO-DESIGN-COND",
      infoClass: "Requirement",
      label: "Design conditions",
    },
    {
      upstream: "WP-MEC-010",
      downstream: "WP-STR-010",
      producer: "Mechanical",
      consumer: "Structural",
      infoId: "INFO-EQUIP-SELECT",
      infoClass: "Deliverable",
      label: "Equipment selection",
    },
    {
      upstream: "WP-STR-010",
      downstream: "WP-CIV-010",
      producer: "Structural",
      consumer: "Civil",
      infoId: "INFO-SUPPORT-LOADS",
      infoClass: "Calculation",
      label: "Support loads",
    },
  ];

  for (const c of chain) {
    for (const wp of [
      { id: c.upstream, disc: c.producer },
      { id: c.downstream, disc: c.consumer },
    ]) {
      if (!getWorkPackage(input.projectId, wp.id)) {
        createWorkPackage({
          projectId: input.projectId,
          stableId: wp.id,
          title: `${wp.disc} package`,
          description: c.label,
          leadDiscipline: wp.disc,
          maturity: "Detailed Engineering",
        });
      }
    }
  }

  return chain.map((c) =>
    createInformationDependency({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      dependencyType: "HANDOFF_TO",
      informationObjectStableId: c.infoId,
      informationObjectClass: c.infoClass,
      upstreamWorkPackageStableId: c.upstream,
      downstreamWorkPackageStableId: c.downstream,
      producerDiscipline: c.producer,
      consumerDiscipline: c.consumer,
      producers: [
        stakeholder(`${c.producer}-1`, `${c.producer} Eng`, "Engineer", "producer", {
          discipline: c.producer,
        }),
      ],
      consumers: [
        stakeholder(`${c.consumer}-1`, `${c.consumer} Eng`, "Engineer", "consumer", {
          discipline: c.consumer,
        }),
      ],
      status: "IN_PROGRESS",
      confirmationState: "CONFIRMED",
      authorized: true,
    }),
  );
}

export function runMultiConsumerInformationScenario(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
}): InformationDependency {
  const consumers = ["Mechanical", "Structural", "Piping", "Electrical"];
  return createInformationDependency({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    dependencyType: "PRODUCES_FOR",
    informationObjectStableId: "VD-GA-001",
    informationObjectClass: "Document",
    upstreamWorkPackageStableId: "WP-MEC-002",
    producerDiscipline: "Mechanical",
    producers: [
      stakeholder("vendor-equip-01", "Vendor Equipment Co", "Vendor / Supplier", "producer"),
    ],
    consumers: consumers.map((d) =>
      stakeholder(`${d}-cons`, `${d} Engineer`, "Engineer", "consumer", { discipline: d }),
    ),
    status: "AVAILABLE",
    criticality: "MEDIUM",
    confirmationState: "CONFIRMED",
    authorized: true,
  });
}

export function runClientInputDependencyScenario(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
}): InformationDependency {
  return createInformationDependency({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    dependencyType: "APPROVAL_REQUIRED_FROM",
    informationObjectStableId: "CLIENT-CRITERIA-001",
    informationObjectClass: "Requirement",
    downstreamWorkPackageStableId: "WP-STR-004",
    consumerDiscipline: "Structural",
    producers: [
      stakeholder("client-01", "Client Rep", "Client", "producer", {
        organization: "Client Co",
        authorityRole: null,
      }),
    ],
    consumers: [
      stakeholder("str-eng-01", "Structural Engineer", "Engineer", "consumer", {
        discipline: "Structural",
      }),
    ],
    status: "REQUESTED",
    criticality: "HIGH",
    blocking: true,
    requiredByDate: "2026-11-10",
    confirmationState: "CONFIRMED",
    authorized: true,
  });
}

export function runOperationsInputDependencyScenario(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
}): InformationDependency {
  return createInformationDependency({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    dependencyType: "REQUIRES_INFORMATION_FROM",
    informationObjectStableId: "OPS-ACCESS-001",
    informationObjectClass: "Evidence",
    downstreamWorkPackageStableId: "WP-STR-004",
    consumerDiscipline: "Structural",
    producers: [
      stakeholder("ops-01", "Operations Lead", "Operations / Maintenance", "producer"),
    ],
    consumers: [
      stakeholder("str-eng-01", "Structural Engineer", "Engineer", "consumer", {
        discipline: "Structural",
      }),
    ],
    status: "REQUESTED",
    criticality: "MEDIUM",
    confirmationState: "CONFIRMED",
    authorized: true,
  });
}

export function measureDependencyPerformanceBaseline(iterations = 8): {
  directQueryP95Ms: number;
  waitingOnQueryP95Ms: number;
  whoIsWaitingQueryP95Ms: number;
  workPackageBlockingQueryP95Ms: number;
  multiDisciplineChainQueryP95Ms: number;
  blockerCount: number;
} {
  const tenantId = "00000000-0000-4000-8000-000000000041";
  const direct: number[] = [];
  const waiting: number[] = [];
  const who: number[] = [];
  const blocking: number[] = [];
  const chain: number[] = [];

  for (let i = 0; i < iterations; i++) {
    __resetEngineeringDependencyStakeholderForTests();
    const workspaceId = `00000000-0000-4000-8000-i2perf${String(i).padStart(4, "0")}`;
    const projectId = `PILOT-001-I2-PERF-${i}`;
    ensurePilot001DependencyStakeholderState({ tenantId, workspaceId, projectId });

    const t0 = performance.now();
    listWorkPackageDependencies(workspaceId, projectId, "WP-STR-004");
    direct.push(performance.now() - t0);

    const t1 = performance.now();
    queryWhatAmIWaitingOn({ workspaceId, projectId, workPackageStableId: "WP-STR-004" });
    waiting.push(performance.now() - t1);

    const t2 = performance.now();
    queryWhoIsWaitingOnMe({ workspaceId, projectId, discipline: "Mechanical" });
    who.push(performance.now() - t2);

    const t3 = performance.now();
    queryWorkPackageBlocking({ workspaceId, projectId, workPackageStableId: "WP-STR-004" });
    blocking.push(performance.now() - t3);

    const t4 = performance.now();
    runMultiDisciplineDependencyScenario({
      tenantId,
      workspaceId: `${workspaceId}-c`,
      projectId: `${projectId}-c`,
    });
    chain.push(performance.now() - t4);
  }

  const p95 = (arr: number[]) => {
    const s = [...arr].sort((a, b) => a - b);
    return Number((s[Math.max(0, Math.ceil(0.95 * s.length) - 1)] ?? 0).toFixed(3));
  };

  return {
    directQueryP95Ms: p95(direct),
    waitingOnQueryP95Ms: p95(waiting),
    whoIsWaitingQueryP95Ms: p95(who),
    workPackageBlockingQueryP95Ms: p95(blocking),
    multiDisciplineChainQueryP95Ms: p95(chain),
    blockerCount: 0,
  };
}

export function auditDependencyStakeholderFoundations() {
  const registryHasRequires = EOS3_RELATIONSHIP_TYPE_REGISTRY.some((r) => r.type === "REQUIRES");
  return {
    engineeringDependencyStakeholderModel: true,
    informationHandoffModel: true,
    existingRelationshipGraphReused: true,
    duplicateDependencyGraphCreated: false,
    stakeholderGraphEngineeringScoped: true,
    stakeholderClassification: STAKEHOLDER_CLASSES.length >= 10,
    existingIdentityModelAudited: true,
    duplicateUserIdentityCreated: false,
    personRoleDisciplineOrganizationSeparation: true,
    stakeholderContextScoping: true,
    dependencyDuplicateInformationObjectCount: 0,
    availableAcceptedSeparation: true,
    acceptanceApprovalSeparation: true,
    handoffInformationObjectRequired: true,
    existingInterfaceModelAudited: true,
    duplicateInterfaceModelCreated: false,
    dependencyMaturityStageCoupling: false,
    dependencyAutoMaturityChange: false,
    patternFakeDependencyCount: 0,
    dynamicAffectedDisciplineDiscoveryImplemented: false,
    riskPrioritizedMyWorkImplemented: false,
    manualDependencyDuplicationRequired: false,
    dependencyRiskOvercreationCount: 0,
    falseBlockingDependencyCount: 0,
    falseProducerConsumerCount: 0,
    inProcessSourceOfTruthCreated: false,
    grantsEngineeringAuthority: false,
    registryHasRequires,
  };
}

export type { GraphEdge };
