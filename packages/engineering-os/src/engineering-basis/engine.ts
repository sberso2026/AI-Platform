import {
  emptyBasisGraph,
  roleMayApproveBasis,
  type BasisAudit,
  type BasisRequirement,
  type BasisVerificationMethod,
  type ChainType,
  type DesignBasisItem,
  type EngineeringBasisGraph,
  type EngineeringInput,
  type Freshness,
  type TraceLink,
  type JurisdictionProfile,
  type SourceKind,
} from "./model";
import type { DeliveryDiscipline, DeliveryStage } from "../delivery-lifecycle/model";

export type BasisResult = {
  graph: EngineeringBasisGraph;
  error: string | null;
  audit: BasisAudit | null;
  approvalGranted: false;
};

type Actor = { actorId: string; actorRole: string | null; at: string; workspaceId: string };

function sameWorkspace(graph: EngineeringBasisGraph, workspaceId: string): boolean {
  return graph.workspaceId === workspaceId;
}

function deny(graph: EngineeringBasisGraph, error: string): BasisResult {
  return { graph, error, audit: null, approvalGranted: false };
}

function commit(graph: EngineeringBasisGraph, audit: BasisAudit): BasisResult {
  return { graph: { ...graph, audits: [...graph.audits, audit] }, error: null, audit, approvalGranted: false };
}

function link(graph: EngineeringBasisGraph, fromType: ChainType, fromId: string, toType: ChainType, toId: string, relationship: string): EngineeringBasisGraph {
  return {
    ...graph,
    links: [...graph.links, { id: `link-${graph.links.length + 1}`, fromType, fromId, toType, toId, relationship }],
  };
}

export function createBasisGraph(input: {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  stage?: DeliveryStage;
  actorId: string;
  at: string;
}): BasisResult {
  const graph = emptyBasisGraph(input);
  return commit(graph, {
    action: "basis_graph_created",
    at: input.at,
    actorId: input.actorId,
    detail: { stage: graph.stage, legacyRequirementsCopied: false },
  });
}

export function addSource(graph: EngineeringBasisGraph, actor: Actor, source: { id: string; kind: SourceKind; title: string; revision: string; locator?: string | null }): BasisResult {
  if (!sameWorkspace(graph, actor.workspaceId)) return deny(graph, "cross_workspace_denied");
  if (!source.id || !source.title || !source.revision) return deny(graph, "source identity, title, and revision are required");
  const next = { ...graph, sources: [...graph.sources, { ...source, locator: source.locator ?? null, provenance: "human_record" }] };
  return commit(next, { action: "source_created", at: actor.at, actorId: actor.actorId, detail: { id: source.id, kind: source.kind } });
}

export function addBasisItem(
  graph: EngineeringBasisGraph,
  actor: Actor,
  item: Omit<DesignBasisItem, "approvalGranted" | "revision" | "authorityState" | "reviewer"> & { revision?: number },
): BasisResult {
  if (!sameWorkspace(graph, actor.workspaceId)) return deny(graph, "cross_workspace_denied");
  if (item.status === "approved") return deny(graph, "Design basis approval is a separate review.");
  if (item.inheritance === "override") {
    if (!item.parentId || !item.overrideRationale || !item.stage) {
      return deny(graph, "An override must record the parent, rationale, authority, lifecycle stage, and revision.");
    }
    const parent = graph.basisItems.find((candidate) => candidate.id === item.parentId);
    if (!parent) return deny(graph, "The parent basis item was not found.");
  }
  const stored: DesignBasisItem = {
    ...item,
    revision: item.revision ?? 1,
    reviewer: null,
    authorityState: "none",
    approvalGranted: false,
    status: item.status ?? "draft",
  };
  let next = { ...graph, basisItems: [...graph.basisItems, stored] };
  if (stored.sourceId) next = link(next, "basis", stored.id, "source", stored.sourceId, "sourced_by");
  if (stored.parentId) next = link(next, "basis", stored.id, "basis", stored.parentId, stored.inheritance);
  return commit(next, {
    action: stored.inheritance === "override" ? "basis_override_recorded" : "basis_item_created",
    at: actor.at,
    actorId: actor.actorId,
    detail: { id: stored.id, level: stored.level, status: stored.status, approvalGranted: false },
  });
}

export function reviewBasis(
  graph: EngineeringBasisGraph,
  actor: Actor & { canApprove?: boolean },
  review: { itemId: string; outcome: "under_review" | "accepted_for_stage" | "approved"; comments: string | null },
): BasisResult {
  if (!sameWorkspace(graph, actor.workspaceId)) return deny(graph, "cross_workspace_denied");
  const item = graph.basisItems.find((candidate) => candidate.id === review.itemId);
  if (!item) return deny(graph, "The design basis item was not found.");
  if (review.outcome === "approved" && !roleMayApproveBasis(actor.actorRole, actor.canApprove)) {
    return deny(graph, "This role cannot approve a design basis.");
  }
  const status = review.outcome === "under_review" ? "under_review" : review.outcome;
  const updated: DesignBasisItem = {
    ...item,
    status,
    reviewer: actor.actorId,
    authorityState: review.outcome === "approved" ? "approved" : "reviewed",
    approvalGranted: false,
  };
  const next = {
    ...graph,
    basisItems: graph.basisItems.map((candidate) => (candidate.id === item.id ? updated : candidate)),
    reviews: [...graph.reviews, {
      id: `review-${graph.reviews.length + 1}`,
      subjectType: "basis" as const,
      subjectId: item.id,
      revision: item.revision,
      reviewer: actor.actorId,
      role: actor.actorRole ?? "unspecified",
      outcome: review.outcome,
      comments: review.comments,
      at: actor.at,
      approvalGranted: review.outcome === "approved",
    }],
  };
  return commit(next, {
    action: "basis_reviewed",
    at: actor.at,
    actorId: actor.actorId,
    detail: { id: item.id, outcome: review.outcome, approvalGranted: review.outcome === "approved" },
  });
}

export function addRequirement(
  graph: EngineeringBasisGraph,
  actor: Actor,
  requirement: Omit<BasisRequirement, "revision" | "verificationStatus" | "label" | "supersedesId"> & { proposedByAi?: boolean },
): BasisResult {
  if (!sameWorkspace(graph, actor.workspaceId)) return deny(graph, "cross_workspace_denied");
  if (requirement.status === "verified") return deny(graph, "Verification requires an evidence record.");
  const proposed = requirement.proposedByAi === true || actor.actorRole === "ai";
  const stored: BasisRequirement = {
    ...requirement,
    status: proposed ? "proposed" : requirement.status,
    revision: 1,
    verificationStatus: "unverified",
    supersedesId: null,
    label: proposed ? "PROPOSED" : "RECORD",
    provenance: proposed ? "ai_candidate" : requirement.provenance,
  };
  let next = { ...graph, requirements: [...graph.requirements, stored] };
  if (stored.sourceId) next = link(next, "source", stored.sourceId, "requirement", stored.id, "sourced_by");
  return commit(next, {
    action: "requirement_created",
    at: actor.at,
    actorId: actor.actorId,
    detail: { id: stored.id, status: stored.status, label: stored.label, legacyCopied: false },
  });
}

export function reviseRequirement(graph: EngineeringBasisGraph, actor: Actor, id: string, statement: string): BasisResult {
  if (!sameWorkspace(graph, actor.workspaceId)) return deny(graph, "cross_workspace_denied");
  const current = graph.requirements.find((item) => item.id === id && item.status !== "superseded");
  if (!current) return deny(graph, "The requirement was not found.");
  const successorId = `${current.id}-r${current.revision + 1}`;
  const successor: BasisRequirement = { ...current, id: successorId, statement, revision: current.revision + 1, status: "draft", verificationStatus: "unverified", supersedesId: current.id };
  const next = {
    ...graph,
    requirements: graph.requirements.map((item) => (item.id === current.id ? { ...item, status: "superseded" as const } : item)).concat(successor),
  };
  return commit(link(next, "requirement", successor.id, "requirement", current.id, "supersedes"), {
    action: "requirement_revised",
    at: actor.at,
    actorId: actor.actorId,
    detail: { id: successor.id, previous: current.id },
  });
}

export function verifyRequirement(
  graph: EngineeringBasisGraph,
  actor: Actor,
  input: { requirementId: string; method: BasisVerificationMethod; evidenceId: string; result: string; outcome: "pass" | "fail" | "conditional"; comments: string | null; inferFromCalculation?: boolean },
): BasisResult {
  if (!sameWorkspace(graph, actor.workspaceId)) return deny(graph, "cross_workspace_denied");
  if (actor.actorRole === "ai") return deny(graph, "AI cannot mark a requirement verified.");
  if (input.inferFromCalculation) return deny(graph, "A calculation does not by itself verify a requirement.");
  if (!input.evidenceId) return deny(graph, "Verification requires evidence.");
  const requirement = graph.requirements.find((item) => item.id === input.requirementId && item.status !== "superseded");
  if (!requirement) return deny(graph, "The requirement was not found.");
  const verification = {
    id: `ver-${graph.verifications.length + 1}`,
    requirementId: requirement.id,
    method: input.method,
    evidenceId: input.evidenceId,
    result: input.result,
    reviewer: actor.actorId,
    at: actor.at,
    revision: requirement.revision,
    stage: graph.stage,
    outcome: input.outcome,
    comments: input.comments,
    provenance: "human_evidence",
    freshness: "current" as const,
  };
  const status = input.outcome === "pass" ? "verified" as const : requirement.status;
  const next = {
    ...graph,
    verifications: [...graph.verifications, verification],
    requirements: graph.requirements.map((item) => item.id === requirement.id ? { ...item, status, verificationMethod: input.method, verificationStatus: input.outcome === "pass" ? "verified" as const : "conditional" as const, reviewer: actor.actorId } : item),
  };
  return commit(link(next, "requirement", requirement.id, "verification", verification.id, "verified_by"), {
    action: "requirement_verification_recorded",
    at: actor.at,
    actorId: actor.actorId,
    detail: { requirementId: requirement.id, evidenceId: input.evidenceId, outcome: input.outcome },
  });
}

export function addCriterion(graph: EngineeringBasisGraph, actor: Actor, criterion: EngineeringBasisGraph["criteria"][number]): BasisResult {
  if (!sameWorkspace(graph, actor.workspaceId)) return deny(graph, "cross_workspace_denied");
  if (!criterion.basisItemId && !criterion.sourceId) return deny(graph, "A criterion needs a basis item or a source.");
  let next = { ...graph, criteria: [...graph.criteria, criterion] };
  if (criterion.basisItemId) next = link(next, "criterion", criterion.id, "basis", criterion.basisItemId, "criterion_of");
  if (criterion.sourceId) next = link(next, "criterion", criterion.id, "source", criterion.sourceId, "sourced_by");
  return commit(next, { action: "criterion_created", at: actor.at, actorId: actor.actorId, detail: { id: criterion.id } });
}

export function addAssumption(graph: EngineeringBasisGraph, actor: Actor, assumption: EngineeringBasisGraph["assumptions"][number]): BasisResult {
  if (!sameWorkspace(graph, actor.workspaceId)) return deny(graph, "cross_workspace_denied");
  let next = { ...graph, assumptions: [...graph.assumptions, assumption] };
  if (assumption.basisItemId) next = link(next, "assumption", assumption.id, "basis", assumption.basisItemId, "assumes");
  if (assumption.requirementId) next = link(next, "assumption", assumption.id, "requirement", assumption.requirementId, "assumes");
  return commit(next, { action: "assumption_created", at: actor.at, actorId: actor.actorId, detail: { id: assumption.id, blocksNextStage: assumption.blocksNextStage, validated: assumption.status === "validated" } });
}

export function addInput(graph: EngineeringBasisGraph, actor: Actor, input: EngineeringInput): BasisResult {
  if (!sameWorkspace(graph, actor.workspaceId)) return deny(graph, "cross_workspace_denied");
  if (input.dataType === "number" && !input.unit) return deny(graph, "A numeric engineering input needs a unit.");
  let next = { ...graph, inputs: [...graph.inputs, input] };
  if (input.sourceId) next = link(next, "input", input.id, "source", input.sourceId, "sourced_by");
  return commit(next, { action: "engineering_input_created", at: actor.at, actorId: actor.actorId, detail: { id: input.id, revision: input.revision } });
}

export function addCalculation(graph: EngineeringBasisGraph, actor: Actor, calculation: EngineeringBasisGraph["calculations"][number]): BasisResult {
  if (!sameWorkspace(graph, actor.workspaceId)) return deny(graph, "cross_workspace_denied");
  let next = { ...graph, calculations: [...graph.calculations, calculation] };
  for (const inputId of calculation.inputIds) next = link(next, "calculation", calculation.id, "input", inputId, "uses_input");
  return commit(next, { action: "calculation_reference_created", at: actor.at, actorId: actor.actorId, detail: { id: calculation.id, evaluated: false } });
}

export function addDeliverable(graph: EngineeringBasisGraph, actor: Actor, deliverable: EngineeringBasisGraph["deliverables"][number]): BasisResult {
  if (!sameWorkspace(graph, actor.workspaceId)) return deny(graph, "cross_workspace_denied");
  let next = { ...graph, deliverables: [...graph.deliverables, deliverable] };
  for (const basisId of deliverable.basisItemIds) next = link(next, "deliverable", deliverable.id, "basis", basisId, "implements");
  return commit(next, { action: "deliverable_reference_created", at: actor.at, actorId: actor.actorId, detail: { id: deliverable.id } });
}

export function reviseInput(graph: EngineeringBasisGraph, actor: Actor, id: string, value: string): BasisResult {
  if (!sameWorkspace(graph, actor.workspaceId)) return deny(graph, "cross_workspace_denied");
  const current = graph.inputs.find((item) => item.id === id && item.status === "current");
  if (!current) return deny(graph, "The engineering input was not found.");
  const successor: EngineeringInput = { ...current, id: `${current.id}-r${current.revision + 1}`, value, revision: current.revision + 1, supersedesId: current.id, status: "current" };
  const affected = new Set<string>();
  for (const item of graph.links) {
    if (item.toType === "input" && item.toId === current.id) affected.add(`${item.fromType}:${item.fromId}`);
  }
  const mark = <T extends { id: string; freshness: Freshness }>(rows: T[]) => rows.map((row) => affected.has(`calculation:${row.id}`) || affected.has(`deliverable:${row.id}`) || affected.has(`verification:${row.id}`) ? { ...row, freshness: "potentially_stale" as const } : row);
  const next: EngineeringBasisGraph = {
    ...graph,
    inputs: graph.inputs.map((item) => item.id === current.id ? { ...item, status: "superseded" as const } : item).concat(successor),
    calculations: mark(graph.calculations),
    deliverables: graph.deliverables.map((row) => affected.has(`deliverable:${row.id}`) ? { ...row, freshness: "potentially_stale" } : row),
    verifications: graph.verifications.map((row) => affected.has(`verification:${row.id}`) ? { ...row, freshness: "potentially_stale" } : row),
    basisItems: graph.basisItems.map((row) => affected.has(`basis:${row.id}`) ? row : row),
  };
  return commit(link(next, "input", successor.id, "input", current.id, "supersedes"), {
    action: "engineering_input_revised",
    at: actor.at,
    actorId: actor.actorId,
    detail: { id: successor.id, previous: current.id, recalculated: false, staleCount: affected.size },
  });
}

export function recordChange(graph: EngineeringBasisGraph, actor: Actor, change: { id: string; targets: Array<{ type: ChainType; id: string }> }): BasisResult {
  if (!sameWorkspace(graph, actor.workspaceId)) return deny(graph, "cross_workspace_denied");
  const targetIds = new Set(change.targets.map((target) => `${target.type}:${target.id}`));
  const flagged = (type: ChainType, id: string, freshness: Freshness): Freshness => targetIds.has(`${type}:${id}`) ? "potentially_stale" : freshness;
  const next: EngineeringBasisGraph = {
    ...graph,
    changes: [...graph.changes, { id: change.id, targets: change.targets, decision: null, approved: false }],
    calculations: graph.calculations.map((row) => ({ ...row, freshness: flagged("calculation", row.id, row.freshness) })),
    deliverables: graph.deliverables.map((row) => ({ ...row, freshness: flagged("deliverable", row.id, row.freshness) })),
    verifications: graph.verifications.map((row) => ({ ...row, freshness: flagged("verification", row.id, row.freshness) })),
  };
  return commit(next, { action: "basis_change_recorded", at: actor.at, actorId: actor.actorId, detail: { id: change.id, approved: false } });
}

export function traverse(graph: EngineeringBasisGraph, startType: ChainType, startId: string, direction: "upstream" | "downstream", maxDepth = 4): TraceLink[] {
  const depth = Math.min(Math.max(maxDepth, 1), 6);
  const seen = new Set<string>();
  const found: TraceLink[] = [];
  let frontier = [{ type: startType, id: startId }];
  for (let step = 0; step < depth; step += 1) {
    const next: Array<{ type: ChainType; id: string }> = [];
    for (const node of frontier) {
      for (const item of graph.links) {
        const match = direction === "downstream" ? item.fromType === node.type && item.fromId === node.id : item.toType === node.type && item.toId === node.id;
        if (!match || seen.has(item.id)) continue;
        seen.add(item.id);
        found.push(item);
        next.push(direction === "downstream" ? { type: item.toType, id: item.toId } : { type: item.fromType, id: item.fromId });
      }
    }
    frontier = next;
  }
  return found;
}

export function missingTraceability(graph: EngineeringBasisGraph): Array<{ code: string; subjectId: string; severity: "info" | "review" | "blocking" }> {
  const gaps: Array<{ code: string; subjectId: string; severity: "info" | "review" | "blocking" }> = [];
  for (const requirement of graph.requirements) {
    if (requirement.status === "superseded" || requirement.status === "rejected" || requirement.status === "not_applicable") continue;
    if (!requirement.sourceId) gaps.push({ code: "requirement_without_source", subjectId: requirement.id, severity: "review" });
    if (!requirement.verificationMethod) gaps.push({ code: "requirement_without_verification_method", subjectId: requirement.id, severity: "info" });
    if (requirement.status === "verified" && !graph.verifications.some((item) => item.requirementId === requirement.id && item.evidenceId)) {
      gaps.push({ code: "verified_requirement_without_evidence", subjectId: requirement.id, severity: "blocking" });
    }
  }
  for (const item of graph.basisItems) {
    if (item.status !== "superseded" && item.status !== "withdrawn" && !item.sourceId) gaps.push({ code: "basis_without_source", subjectId: item.id, severity: "review" });
  }
  for (const criterion of graph.criteria) {
    if (!criterion.basisItemId && !criterion.sourceId) gaps.push({ code: "criterion_without_basis_or_source", subjectId: criterion.id, severity: "review" });
  }
  for (const calculation of graph.calculations) {
    if (calculation.inputIds.length === 0) gaps.push({ code: "calculation_without_controlled_inputs", subjectId: calculation.id, severity: "review" });
  }
  for (const deliverable of graph.deliverables) {
    if (deliverable.basisItemIds.length === 0) gaps.push({ code: "deliverable_without_basis", subjectId: deliverable.id, severity: "info" });
  }
  for (const item of graph.basisItems.filter((candidate) => candidate.status === "superseded")) {
    const stillUsed = graph.links.some((linkItem) => linkItem.toType === "basis" && linkItem.toId === item.id && linkItem.relationship !== "supersedes" && linkItem.fromType !== "basis");
    if (stillUsed) gaps.push({ code: "superseded_basis_still_referenced", subjectId: item.id, severity: "review" });
  }
  return gaps;
}

export function lifecycleBasisReadiness(graph: EngineeringBasisGraph): {
  stage: DeliveryStage;
  preliminaryBasis: boolean;
  assumptionsRecorded: boolean;
  requirementsCaptured: boolean;
  criteriaTraceable: boolean;
  controlledBasis: boolean;
  unresolvedBasisIds: string[];
  staleIds: string[];
  blockers: string[];
  acceptedForStageIsApproval: false;
} {
  const preliminaryBasis = graph.basisItems.some((item) => item.level === "project" && item.status !== "withdrawn");
  const assumptionsRecorded = graph.assumptions.length > 0;
  const requirementsCaptured = graph.requirements.some((item) => item.status !== "rejected");
  const criteriaTraceable = graph.criteria.some((item) => item.basisItemId || item.sourceId);
  const controlledBasis = graph.basisItems.some((item) => item.status === "accepted_for_stage" || item.status === "approved");
  const unresolvedBasisIds = graph.basisItems.filter((item) => item.status === "draft" || item.status === "under_review").map((item) => item.id);
  const staleIds = [
    ...graph.calculations.filter((item) => item.freshness === "potentially_stale" || item.freshness === "requires_review"),
    ...graph.deliverables.filter((item) => item.freshness === "potentially_stale" || item.freshness === "requires_review"),
    ...graph.verifications.filter((item) => item.freshness === "potentially_stale" || item.freshness === "requires_review"),
  ].map((item) => item.id);
  const blockers: string[] = [];
  if (graph.stage === "concept" && !preliminaryBasis) blockers.push("preliminary design basis is not recorded");
  if (graph.stage === "feasibility" && !requirementsCaptured) blockers.push("feasibility requirements are not captured");
  if (graph.stage === "feasibility" && !criteriaTraceable) blockers.push("preferred option criteria are not traceable");
  if (graph.stage === "feed" && !controlledBasis) blockers.push("controlled FEED design basis is not recorded");
  if (graph.stage === "detailed_engineering" && !controlledBasis) blockers.push("current design basis is not available");
  return {
    stage: graph.stage,
    preliminaryBasis,
    assumptionsRecorded,
    requirementsCaptured,
    criteriaTraceable,
    controlledBasis,
    unresolvedBasisIds,
    staleIds,
    blockers,
    acceptedForStageIsApproval: false,
  };
}

export function captureBasisBaseline(graph: EngineeringBasisGraph, actorId: string, at: string) {
  return {
    frozen: true as const,
    capturedAt: at,
    capturedBy: actorId,
    basis: graph.basisItems.map((item) => ({ id: item.id, revision: item.revision })),
    requirements: graph.requirements.map((item) => ({ id: item.id, revision: item.revision })),
    assumptions: graph.assumptions.map((item) => ({ id: item.id, status: item.status })),
    criteria: graph.criteria.map((item) => ({ id: item.id, revision: item.revision })),
    inputs: graph.inputs.map((item) => ({ id: item.id, revision: item.revision, value: item.value })),
  };
}

export function resolveBasisStatement(graph: EngineeringBasisGraph, id: string): { statement: string; originId: string; overridden: boolean } | null {
  let current = graph.basisItems.find((item) => item.id === id);
  let depth = 0;
  while (current && current.inheritance === "inherit" && current.parentId && depth < 4) {
    const parent = graph.basisItems.find((item) => item.id === current?.parentId);
    if (!parent) break;
    current = parent;
    depth += 1;
  }
  if (!current) return null;
  return { statement: current.statement, originId: current.id, overridden: current.inheritance === "override" };
}

export function itemsForStage(graph: EngineeringBasisGraph, stage: DeliveryStage): DesignBasisItem[] {
  return graph.basisItems.filter((item) => item.stage === stage && item.status !== "withdrawn" && item.status !== "superseded");
}

export function basisAdvisory(graph: EngineeringBasisGraph): string {
  const unresolved = graph.assumptions.filter((item) => item.status === "open" || item.status === "accepted_for_stage").length;
  const unverified = graph.requirements.filter((item) => item.verificationStatus !== "verified" && item.status !== "rejected" && item.status !== "not_applicable").length;
  const stale = graph.calculations.filter((item) => item.freshness === "potentially_stale").length;
  return `Advisory only. FACT: stage ${graph.stage}; design basis items ${graph.basisItems.length}; requirements ${graph.requirements.length}. INFERENCE: ${unresolved} assumption(s) are unresolved and ${unverified} requirement(s) are not verified. RECOMMENDATION: review ${stale} potentially stale calculation reference(s) before the next baseline. This statement does not approve a design basis or a requirement.`;
}

export function previewBasisImport(input: { format: "json" | "csv"; text: string }): { valid: Array<Record<string, string>>; invalid: Array<{ row: number; reason: string }> } {
  const rows = input.format === "json" ? parseJson(input.text) : parseCsv(input.text);
  const valid: Array<Record<string, string>> = [];
  const invalid: Array<{ row: number; reason: string }> = [];
  const seen = new Set<string>();
  rows.forEach((row, index) => {
    if ("error" in row) {
      invalid.push({ row: index + 1, reason: row.error });
      return;
    }
    if (!row.id || !row.title || !row.recordType) {
      invalid.push({ row: index + 1, reason: "id, title, and recordType are required" });
      return;
    }
    if (seen.has(row.id)) {
      invalid.push({ row: index + 1, reason: "duplicate id" });
      return;
    }
    if (row.recordType !== "source" && row.recordType !== "basis" && row.recordType !== "requirement" && row.recordType !== "input") {
      invalid.push({ row: index + 1, reason: "recordType is not supported" });
      return;
    }
    if (row.dataType === "number" && !row.unit) {
      invalid.push({ row: index + 1, reason: "numeric input requires a unit" });
      return;
    }
    seen.add(row.id);
    valid.push(row);
  });
  return { valid, invalid };
}

export function commitBasisImport(graph: EngineeringBasisGraph, actor: Actor, preview: ReturnType<typeof previewBasisImport>): BasisResult {
  if (preview.invalid.length > 0) return deny(graph, "Import was not committed because one or more rows are invalid.");
  let next = graph;
  for (const row of preview.valid) {
    const created = importRow(next, actor, row);
    if (created.error) return created;
    next = created.graph;
  }
  return commit(next, { action: "import_committed", at: actor.at, actorId: actor.actorId, detail: { validRows: preview.valid.length, approved: false } });
}

function importRow(graph: EngineeringBasisGraph, actor: Actor, row: Record<string, string>): BasisResult {
  if (row.recordType === "source") {
    return addSource(graph, actor, { id: row.id ?? "", kind: "project_specification", title: row.title ?? "", revision: row.revision || "1" });
  }
  if (row.recordType === "basis") {
    return addBasisItem(graph, actor, {
      id: row.id ?? "",
      level: "project",
      discipline: "common",
      category: "project_specific_requirement",
      title: row.title ?? "",
      statement: row.statement || row.title || "",
      unit: row.unit || null,
      sourceId: row.sourceId || null,
      sourceRevision: null,
      stage: graph.stage,
      status: "draft",
      effectiveAt: null,
      owner: actor.actorId,
      provenance: "import_preview",
      parentId: null,
      inheritance: "add",
      overrideRationale: null,
      supersedesId: null,
    });
  }
  if (row.recordType === "requirement") {
    return addRequirement(graph, actor, {
      id: row.id ?? "",
      title: row.title ?? "",
      statement: row.statement || row.title || "",
      requirementType: "engineering",
      discipline: "common",
      applicability: null,
      sourceId: row.sourceId || null,
      sourceRevision: null,
      sourceLocator: null,
      rationale: null,
      introducedStage: graph.stage,
      requiredByStage: null,
      criticality: "medium",
      status: "draft",
      verificationMethod: null,
      owner: actor.actorId,
      reviewer: null,
      legacyRequirementId: null,
      provenance: "import_preview",
    });
  }
  return addInput(graph, actor, {
    id: row.id ?? "",
    name: row.title ?? "",
    value: row.value || "",
    unit: row.unit || null,
    dataType: row.dataType === "number" ? "number" : "text",
    sourceId: row.sourceId || null,
    sourceRevision: null,
    effectiveAt: null,
    uncertainty: null,
    stage: graph.stage,
    status: "current",
    discipline: "common",
    owner: actor.actorId,
    provenance: "import_preview",
    revision: 1,
    supersedesId: null,
    interfaceUse: null,
  });
}

function parseJson(text: string): Array<Record<string, string> | { error: string }> {
  try {
    const parsed = JSON.parse(text) as unknown;
    if (!Array.isArray(parsed)) return [{ error: "JSON import must be an array" }];
    return parsed.map((row) => {
      if (!row || typeof row !== "object") return { error: "row is not an object" };
      return Object.fromEntries(Object.entries(row).map(([key, value]) => [key, String(value ?? "")]));
    });
  } catch {
    return [{ error: "JSON is not parseable" }];
  }
}

function parseCsv(text: string): Array<Record<string, string> | { error: string }> {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [{ error: "CSV needs a header and one row" }];
  const header = lines[0]?.split(",").map((cell) => cell.trim()) ?? [];
  return lines.slice(1).map((line) => {
    const cells = line.split(",").map((cell) => cell.trim());
    if (cells.length !== header.length) return { error: "column count does not match the header" };
    return Object.fromEntries(header.map((key, index) => [key, cells[index] ?? ""]));
  });
}

export function overview(graph: EngineeringBasisGraph) {
  const supersededInUse = graph.basisItems.filter((item) => item.status === "superseded" && graph.links.some((linkItem) => linkItem.toId === item.id && linkItem.toType === "basis" && linkItem.relationship !== "supersedes")).map((item) => item.id);
  return {
    stage: graph.stage,
    jurisdictionProfile: graph.jurisdictionProfile,
    baselineId: graph.baselineId,
    basisCount: graph.basisItems.length,
    disciplines: [...new Set(graph.basisItems.map((item) => item.discipline).filter(Boolean))],
    unresolvedBasis: graph.basisItems.filter((item) => item.status === "draft" || item.status === "under_review").length,
    unresolvedAssumptions: graph.assumptions.filter((item) => item.status === "open" || item.status === "accepted_for_stage").length,
    requirementCount: graph.requirements.length,
    unverifiedRequirements: graph.requirements.filter((item) => item.verificationStatus !== "verified").length,
    staleReferences: graph.calculations.filter((item) => item.freshness !== "current").length + graph.deliverables.filter((item) => item.freshness !== "current").length,
    supersededInUse,
    readiness: lifecycleBasisReadiness(graph),
    advisory: basisAdvisory(graph),
    approvalGranted: false as const,
  };
}

export function setJurisdiction(graph: EngineeringBasisGraph, actor: Actor, profile: JurisdictionProfile): BasisResult {
  if (!sameWorkspace(graph, actor.workspaceId)) return deny(graph, "cross_workspace_denied");
  return commit({ ...graph, jurisdictionProfile: profile }, { action: "jurisdiction_profile_set", at: actor.at, actorId: actor.actorId, detail: { profile, universal: false } });
}

export type { DeliveryDiscipline };
