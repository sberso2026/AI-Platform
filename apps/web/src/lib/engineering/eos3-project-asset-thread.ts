/**
 * EOS 3.8 Project-to-Asset Digital Thread.
 * PROJECT ENGINEERING STATE -> GOVERNED HANDOVER -> ASSET ENGINEERING STATE
 * Not a full EAM/CMMS/ERP/historian.
 */

import { buildEos3Provenance } from "../commerce/eos3-provenance";
import { Eos3GovernedEventBus } from "./eos3-governed-events";

export const EOS3_HISTORIAN_BOUNDARY_PRESERVED = true as const;
export const EOS3_PROJECT_CONTROLS_BOUNDARY_PRESERVED = true as const;
export const EOS3_CONSTRUCTION_BOUNDARY_PRESERVED = true as const;
export const EOS3_DMS_BOUNDARY_PRESERVED = true as const;
export const EOS3_EXTERNAL_ASSET_SYSTEM_BOUNDARY = "METADATA_AND_LINKS_ONLY" as const;

export type AssetLifecycleState =
  | "DESIGNED"
  | "HANDED_OVER"
  | "OPERATIONAL"
  | "UNDER_MODIFICATION"
  | "RETIRED";

export type ConfigStateClass = "DESIGN_INTENT" | "ISSUED_RELEASED" | "AS_BUILT" | "OPERATIONAL_CURRENT";

export type HandoverStatus = "DRAFT" | "ASSEMBLING" | "READY_FOR_REVIEW" | "ACCEPTED" | "SUPERSEDED";

export type HierarchyLevel = "site" | "area" | "system" | "subsystem" | "equipment" | "component";

export type SystemOfRecordRole =
  | "EOS_ENGINEERING_THREAD"
  | "EXTERNAL_EAM_CMMS"
  | "EXTERNAL_DMS"
  | "EXTERNAL_HISTORIAN";

export type Eos3OperationalAsset = {
  assetId: string;
  /** Stable across modification projects — never equals projectId. */
  stableAssetId: string;
  tenantId: string;
  workspaceId: string;
  ownerContext: string;
  originatingProjectId: string;
  systemObjectId: string | null;
  parentAssetId: string | null;
  assetClass: string;
  hierarchyLevel: HierarchyLevel;
  lifecycleState: AssetLifecycleState;
  jurisdictionContext: string | null;
  handoverPackageId: string | null;
  currentConfigurationId: string | null;
  provenance: Record<string, unknown>;
  createdAt: string;
};

export type AssetConfigurationVersion = {
  configurationId: string;
  assetId: string;
  version: number;
  stateClass: ConfigStateClass;
  sourceBaselineObjectId: string | null;
  sourceHandoverPackageId: string | null;
  modificationProjectId: string | null;
  memberRefs: Array<{ kind: string; objectId: string; revisionId: string | null }>;
  immutableOnceAccepted: boolean;
  accepted: boolean;
  acceptedBy: string | null;
  acceptedAt: string | null;
  provenance: Record<string, unknown>;
  createdAt: string;
};

export type ProjectAssetMapping = {
  mappingId: string;
  projectObjectId: string;
  projectObjectType: string;
  assetId: string;
  mappingKind:
    | "SYSTEM_TO_ASSET_SYSTEM"
    | "DISCIPLINE_TO_ASSET"
    | "DELIVERABLE_TO_ASSET_EVIDENCE"
    | "BASELINE_TO_HANDOVER_CONFIG"
    | "DECISION_TO_ASSET_HISTORY"
    | "CALCULATION_TO_ASSET_EVIDENCE"
    | "REQUIREMENT_TO_ASSET"
    | "INTERFACE_TO_ASSET"
    | "ASSUMPTION_TO_ASSET"
    | "ENGINEERING_BASIS_TO_ASSET";
  provenance: Record<string, unknown>;
};

export type HandoverPackage = {
  handoverId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  status: HandoverStatus;
  assetIds: string[];
  approvedRevisionRefs: Array<{ objectId: string; revisionId: string }>;
  baselineObjectId: string | null;
  engineeringBasisId: string | null;
  requirementIds: string[];
  calculationIds: string[];
  decisionIds: string[];
  assumptionIds: string[];
  interfaceIds: string[];
  deliverableIds: string[];
  commissioningEvidenceIds: string[];
  outstandingItemIds: string[];
  inspectionBaselineIds: string[];
  externalDmsRefs: string[];
  asBuiltDiffs: Array<{ objectId: string; designRevisionId: string; asBuiltRevisionId: string }>;
  immutable: boolean;
  acceptedBy: string | null;
  acceptedAt: string | null;
  provenance: Record<string, unknown>;
  audit: Array<{ action: string; actorId: string | null; at: string; detail: Record<string, unknown> }>;
};

export type HandoverReadiness = {
  ready: boolean;
  missing: string[];
  isAcceptance: false;
};

export type CommissioningEvidence = {
  evidenceId: string;
  kind: "inspection" | "test" | "completion_record" | "punch_item" | "certification_reference" | "commissioning_result";
  assetId: string | null;
  projectId: string;
  reference: string;
  externalDmsRef: string | null;
  provenance: Record<string, unknown>;
};

export type TechnicalOutstandingItem = {
  itemId: string;
  kind: "technical_query" | "punch_item" | "deferred_defect" | "incomplete_evidence" | "outstanding_verification";
  projectId: string;
  assetId: string | null;
  description: string;
  status: "OPEN" | "ACCEPTED_RESIDUAL" | "CLOSED";
  acceptedInHandover: boolean;
  provenance: Record<string, unknown>;
};

export type AssetInspectionRecord = {
  inspectionId: string;
  assetId: string;
  componentObjectId: string | null;
  inspectionType: string;
  inspectedAt: string;
  actorId: string;
  method: string;
  findingSummary: string;
  evidenceRefs: string[];
  severity: "low" | "medium" | "high" | "critical";
  disposition: "OPEN" | "MONITOR" | "REPAIR_REQUIRED" | "CLOSED";
  status: "RECORDED" | "UNDER_REVIEW" | "DISPOSITIONED";
  relatedChangeId: string | null;
  relatedDecisionId: string | null;
  configurationId: string | null;
  provenance: Record<string, unknown>;
};

export type AssetFinding = {
  findingId: string;
  inspectionId: string;
  assetId: string;
  observation: string;
  evidenceRefs: string[];
  source: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "OPEN" | "DISPOSITIONED" | "CLOSED";
  uncertainty: string | null;
  recommendedAction: string | null;
  humanDisposition: string | null;
  dispositionActorId: string | null;
  changeCandidateId: string | null;
  provenance: Record<string, unknown>;
};

export type ModificationProjectLink = {
  linkId: string;
  assetId: string;
  modificationProjectId: string;
  priorConfigurationId: string;
  revisedConfigurationId: string | null;
  status: "OPEN" | "HANDED_OVER" | "SUPERSEDED";
  provenance: Record<string, unknown>;
};

function id(): string {
  return crypto.randomUUID();
}
function now(): string {
  return new Date().toISOString();
}

export function classifySystemOfRecord(kind: SystemOfRecordRole): SystemOfRecordRole {
  return kind;
}

export class Eos3ProjectAssetStore {
  assets: Eos3OperationalAsset[] = [];
  configurations: AssetConfigurationVersion[] = [];
  mappings: ProjectAssetMapping[] = [];
  handovers: HandoverPackage[] = [];
  commissioning: CommissioningEvidence[] = [];
  outstanding: TechnicalOutstandingItem[] = [];
  inspections: AssetInspectionRecord[] = [];
  findings: AssetFinding[] = [];
  modifications: ModificationProjectLink[] = [];
  bus = new Eos3GovernedEventBus();
  observability = {
    handoverTransitions: 0,
    configurationChanges: 0,
    inspections: 0,
    findings: 0,
    modificationLinks: 0,
    authDenials: 0,
  };
  audit: Array<{ action: string; actorId: string | null; at: string; detail: Record<string, unknown> }> = [];

  authorize(caller: {
    authenticated: boolean;
    tenantId: string | null;
    workspaceId: string | null;
    eos3Entitled: boolean;
    eos3Enrolled: boolean;
    productionEnvironment?: boolean;
    role: string;
  }, target: { tenantId: string; workspaceId: string }): { allowed: boolean; reason?: string } {
    if (!caller.authenticated) return { allowed: false, reason: "unauthenticated" };
    if (caller.productionEnvironment) return { allowed: false, reason: "production_denied" };
    if (!caller.eos3Entitled || !caller.eos3Enrolled) return { allowed: false, reason: "not_entitled" };
    if (caller.tenantId !== target.tenantId || caller.workspaceId !== target.workspaceId) {
      this.observability.authDenials += 1;
      return { allowed: false, reason: "workspace_mismatch" };
    }
    return { allowed: true };
  }

  createAsset(input: {
    tenantId: string;
    workspaceId: string;
    ownerContext: string;
    originatingProjectId: string;
    systemObjectId?: string | null;
    parentAssetId?: string | null;
    assetClass: string;
    hierarchyLevel: HierarchyLevel;
    jurisdictionContext?: string | null;
    actorId: string;
  }): Eos3OperationalAsset {
    const assetId = id();
    const stableAssetId = `AST-${assetId.slice(0, 8).toUpperCase()}`;
    if (stableAssetId === input.originatingProjectId) {
      throw new Error("asset_identity_must_not_equal_project_id");
    }
    const asset: Eos3OperationalAsset = {
      assetId,
      stableAssetId,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      ownerContext: input.ownerContext,
      originatingProjectId: input.originatingProjectId,
      systemObjectId: input.systemObjectId ?? null,
      parentAssetId: input.parentAssetId ?? null,
      assetClass: input.assetClass,
      hierarchyLevel: input.hierarchyLevel,
      lifecycleState: "DESIGNED",
      jurisdictionContext: input.jurisdictionContext ?? null,
      handoverPackageId: null,
      currentConfigurationId: null,
      provenance: buildEos3Provenance({
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        projectId: input.originatingProjectId,
        objectId: assetId,
        revisionId: null,
        source: "eos3.project.asset",
        actorId: input.actorId,
        authority: "engineer",
        method: "createAsset",
        toolOrModel: null,
        evidenceClassification: "FACT",
        qualificationState: null,
      }),
      createdAt: now(),
    };
    this.assets.push(asset);
    this.bus.publish({
      eventType: "ASSET_CREATED",
      category: "STATE_CHANGE",
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.originatingProjectId,
      objectId: assetId,
      actorId: input.actorId,
      source: "eos3.project.asset",
      idempotencyKey: `asset-created:${assetId}`,
      sequenceHint: this.assets.length,
    });
    this.audit.push({ action: "asset_created", actorId: input.actorId, at: now(), detail: { assetId, stableAssetId } });
    return asset;
  }

  mapProjectObject(input: {
    projectObjectId: string;
    projectObjectType: string;
    assetId: string;
    mappingKind: ProjectAssetMapping["mappingKind"];
    tenantId: string;
    workspaceId: string;
    projectId: string;
  }): ProjectAssetMapping {
    const m: ProjectAssetMapping = {
      mappingId: id(),
      projectObjectId: input.projectObjectId,
      projectObjectType: input.projectObjectType,
      assetId: input.assetId,
      mappingKind: input.mappingKind,
      provenance: buildEos3Provenance({
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        projectId: input.projectId,
        objectId: input.assetId,
        revisionId: null,
        source: "eos3.project.asset.mapping",
        actorId: null,
        authority: null,
        method: "mapProjectObject",
        toolOrModel: null,
        evidenceClassification: "FACT",
        qualificationState: null,
      }),
    };
    this.mappings.push(m);
    return m;
  }

  createHandoverPackage(input: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
    actorId: string;
  }): HandoverPackage {
    const pkg: HandoverPackage = {
      handoverId: id(),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      status: "DRAFT",
      assetIds: [],
      approvedRevisionRefs: [],
      baselineObjectId: null,
      engineeringBasisId: null,
      requirementIds: [],
      calculationIds: [],
      decisionIds: [],
      assumptionIds: [],
      interfaceIds: [],
      deliverableIds: [],
      commissioningEvidenceIds: [],
      outstandingItemIds: [],
      inspectionBaselineIds: [],
      externalDmsRefs: [],
      asBuiltDiffs: [],
      immutable: false,
      acceptedBy: null,
      acceptedAt: null,
      provenance: buildEos3Provenance({
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        projectId: input.projectId,
        objectId: null,
        revisionId: null,
        source: "eos3.handover",
        actorId: input.actorId,
        authority: "engineer",
        method: "createHandoverPackage",
        toolOrModel: null,
        evidenceClassification: "FACT",
        qualificationState: null,
      }),
      audit: [{ action: "created", actorId: input.actorId, at: now(), detail: {} }],
    };
    this.handovers.push(pkg);
    this.bus.publish({
      eventType: "HANDOVER_PACKAGE_CREATED",
      category: "BASELINE_CHANGE",
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      objectId: pkg.handoverId,
      actorId: input.actorId,
      source: "eos3.handover",
      idempotencyKey: `handover-created:${pkg.handoverId}`,
      sequenceHint: 100 + this.handovers.length,
    });
    this.observability.handoverTransitions += 1;
    return pkg;
  }

  evaluateHandoverReadiness(pkg: HandoverPackage): HandoverReadiness {
    const missing: string[] = [];
    if (pkg.assetIds.length === 0) missing.push("asset_identities");
    if (pkg.deliverableIds.length === 0) missing.push("deliverables");
    if (!pkg.baselineObjectId) missing.push("frozen_baseline");
    if (pkg.commissioningEvidenceIds.length === 0) missing.push("commissioning_evidence");
    if (pkg.approvedRevisionRefs.length === 0) missing.push("approved_revisions");
    // Residual outstanding items are allowed if explicitly listed — not a readiness failure by themselves
    return { ready: missing.length === 0, missing, isAcceptance: false };
  }

  transitionHandover(
    pkg: HandoverPackage,
    to: HandoverStatus,
    actor: { actorId: string; role: string; isAi?: boolean },
  ): HandoverPackage {
    const allowed: Record<HandoverStatus, HandoverStatus[]> = {
      DRAFT: ["ASSEMBLING"],
      ASSEMBLING: ["READY_FOR_REVIEW", "DRAFT"],
      READY_FOR_REVIEW: ["ACCEPTED", "ASSEMBLING"],
      ACCEPTED: ["SUPERSEDED"],
      SUPERSEDED: [],
    };
    if (!allowed[pkg.status].includes(to)) throw new Error("invalid_handover_transition");
    if (to === "ACCEPTED") {
      if (actor.isAi || actor.role === "ai") throw new Error("ai_cannot_accept_handover");
      if (!["handover_authority", "owner", "approver"].includes(actor.role)) {
        throw new Error("insufficient_handover_acceptance_authority");
      }
      const readiness = this.evaluateHandoverReadiness(pkg);
      if (!readiness.ready) throw new Error(`handover_not_ready:${readiness.missing.join(",")}`);
      pkg.immutable = true;
      pkg.acceptedBy = actor.actorId;
      pkg.acceptedAt = now();
      this.bus.publish({
        eventType: "HANDOVER_ACCEPTED",
        category: "BASELINE_CHANGE",
        tenantId: pkg.tenantId,
        workspaceId: pkg.workspaceId,
        projectId: pkg.projectId,
        objectId: pkg.handoverId,
        actorId: actor.actorId,
        authority: actor.role,
        source: "eos3.handover",
        idempotencyKey: `handover-accepted:${pkg.handoverId}`,
        sequenceHint: 200,
      });
    }
    pkg.status = to;
    pkg.audit.push({ action: "transition", actorId: actor.actorId, at: now(), detail: { to } });
    this.observability.handoverTransitions += 1;
    return pkg;
  }

  /** Transfer frozen project baseline into asset configuration — does not rewrite baseline. */
  createConfigurationFromHandover(input: {
    asset: Eos3OperationalAsset;
    handover: HandoverPackage;
    baselineObjectId: string;
    actorId: string;
    stateClass?: ConfigStateClass;
    members?: AssetConfigurationVersion["memberRefs"];
  }): AssetConfigurationVersion {
    if (input.handover.status !== "ACCEPTED") throw new Error("handover_must_be_accepted");
    if (input.handover.immutable !== true) throw new Error("handover_must_be_immutable");
    const prior = this.configurations.filter((c) => c.assetId === input.asset.assetId);
    const version = prior.length + 1;
    const cfg: AssetConfigurationVersion = {
      configurationId: id(),
      assetId: input.asset.assetId,
      version,
      stateClass: input.stateClass ?? "AS_BUILT",
      sourceBaselineObjectId: input.baselineObjectId,
      sourceHandoverPackageId: input.handover.handoverId,
      modificationProjectId: null,
      memberRefs: input.members ?? input.handover.approvedRevisionRefs.map((r) => ({
        kind: "revision",
        objectId: r.objectId,
        revisionId: r.revisionId,
      })),
      immutableOnceAccepted: true,
      accepted: true,
      acceptedBy: input.actorId,
      acceptedAt: now(),
      provenance: buildEos3Provenance({
        tenantId: input.asset.tenantId,
        workspaceId: input.asset.workspaceId,
        projectId: input.asset.originatingProjectId,
        objectId: input.asset.assetId,
        revisionId: null,
        source: "eos3.asset.configuration",
        actorId: input.actorId,
        authority: "handover_authority",
        method: "createConfigurationFromHandover",
        toolOrModel: null,
        evidenceClassification: "FACT",
        qualificationState: null,
      }),
      createdAt: now(),
    };
    this.configurations.push(cfg);
    input.asset.currentConfigurationId = cfg.configurationId;
    // Preserve originating handover identity across later modification handovers.
    if (!input.asset.handoverPackageId) {
      input.asset.handoverPackageId = input.handover.handoverId;
    }
    input.asset.lifecycleState = "OPERATIONAL";
    this.observability.configurationChanges += 1;
    this.bus.publish({
      eventType: "ASSET_CONFIGURATION_CHANGED",
      category: "BASELINE_CHANGE",
      tenantId: input.asset.tenantId,
      workspaceId: input.asset.workspaceId,
      projectId: input.asset.originatingProjectId,
      objectId: input.asset.assetId,
      actorId: input.actorId,
      source: "eos3.asset.configuration",
      idempotencyKey: `asset-cfg:${cfg.configurationId}`,
      sequenceHint: 300 + version,
    });
    return cfg;
  }

  updateConfigurationUnauthorized(): never {
    throw new Error("unauthorized_asset_configuration_change");
  }

  recordInspection(input: {
    asset: Eos3OperationalAsset;
    componentObjectId?: string | null;
    inspectionType: string;
    actorId: string;
    method: string;
    findingSummary: string;
    severity: AssetInspectionRecord["severity"];
    evidenceRefs?: string[];
  }): AssetInspectionRecord {
    const rec: AssetInspectionRecord = {
      inspectionId: id(),
      assetId: input.asset.assetId,
      componentObjectId: input.componentObjectId ?? null,
      inspectionType: input.inspectionType,
      inspectedAt: now(),
      actorId: input.actorId,
      method: input.method,
      findingSummary: input.findingSummary,
      evidenceRefs: input.evidenceRefs ?? [],
      severity: input.severity,
      disposition: "OPEN",
      status: "RECORDED",
      relatedChangeId: null,
      relatedDecisionId: null,
      configurationId: input.asset.currentConfigurationId,
      provenance: buildEos3Provenance({
        tenantId: input.asset.tenantId,
        workspaceId: input.asset.workspaceId,
        projectId: input.asset.originatingProjectId,
        objectId: input.asset.assetId,
        revisionId: null,
        source: "eos3.inspection",
        actorId: input.actorId,
        authority: "inspector",
        method: "recordInspection",
        toolOrModel: null,
        evidenceClassification: "FACT",
        qualificationState: null,
      }),
    };
    this.inspections.push(rec);
    this.observability.inspections += 1;
    this.bus.publish({
      eventType: "INSPECTION_RECORDED",
      category: "STATE_CHANGE",
      tenantId: input.asset.tenantId,
      workspaceId: input.asset.workspaceId,
      projectId: input.asset.originatingProjectId,
      objectId: rec.inspectionId,
      actorId: input.actorId,
      source: "eos3.inspection",
      idempotencyKey: `insp:${rec.inspectionId}`,
      sequenceHint: 400 + this.inspections.length,
    });
    return rec;
  }

  raiseFinding(input: {
    inspection: AssetInspectionRecord;
    asset: Eos3OperationalAsset;
    observation: string;
    severity: AssetFinding["severity"];
    recommendedAction?: string | null;
    actorId: string;
  }): AssetFinding {
    const finding: AssetFinding = {
      findingId: id(),
      inspectionId: input.inspection.inspectionId,
      assetId: input.asset.assetId,
      observation: input.observation,
      evidenceRefs: input.inspection.evidenceRefs,
      source: "inspection",
      severity: input.severity,
      status: "OPEN",
      uncertainty: null,
      recommendedAction: input.recommendedAction ?? null,
      humanDisposition: null,
      dispositionActorId: null,
      changeCandidateId: null,
      provenance: buildEos3Provenance({
        tenantId: input.asset.tenantId,
        workspaceId: input.asset.workspaceId,
        projectId: input.asset.originatingProjectId,
        objectId: input.asset.assetId,
        revisionId: null,
        source: "eos3.finding",
        actorId: input.actorId,
        authority: "inspector",
        method: "raiseFinding",
        toolOrModel: null,
        evidenceClassification: "FACT",
        qualificationState: null,
      }),
    };
    this.findings.push(finding);
    this.observability.findings += 1;
    this.bus.publish({
      eventType: "FINDING_RAISED",
      category: "STATE_CHANGE",
      tenantId: input.asset.tenantId,
      workspaceId: input.asset.workspaceId,
      projectId: input.asset.originatingProjectId,
      objectId: finding.findingId,
      actorId: input.actorId,
      source: "eos3.finding",
      idempotencyKey: `finding:${finding.findingId}`,
      sequenceHint: 500 + this.findings.length,
    });
    return finding;
  }

  disposeFinding(
    finding: AssetFinding,
    actor: { actorId: string; role: string; isAi?: boolean },
    disposition: string,
  ): AssetFinding {
    if (actor.isAi || actor.role === "ai") throw new Error("ai_cannot_dispose_finding");
    if (!["inspector", "engineer", "integrity_authority", "approver"].includes(actor.role)) {
      throw new Error("insufficient_inspection_disposition_authority");
    }
    finding.status = "DISPOSITIONED";
    finding.humanDisposition = disposition;
    finding.dispositionActorId = actor.actorId;
    finding.changeCandidateId = finding.changeCandidateId ?? `chg-cand:${finding.findingId}`;
    return finding;
  }

  linkModificationProject(input: {
    asset: Eos3OperationalAsset;
    modificationProjectId: string;
    actorId: string;
  }): ModificationProjectLink {
    if (!input.asset.currentConfigurationId) throw new Error("asset_has_no_configuration");
    const link: ModificationProjectLink = {
      linkId: id(),
      assetId: input.asset.assetId,
      modificationProjectId: input.modificationProjectId,
      priorConfigurationId: input.asset.currentConfigurationId,
      revisedConfigurationId: null,
      status: "OPEN",
      provenance: buildEos3Provenance({
        tenantId: input.asset.tenantId,
        workspaceId: input.asset.workspaceId,
        projectId: input.modificationProjectId,
        objectId: input.asset.assetId,
        revisionId: null,
        source: "eos3.asset.modification",
        actorId: input.actorId,
        authority: "engineer",
        method: "linkModificationProject",
        toolOrModel: null,
        evidenceClassification: "FACT",
        qualificationState: null,
      }),
    };
    this.modifications.push(link);
    input.asset.lifecycleState = "UNDER_MODIFICATION";
    this.observability.modificationLinks += 1;
    this.bus.publish({
      eventType: "MODIFICATION_PROJECT_LINKED",
      category: "STATE_CHANGE",
      tenantId: input.asset.tenantId,
      workspaceId: input.asset.workspaceId,
      projectId: input.modificationProjectId,
      objectId: input.asset.assetId,
      actorId: input.actorId,
      source: "eos3.asset.modification",
      idempotencyKey: `mod-link:${link.linkId}`,
      sequenceHint: 600 + this.modifications.length,
    });
    return link;
  }

  completeModificationHandover(input: {
    asset: Eos3OperationalAsset;
    link: ModificationProjectLink;
    handover: HandoverPackage;
    baselineObjectId: string;
    actorId: string;
    members: AssetConfigurationVersion["memberRefs"];
  }): AssetConfigurationVersion {
    const priorId = input.asset.currentConfigurationId;
    const prior = this.configurations.find((c) => c.configurationId === priorId);
    if (!prior) throw new Error("prior_configuration_missing");
    const cfg = this.createConfigurationFromHandover({
      asset: input.asset,
      handover: input.handover,
      baselineObjectId: input.baselineObjectId,
      actorId: input.actorId,
      stateClass: "OPERATIONAL_CURRENT",
      members: input.members,
    });
    cfg.modificationProjectId = input.link.modificationProjectId;
    input.link.revisedConfigurationId = cfg.configurationId;
    input.link.status = "HANDED_OVER";
    // Prior configuration remains — history not overwritten
    if (prior.accepted !== true) throw new Error("prior_must_remain");
    return cfg;
  }

  queryThread(assetId: string): {
    asset: Eos3OperationalAsset | null;
    originatingProjectId: string | null;
    handoverId: string | null;
    currentConfigurationId: string | null;
    configurationHistory: AssetConfigurationVersion[];
    inspections: AssetInspectionRecord[];
    findings: AssetFinding[];
    modifications: ModificationProjectLink[];
    mappings: ProjectAssetMapping[];
  } {
    const asset = this.assets.find((a) => a.assetId === assetId) ?? null;
    return {
      asset,
      originatingProjectId: asset?.originatingProjectId ?? null,
      handoverId: asset?.handoverPackageId ?? null,
      currentConfigurationId: asset?.currentConfigurationId ?? null,
      configurationHistory: this.configurations.filter((c) => c.assetId === assetId),
      inspections: this.inspections.filter((i) => i.assetId === assetId),
      findings: this.findings.filter((f) => f.assetId === assetId),
      modifications: this.modifications.filter((m) => m.assetId === assetId),
      mappings: this.mappings.filter((m) => m.assetId === assetId),
    };
  }
}

export function aiMayAcceptHandover(): false {
  return false;
}
export function aiMayCertifyAssetCondition(): false {
  return false;
}
export function aiMayApproveRepair(): false {
  return false;
}
export function aiMayCloseSafetyCriticalFinding(): false {
  return false;
}
export function optimizationMaySelectFinalRepair(): false {
  return false;
}
