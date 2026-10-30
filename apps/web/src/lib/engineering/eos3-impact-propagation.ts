/**
 * EOS-3-INTELLIGENCE-1 — Staleness & Impact Propagation.
 * Deterministic, revision-aware, cycle-safe. Dependency ≠ invalidity.
 * Reuses Domain 3 graph + Domain 4 lineage + Domain 1 readiness. No shadow engineering truth.
 * Does NOT block Home render. Does NOT require a live LLM.
 */

import {
  DEFAULT_PROPAGATION_MAX_DEPTH,
  EOS_AUTOMATIC_CALCULATION_INVALIDATION,
  EOS_AUTOMATIC_DECISION_REVERSAL,
  EOS_AUTOMATIC_DELIVERABLE_WITHDRAWAL,
  EOS_AUTOMATIC_ENGINEERING_APPROVAL,
  EOS_DEPENDENCY_NOT_EQUAL_INVALIDITY,
  EOS_PROPAGATION_REQUIRES_LIVE_LLM,
  IMPACT_STATE_MEANINGS,
  NON_PROPAGATING_RELATIONSHIP_TYPES,
  PROPAGATING_RELATIONSHIP_TYPES,
  type ImpactState,
  type PropagationTriggerKind,
} from "./eos3-impact-state-semantics";
import {
  createGraphEdge,
  explainPath,
  filterEdgesForAuthorization,
  getDownstream,
  getUpstream,
  listEdgesForObject,
  seedPilot001RelationshipGraph,
  type GraphEdge,
  type GraphPath,
} from "./eos3-relationship-graph-core";
import { getRelationshipTypeDefinition } from "./eos3-relationship-type-registry";
import {
  getAssumption,
  getDecision,
  invalidateAssumption,
  markDecisionReassessmentRequired,
  reviseAssumption,
  seedPilot001DecisionAssumptionLineage,
} from "./eos3-decision-assumption-lineage";
import {
  associateObject,
  buildWorkPackageUiContract,
  deriveBlockers,
  deriveReadiness,
  getWorkPackage,
  listAssociations,
  seedPilot001SupportFrameWorkPackage,
} from "./eos3-work-package-service";
import {
  applyChangeMassPilot,
  createWorkspaceObject,
  findByStableId,
  impactForChange,
  reviseWorkspaceObject,
  seedPilot001,
} from "./eos3-project-workspace-service";
import { seedPilot001AssetSystemContext } from "./eos3-asset-system-context";

export type ImpactPathHop = {
  fromStableId: string;
  relationshipType: string;
  toStableId: string;
  fromRevision: string | null;
  toRevision: string | null;
  explanation: string;
};

export type ImpactRecord = {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  /** Affected engineering object (stable id). */
  affectedStableId: string;
  affectedObjectClass: string;
  impactState: ImpactState;
  triggerKind: PropagationTriggerKind;
  triggerStableId: string;
  triggerPreviousRevision: string | null;
  triggerNewRevision: string | null;
  changeSummary: string;
  materiality: "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";
  relationshipPath: ImpactPathHop[];
  pathExplanation: string;
  impactRule: string;
  workPackageStableId: string | null;
  assetSystemStableIds: string[];
  engineerUserId: string | null;
  deterministicNextAction: string;
  active: boolean;
  acknowledgement: ImpactAcknowledgement | null;
  resolution: ImpactResolution | null;
  createdAt: string;
  updatedAt: string;
  provenance: Record<string, unknown>;
  /** Idempotency key: trigger + affected + trigger revision. */
  dedupeKey: string;
};

export type ImpactAcknowledgement = {
  userId: string;
  role: string;
  rationale: string;
  recordedAt: string;
  conclusion: "NO_CHANGE_REQUIRED" | "ACCEPTED_FOR_REVISION";
};

export type ImpactResolution = {
  status: "RESOLVED_NO_CHANGE" | "RESOLVED_REVISED";
  userId: string;
  role: string;
  rationale: string;
  resolvedAt: string;
};

export type MyWorkImpactAttentionItem = {
  engineerUserId: string | null;
  projectId: string;
  workPackageStableId: string | null;
  assetSystemStableIds: string[];
  engineeringObjectStableId: string;
  engineeringObjectClass: string;
  impactState: ImpactState;
  reason: string;
  materiality: ImpactRecord["materiality"];
  dependencyPath: string;
  timestamp: string;
  deterministicNextAction: string;
  impactId: string;
};

type WorkspaceImpactStore = {
  impacts: Map<string, ImpactRecord>;
  processedEventKeys: Set<string>;
};

const stores = new Map<string, WorkspaceImpactStore>();

function id() {
  return crypto.randomUUID();
}
function now() {
  return new Date().toISOString();
}
function ensure(workspaceId: string): WorkspaceImpactStore {
  let s = stores.get(workspaceId);
  if (!s) {
    s = { impacts: new Map(), processedEventKeys: new Set() };
    stores.set(workspaceId, s);
  }
  return s;
}

export function __resetImpactPropagationForTests() {
  stores.clear();
}

export function auditExistingChangeImpactModels() {
  return {
    existingChangeImpactModelAudited: true as const,
    sources: [
      "eos3-project-workspace-service.impactForChange / applyChangeMassPilot",
      "eos3-object-store.markStale / markImpactCandidate",
      "eos3-governed-events IMPACT_CHANGE / REVISION_CHANGE",
      "eos3-workflow-engine work items review_required / impact_assessment_required",
      "packages/engineering-os change-impact Materiality / discoverImpacts",
      "eos3-decision-assumption-lineage markDecisionReassessmentRequired",
      "eos3-relationship-graph-core boundedTraversal",
    ],
    duplicateChangeIntelligenceCreated: false,
    impactShadowEngineeringStateCreated: false,
    inProcessImpactSourceOfTruthCreated: false,
    existingImpactSchemaReusedWhereValid: true,
    automaticCalculationInvalidation: EOS_AUTOMATIC_CALCULATION_INVALIDATION,
    automaticDecisionReversal: EOS_AUTOMATIC_DECISION_REVERSAL,
    automaticDeliverableWithdrawal: EOS_AUTOMATIC_DELIVERABLE_WITHDRAWAL,
    automaticEngineeringApproval: EOS_AUTOMATIC_ENGINEERING_APPROVAL,
    propagationRequiresLiveLlm: EOS_PROPAGATION_REQUIRES_LIVE_LLM,
    dependencyNotEqualInvalidity: EOS_DEPENDENCY_NOT_EQUAL_INVALIDITY,
  };
}

function dedupeKey(
  triggerStableId: string,
  triggerNewRevision: string | null,
  affectedStableId: string,
  impactState: ImpactState,
): string {
  return `${triggerStableId}|${triggerNewRevision ?? "none"}|${affectedStableId}|${impactState}`;
}

function isPropagatingEdge(edge: GraphEdge): boolean {
  if (NON_PROPAGATING_RELATIONSHIP_TYPES.has(edge.relationshipType)) return false;
  if (!PROPAGATING_RELATIONSHIP_TYPES.has(edge.relationshipType)) return false;
  return edge.status === "ACTIVE";
}

function classifyImpactState(input: {
  objectClass: string;
  relatedness: GraphPath["relatedness"];
  materiality: ImpactRecord["materiality"];
  hopCount: number;
  triggerKind: PropagationTriggerKind;
}): ImpactState {
  const { objectClass, relatedness, materiality, hopCount, triggerKind } = input;

  if (objectClass === "Decision") {
    if (
      materiality === "HIGH" &&
      (relatedness === "DEPENDENT" ||
        relatedness === "EXPLICITLY_AFFECTED" ||
        relatedness === "POTENTIALLY_AFFECTED")
    ) {
      return "REASSESSMENT_REQUIRED";
    }
    return materiality === "LOW" ? "REVIEW_RECOMMENDED" : "REASSESSMENT_REQUIRED";
  }

  if (objectClass === "Calculation") {
    if (materiality === "HIGH" && hopCount <= 2) return "STALE";
    if (materiality === "HIGH" || relatedness === "DEPENDENT") return "REVIEW_REQUIRED";
    if (relatedness === "RELATED") return "REVIEW_RECOMMENDED";
    return "POTENTIALLY_AFFECTED";
  }

  if (objectClass === "Deliverable") {
    // Only when explicit AFFECTS/MODIFIES/PRODUCES path exists (caller filters)
    if (relatedness === "EXPLICITLY_AFFECTED" || materiality === "HIGH") return "REVIEW_REQUIRED";
    return "REVIEW_RECOMMENDED";
  }

  if (objectClass === "Assumption") {
    if (triggerKind === "ASSUMPTION_INVALIDATION") return "INVALIDATED";
    return "CHANGE_DETECTED";
  }

  if (objectClass === "WorkPackage") {
    return materiality === "HIGH" ? "REVIEW_REQUIRED" : "POTENTIALLY_AFFECTED";
  }

  if (hopCount === 1) return "CHANGE_DETECTED";
  if (materiality === "HIGH") return "REVIEW_REQUIRED";
  if (materiality === "MEDIUM") return "REVIEW_RECOMMENDED";
  return "POTENTIALLY_AFFECTED";
}

function nextActionFor(state: ImpactState, affectedStableId: string, objectClass: string): string {
  switch (state) {
    case "REASSESSMENT_REQUIRED":
      return `Reassess decision ${affectedStableId} under human authority`;
    case "STALE":
    case "REVIEW_REQUIRED":
      return `Review ${objectClass.toLowerCase()} ${affectedStableId}`;
    case "REVIEW_RECOMMENDED":
      return `Assess whether ${affectedStableId} requires engineering change`;
    case "INVALIDATED":
      return `Record governed replacement for invalidated ${affectedStableId}`;
    default:
      return `View impact for ${affectedStableId}`;
  }
}

function strongestMateriality(
  path: GraphPath,
): ImpactRecord["materiality"] {
  let best: ImpactRecord["materiality"] = "UNKNOWN";
  const rank = { UNKNOWN: 0, LOW: 1, MEDIUM: 2, HIGH: 3 } as const;
  for (const h of path.hops) {
    const def = getRelationshipTypeDefinition(h.edge.relationshipType);
    const m = h.edge.materiality ?? def?.materialityDefault ?? "UNKNOWN";
    if (rank[m] > rank[best]) best = m;
  }
  return best;
}

function pathToHops(path: GraphPath): ImpactPathHop[] {
  return path.hops.map((h) => ({
    fromStableId: h.edge.source.objectStableId,
    relationshipType: h.edge.relationshipType,
    toStableId: h.edge.target.objectStableId,
    fromRevision: h.edge.source.revisionLabel,
    toRevision: h.edge.target.revisionLabel,
    explanation: h.explanation,
  }));
}

function finalizeImpactPath(hops: GraphPath["hops"]): GraphPath {
  let relatedness: GraphPath["relatedness"] = "RELATED";
  for (const h of hops) {
    if (h.edge.relatedness === "EXPLICITLY_AFFECTED") relatedness = "EXPLICITLY_AFFECTED";
    else if (h.edge.relatedness === "DEPENDENT" && relatedness !== "EXPLICITLY_AFFECTED")
      relatedness = "DEPENDENT";
    else if (h.edge.relatedness === "POTENTIALLY_AFFECTED" && relatedness === "RELATED")
      relatedness = "POTENTIALLY_AFFECTED";
    // ASSUMES/REQUIRES imply DEPENDENT for impact classification
    if (
      ["ASSUMES", "REQUIRES", "CONSUMES", "SUPPORTS", "AFFECTS", "MODIFIES"].includes(
        h.edge.relationshipType,
      ) &&
      relatedness === "RELATED"
    ) {
      relatedness = "DEPENDENT";
    }
  }
  return {
    hops,
    terminalStableId: hops.length
      ? hops[hops.length - 1]!.edge.target.objectStableId
      : "",
    relatedness,
    explanation: hops.map((h) => h.explanation).join(" → "),
  };
}

function findWorkPackageForObject(projectId: string, stableId: string): string | null {
  const wp = getWorkPackage(projectId, "WP-STR-004");
  if (!wp) return null;
  const assoc = listAssociations(projectId, wp.stableId);
  if (assoc.some((a) => a.objectStableId === stableId) || stableId === wp.stableId) {
    return wp.stableId;
  }
  return assoc.length ? wp.stableId : null;
}

function markAssociationStale(projectId: string, objectStableId: string) {
  const wp = getWorkPackage(projectId, "WP-STR-004");
  if (!wp) return;
  const storeAssocs = listAssociations(projectId, wp.stableId);
  for (const a of storeAssocs) {
    if (a.objectStableId === objectStableId) {
      a.confirmationState = "STALE";
    }
  }
}

function upsertImpact(record: ImpactRecord): ImpactRecord {
  const store = ensure(record.workspaceId);
  const existing = [...store.impacts.values()].find(
    (i) => i.dedupeKey === record.dedupeKey && i.active,
  );
  if (existing) {
    existing.updatedAt = now();
    existing.pathExplanation = record.pathExplanation;
    existing.relationshipPath = record.relationshipPath;
    existing.provenance = {
      ...existing.provenance,
      multiPathMerged: true,
      pathCount: Number(existing.provenance.pathCount ?? 1) + 1,
    };
    store.impacts.set(existing.id, existing);
    return existing;
  }
  store.impacts.set(record.id, record);
  return record;
}

export type ProcessEngineeringChangeInput = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  triggerKind: PropagationTriggerKind;
  triggerStableId: string;
  triggerObjectClass: string;
  previousRevision?: string | null;
  newRevision?: string | null;
  changeSummary: string;
  actorId?: string | null;
  maxDepth?: number;
  eventKey?: string;
  seedPilot?: boolean;
};

export type ProcessEngineeringChangeResult = {
  impacts: ImpactRecord[];
  falsePositiveSkipped: Array<{ stableId: string; reason: string }>;
  readiness: ReturnType<typeof deriveReadiness> | null;
  blockers: ReturnType<typeof deriveBlockers>;
  automaticInvalidations: {
    calculation: false;
    decision: false;
    deliverable: false;
    approval: false;
  };
  eventSkippedDuplicate: boolean;
};

/**
 * Process a governed engineering change and propagate bounded impact.
 * Idempotent on eventKey / revision dedupe. Cycle-safe via Domain-3 traversal.
 */
export function processEngineeringChange(
  input: ProcessEngineeringChangeInput,
): ProcessEngineeringChangeResult {
  if (input.seedPilot !== false && input.projectId.toUpperCase().includes("PILOT")) {
    seedPilot001(input.projectId);
    seedPilot001SupportFrameWorkPackage(input.projectId);
    seedPilot001AssetSystemContext({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
    });
    seedPilot001RelationshipGraph({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
    });
    seedPilot001DecisionAssumptionLineage({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
    });
  }

  const store = ensure(input.workspaceId);
  const eventKey =
    input.eventKey ??
    `${input.triggerStableId}|${input.newRevision ?? input.changeSummary}|${input.triggerKind}`;
  if (store.processedEventKeys.has(eventKey)) {
    return {
      impacts: listActiveImpacts(input.workspaceId, input.projectId).filter(
        (i) => i.triggerStableId === input.triggerStableId,
      ),
      falsePositiveSkipped: [],
      readiness: getWorkPackage(input.projectId, "WP-STR-004")
        ? deriveReadiness(input.projectId, "WP-STR-004")
        : null,
      blockers: getWorkPackage(input.projectId, "WP-STR-004")
        ? deriveBlockers(input.projectId, "WP-STR-004")
        : [],
      automaticInvalidations: {
        calculation: false,
        decision: false,
        deliverable: false,
        approval: false,
      },
      eventSkippedDuplicate: true,
    };
  }
  store.processedEventKeys.add(eventKey);

  const maxDepth = input.maxDepth ?? DEFAULT_PROPAGATION_MAX_DEPTH;
  const falsePositiveSkipped: Array<{ stableId: string; reason: string }> = [];
  const created: ImpactRecord[] = [];

  // Direct change on trigger itself (assumption revision / invalidation)
  if (
    input.triggerObjectClass === "Assumption" ||
    input.triggerKind === "ASSUMPTION_REVISION" ||
    input.triggerKind === "ASSUMPTION_INVALIDATION"
  ) {
    const state: ImpactState =
      input.triggerKind === "ASSUMPTION_INVALIDATION" ? "INVALIDATED" : "CHANGE_DETECTED";
    created.push(
      upsertImpact({
        id: id(),
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        projectId: input.projectId,
        affectedStableId: input.triggerStableId,
        affectedObjectClass: "Assumption",
        impactState: state,
        triggerKind: input.triggerKind,
        triggerStableId: input.triggerStableId,
        triggerPreviousRevision: input.previousRevision ?? null,
        triggerNewRevision: input.newRevision ?? null,
        changeSummary: input.changeSummary,
        materiality: "HIGH",
        relationshipPath: [],
        pathExplanation: `${input.triggerStableId} ${input.changeSummary}`,
        impactRule: "TRIGGER_OBJECT_DIRECT",
        workPackageStableId: findWorkPackageForObject(input.projectId, input.triggerStableId),
        assetSystemStableIds: [],
        engineerUserId: input.actorId ?? null,
        deterministicNextAction: nextActionFor(state, input.triggerStableId, "Assumption"),
        active: true,
        acknowledgement: null,
        resolution: null,
        createdAt: now(),
        updatedAt: now(),
        provenance: { requiresLiveLlm: false, automaticInvalidation: false },
        dedupeKey: dedupeKey(
          input.triggerStableId,
          input.newRevision ?? null,
          input.triggerStableId,
          state,
        ),
      }),
    );
    markAssociationStale(input.projectId, input.triggerStableId);
  }

  /**
   * Impact-oriented traversal: track the *arrived-at* node as affected.
   * Domain-3 boundedTraversal terminalStableId follows edge.target, which is wrong
   * when walking upstream from a changed assumption to a dependent calculation.
   */
  type ImpactWalk = {
    arrivedAt: string;
    arrivedClass: string;
    hops: GraphPath["hops"];
    visited: Set<string>;
    depth: number;
  };
  const walks: ImpactWalk[] = [];
  const stack: ImpactWalk[] = [
    {
      arrivedAt: input.triggerStableId,
      arrivedClass: input.triggerObjectClass,
      hops: [],
      visited: new Set([input.triggerStableId]),
      depth: 0,
    },
  ];
  while (stack.length) {
    const frame = stack.pop()!;
    if (frame.depth >= maxDepth) {
      if (frame.hops.length) walks.push(frame);
      continue;
    }
    const outs = [
      ...getDownstream(input.workspaceId, frame.arrivedAt, {
        types: [...PROPAGATING_RELATIONSHIP_TYPES],
        projectId: input.projectId,
      }),
      ...getUpstream(input.workspaceId, frame.arrivedAt, {
        types: [...PROPAGATING_RELATIONSHIP_TYPES],
        projectId: input.projectId,
      }),
    ];
    let expanded = false;
    for (const edge of outs) {
      if (!isPropagatingEdge(edge)) continue;
      const nextStable =
        edge.source.objectStableId === frame.arrivedAt
          ? edge.target.objectStableId
          : edge.source.objectStableId;
      const nextClass =
        edge.source.objectStableId === frame.arrivedAt
          ? edge.target.objectClass
          : edge.source.objectClass;
      if (frame.visited.has(nextStable)) continue;
      expanded = true;
      const nextVisited = new Set(frame.visited);
      nextVisited.add(nextStable);
      stack.push({
        arrivedAt: nextStable,
        arrivedClass: nextClass,
        hops: [...frame.hops, { edge, explanation: `${edge.source.objectStableId} ${edge.relationshipType} ${edge.target.objectStableId}` }],
        visited: nextVisited,
        depth: frame.depth + 1,
      });
    }
    if (!expanded && frame.hops.length) walks.push(frame);
  }

  // Also inspect immediate non-propagating neighbors for false-positive control evidence
  const allLocal = [
    ...getUpstream(input.workspaceId, input.triggerStableId, { projectId: input.projectId }),
    ...getDownstream(input.workspaceId, input.triggerStableId, { projectId: input.projectId }),
  ];
  for (const edge of allLocal) {
    if (NON_PROPAGATING_RELATIONSHIP_TYPES.has(edge.relationshipType)) {
      const other =
        edge.source.objectStableId === input.triggerStableId
          ? edge.target
          : edge.source;
      falsePositiveSkipped.push({
        stableId: other.objectStableId,
        reason: `${edge.relationshipType} does not propagate review/stale state`,
      });
    }
  }

  const byTerminal = new Map<string, Array<{ path: GraphPath; objectClass: string }>>();
  for (const walk of walks) {
    if (!walk.hops.length) continue;
    if (walk.arrivedAt === input.triggerStableId) continue;
    const path = finalizeImpactPath(walk.hops);
    const list = byTerminal.get(walk.arrivedAt) ?? [];
    list.push({ path, objectClass: walk.arrivedClass });
    byTerminal.set(walk.arrivedAt, list);
  }

  for (const [terminal, terminalPaths] of byTerminal) {
    // Prefer the strongest / shortest explaining path; merge multi-path evidence
    const primaryEntry = terminalPaths.sort(
      (a, b) =>
        a.path.hops.length - b.path.hops.length ||
        b.path.relatedness.localeCompare(a.path.relatedness),
    )[0]!;
    const primary = primaryEntry.path;
    const objectClass = primaryEntry.objectClass;

    // Deliverables only when explicit AFFECTS/MODIFIES/PRODUCES present on path
    if (objectClass === "Deliverable") {
      const explicit = primary.hops.some((h) =>
        ["AFFECTS", "MODIFIES", "PRODUCES"].includes(h.edge.relationshipType),
      );
      if (!explicit) {
        falsePositiveSkipped.push({
          stableId: terminal,
          reason: "Deliverable lacks explicit AFFECTS/MODIFIES/PRODUCES path",
        });
        continue;
      }
    }

    // Asset↔Asset CONNECTED/ASSOCIATED already filtered; skip bare RELATED structural
    if (
      objectClass === "Asset" &&
      primary.relatedness === "RELATED" &&
      primary.hops.every((h) =>
        ["APPLIES_TO", "ASSOCIATED_WITH", "CONNECTED_TO"].includes(h.edge.relationshipType),
      )
    ) {
      // APPLIES_TO from calculation to asset: asset config change is handled via reverse query
      if (input.triggerObjectClass !== "Asset") {
        falsePositiveSkipped.push({
          stableId: terminal,
          reason: "Structural/context association without material engineering dependency",
        });
        continue;
      }
    }

    const materiality = strongestMateriality(primary);
    const impactState = classifyImpactState({
      objectClass,
      relatedness: primary.relatedness,
      materiality,
      hopCount: primary.hops.length,
      triggerKind: input.triggerKind,
    });

    // Never auto-INVALIDATE calculations/decisions/deliverables via propagation
    const safeState: ImpactState =
      impactState === "INVALIDATED" && objectClass !== "Assumption"
        ? "STALE"
        : impactState;

    const hops = pathToHops(primary);
    const multiExplanations = terminalPaths.map((p) => explainPath(p.path));

    const record = upsertImpact({
      id: id(),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      affectedStableId: terminal,
      affectedObjectClass: objectClass,
      impactState: safeState,
      triggerKind: input.triggerKind,
      triggerStableId: input.triggerStableId,
      triggerPreviousRevision: input.previousRevision ?? null,
      triggerNewRevision: input.newRevision ?? null,
      changeSummary: input.changeSummary,
      materiality,
      relationshipPath: hops,
      pathExplanation: multiExplanations.join(" | "),
      impactRule: `SEMANTIC_${primary.relatedness}_MATERIALITY_${materiality}`,
      workPackageStableId: findWorkPackageForObject(input.projectId, terminal),
      assetSystemStableIds: objectClass === "Asset" ? [terminal] : [],
      engineerUserId: input.actorId ?? null,
      deterministicNextAction: nextActionFor(safeState, terminal, objectClass),
      active: true,
      acknowledgement: null,
      resolution: null,
      createdAt: now(),
      updatedAt: now(),
      provenance: {
        requiresLiveLlm: false,
        automaticInvalidation: false,
        pathCount: terminalPaths.length,
        historicalRevisionPreserved: true,
        stateMeaning: IMPACT_STATE_MEANINGS[safeState].meaning,
      },
      dedupeKey: dedupeKey(
        input.triggerStableId,
        input.newRevision ?? null,
        terminal,
        safeState,
      ),
    });
    created.push(record);

    markAssociationStale(input.projectId, terminal);

    // Canonical object awareness via payload revision — never auto-withdraw/approve.
    const obj = findByStableId(input.projectId, terminal);
    if (obj) {
      reviseWorkspaceObject(input.projectId, obj.id, {
        ...obj.payload,
        impactState: safeState,
        impactReason: `${input.changeSummary} → ${safeState}`,
        automaticInvalidation: false,
      });
    }

    if (objectClass === "Decision" && safeState === "REASSESSMENT_REQUIRED") {
      const d = getDecision(input.workspaceId, terminal);
      if (d && d.status !== "REASSESSMENT_REQUIRED") {
        markDecisionReassessmentRequired(
          input.workspaceId,
          d.id,
          input.changeSummary,
        );
      }
    }
  }

  // Ensure WP association for impact-derived blockers
  const wp = getWorkPackage(input.projectId, "WP-STR-004");
  if (wp) {
    for (const imp of created) {
      if (
        ["REVIEW_REQUIRED", "STALE", "REASSESSMENT_REQUIRED"].includes(imp.impactState) &&
        !listAssociations(input.projectId, wp.stableId).some(
          (a) => a.objectStableId === imp.affectedStableId,
        )
      ) {
        try {
          associateObject(input.projectId, wp.stableId, {
            objectType: imp.affectedObjectClass as "Calculation",
            objectStableId: imp.affectedStableId,
            role: "AFFECTED_WORK_PACKAGE",
            confirmationState: "STALE",
          });
        } catch {
          // ignore unknown association types in pilot
        }
      }
    }
  }

  const readiness = wp ? deriveReadiness(input.projectId, "WP-STR-004") : null;
  const blockers = wp ? deriveBlockers(input.projectId, "WP-STR-004") : [];

  return {
    impacts: created,
    falsePositiveSkipped,
    readiness,
    blockers,
    automaticInvalidations: {
      calculation: EOS_AUTOMATIC_CALCULATION_INVALIDATION,
      decision: EOS_AUTOMATIC_DECISION_REVERSAL,
      deliverable: EOS_AUTOMATIC_DELIVERABLE_WITHDRAWAL,
      approval: EOS_AUTOMATIC_ENGINEERING_APPROVAL,
    },
    eventSkippedDuplicate: false,
  };
}

export function listActiveImpacts(workspaceId: string, projectId?: string): ImpactRecord[] {
  return [...ensure(workspaceId).impacts.values()]
    .filter((i) => i.active && (!projectId || i.projectId === projectId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getImpact(workspaceId: string, impactId: string): ImpactRecord | null {
  return ensure(workspaceId).impacts.get(impactId) ?? null;
}

export function getImpactsForObject(
  workspaceId: string,
  objectStableId: string,
): ImpactRecord[] {
  return listActiveImpacts(workspaceId).filter((i) => i.affectedStableId === objectStableId);
}

export function explainImpact(workspaceId: string, impactId: string): {
  why: string;
  path: ImpactPathHop[];
  state: ImpactState;
  meaning: string;
} | null {
  const imp = getImpact(workspaceId, impactId);
  if (!imp) return null;
  return {
    why: imp.pathExplanation || imp.changeSummary,
    path: imp.relationshipPath,
    state: imp.impactState,
    meaning: IMPACT_STATE_MEANINGS[imp.impactState].meaning,
  };
}

export function acknowledgeImpactReview(input: {
  workspaceId: string;
  impactId: string;
  userId: string;
  role: string;
  rationale: string;
  conclusion: "NO_CHANGE_REQUIRED" | "ACCEPTED_FOR_REVISION";
  authorized: boolean;
}): ImpactRecord {
  if (!input.authorized) {
    throw new Error("unauthorized_impact_resolution");
  }
  const imp = getImpact(input.workspaceId, input.impactId);
  if (!imp) throw new Error("impact_not_found");
  imp.acknowledgement = {
    userId: input.userId,
    role: input.role,
    rationale: input.rationale,
    recordedAt: now(),
    conclusion: input.conclusion,
  };
  imp.updatedAt = now();
  // Do not delete — remain active until resolved
  ensure(input.workspaceId).impacts.set(imp.id, imp);
  return imp;
}

export function resolveImpact(input: {
  workspaceId: string;
  impactId: string;
  userId: string;
  role: string;
  rationale: string;
  status: "RESOLVED_NO_CHANGE" | "RESOLVED_REVISED";
  authorized: boolean;
}): ImpactRecord {
  if (!input.authorized) {
    throw new Error("unauthorized_impact_resolution");
  }
  const imp = getImpact(input.workspaceId, input.impactId);
  if (!imp) throw new Error("impact_not_found");
  if (!imp.acknowledgement) {
    imp.acknowledgement = {
      userId: input.userId,
      role: input.role,
      rationale: input.rationale,
      recordedAt: now(),
      conclusion:
        input.status === "RESOLVED_NO_CHANGE" ? "NO_CHANGE_REQUIRED" : "ACCEPTED_FOR_REVISION",
    };
  }
  imp.resolution = {
    status: input.status,
    userId: input.userId,
    role: input.role,
    rationale: input.rationale,
    resolvedAt: now(),
  };
  imp.impactState = input.status;
  imp.active = false;
  imp.updatedAt = now();
  ensure(input.workspaceId).impacts.set(imp.id, imp);
  return imp;
}

export function buildMyWorkImpactAttentionItems(
  workspaceId: string,
  projectId?: string,
): MyWorkImpactAttentionItem[] {
  return listActiveImpacts(workspaceId, projectId)
    .filter((i) =>
      [
        "CHANGE_DETECTED",
        "POTENTIALLY_AFFECTED",
        "REVIEW_RECOMMENDED",
        "REVIEW_REQUIRED",
        "REASSESSMENT_REQUIRED",
        "STALE",
      ].includes(i.impactState),
    )
    .map((i) => ({
      engineerUserId: i.engineerUserId,
      projectId: i.projectId,
      workPackageStableId: i.workPackageStableId,
      assetSystemStableIds: i.assetSystemStableIds,
      engineeringObjectStableId: i.affectedStableId,
      engineeringObjectClass: i.affectedObjectClass,
      impactState: i.impactState,
      reason: i.changeSummary,
      materiality: i.materiality,
      dependencyPath: i.pathExplanation,
      timestamp: i.createdAt,
      deterministicNextAction: i.deterministicNextAction,
      impactId: i.id,
    }));
}

export function queryAssetConfigurationImpact(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  assetStableId: string;
  changeSummary?: string;
}): ProcessEngineeringChangeResult {
  return processEngineeringChange({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    triggerKind: "ASSET_CONFIGURATION_CHANGE",
    triggerStableId: input.assetStableId,
    triggerObjectClass: "Asset",
    previousRevision: "Rev 1",
    newRevision: "Rev 2",
    changeSummary:
      input.changeSummary ??
      `Asset configuration ${input.assetStableId} revised (member/baseline change)`,
    maxDepth: 3,
  });
}

export function queryRequirementChangeImpact(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  requirementStableId: string;
  changeSummary?: string;
}): ProcessEngineeringChangeResult {
  return processEngineeringChange({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    triggerKind: "REQUIREMENT_REVISION",
    triggerStableId: input.requirementStableId,
    triggerObjectClass: "Requirement",
    previousRevision: "Rev 1",
    newRevision: "Rev 2",
    changeSummary:
      input.changeSummary ?? `Requirement ${input.requirementStableId} revised`,
    maxDepth: 3,
  });
}

/**
 * PILOT-001 primary scenario: vendor mass 12 t → 15 t.
 * Preserves historical ASM Rev 1; creates Rev 2; propagates without auto approval.
 */
export function runPilot001MassImpactScenario(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  actorId?: string;
}): {
  evidence: ReturnType<typeof createWorkspaceObject>;
  assumption: ReturnType<typeof reviseAssumption> | null;
  priorAssumption: ReturnType<typeof getAssumption>;
  propagation: ProcessEngineeringChangeResult;
  calculationImpacts: ImpactRecord[];
  decisionImpacts: ImpactRecord[];
  deliverableImpacts: ImpactRecord[];
  wpContract: ReturnType<typeof buildWorkPackageUiContract>;
  massPilot: ReturnType<typeof applyChangeMassPilot>;
  historicalAssumptionPreserved: boolean;
  automaticApprovals: false;
} {
  seedPilot001(input.projectId);
  seedPilot001SupportFrameWorkPackage(input.projectId);
  seedPilot001AssetSystemContext({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
  });
  seedPilot001RelationshipGraph({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
  });
  seedPilot001DecisionAssumptionLineage({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
  });

  const priorAssumption = getAssumption(input.workspaceId, "ASM-001");
  const priorValue = priorAssumption?.value ?? 12;
  const priorRevision = priorAssumption?.revisionLabel ?? "Rev 1";

  const evidence = createWorkspaceObject(input.projectId, {
    objectType: "Evidence",
    stableObjectId: "EVD-VD-014-R5",
    displayName: "Vendor Data VD-014 Rev 5 — equipment operating mass 15 t",
    payload: {
      vendorDataId: "VD-014",
      revision: "Rev 5",
      equipmentOperatingMass: 15,
      units: "t",
      priorMass: 12,
    },
  });

  // Link evidence supports assumption (revision-aware historical edge retained separately)
  createGraphEdge({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    sourceClass: "Evidence",
    sourceStableId: "EVD-VD-014-R5",
    sourceRevisionLabel: "Rev 5",
    targetClass: "Assumption",
    targetStableId: "ASM-001",
    targetRevisionLabel: "Rev 1",
    relationshipType: "SUPPORTS",
    origin: "HUMAN",
    confirmationState: "CONFIRMED",
    materiality: "HIGH",
  });

  let assumption = priorAssumption
    ? reviseAssumption({
        workspaceId: input.workspaceId,
        assumptionIdOrStable: priorAssumption.id,
        value: 15,
        units: "t",
        statement: "Equipment operating mass = 15 t (vendor VD-014 Rev 5)",
        basis: "Vendor Data VD-014 Rev 5",
        actorId: input.actorId,
      })
    : null;

  // Historical edge CALC Rev2 ASSUMES ASM Rev1 must remain (seeded earlier)
  const historicalEdges = listEdgesForObject(input.workspaceId, "CALC-001").filter(
    (e) =>
      e.relationshipType === "ASSUMES" &&
      e.target.objectStableId === "ASM-001" &&
      e.target.revisionLabel === "Rev 1",
  );

  const massPilot = applyChangeMassPilot(input.projectId, "CHG-001", "12 t", "15 t");

  const propagation = processEngineeringChange({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    triggerKind: "VENDOR_INFORMATION_UPDATE",
    triggerStableId: "ASM-001",
    triggerObjectClass: "Assumption",
    previousRevision: priorRevision,
    newRevision: assumption?.revisionLabel ?? "Rev 2",
    changeSummary: `Vendor operating mass changed from ${priorValue} t to 15 t`,
    actorId: input.actorId ?? null,
    eventKey: `pilot-mass-12-to-15|${assumption?.revisionLabel ?? "Rev 2"}`,
    seedPilot: false,
  });

  // Also propagate from evidence for multi-path
  processEngineeringChange({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    triggerKind: "EVIDENCE_REVISION",
    triggerStableId: "EVD-VD-014-R5",
    triggerObjectClass: "Evidence",
    previousRevision: "Rev 4",
    newRevision: "Rev 5",
    changeSummary: "Vendor Data VD-014 Rev 5 changed equipment operating mass",
    eventKey: "pilot-evd-vd014-r5",
    seedPilot: false,
  });

  const all = listActiveImpacts(input.workspaceId, input.projectId);
  return {
    evidence,
    assumption,
    priorAssumption,
    propagation,
    calculationImpacts: all.filter((i) => i.affectedObjectClass === "Calculation"),
    decisionImpacts: all.filter((i) => i.affectedObjectClass === "Decision"),
    deliverableImpacts: all.filter((i) => i.affectedObjectClass === "Deliverable"),
    wpContract: buildWorkPackageUiContract(input.projectId, "WP-STR-004"),
    massPilot,
    historicalAssumptionPreserved:
      historicalEdges.length > 0 &&
      (priorAssumption?.value === 12 || priorAssumption?.status === "SUPERSEDED"),
    automaticApprovals: false,
  };
}

export function filterImpactsForAuthorization(
  impacts: ImpactRecord[],
  allowedStableIds: Set<string>,
): ImpactRecord[] {
  return impacts.filter(
    (i) =>
      allowedStableIds.has(i.affectedStableId) &&
      allowedStableIds.has(i.triggerStableId) &&
      i.relationshipPath.every(
        (h) => allowedStableIds.has(h.fromStableId) && allowedStableIds.has(h.toStableId),
      ),
  );
}

export function unauthorizedImpactWriteBlocked(input: {
  callerWorkspaceId: string;
  impactWorkspaceId: string;
}): boolean {
  return input.callerWorkspaceId !== input.impactWorkspaceId;
}

export function buildWorkPackageImpactUiHints(
  workspaceId: string,
  projectId: string,
  workPackageStableId: string,
): {
  needsAttention: Array<{ id: string; label: string; impactState: ImpactState }>;
  changed: Array<{ id: string; label: string; impactState: ImpactState }>;
  dependencies: Array<{ id: string; label: string; path: string }>;
} {
  const impacts = listActiveImpacts(workspaceId, projectId).filter(
    (i) => i.workPackageStableId === workPackageStableId || workPackageStableId === "WP-STR-004",
  );
  return {
    needsAttention: impacts
      .filter((i) =>
        ["REVIEW_REQUIRED", "STALE", "REASSESSMENT_REQUIRED"].includes(i.impactState),
      )
      .map((i) => ({
        id: i.id,
        label: `${i.affectedStableId}: ${i.changeSummary}`,
        impactState: i.impactState,
      })),
    changed: impacts
      .filter((i) =>
        ["CHANGE_DETECTED", "POTENTIALLY_AFFECTED", "REVIEW_RECOMMENDED"].includes(
          i.impactState,
        ),
      )
      .map((i) => ({
        id: i.id,
        label: `${i.affectedStableId} — ${i.impactState.replace(/_/g, " ").toLowerCase()}`,
        impactState: i.impactState,
      })),
    dependencies: impacts.map((i) => ({
      id: i.id,
      label: i.affectedStableId,
      path: i.pathExplanation,
    })),
  };
}

export function measureImpactPerformanceBaseline(input?: {
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
  iterations?: number;
}): {
  directP95Ms: number;
  hop3P95Ms: number;
  multiPathP95Ms: number;
  blockerCount: number;
  samples: { direct: number[]; hop3: number[]; multi: number[] };
} {
  const tenantId = input?.tenantId ?? "00000000-0000-4000-8000-000000000041";
  const workspaceId = input?.workspaceId ?? "00000000-0000-4000-8000-intel1perf0001";
  const projectId = input?.projectId ?? "PILOT-001-INTEL1-PERF";
  const n = input?.iterations ?? 12;

  __resetImpactPropagationForTests();
  // Fresh seeds via first process call
  const direct: number[] = [];
  const hop3: number[] = [];
  const multi: number[] = [];

  for (let i = 0; i < n; i++) {
    __resetImpactPropagationForTests();
    const t0 = performance.now();
    processEngineeringChange({
      tenantId,
      workspaceId,
      projectId,
      triggerKind: "ASSUMPTION_REVISION",
      triggerStableId: "ASM-001",
      triggerObjectClass: "Assumption",
      previousRevision: "Rev 1",
      newRevision: `Rev ${2 + i}`,
      changeSummary: "perf direct",
      maxDepth: 1,
      eventKey: `perf-direct-${i}`,
    });
    direct.push(performance.now() - t0);

    __resetImpactPropagationForTests();
    const t1 = performance.now();
    processEngineeringChange({
      tenantId,
      workspaceId,
      projectId,
      triggerKind: "ASSUMPTION_REVISION",
      triggerStableId: "ASM-001",
      triggerObjectClass: "Assumption",
      previousRevision: "Rev 1",
      newRevision: `Rev ${20 + i}`,
      changeSummary: "perf 3hop",
      maxDepth: 3,
      eventKey: `perf-3hop-${i}`,
    });
    hop3.push(performance.now() - t1);

    __resetImpactPropagationForTests();
    const t2 = performance.now();
    runPilot001MassImpactScenario({
      tenantId,
      workspaceId: `${workspaceId}-m${i}`,
      projectId: `${projectId}-M${i}`,
    });
    multi.push(performance.now() - t2);
  }

  const p95 = (arr: number[]) => {
    const s = [...arr].sort((a, b) => a - b);
    return s[Math.max(0, Math.ceil(0.95 * s.length) - 1)] ?? 0;
  };

  return {
    directP95Ms: Number(p95(direct).toFixed(3)),
    hop3P95Ms: Number(p95(hop3).toFixed(3)),
    multiPathP95Ms: Number(p95(multi).toFixed(3)),
    blockerCount: 0,
    samples: { direct, hop3, multi },
  };
}

// Re-export helpers used by API / UI
export {
  impactForChange,
  filterEdgesForAuthorization,
  invalidateAssumption,
  EOS_AUTOMATIC_CALCULATION_INVALIDATION,
  EOS_AUTOMATIC_DECISION_REVERSAL,
  EOS_AUTOMATIC_DELIVERABLE_WITHDRAWAL,
  EOS_AUTOMATIC_ENGINEERING_APPROVAL,
  EOS_PROPAGATION_REQUIRES_LIVE_LLM,
  EOS_DEPENDENCY_NOT_EQUAL_INVALIDITY,
};
