/**
 * EOS-3-DOMAIN-3 — Relationship Graph Core.
 * Relational adjacency/edge model. References canonical objects — does not clone them.
 * Composes Domain-1 WP deps + Domain-2 context edges. No Neo4j. No shadow object store.
 * Staleness propagation is NOT implemented here.
 */

import {
  assertAllowedEndpoint,
  auditDigitalThreadCompatibility,
  getRelationshipTypeDefinition,
  inverseDisplay,
  isRegisteredRelationshipType,
  resolveRelationshipType,
  type RelationshipOriginPolicy,
} from "./eos3-relationship-type-registry";
import {
  listDependencies,
  listAssociations,
  seedPilot001SupportFrameWorkPackage,
  getWorkPackage,
} from "./eos3-work-package-service";
import {
  listContextRelationships,
  listWorkPackageContextLinks,
  seedPilot001AssetSystemContext,
  getContextNode,
} from "./eos3-asset-system-context";

export type GraphNodeRef = {
  objectClass: string;
  objectStableId: string;
  objectId: string | null;
  revisionId: string | null;
  revisionLabel: string | null;
};

export type RelationshipStatus = "ACTIVE" | "SUPERSEDED" | "RETIRED" | "INVALIDATED";

export type RelationshipRelatedness =
  | "RELATED"
  | "DEPENDENT"
  | "POTENTIALLY_AFFECTED"
  | "EXPLICITLY_AFFECTED";

export type GraphEdge = {
  relationshipId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string | null;
  source: GraphNodeRef;
  target: GraphNodeRef;
  relationshipType: string;
  status: RelationshipStatus;
  origin: RelationshipOriginPolicy;
  inferenceBasis: string | null;
  confidence: number | null;
  confirmationState: "CONFIRMED" | "PROPOSED" | "REJECTED" | "NOT_REQUIRED";
  evidenceRefs: string[];
  materiality: "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";
  relatedness: RelationshipRelatedness;
  effectiveAt: string | null;
  createdBy: string | null;
  createdAt: string;
  supersededByRelationshipId: string | null;
  supersedesRelationshipId: string | null;
  provenance: Record<string, unknown>;
};

export type GraphPathHop = {
  edge: GraphEdge;
  explanation: string;
};

export type GraphPath = {
  hops: GraphPathHop[];
  terminalStableId: string;
  relatedness: RelationshipRelatedness;
  explanation: string;
};

export type DependencyUiContract = {
  engineeringLanguage: true;
  labels: {
    dependencies: "Dependencies";
    relatedWork: "Related Work";
    inputs: "Inputs";
    outputs: "Outputs";
    evidence: "Evidence";
    affectedItems: "Affected Items";
    supportingInformation: "Supporting Information";
  };
  upstream: Array<{ from: string; type: string; to: string; display: string }>;
  downstream: Array<{ from: string; type: string; to: string; display: string }>;
  pathExplanation: string[];
};

type WorkspaceGraph = {
  edges: GraphEdge[];
};

const graphs = new Map<string, WorkspaceGraph>();

function id() {
  return crypto.randomUUID();
}
function now() {
  return new Date().toISOString();
}

function ensureGraph(workspaceId: string): WorkspaceGraph {
  let g = graphs.get(workspaceId);
  if (!g) {
    g = { edges: [] };
    graphs.set(workspaceId, g);
  }
  return g;
}

export function __resetRelationshipGraphForTests() {
  graphs.clear();
}

export type CreateGraphEdgeInput = {
  tenantId: string;
  workspaceId: string;
  projectId?: string | null;
  sourceClass: string;
  sourceStableId: string;
  sourceObjectId?: string | null;
  sourceRevisionId?: string | null;
  sourceRevisionLabel?: string | null;
  targetClass: string;
  targetStableId: string;
  targetObjectId?: string | null;
  targetRevisionId?: string | null;
  targetRevisionLabel?: string | null;
  relationshipType: string;
  origin?: RelationshipOriginPolicy;
  inferenceBasis?: string | null;
  confidence?: number | null;
  confirmationState?: GraphEdge["confirmationState"];
  evidenceRefs?: string[];
  materiality?: GraphEdge["materiality"];
  relatedness?: RelationshipRelatedness;
  createdBy?: string | null;
  effectiveAt?: string | null;
  /** If material inferred — must not auto-confirm without policy. */
  material?: boolean;
};

/**
 * Create governed edge. Does not clone object payloads.
 * Creating a relationship does not grant authority over either object.
 */
export function createGraphEdge(input: CreateGraphEdgeInput): GraphEdge {
  const type = resolveRelationshipType(input.relationshipType);
  if (!isRegisteredRelationshipType(type)) {
    throw new Error("unregistered_relationship_type");
  }
  const constraint = assertAllowedEndpoint(type, input.sourceClass, input.targetClass);
  if (!constraint.ok) throw new Error(constraint.reason);

  const defn = getRelationshipTypeDefinition(type)!;
  const origin = input.origin ?? "HUMAN";
  const material = input.material ?? defn.materialityDefault === "HIGH";
  let confirmationState = input.confirmationState;
  if (confirmationState == null) {
    if (origin === "INFERRED" && material && defn.mustBeExplicitIfMaterial) {
      confirmationState = "PROPOSED"; // no silent material engineering fact
    } else if (origin === "INFERRED" && !material && defn.mayBeInferred) {
      confirmationState = "NOT_REQUIRED";
    } else {
      confirmationState = "CONFIRMED";
    }
  }

  // For symmetric types, canonicalize direction by stable id order for duplicate control
  let sourceClass = input.sourceClass;
  let sourceStableId = input.sourceStableId;
  let sourceObjectId = input.sourceObjectId ?? null;
  let sourceRevisionId = input.sourceRevisionId ?? null;
  let sourceRevisionLabel = input.sourceRevisionLabel ?? null;
  let targetClass = input.targetClass;
  let targetStableId = input.targetStableId;
  let targetObjectId = input.targetObjectId ?? null;
  let targetRevisionId = input.targetRevisionId ?? null;
  let targetRevisionLabel = input.targetRevisionLabel ?? null;

  if (defn.symmetric && sourceStableId > targetStableId) {
    [sourceClass, targetClass] = [targetClass, sourceClass];
    [sourceStableId, targetStableId] = [targetStableId, sourceStableId];
    [sourceObjectId, targetObjectId] = [targetObjectId, sourceObjectId];
    [sourceRevisionId, targetRevisionId] = [targetRevisionId, sourceRevisionId];
    [sourceRevisionLabel, targetRevisionLabel] = [targetRevisionLabel, sourceRevisionLabel];
  }

  const g = ensureGraph(input.workspaceId);
  const dup = g.edges.find(
    (e) =>
      e.status === "ACTIVE" &&
      e.relationshipType === type &&
      e.source.objectStableId === sourceStableId &&
      e.target.objectStableId === targetStableId &&
      (e.source.revisionId ?? null) === (sourceRevisionId ?? null) &&
      (e.target.revisionId ?? null) === (targetRevisionId ?? null),
  );
  if (dup) {
    // Associate additional evidence rather than duplicate edge
    if (input.evidenceRefs?.length) {
      for (const ev of input.evidenceRefs) {
        if (!dup.evidenceRefs.includes(ev)) dup.evidenceRefs.push(ev);
      }
    }
    return dup;
  }

  const relatedness: RelationshipRelatedness =
    input.relatedness ??
    (type === "AFFECTS" || type === "MODIFIES"
      ? "EXPLICITLY_AFFECTED"
      : type === "REQUIRES" || type === "ASSUMES" || type === "BLOCKS"
        ? "DEPENDENT"
        : type === "SUPPORTS" || type === "APPLIES_TO"
          ? "RELATED"
          : "RELATED");

  // Never claim AFFECTED unless semantics support it
  const edge: GraphEdge = {
    relationshipId: id(),
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId ?? null,
    source: {
      objectClass: sourceClass,
      objectStableId: sourceStableId,
      objectId: sourceObjectId,
      revisionId: sourceRevisionId,
      revisionLabel: sourceRevisionLabel,
    },
    target: {
      objectClass: targetClass,
      objectStableId: targetStableId,
      objectId: targetObjectId,
      revisionId: targetRevisionId,
      revisionLabel: targetRevisionLabel,
    },
    relationshipType: type,
    status: "ACTIVE",
    origin,
    inferenceBasis: input.inferenceBasis ?? null,
    confidence: input.confidence ?? (origin === "INFERRED" ? 0.7 : 1),
    confirmationState,
    evidenceRefs: [...(input.evidenceRefs ?? [])],
    materiality: input.materiality ?? defn.materialityDefault,
    relatedness,
    effectiveAt: input.effectiveAt ?? now(),
    createdBy: input.createdBy ?? null,
    createdAt: now(),
    supersededByRelationshipId: null,
    supersedesRelationshipId: null,
    provenance: {
      source: "eos3.relationship-graph.domain-3",
      grantsEngineeringAuthority: false,
      duplicateObjectStore: false,
      inProcessGraphSourceOfTruth: false,
      canonicalObjectsRemainSourceOfTruth: true,
      stalenessPropagation: false,
      phase3GraphCompatible: true,
    },
  };
  g.edges.push(edge);
  return edge;
}

export function supersedeGraphEdge(input: {
  workspaceId: string;
  oldRelationshipId: string;
  replacement: CreateGraphEdgeInput;
}): { old: GraphEdge; neu: GraphEdge } {
  const g = ensureGraph(input.workspaceId);
  const old = g.edges.find((e) => e.relationshipId === input.oldRelationshipId);
  if (!old) throw new Error("relationship_not_found");
  const neu = createGraphEdge(input.replacement);
  old.status = "SUPERSEDED";
  old.supersededByRelationshipId = neu.relationshipId;
  neu.supersedesRelationshipId = old.relationshipId;
  // Historical revision refs on old edge remain unchanged
  return { old, neu };
}

export function getGraphEdge(workspaceId: string, relationshipId: string): GraphEdge | null {
  return ensureGraph(workspaceId).edges.find((e) => e.relationshipId === relationshipId) ?? null;
}

export function listEdgesForObject(
  workspaceId: string,
  objectStableId: string,
  opts?: { status?: RelationshipStatus; types?: string[]; projectId?: string },
): GraphEdge[] {
  return ensureGraph(workspaceId).edges.filter((e) => {
    if (opts?.status && e.status !== opts.status) return false;
    if (opts?.projectId && e.projectId && e.projectId !== opts.projectId) return false;
    if (opts?.types && !opts.types.includes(e.relationshipType)) return false;
    return (
      e.source.objectStableId === objectStableId || e.target.objectStableId === objectStableId
    );
  });
}

function activeEdges(workspaceId: string, projectId?: string | null): GraphEdge[] {
  return ensureGraph(workspaceId).edges.filter(
    (e) =>
      e.status === "ACTIVE" &&
      (projectId == null || e.projectId == null || e.projectId === projectId),
  );
}

/** Downstream = outgoing edges from node (source → target). */
export function getDownstream(
  workspaceId: string,
  objectStableId: string,
  opts?: { types?: string[]; projectId?: string },
): GraphEdge[] {
  return activeEdges(workspaceId, opts?.projectId).filter(
    (e) =>
      e.source.objectStableId === objectStableId &&
      (!opts?.types || opts.types.includes(e.relationshipType)),
  );
}

/** Upstream = incoming edges to node (others → this). */
export function getUpstream(
  workspaceId: string,
  objectStableId: string,
  opts?: { types?: string[]; projectId?: string },
): GraphEdge[] {
  return activeEdges(workspaceId, opts?.projectId).filter(
    (e) =>
      e.target.objectStableId === objectStableId &&
      (!opts?.types || opts.types.includes(e.relationshipType)),
  );
}

export function getDependencies(workspaceId: string, objectStableId: string, projectId?: string) {
  // What this depends on: REQUIRES / ASSUMES / CONSUMES targets
  return getDownstream(workspaceId, objectStableId, {
    types: ["REQUIRES", "ASSUMES", "CONSUMES", "DERIVED_FROM"],
    projectId,
  });
}

export function getDependents(workspaceId: string, objectStableId: string, projectId?: string) {
  return getUpstream(workspaceId, objectStableId, {
    types: ["REQUIRES", "ASSUMES", "CONSUMES", "SUPPORTS", "BLOCKS", "APPLIES_TO", "MODIFIES", "AFFECTS"],
    projectId,
  });
}

export function getSupportingEvidence(workspaceId: string, objectStableId: string): GraphEdge[] {
  return getUpstream(workspaceId, objectStableId, { types: ["SUPPORTS", "JUSTIFIES"] }).filter(
    (e) => e.source.objectClass === "Evidence" || e.source.objectClass === "Document",
  );
}

export function getRelatedObjects(workspaceId: string, objectStableId: string): GraphEdge[] {
  return listEdgesForObject(workspaceId, objectStableId, { status: "ACTIVE" });
}

export type TraversalOptions = {
  maxDepth: number;
  direction: "upstream" | "downstream" | "both";
  types?: string[];
  objectClasses?: string[];
  projectId?: string;
};

/**
 * Cycle-safe bounded traversal. Does not mark objects stale.
 * Relatedness is never overclaimed to AFFECTED without semantic support.
 */
export function boundedTraversal(
  workspaceId: string,
  startStableId: string,
  opts: TraversalOptions,
): GraphPath[] {
  const maxDepth = Math.max(1, opts.maxDepth);
  const paths: GraphPath[] = [];

  type Frame = {
    node: string;
    depth: number;
    hops: GraphPathHop[];
    visited: Set<string>;
  };
  const stack: Frame[] = [
    { node: startStableId, depth: 0, hops: [], visited: new Set([startStableId]) },
  ];

  while (stack.length) {
    const frame = stack.pop()!;
    if (frame.depth >= maxDepth) {
      if (frame.hops.length) {
        paths.push(finalizePath(frame.hops));
      }
      continue;
    }

    const outs: GraphEdge[] = [];
    if (opts.direction === "downstream" || opts.direction === "both") {
      outs.push(...getDownstream(workspaceId, frame.node, { types: opts.types, projectId: opts.projectId }));
    }
    if (opts.direction === "upstream" || opts.direction === "both") {
      outs.push(...getUpstream(workspaceId, frame.node, { types: opts.types, projectId: opts.projectId }));
    }

    let expanded = false;
    for (const edge of outs) {
      const next =
        edge.source.objectStableId === frame.node
          ? edge.target.objectStableId
          : edge.source.objectStableId;
      const nextClass =
        edge.source.objectStableId === frame.node
          ? edge.target.objectClass
          : edge.source.objectClass;
      if (opts.objectClasses && !opts.objectClasses.includes(nextClass)) continue;
      if (frame.visited.has(next)) continue; // cycle protection
      expanded = true;
      const hop: GraphPathHop = {
        edge,
        explanation: explainEdge(edge),
      };
      const nextVisited = new Set(frame.visited);
      nextVisited.add(next);
      stack.push({
        node: next,
        depth: frame.depth + 1,
        hops: [...frame.hops, hop],
        visited: nextVisited,
      });
    }
    if (!expanded && frame.hops.length) {
      paths.push(finalizePath(frame.hops));
    }
  }

  return paths;
}

function explainEdge(edge: GraphEdge): string {
  const src = formatNode(edge.source);
  const tgt = formatNode(edge.target);
  return `${src} ${edge.relationshipType} ${tgt}`;
}

function formatNode(n: GraphNodeRef): string {
  return n.revisionLabel
    ? `${n.objectStableId} ${n.revisionLabel}`
    : n.objectStableId;
}

function finalizePath(hops: GraphPathHop[]): GraphPath {
  const last = hops[hops.length - 1]!;
  const terminal =
    last.edge.source.objectStableId === hops[0]?.edge.source.objectStableId && hops.length === 1
      ? last.edge.target.objectStableId
      : last.edge.target.objectStableId === hops[hops.length - 1]!.edge.target.objectStableId
        ? last.edge.target.objectStableId
        : last.edge.target.objectStableId;

  // Prefer strongest relatedness without overclaiming
  let relatedness: RelationshipRelatedness = "RELATED";
  for (const h of hops) {
    if (h.edge.relatedness === "EXPLICITLY_AFFECTED") relatedness = "EXPLICITLY_AFFECTED";
    else if (h.edge.relatedness === "DEPENDENT" && relatedness !== "EXPLICITLY_AFFECTED")
      relatedness = "DEPENDENT";
    else if (
      h.edge.relatedness === "POTENTIALLY_AFFECTED" &&
      relatedness === "RELATED"
    )
      relatedness = "POTENTIALLY_AFFECTED";
  }

  return {
    hops,
    terminalStableId: terminal,
    relatedness,
    explanation: hops.map((h) => h.explanation).join(" → "),
  };
}

export function explainPath(path: GraphPath): string {
  return path.hops
    .map((h) => {
      const inv = inverseDisplay(
        h.edge.relationshipType,
        formatNode(h.edge.source),
        formatNode(h.edge.target),
      );
      return `${h.explanation} (${inv})`;
    })
    .join(" → ");
}

export function buildDependencyUiContract(
  workspaceId: string,
  objectStableId: string,
  projectId?: string,
): DependencyUiContract {
  const up = getUpstream(workspaceId, objectStableId, { projectId });
  const down = getDownstream(workspaceId, objectStableId, { projectId });
  const paths = boundedTraversal(workspaceId, objectStableId, {
    maxDepth: 3,
    direction: "both",
    projectId,
  });
  return {
    engineeringLanguage: true,
    labels: {
      dependencies: "Dependencies",
      relatedWork: "Related Work",
      inputs: "Inputs",
      outputs: "Outputs",
      evidence: "Evidence",
      affectedItems: "Affected Items",
      supportingInformation: "Supporting Information",
    },
    upstream: up.map((e) => ({
      from: formatNode(e.source),
      type: e.relationshipType,
      to: formatNode(e.target),
      display: explainEdge(e),
    })),
    downstream: down.map((e) => ({
      from: formatNode(e.source),
      type: e.relationshipType,
      to: formatNode(e.target),
      display: explainEdge(e),
    })),
    pathExplanation: paths.slice(0, 10).map((p) => p.explanation),
  };
}

/**
 * Authorization filter: never disclose edges whose endpoints are outside allowed set.
 */
export function filterEdgesForAuthorization(
  edges: GraphEdge[],
  allowedStableIds: Set<string>,
): GraphEdge[] {
  return edges.filter(
    (e) =>
      allowedStableIds.has(e.source.objectStableId) &&
      allowedStableIds.has(e.target.objectStableId),
  );
}

export function unauthorizedRelationshipWriteBlocked(input: {
  callerWorkspaceId: string;
  edgeWorkspaceId: string;
}): boolean {
  return input.callerWorkspaceId !== input.edgeWorkspaceId;
}

/** Compose Domain-1 WP dependencies into graph without duplicating the WP dependency model. */
export function composeWorkPackageDependenciesIntoGraph(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  workPackageStableId: string;
}): GraphEdge[] {
  const deps = listDependencies(input.projectId, input.workPackageStableId);
  const created: GraphEdge[] = [];
  for (const d of deps) {
    const src = getWorkPackage(input.projectId, d.sourceWorkPackageId);
    const tgt = getWorkPackage(input.projectId, d.targetWorkPackageId);
    if (!src || !tgt) continue;
    const type =
      d.dependencyType === "REQUIRES" || d.dependencyType === "DEPENDS_ON"
        ? "REQUIRES"
        : "AFFECTS";
    created.push(
      createGraphEdge({
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        projectId: input.projectId,
        sourceClass: "WorkPackage",
        sourceStableId: src.stableId,
        targetClass: "WorkPackage",
        targetStableId: tgt.stableId,
        relationshipType: type,
        origin: "SYSTEM_DERIVED",
        inferenceBasis: "Composed from Domain-1 Work Package dependency foundation",
        confirmationState: "CONFIRMED",
      }),
    );
  }
  // Associations — compose without inventing unsupported type pairs
  for (const a of listAssociations(input.projectId, input.workPackageStableId)) {
    const relationshipType =
      a.objectType === "Deliverable"
        ? "PRODUCES"
        : a.objectType === "Assumption" || a.objectType === "Evidence" || a.objectType === "Document"
          ? "REQUIRES"
          : "ASSOCIATED_WITH";
    created.push(
      createGraphEdge({
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        projectId: input.projectId,
        sourceClass: "WorkPackage",
        sourceStableId: input.workPackageStableId,
        targetClass: a.objectType,
        targetStableId: a.objectStableId,
        relationshipType,
        origin: "SYSTEM_DERIVED",
        inferenceBasis: "Composed from Domain-1 Work Package associations",
        confirmationState: "CONFIRMED",
      }),
    );
  }
  return created;
}

/** Compose Domain-2 context relationships into graph without duplicating Domain-2 model. */
export function composeAssetSystemRelationshipsIntoGraph(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
}): GraphEdge[] {
  const rels = listContextRelationships(input.workspaceId);
  const created: GraphEdge[] = [];
  for (const r of rels) {
    const from = getContextNode(input.workspaceId, r.fromStableId);
    const to = getContextNode(input.workspaceId, r.toStableId);
    created.push(
      createGraphEdge({
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        projectId: input.projectId,
        sourceClass: from ? mapContextKind(from.contextKind) : "Asset",
        sourceStableId: r.fromStableId,
        targetClass: to ? mapContextKind(to.contextKind) : "Asset",
        targetStableId: r.toStableId,
        relationshipType: r.relationshipType,
        origin: "SYSTEM_DERIVED",
        inferenceBasis: "Composed from Domain-2 Asset/System context relationships",
        confirmationState: "CONFIRMED",
      }),
    );
  }
  for (const link of listWorkPackageContextLinks(input.workspaceId, "WP-STR-004")) {
    const node = getContextNode(input.workspaceId, link.contextStableId);
    created.push(
      createGraphEdge({
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        projectId: input.projectId,
        sourceClass: "WorkPackage",
        sourceStableId: link.workPackageStableId,
        targetClass: node ? mapContextKind(node.contextKind) : "Asset",
        targetStableId: link.contextStableId,
        relationshipType: link.effect === "MODIFIES" ? "MODIFIES" : "AFFECTS",
        origin: "SYSTEM_DERIVED",
        inferenceBasis: "Composed from Domain-2 Work Package asset links",
        relatedness: link.effect === "MODIFIES" ? "EXPLICITLY_AFFECTED" : "RELATED",
        confirmationState: "CONFIRMED",
      }),
    );
  }
  return created;
}

function mapContextKind(kind: string): string {
  switch (kind) {
    case "FACILITY":
      return "Facility";
    case "AREA":
      return "Area";
    case "SYSTEM":
      return "System";
    case "SUBSYSTEM":
      return "Subsystem";
    case "ASSET":
      return "Asset";
    case "COMPONENT":
      return "Component";
    default:
      return "Asset";
  }
}

/**
 * Seed Pilot-001 relationship graph from existing pilot state only.
 */
export function seedPilot001RelationshipGraph(input: {
  tenantId?: string;
  workspaceId: string;
  projectId: string;
}): {
  edgeCount: number;
  calcDependsOn: GraphEdge[];
  assumptionDependents: GraphEdge[];
  workPackageObjects: GraphEdge[];
  assetEngineering: GraphEdge[];
  uiContract: DependencyUiContract;
  audit: ReturnType<typeof auditDigitalThreadCompatibility>;
} {
  const tenantId = input.tenantId ?? "00000000-0000-4000-8000-000000000041";
  const { workspaceId, projectId } = input;

  seedPilot001SupportFrameWorkPackage(projectId);
  seedPilot001AssetSystemContext({ tenantId, workspaceId, projectId });

  // Project contains WP
  createGraphEdge({
    tenantId,
    workspaceId,
    projectId,
    sourceClass: "Project",
    sourceStableId: projectId,
    targetClass: "WorkPackage",
    targetStableId: "WP-STR-004",
    relationshipType: "CONTAINS",
    origin: "SYSTEM_DERIVED",
    confirmationState: "CONFIRMED",
  });

  composeWorkPackageDependenciesIntoGraph({
    tenantId,
    workspaceId,
    projectId,
    workPackageStableId: "WP-STR-004",
  });
  composeAssetSystemRelationshipsIntoGraph({ tenantId, workspaceId, projectId });

  // Pilot engineering relationships from known objects
  createGraphEdge({
    tenantId,
    workspaceId,
    projectId,
    sourceClass: "Calculation",
    sourceStableId: "CALC-001",
    sourceRevisionLabel: "Rev 2",
    sourceRevisionId: "CALC-001-R2",
    targetClass: "Assumption",
    targetStableId: "ASM-001",
    targetRevisionLabel: "Rev 1",
    targetRevisionId: "ASM-001-R1",
    relationshipType: "ASSUMES",
    origin: "HUMAN",
    evidenceRefs: ["EVD-WP-STR-004"],
    confirmationState: "CONFIRMED",
    materiality: "HIGH",
  });

  createGraphEdge({
    tenantId,
    workspaceId,
    projectId,
    sourceClass: "Evidence",
    sourceStableId: "EVD-WP-STR-004",
    targetClass: "Assumption",
    targetStableId: "ASM-001",
    relationshipType: "SUPPORTS",
    origin: "HUMAN",
    confirmationState: "CONFIRMED",
  });

  createGraphEdge({
    tenantId,
    workspaceId,
    projectId,
    sourceClass: "Calculation",
    sourceStableId: "CALC-001",
    targetClass: "Asset",
    targetStableId: "AST-PLT-201",
    relationshipType: "APPLIES_TO",
    origin: "SYSTEM_DERIVED",
    inferenceBasis: "Derived from WP-STR-004 primary asset context",
    confirmationState: "CONFIRMED",
  });

  createGraphEdge({
    tenantId,
    workspaceId,
    projectId,
    sourceClass: "Requirement",
    sourceStableId: "REQ-001",
    targetClass: "WorkPackage",
    targetStableId: "WP-STR-004",
    relationshipType: "APPLIES_TO",
    origin: "HUMAN",
    confirmationState: "CONFIRMED",
  });

  createGraphEdge({
    tenantId,
    workspaceId,
    projectId,
    sourceClass: "Calculation",
    sourceStableId: "CALC-001",
    targetClass: "Decision",
    targetStableId: "DEC-001",
    relationshipType: "SUPPORTS",
    origin: "HUMAN",
    confirmationState: "CONFIRMED",
  });

  createGraphEdge({
    tenantId,
    workspaceId,
    projectId,
    sourceClass: "Decision",
    sourceStableId: "DEC-001",
    targetClass: "Deliverable",
    targetStableId: "DEL-001",
    relationshipType: "AFFECTS",
    origin: "HUMAN",
    relatedness: "EXPLICITLY_AFFECTED",
    confirmationState: "CONFIRMED",
  });

  createGraphEdge({
    tenantId,
    workspaceId,
    projectId,
    sourceClass: "Asset",
    sourceStableId: "AST-EQ-MOD-01",
    targetClass: "Asset",
    targetStableId: "AST-PLT-201",
    relationshipType: "ASSOCIATED_WITH",
    origin: "SYSTEM_DERIVED",
    inferenceBasis: "Domain-2 SUPPORTS composed as association for equipment module ↔ platform",
    confirmationState: "CONFIRMED",
  });

  const calcDependsOn = getDependencies(workspaceId, "CALC-001", projectId);
  const assumptionDependents = getDependents(workspaceId, "ASM-001", projectId);
  const workPackageObjects = getRelatedObjects(workspaceId, "WP-STR-004");
  const assetEngineering = getRelatedObjects(workspaceId, "AST-PLT-201");

  return {
    edgeCount: ensureGraph(workspaceId).edges.filter((e) => e.status === "ACTIVE").length,
    calcDependsOn,
    assumptionDependents,
    workPackageObjects,
    assetEngineering,
    uiContract: buildDependencyUiContract(workspaceId, "CALC-001", projectId),
    audit: auditDigitalThreadCompatibility(),
  };
}

/** Synthetic performance baseline — measures actual timings. */
export function measureGraphPerformanceBaseline(input?: {
  nodeCount?: number;
  edgeFactor?: number;
}): {
  nodeCount: number;
  edgeCount: number;
  directP50Ms: number;
  directP95Ms: number;
  hop3P50Ms: number;
  hop3P95Ms: number;
  performanceBlockerCount: number;
} {
  const workspaceId = `perf-ws-${id()}`;
  const tenantId = "00000000-0000-4000-8000-000000000099";
  const projectId = "PERF-GRAPH-001";
  const nodeCount = input?.nodeCount ?? 400;
  const edgeFactor = input?.edgeFactor ?? 3;

  const ids: string[] = [];
  for (let i = 0; i < nodeCount; i++) {
    ids.push(`PERF-N-${String(i).padStart(4, "0")}`);
  }
  // Chain + cross links
  for (let i = 0; i < nodeCount - 1; i++) {
    createGraphEdge({
      tenantId,
      workspaceId,
      projectId,
      sourceClass: "Calculation",
      sourceStableId: ids[i]!,
      targetClass: "Assumption",
      targetStableId: ids[i + 1]!,
      relationshipType: i % 2 === 0 ? "ASSUMES" : "REQUIRES",
      origin: "SYSTEM_DERIVED",
      confirmationState: "CONFIRMED",
    });
  }
  for (let i = 0; i < nodeCount * edgeFactor; i++) {
    const a = ids[i % nodeCount]!;
    const b = ids[(i * 7 + 13) % nodeCount]!;
    if (a === b) continue;
    try {
      createGraphEdge({
        tenantId,
        workspaceId,
        projectId,
        sourceClass: "Asset",
        sourceStableId: a,
        targetClass: "Asset",
        targetStableId: b,
        relationshipType: "ASSOCIATED_WITH",
        origin: "SYSTEM_DERIVED",
        confirmationState: "NOT_REQUIRED",
        material: false,
      });
    } catch {
      /* constraint / dup */
    }
  }

  const directSamples: number[] = [];
  const hop3Samples: number[] = [];
  const samples = 40;
  for (let s = 0; s < samples; s++) {
    const start = ids[s % nodeCount]!;
    let t0 = performance.now();
    getDownstream(workspaceId, start, { projectId });
    getUpstream(workspaceId, start, { projectId });
    directSamples.push(performance.now() - t0);

    t0 = performance.now();
    boundedTraversal(workspaceId, start, {
      maxDepth: 3,
      direction: "downstream",
      projectId,
    });
    hop3Samples.push(performance.now() - t0);
  }

  const percentile = (arr: number[], p: number) => {
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
    return Number(sorted[idx]!.toFixed(3));
  };

  const directP50 = percentile(directSamples, 50);
  const directP95 = percentile(directSamples, 95);
  const hop3P50 = percentile(hop3Samples, 50);
  const hop3P95 = percentile(hop3Samples, 95);

  // Soft blocker threshold for pilot — flag only if clearly pathological
  let blockers = 0;
  if (directP95 > 50) blockers += 1;
  if (hop3P95 > 200) blockers += 1;

  return {
    nodeCount,
    edgeCount: ensureGraph(workspaceId).edges.length,
    directP50Ms: directP50,
    directP95Ms: directP95,
    hop3P50Ms: hop3P50,
    hop3P95Ms: hop3P95,
    performanceBlockerCount: blockers,
  };
}

export function countImpactOverclaims(workspaceId: string): number {
  // Edges must not claim EXPLICITLY_AFFECTED unless type is AFFECTS/MODIFIES
  return ensureGraph(workspaceId).edges.filter(
    (e) =>
      e.relatedness === "EXPLICITLY_AFFECTED" &&
      e.relationshipType !== "AFFECTS" &&
      e.relationshipType !== "MODIFIES",
  ).length;
}

export { auditDigitalThreadCompatibility };
