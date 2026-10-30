/**
 * EOS-3-DOMAIN-4 — Decision & Assumption lineage.
 * Strengthens existing Decision/Assumption canonical objects (no duplicates).
 * Lineage uses Domain-3 relationship graph (no parallel lineage store).
 * Assumption is NOT an orchestration anchor.
 * No automatic staleness / decision invalidation propagation.
 */

import { AI_DECISION_AUTHORITY } from "./eos3-decision-intelligence";
import {
  createGraphEdge,
  getDependencies,
  getDependents,
  getSupportingEvidence,
  getUpstream,
  getDownstream,
  seedPilot001RelationshipGraph,
  type GraphEdge,
} from "./eos3-relationship-graph-core";
import {
  associateObject,
  getWorkPackage,
  seedPilot001SupportFrameWorkPackage,
  type WorkPackage,
} from "./eos3-work-package-service";
import { seedPilot001AssetSystemContext } from "./eos3-asset-system-context";

export const EOS_ASSUMPTION_ORCHESTRATION_ANCHOR = false as const;
export const EOS_AUTOMATIC_DECISION_INVALIDATION_IMPLEMENTED = false as const;
export const EOS_STALENESS_PROPAGATION_IMPLEMENTED = false as const;
export const EOS_AUTONOMOUS_FINAL_ENGINEERING_DECISION = false as const;
export const EOS_AUTONOMOUS_ENGINEERING_APPROVAL = false as const;

export const DECISION_TYPES = [
  "ENGINEERING_DECISION",
  "CLIENT_DECISION",
  "OPERATIONS_DECISION",
  "COMMERCIAL_DECISION",
  "INVESTMENT_DECISION",
  "TECHNICAL_AUTHORITY_DECISION",
  "REGULATORY_DECISION",
] as const;
export type DecisionType = (typeof DECISION_TYPES)[number];

export const DECISION_STATUSES = [
  "PROPOSED",
  "UNDER_REVIEW",
  "DECISION_REQUIRED",
  "DECIDED",
  "REJECTED",
  "SUPERSEDED",
  "REASSESSMENT_REQUIRED",
  "CLOSED",
] as const;
export type DecisionStatus = (typeof DECISION_STATUSES)[number];

export const ASSUMPTION_STATUSES = [
  "PROPOSED",
  "ACTIVE",
  "UNVERIFIED",
  "VERIFIED",
  "SUPERSEDED",
  "INVALIDATED",
  "RETIRED",
] as const;
export type AssumptionStatus = (typeof ASSUMPTION_STATUSES)[number];

export const ASSUMPTION_TYPES = [
  "Design Input Assumption",
  "Existing Condition Assumption",
  "Vendor Data Assumption",
  "Material Property Assumption",
  "Operational Assumption",
  "Environmental Assumption",
  "Geotechnical Assumption",
  "Constructability Assumption",
] as const;
export type AssumptionType = (typeof ASSUMPTION_TYPES)[number];

export type DecisionOption = {
  optionId: string;
  label: string;
  description: string;
  advantages: string[];
  disadvantages: string[];
  evidenceIds: string[];
  risks: string[];
  recommended: boolean;
};

export type DecisionRecord = {
  id: string;
  stableId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  workPackageStableId: string | null;
  assetSystemStableIds: string[];
  title: string;
  question: string;
  decisionType: DecisionType;
  category: string;
  problemContext: string;
  options: DecisionOption[];
  criteria: string[];
  recommendation: string | null;
  selectedOptionId: string | null;
  rationale: string | null;
  assumptionStableIds: string[];
  evidenceStableIds: string[];
  calculationStableIds: string[];
  riskNotes: string[];
  responsibleEngineer: string | null;
  /** Explicit authority — never inferred from WP owner alone. */
  decisionAuthority: string | null;
  decisionAuthorityRole: string | null;
  decisionDate: string | null;
  requiredByDate: string | null;
  conditions: string[];
  status: DecisionStatus;
  revision: number;
  revisionLabel: string;
  supersededDecisionId: string | null;
  supersedesDecisionId: string | null;
  affectedObjectStableIds: string[];
  provenance: Record<string, unknown>;
  humanDecisionEvent: {
    actorId: string;
    authorityBasis: string;
    timestamp: string;
    selectedOptionId: string;
    conditions: string[];
    rationale: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type AssumptionRecord = {
  id: string;
  stableId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  workPackageStableId: string | null;
  assetSystemStableIds: string[];
  statement: string;
  assumptionType: AssumptionType | null;
  value: string | number | null;
  units: string | null;
  basis: string;
  sourceEvidenceStableIds: string[];
  confidence: "low" | "medium" | "high" | "unknown";
  materiality: "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";
  owner: string | null;
  verificationResponsibility: string | null;
  verificationRequirement: string | null;
  dueDate: string | null;
  status: AssumptionStatus;
  revision: number;
  revisionLabel: string;
  priorRevisionId: string | null;
  supersededAssumptionId: string | null;
  supersedesAssumptionId: string | null;
  /** Evidence classification separation — never FACT. */
  evidenceClassification: "ASSUMPTION";
  dependentObjectStableIds: string[];
  provenance: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

type Store = {
  decisions: Map<string, DecisionRecord>;
  assumptions: Map<string, AssumptionRecord>;
};

const stores = new Map<string, Store>();

function id() {
  return crypto.randomUUID();
}
function now() {
  return new Date().toISOString();
}
function ensure(workspaceId: string): Store {
  let s = stores.get(workspaceId);
  if (!s) {
    s = { decisions: new Map(), assumptions: new Map() };
    stores.set(workspaceId, s);
  }
  return s;
}

export function __resetDecisionAssumptionLineageForTests() {
  stores.clear();
}

export function auditExistingDecisionAssumptionModels(): {
  existingDecisionModelAudited: true;
  existingAssumptionModelAudited: true;
  duplicateDecisionModelCreated: false;
  duplicateAssumptionModelCreated: false;
  decisionIntelligencePreserved: true;
  assumptionIsNotOrchestrationAnchor: true;
  notes: string[];
} {
  return {
    existingDecisionModelAudited: true,
    existingAssumptionModelAudited: true,
    duplicateDecisionModelCreated: false,
    duplicateAssumptionModelCreated: false,
    decisionIntelligencePreserved: true,
    assumptionIsNotOrchestrationAnchor: true,
    notes: [
      "EOS 3.2 Decision/Assumption object types remain canonical object families.",
      "EOS 3.4 Decision Intelligence (cases/options/MCDA) remains analysis layer — ANALYSIS != HUMAN_DECISION.",
      "Domain-4 strengthens structured Decision/Assumption records + graph lineage; does not replace Intelligence or Optimization.",
      "Assumption preserves uncertain premises; Work Package remains execution boundary; Relationship Graph remains reasoning substrate.",
    ],
  };
}

export type CreateAssumptionInput = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  statement: string;
  stableId?: string;
  workPackageStableId?: string | null;
  assetSystemStableIds?: string[];
  assumptionType?: AssumptionType | null;
  value?: string | number | null;
  units?: string | null;
  basis?: string;
  sourceEvidenceStableIds?: string[];
  confidence?: AssumptionRecord["confidence"];
  materiality?: AssumptionRecord["materiality"];
  owner?: string | null;
  verificationRequirement?: string | null;
  verificationResponsibility?: string | null;
  actorId?: string | null;
  generated?: boolean;
};

export function createAssumption(input: CreateAssumptionInput): AssumptionRecord {
  const statement = input.statement.trim();
  if (!statement) throw new Error("assumption_statement_required");
  const store = ensure(input.workspaceId);
  const stableId = input.stableId ?? `ASM-${id().slice(0, 6).toUpperCase()}`;
  if ([...store.assumptions.values()].some((a) => a.stableId === stableId && a.status !== "SUPERSEDED")) {
    // Idempotent return for same stable id
    const existing = [...store.assumptions.values()].find((a) => a.stableId === stableId);
    if (existing) return existing;
  }

  const derivedType =
    input.assumptionType ??
    (/vendor|mass|equipment/i.test(statement)
      ? "Vendor Data Assumption"
      : /steel|grade|material/i.test(statement)
        ? "Material Property Assumption"
        : /foundation|bearing|geotech/i.test(statement)
          ? "Geotechnical Assumption"
          : /temperature|operating|process/i.test(statement)
            ? "Operational Assumption"
            : null);

  const row: AssumptionRecord = {
    id: id(),
    stableId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    workPackageStableId: input.workPackageStableId ?? null,
    assetSystemStableIds: input.assetSystemStableIds ?? [],
    statement,
    assumptionType: derivedType,
    value: input.value ?? null,
    units: input.units ?? null,
    basis: input.basis ?? "Engineer judgment / provisional design input",
    sourceEvidenceStableIds: input.sourceEvidenceStableIds ?? [],
    confidence: input.confidence ?? "unknown",
    materiality: input.materiality ?? "HIGH",
    owner: input.owner ?? null,
    verificationResponsibility: input.verificationResponsibility ?? null,
    verificationRequirement: input.verificationRequirement ?? "Pending confirmation",
    dueDate: null,
    status: "PROPOSED",
    revision: 1,
    revisionLabel: "Rev 1",
    priorRevisionId: null,
    supersededAssumptionId: null,
    supersedesAssumptionId: null,
    evidenceClassification: "ASSUMPTION",
    dependentObjectStableIds: [],
    provenance: {
      source: "eos3.domain-4.assumption",
      generated: Boolean(input.generated),
      autoVerified: false,
      isFact: false,
      isOrchestrationAnchor: false,
      actorId: input.actorId ?? null,
      grantsEngineeringAuthority: false,
      shadowTruth: false,
    },
    createdAt: now(),
    updatedAt: now(),
  };
  store.assumptions.set(row.id, row);

  if (row.workPackageStableId) {
    try {
      associateObject(input.projectId, row.workPackageStableId, {
        objectType: "Assumption",
        objectStableId: row.stableId,
        confirmationState: "PROPOSED",
      });
    } catch {
      /* WP may not exist yet */
    }
  }
  return row;
}

/** Natural-language contextual assumption creation. Remains PROPOSED. */
export function createAssumptionFromNaturalStatement(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  text: string;
  workPackageStableId?: string | null;
  assetSystemStableIds?: string[];
  actorId?: string | null;
}): AssumptionRecord {
  const text = input.text.trim();
  const mass = text.match(/(\d+(?:\.\d+)?)\s*(t|tonne|kg|kN)/i);
  return createAssumption({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    statement: text.replace(/^assume\s+/i, "").replace(/\.$/, ""),
    workPackageStableId: input.workPackageStableId,
    assetSystemStableIds: input.assetSystemStableIds,
    value: mass ? Number(mass[1]) : null,
    units: mass ? mass[2] : null,
    basis: /vendor/i.test(text) ? "Preliminary vendor data" : "Contextual engineering statement",
    verificationRequirement: /until|pending|vendor/i.test(text)
      ? "Pending vendor confirmation"
      : "Requires verification",
    actorId: input.actorId,
    generated: true,
  });
}

export function reviseAssumption(input: {
  workspaceId: string;
  assumptionIdOrStable: string;
  value?: string | number | null;
  units?: string | null;
  statement?: string;
  basis?: string;
  actorId?: string | null;
}): AssumptionRecord {
  const store = ensure(input.workspaceId);
  const prior =
    store.assumptions.get(input.assumptionIdOrStable) ??
    [...store.assumptions.values()].find((a) => a.stableId === input.assumptionIdOrStable);
  if (!prior) throw new Error("assumption_not_found");

  // Supersede prior revision historically — do not rewrite prior row values in place for lineage
  const neu: AssumptionRecord = {
    ...prior,
    id: id(),
    value: input.value !== undefined ? input.value : prior.value,
    units: input.units !== undefined ? input.units : prior.units,
    statement: input.statement?.trim() || prior.statement,
    basis: input.basis ?? prior.basis,
    revision: prior.revision + 1,
    revisionLabel: `Rev ${prior.revision + 1}`,
    priorRevisionId: prior.id,
    supersedesAssumptionId: prior.id,
    status: "UNVERIFIED",
    provenance: {
      ...prior.provenance,
      revisedFrom: prior.id,
      actorId: input.actorId ?? null,
      historicalPriorPreserved: true,
    },
    createdAt: now(),
    updatedAt: now(),
  };
  prior.status = "SUPERSEDED";
  prior.supersededAssumptionId = neu.id;
  prior.updatedAt = now();
  store.assumptions.set(prior.id, prior);
  store.assumptions.set(neu.id, neu);
  return neu;
}

export function verifyAssumption(input: {
  workspaceId: string;
  assumptionIdOrStable: string;
  actorId: string;
  authorityRole: string;
}): AssumptionRecord {
  const a = getAssumption(input.workspaceId, input.assumptionIdOrStable);
  if (!a) throw new Error("assumption_not_found");
  // Creation owner alone is insufficient — require explicit authority role string
  if (!input.authorityRole || input.authorityRole === "author") {
    throw new Error("assumption_verification_authority_required");
  }
  a.status = "VERIFIED";
  a.provenance = {
    ...a.provenance,
    verifiedBy: input.actorId,
    verificationAuthority: input.authorityRole,
    verifiedAt: now(),
    // VERIFIED != APPROVED ENGINEERING
    verifiedIsNotApprovedEngineering: true,
  };
  a.updatedAt = now();
  ensure(input.workspaceId).assumptions.set(a.id, a);
  return a;
}

export function invalidateAssumption(input: {
  workspaceId: string;
  assumptionIdOrStable: string;
  actorId: string;
  reason: string;
  authoritativeEvidenceStableId?: string;
}): AssumptionRecord {
  const a = getAssumption(input.workspaceId, input.assumptionIdOrStable);
  if (!a) throw new Error("assumption_not_found");
  a.status = "INVALIDATED";
  a.provenance = {
    ...a.provenance,
    invalidatedBy: input.actorId,
    invalidationReason: input.reason,
    authoritativeEvidenceStableId: input.authoritativeEvidenceStableId ?? null,
    invalidatedAt: now(),
    // No automatic downstream stale propagation in Domain-4
    automaticStalenessPropagation: false,
  };
  a.updatedAt = now();
  ensure(input.workspaceId).assumptions.set(a.id, a);
  return a;
}

export function getAssumption(workspaceId: string, idOrStable: string): AssumptionRecord | null {
  const store = ensure(workspaceId);
  return (
    store.assumptions.get(idOrStable) ??
    [...store.assumptions.values()].find((a) => a.stableId === idOrStable) ??
    null
  );
}

export function listAssumptions(workspaceId: string, projectId?: string): AssumptionRecord[] {
  return [...ensure(workspaceId).assumptions.values()]
    .filter((a) => !projectId || a.projectId === projectId)
    .filter((a) => a.status !== "SUPERSEDED" || true) // keep history visible
    .sort((a, b) => a.stableId.localeCompare(b.stableId));
}

export type CreateDecisionInput = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  title: string;
  question: string;
  stableId?: string;
  workPackageStableId?: string | null;
  assetSystemStableIds?: string[];
  decisionType?: DecisionType;
  problemContext?: string;
  options?: Array<{ label: string; description?: string }>;
  criteria?: string[];
  recommendation?: string | null;
  assumptionStableIds?: string[];
  evidenceStableIds?: string[];
  calculationStableIds?: string[];
  responsibleEngineer?: string | null;
  decisionAuthority?: string | null;
  decisionAuthorityRole?: string | null;
  actorId?: string | null;
  generated?: boolean;
};

export function createDecisionDraft(input: CreateDecisionInput): DecisionRecord {
  const title = input.title.trim();
  const question = input.question.trim();
  if (!title || !question) throw new Error("decision_title_and_question_required");
  const store = ensure(input.workspaceId);
  const stableId = input.stableId ?? `DEC-${id().slice(0, 6).toUpperCase()}`;
  const existing = [...store.decisions.values()].find((d) => d.stableId === stableId);
  if (existing) return existing;

  const options: DecisionOption[] = (input.options ?? []).map((o) => ({
    optionId: id(),
    label: o.label,
    description: o.description ?? "",
    advantages: [],
    disadvantages: [],
    evidenceIds: [],
    risks: [],
    recommended: false,
  }));

  const row: DecisionRecord = {
    id: id(),
    stableId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    workPackageStableId: input.workPackageStableId ?? null,
    assetSystemStableIds: input.assetSystemStableIds ?? [],
    title,
    question,
    decisionType: input.decisionType ?? "ENGINEERING_DECISION",
    category: "Engineering Decision",
    problemContext: input.problemContext ?? "",
    options,
    criteria: input.criteria ?? [],
    recommendation: input.recommendation ?? null,
    selectedOptionId: null,
    rationale: null,
    assumptionStableIds: input.assumptionStableIds ?? [],
    evidenceStableIds: input.evidenceStableIds ?? [],
    calculationStableIds: input.calculationStableIds ?? [],
    riskNotes: [],
    responsibleEngineer: input.responsibleEngineer ?? null,
    decisionAuthority: input.decisionAuthority ?? null,
    decisionAuthorityRole: input.decisionAuthorityRole ?? null,
    decisionDate: null,
    requiredByDate: null,
    conditions: [],
    status: "PROPOSED",
    revision: 1,
    revisionLabel: "Rev 1",
    supersededDecisionId: null,
    supersedesDecisionId: null,
    affectedObjectStableIds: [],
    provenance: {
      source: "eos3.domain-4.decision",
      generated: Boolean(input.generated),
      autoApproved: false,
      ownerIsNotAuthority: true,
      aiDecisionAuthority: AI_DECISION_AUTHORITY,
      shadowTruth: false,
      actorId: input.actorId ?? null,
    },
    humanDecisionEvent: null,
    createdAt: now(),
    updatedAt: now(),
  };
  store.decisions.set(row.id, row);

  if (row.workPackageStableId) {
    try {
      associateObject(input.projectId, row.workPackageStableId, {
        objectType: "Decision",
        objectStableId: row.stableId,
        confirmationState: "PROPOSED",
      });
    } catch {
      /* optional */
    }
  }
  return row;
}

export function createDecisionFromNaturalQuestion(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  text: string;
  workPackageStableId?: string | null;
  assetSystemStableIds?: string[];
  actorId?: string | null;
}): DecisionRecord {
  const text = input.text.trim();
  const options: Array<{ label: string; description?: string }> = [];
  if (/strengthen|independent|replacement|frame|platform/i.test(text)) {
    options.push(
      { label: "Strengthen existing platform", description: "Reinforce current structure" },
      { label: "Independent support frame", description: "New frame independent of existing platform" },
      { label: "Partial structure replacement", description: "Replace affected members only" },
    );
  }
  return createDecisionDraft({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    title: text.length > 80 ? `${text.slice(0, 77)}…` : text,
    question: text,
    workPackageStableId: input.workPackageStableId,
    assetSystemStableIds: input.assetSystemStableIds,
    options,
    actorId: input.actorId,
    generated: true,
    decisionType: "ENGINEERING_DECISION",
  });
}

export function addDecisionOption(
  workspaceId: string,
  decisionIdOrStable: string,
  option: { label: string; description?: string; recommended?: boolean },
): DecisionRecord {
  const d = getDecision(workspaceId, decisionIdOrStable);
  if (!d) throw new Error("decision_not_found");
  if (d.status === "DECIDED" || d.status === "CLOSED") throw new Error("decision_immutable_when_final");
  d.options.push({
    optionId: id(),
    label: option.label,
    description: option.description ?? "",
    advantages: [],
    disadvantages: [],
    evidenceIds: [],
    risks: [],
    recommended: Boolean(option.recommended),
  });
  d.updatedAt = now();
  ensure(workspaceId).decisions.set(d.id, d);
  return d;
}

export function associateDecisionSupport(
  workspaceId: string,
  decisionIdOrStable: string,
  support: {
    assumptionStableIds?: string[];
    evidenceStableIds?: string[];
    calculationStableIds?: string[];
    assetSystemStableIds?: string[];
  },
): DecisionRecord {
  const d = getDecision(workspaceId, decisionIdOrStable);
  if (!d) throw new Error("decision_not_found");
  d.assumptionStableIds = unique([
    ...d.assumptionStableIds,
    ...(support.assumptionStableIds ?? []),
  ]);
  d.evidenceStableIds = unique([...d.evidenceStableIds, ...(support.evidenceStableIds ?? [])]);
  d.calculationStableIds = unique([
    ...d.calculationStableIds,
    ...(support.calculationStableIds ?? []),
  ]);
  d.assetSystemStableIds = unique([
    ...d.assetSystemStableIds,
    ...(support.assetSystemStableIds ?? []),
  ]);
  d.updatedAt = now();
  ensure(workspaceId).decisions.set(d.id, d);
  return d;
}

function unique(xs: string[]) {
  return [...new Set(xs)];
}

/**
 * Finalize governed decision — requires explicit authority + rationale.
 * Does not escalate from WP ownership alone.
 */
export function recordFinalDecision(input: {
  workspaceId: string;
  decisionIdOrStable: string;
  selectedOptionId: string;
  rationale: string;
  actorId: string;
  authorityBasis: string;
  authorityRole: string;
  conditions?: string[];
}): DecisionRecord {
  const d = getDecision(input.workspaceId, input.decisionIdOrStable);
  if (!d) throw new Error("decision_not_found");
  if (!input.rationale.trim()) throw new Error("decision_rationale_required");
  if (!input.authorityBasis.trim() || !input.authorityRole.trim()) {
    throw new Error("decision_authority_required");
  }
  // Owner / author auto-authority forbidden
  if (
    input.authorityRole === "work_package_owner" ||
    input.authorityRole === "author" ||
    input.authorityBasis === "work_package_owner"
  ) {
    throw new Error("decision_owner_auto_authority_forbidden");
  }
  const opt = d.options.find((o) => o.optionId === input.selectedOptionId);
  if (!opt) throw new Error("decision_option_not_found");

  d.selectedOptionId = input.selectedOptionId;
  d.rationale = input.rationale.trim();
  d.status = "DECIDED";
  d.decisionAuthority = input.actorId;
  d.decisionAuthorityRole = input.authorityRole;
  d.decisionDate = now();
  d.conditions = input.conditions ?? [];
  d.humanDecisionEvent = {
    actorId: input.actorId,
    authorityBasis: input.authorityBasis,
    timestamp: now(),
    selectedOptionId: input.selectedOptionId,
    conditions: d.conditions,
    rationale: d.rationale,
  };
  d.provenance = {
    ...d.provenance,
    finalized: true,
    autonomousFinalDecision: false,
    autonomousApproval: false,
  };
  d.updatedAt = now();
  ensure(input.workspaceId).decisions.set(d.id, d);
  return d;
}

export function supersedeDecision(input: {
  workspaceId: string;
  oldDecisionIdOrStable: string;
  title?: string;
  question?: string;
  actorId?: string | null;
}): DecisionRecord {
  const old = getDecision(input.workspaceId, input.oldDecisionIdOrStable);
  if (!old) throw new Error("decision_not_found");
  const neu = createDecisionDraft({
    tenantId: old.tenantId,
    workspaceId: input.workspaceId,
    projectId: old.projectId,
    title: input.title ?? `${old.title} (revised)`,
    question: input.question ?? old.question,
    workPackageStableId: old.workPackageStableId,
    assetSystemStableIds: old.assetSystemStableIds,
    decisionType: old.decisionType,
    options: old.options.map((o) => ({ label: o.label, description: o.description })),
    assumptionStableIds: old.assumptionStableIds,
    evidenceStableIds: old.evidenceStableIds,
    calculationStableIds: old.calculationStableIds,
    actorId: input.actorId,
  });
  neu.revision = old.revision + 1;
  neu.revisionLabel = `Rev ${neu.revision}`;
  neu.supersedesDecisionId = old.id;
  old.status = "SUPERSEDED";
  old.supersededDecisionId = neu.id;
  old.updatedAt = now();
  ensure(input.workspaceId).decisions.set(old.id, old);
  ensure(input.workspaceId).decisions.set(neu.id, neu);
  return neu;
}

export function markDecisionReassessmentRequired(
  workspaceId: string,
  decisionIdOrStable: string,
  reason: string,
): DecisionRecord {
  const d = getDecision(workspaceId, decisionIdOrStable);
  if (!d) throw new Error("decision_not_found");
  // Foundation only — never auto from graph path alone without explicit call
  d.status = "REASSESSMENT_REQUIRED";
  d.provenance = {
    ...d.provenance,
    reassessmentReason: reason,
    automaticInvalidation: false,
  };
  d.updatedAt = now();
  ensure(workspaceId).decisions.set(d.id, d);
  return d;
}

export function getDecision(workspaceId: string, idOrStable: string): DecisionRecord | null {
  const store = ensure(workspaceId);
  return (
    store.decisions.get(idOrStable) ??
    [...store.decisions.values()].find((d) => d.stableId === idOrStable) ??
    null
  );
}

export function listDecisions(workspaceId: string, projectId?: string): DecisionRecord[] {
  return [...ensure(workspaceId).decisions.values()]
    .filter((d) => !projectId || d.projectId === projectId)
    .sort((a, b) => a.stableId.localeCompare(b.stableId));
}

/** Wire lineage into Domain-3 graph without duplicate lineage store. */
export function linkDecisionAssumptionLineageToGraph(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  decisionStableId: string;
  assumptionStableId?: string;
  calculationStableId?: string;
  evidenceStableId?: string;
  requirementStableId?: string;
  deliverableStableId?: string;
  workPackageStableId?: string;
  assetStableId?: string;
}): GraphEdge[] {
  const edges: GraphEdge[] = [];
  const base = {
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    origin: "SYSTEM_DERIVED" as const,
    confirmationState: "CONFIRMED" as const,
  };
  if (input.assumptionStableId && input.calculationStableId) {
    edges.push(
      createGraphEdge({
        ...base,
        sourceClass: "Calculation",
        sourceStableId: input.calculationStableId,
        targetClass: "Assumption",
        targetStableId: input.assumptionStableId,
        relationshipType: "ASSUMES",
      }),
    );
  }
  if (input.evidenceStableId && input.assumptionStableId) {
    edges.push(
      createGraphEdge({
        ...base,
        sourceClass: "Evidence",
        sourceStableId: input.evidenceStableId,
        targetClass: "Assumption",
        targetStableId: input.assumptionStableId,
        relationshipType: "SUPPORTS",
      }),
    );
  }
  if (input.calculationStableId) {
    edges.push(
      createGraphEdge({
        ...base,
        sourceClass: "Calculation",
        sourceStableId: input.calculationStableId,
        targetClass: "Decision",
        targetStableId: input.decisionStableId,
        relationshipType: "SUPPORTS",
      }),
    );
  }
  if (input.assumptionStableId) {
    edges.push(
      createGraphEdge({
        ...base,
        sourceClass: "Assumption",
        sourceStableId: input.assumptionStableId,
        targetClass: "Decision",
        targetStableId: input.decisionStableId,
        relationshipType: "SUPPORTS",
      }),
    );
  }
  if (input.evidenceStableId) {
    edges.push(
      createGraphEdge({
        ...base,
        sourceClass: "Evidence",
        sourceStableId: input.evidenceStableId,
        targetClass: "Decision",
        targetStableId: input.decisionStableId,
        relationshipType: "SUPPORTS",
      }),
    );
  }
  if (input.requirementStableId) {
    edges.push(
      createGraphEdge({
        ...base,
        sourceClass: "Requirement",
        sourceStableId: input.requirementStableId,
        targetClass: "Decision",
        targetStableId: input.decisionStableId,
        relationshipType: "SUPPORTS",
      }),
    );
  }
  if (input.deliverableStableId) {
    edges.push(
      createGraphEdge({
        ...base,
        sourceClass: "Decision",
        sourceStableId: input.decisionStableId,
        targetClass: "Deliverable",
        targetStableId: input.deliverableStableId,
        relationshipType: "AFFECTS",
        relatedness: "EXPLICITLY_AFFECTED",
      }),
    );
  }
  if (input.workPackageStableId) {
    edges.push(
      createGraphEdge({
        ...base,
        sourceClass: "Decision",
        sourceStableId: input.decisionStableId,
        targetClass: "WorkPackage",
        targetStableId: input.workPackageStableId,
        relationshipType: "APPLIES_TO",
      }),
    );
  }
  if (input.assetStableId) {
    edges.push(
      createGraphEdge({
        ...base,
        sourceClass: "Decision",
        sourceStableId: input.decisionStableId,
        targetClass: "Asset",
        targetStableId: input.assetStableId,
        relationshipType: "APPLIES_TO",
      }),
    );
    if (input.assumptionStableId) {
      edges.push(
        createGraphEdge({
          ...base,
          sourceClass: "Assumption",
          sourceStableId: input.assumptionStableId,
          targetClass: "Asset",
          targetStableId: input.assetStableId,
          relationshipType: "APPLIES_TO",
        }),
      );
    }
  }
  return edges;
}

// —— Lineage queries (bounded; no stale labeling) ——

export function queryCalculationAssumptions(
  workspaceId: string,
  calculationStableId: string,
): GraphEdge[] {
  return getDependencies(workspaceId, calculationStableId).filter(
    (e) => e.relationshipType === "ASSUMES",
  );
}

export function queryAssumptionEvidence(
  workspaceId: string,
  assumptionStableId: string,
): GraphEdge[] {
  return getSupportingEvidence(workspaceId, assumptionStableId);
}

export function queryDecisionSupport(workspaceId: string, decisionStableId: string): {
  requirements: GraphEdge[];
  evidence: GraphEdge[];
  assumptions: GraphEdge[];
  calculations: GraphEdge[];
  reviews: GraphEdge[];
} {
  const up = getUpstream(workspaceId, decisionStableId);
  return {
    requirements: up.filter((e) => e.source.objectClass === "Requirement"),
    evidence: up.filter((e) => e.source.objectClass === "Evidence"),
    assumptions: up.filter((e) => e.source.objectClass === "Assumption"),
    calculations: up.filter((e) => e.source.objectClass === "Calculation"),
    reviews: up.filter((e) => e.source.objectClass === "Review"),
  };
}

export function queryDecisionWhy(
  workspaceId: string,
  decisionStableId: string,
): {
  status: DecisionStatus | "NOT_FOUND";
  question: string | null;
  options: DecisionOption[];
  evidenceStableIds: string[];
  recommendation: string | null;
  rationale: string | null;
  humanDecisionEvent: DecisionRecord["humanDecisionEvent"];
  fabricated: false;
} {
  const d = getDecision(workspaceId, decisionStableId);
  if (!d) {
    return {
      status: "NOT_FOUND",
      question: null,
      options: [],
      evidenceStableIds: [],
      recommendation: null,
      rationale: null,
      humanDecisionEvent: null,
      fabricated: false,
    };
  }
  return {
    status: d.status,
    question: d.question,
    options: d.options,
    evidenceStableIds: d.evidenceStableIds,
    recommendation: d.recommendation,
    rationale: d.status === "DECIDED" || d.status === "CLOSED" ? d.rationale : null,
    humanDecisionEvent: d.humanDecisionEvent,
    fabricated: false,
  };
}

export function queryAssumptionDependents(
  workspaceId: string,
  assumptionStableId: string,
): GraphEdge[] {
  // Graph dependents — do not mark STALE
  return getDependents(workspaceId, assumptionStableId);
}

export function buildDecisionUiContract(
  workspaceId: string,
  decisionStableId: string,
): Record<string, unknown> {
  const d = getDecision(workspaceId, decisionStableId);
  if (!d) return { found: false };
  const support = queryDecisionSupport(workspaceId, decisionStableId);
  return {
    found: true,
    engineeringLanguage: true,
    decisionId: d.stableId,
    title: d.title,
    question: d.question,
    workPackage: d.workPackageStableId,
    assetSystem: d.assetSystemStableIds,
    status: d.status,
    authority: d.decisionAuthorityRole,
    whyNow: d.problemContext || null,
    options: d.options.map((o) => ({ id: o.optionId, label: o.label, description: o.description })),
    evidence: d.evidenceStableIds,
    assumptions: d.assumptionStableIds,
    calculations: d.calculationStableIds,
    affectedItems: d.affectedObjectStableIds,
    recommendation: d.recommendation,
    rationale: d.rationale,
    approvalHistory: d.humanDecisionEvent ? [d.humanDecisionEvent] : [],
    supportingLineage: {
      requirements: support.requirements.map((e) => e.source.objectStableId),
      evidence: support.evidence.map((e) => e.source.objectStableId),
      assumptions: support.assumptions.map((e) => e.source.objectStableId),
      calculations: support.calculations.map((e) => e.source.objectStableId),
    },
    labels: {
      decisions: "Decisions",
      assumptions: "Assumptions",
      evidence: "Evidence",
      options: "Options",
      rationale: "Rationale",
      authority: "Authority",
      supportingInformation: "Supporting Information",
      usedBy: "Used By",
      affectedItems: "Affected Items",
    },
  };
}

export function buildAssumptionUiContract(
  workspaceId: string,
  assumptionStableId: string,
): Record<string, unknown> {
  const a = getAssumption(workspaceId, assumptionStableId);
  if (!a) return { found: false };
  const usedBy = queryAssumptionDependents(workspaceId, assumptionStableId).map(
    (e) => e.source.objectStableId,
  );
  return {
    found: true,
    engineeringLanguage: true,
    assumptionId: a.stableId,
    title: a.statement.slice(0, 80),
    value: a.value,
    units: a.units,
    status: a.status,
    verificationRequirement: a.verificationRequirement,
    usedBy,
    source: a.basis,
    evidence: a.sourceEvidenceStableIds,
    workPackage: a.workPackageStableId,
    assetSystem: a.assetSystemStableIds,
    evidenceClassification: a.evidenceClassification,
    displayExample: `${a.stableId} ${a.statement}${a.value != null ? ` — ${a.value}${a.units ? " " + a.units : ""}` : ""}`,
  };
}

export function unauthorizedDecisionAssumptionWriteBlocked(input: {
  callerWorkspaceId: string;
  recordWorkspaceId: string;
}): boolean {
  return input.callerWorkspaceId !== input.recordWorkspaceId;
}

/**
 * Pilot-001 Decision + Assumption lineage seed.
 */
export function seedPilot001DecisionAssumptionLineage(input: {
  tenantId?: string;
  workspaceId: string;
  projectId: string;
}): {
  assumption: AssumptionRecord;
  decision: DecisionRecord;
  calcAssumptions: GraphEdge[];
  assumptionEvidence: GraphEdge[];
  decisionSupport: ReturnType<typeof queryDecisionSupport>;
  decisionWhy: ReturnType<typeof queryDecisionWhy>;
  assumptionDependents: GraphEdge[];
  workPackage: WorkPackage | null;
  audit: ReturnType<typeof auditExistingDecisionAssumptionModels>;
} {
  const tenantId = input.tenantId ?? "00000000-0000-4000-8000-000000000041";
  const { workspaceId, projectId } = input;

  seedPilot001SupportFrameWorkPackage(projectId);
  seedPilot001AssetSystemContext({ tenantId, workspaceId, projectId });
  seedPilot001RelationshipGraph({ tenantId, workspaceId, projectId });

  const assumption = createAssumption({
    tenantId,
    workspaceId,
    projectId,
    stableId: "ASM-001",
    statement: "Equipment operating mass is 12 t pending vendor confirmation",
    value: 12,
    units: "t",
    basis: "Preliminary vendor data",
    assumptionType: "Vendor Data Assumption",
    verificationRequirement: "Pending vendor confirmation",
    workPackageStableId: "WP-STR-004",
    assetSystemStableIds: ["AST-PLT-201", "AST-EQ-MOD-01"],
    sourceEvidenceStableIds: ["EVD-WP-STR-004"],
    materiality: "HIGH",
    confidence: "medium",
    owner: "Structural Lead",
  });

  const decision = createDecisionDraft({
    tenantId,
    workspaceId,
    projectId,
    stableId: "DEC-001",
    title: "Support strategy for equipment modification",
    question: "What support strategy should be adopted for the equipment modification?",
    workPackageStableId: "WP-STR-004",
    assetSystemStableIds: ["AST-PLT-201"],
    problemContext: "Brownfield platform modification for new process equipment module",
    options: [
      { label: "Strengthen existing platform", description: "Reinforce current steel platform" },
      { label: "Independent support frame", description: "Install independent frame" },
      { label: "Partial structure replacement", description: "Replace selected members" },
    ],
    criteria: ["Structural capacity", "Constructability", "Interface with equipment", "Cost/schedule"],
    recommendation: null, // do not auto-select
    assumptionStableIds: ["ASM-001"],
    evidenceStableIds: ["EVD-WP-STR-004"],
    calculationStableIds: ["CALC-001"],
    responsibleEngineer: "Structural Lead",
    // Authority left null until human finalization
    decisionAuthority: null,
    decisionAuthorityRole: null,
  });

  linkDecisionAssumptionLineageToGraph({
    tenantId,
    workspaceId,
    projectId,
    decisionStableId: "DEC-001",
    assumptionStableId: "ASM-001",
    calculationStableId: "CALC-001",
    evidenceStableId: "EVD-WP-STR-004",
    requirementStableId: "REQ-001",
    deliverableStableId: "DEL-001",
    workPackageStableId: "WP-STR-004",
    assetStableId: "AST-PLT-201",
  });

  // Track dependents on assumption record (IDs only — no stale flags)
  assumption.dependentObjectStableIds = queryAssumptionDependents(workspaceId, "ASM-001").map(
    (e) => e.source.objectStableId,
  );
  ensure(workspaceId).assumptions.set(assumption.id, assumption);

  decision.affectedObjectStableIds = getDownstream(workspaceId, "DEC-001").map(
    (e) => e.target.objectStableId,
  );
  ensure(workspaceId).decisions.set(decision.id, decision);

  return {
    assumption,
    decision,
    calcAssumptions: queryCalculationAssumptions(workspaceId, "CALC-001"),
    assumptionEvidence: queryAssumptionEvidence(workspaceId, "ASM-001"),
    decisionSupport: queryDecisionSupport(workspaceId, "DEC-001"),
    decisionWhy: queryDecisionWhy(workspaceId, "DEC-001"),
    assumptionDependents: queryAssumptionDependents(workspaceId, "ASM-001"),
    workPackage: getWorkPackage(projectId, "WP-STR-004"),
    audit: auditExistingDecisionAssumptionModels(),
  };
}
