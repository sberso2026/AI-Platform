import { createBaseline, createDeliveryLifecycle } from "../delivery-lifecycle";
import type { BaselineType } from "../delivery-lifecycle/model";
import {
  AI_AUTOMATIC_BASELINE_UPDATE_AUTHORITY,
  AI_AUTOMATIC_DELIVERABLE_REVISION_AUTHORITY,
  AI_AUTOMATIC_RECALCULATION_AUTHORITY,
  AI_CHANGE_APPROVAL_AUTHORITY,
  AI_IMPACT_FINALIZATION_AUTHORITY,
  AUTOMATIC_ENGINEERING_RECALCULATION,
  type CandidateImpact,
  type ChangeRecord,
  type ChangeRegister,
  type ChangeStatus,
  type Discipline,
  type ImpactNode,
  type Materiality,
  type RequirementRecord,
  type Severity,
} from "./model";

export type ChangeActor = {
  actorId: string;
  actorRole: string | null;
  actingRole: string;
  at: string;
  workspaceId: string;
};

export type ChangeEnvelope = { register: ChangeRegister; error: string | null; approvalGranted: false };

const NEXT: Record<ChangeStatus, ChangeStatus[]> = {
  draft: ["submitted", "cancelled"],
  submitted: ["under_screening", "cancelled"],
  under_screening: ["impact_assessment_required", "rejected", "cancelled"],
  impact_assessment_required: ["impact_assessment_in_progress", "cancelled"],
  impact_assessment_in_progress: ["impact_assessed", "cancelled"],
  impact_assessed: ["approved_for_implementation", "rejected", "cancelled"],
  approved_for_implementation: ["implemented", "cancelled"],
  rejected: ["cancelled"],
  implemented: ["verification_required", "cancelled"],
  verification_required: ["verified", "cancelled"],
  verified: ["closed", "cancelled"],
  closed: [],
  cancelled: [],
};

const FIELD_CLASS: Record<string, ChangeRecord["materialityClass"]> = {
  description: "editorial",
  reviewer_name: "administrative",
  operating_mass: "material",
  design_pressure: "material",
  design_temperature: "material",
  groundwater_level: "material",
  trip_requirement: "material",
  motor_power: "material",
  nozzle_location: "material",
  support_reaction: "material",
  finished_level: "material",
  ground_model_boundary: "material",
};

const MAX_DEPTH = 8;

function deny(register: ChangeRegister, error: string): ChangeEnvelope {
  return { register, error, approvalGranted: false };
}
function ok(register: ChangeRegister): ChangeEnvelope {
  return { register, error: null, approvalGranted: false };
}
function sameWorkspace(register: ChangeRegister, actor: ChangeActor): boolean {
  return register.workspaceId === actor.workspaceId;
}
function isAi(actor: ChangeActor): boolean {
  return actor.actorRole === "ai" || actor.actingRole === "ai";
}
function genericAuthority(actor: ChangeActor): boolean {
  return actor.actorRole === "owner" || actor.actorRole === "admin" || actor.actorRole === "pilot-engineer" || actor.actorRole === "pilot_engineer" || isAi(actor);
}
function audit(register: ChangeRegister, actor: ChangeActor, action: string, detail: ChangeRegister["audits"][number]["detail"]): ChangeRegister {
  return {
    ...register,
    audits: [...register.audits, { action, at: actor.at, actorId: actor.actorId, actingRole: actor.actingRole, detail: { ...detail, recalculated: false } }],
    events: detail.changeId ? [...register.events, { type: action, changeId: String(detail.changeId) }] : register.events,
  };
}

export function classifyRevision(field: string, rules: Record<string, ChangeRecord["materialityClass"]> = FIELD_CLASS): ChangeRecord["materialityClass"] {
  return rules[field] ?? "unknown";
}

export function createChangeRegister(input: {
  id: string; tenantId: string; workspaceId: string; projectId: string; projectTitle: string; actorId: string; at: string;
}): ChangeEnvelope {
  createDeliveryLifecycle({ id: `${input.id}-lifecycle`, tenantId: input.tenantId, workspaceId: input.workspaceId, projectId: input.projectId, actorId: input.actorId, at: input.at });
  const register: ChangeRegister = {
    id: input.id, tenantId: input.tenantId, workspaceId: input.workspaceId, projectId: input.projectId, projectTitle: input.projectTitle,
    changes: [], nodes: [], edges: [], impacts: [], baselines: [], requirements: [], events: [],
    audits: [{ action: "change_register_created", at: input.at, actorId: input.actorId, actingRole: "owner", detail: { a4Replaced: false, d1kReplaced: false, recalculated: false } }],
    a4Replaced: false, d1kReplaced: false, recalculated: false,
  };
  return ok(register);
}

export function addChange(register: ChangeRegister, actor: ChangeActor, change: Omit<ChangeRecord, "status" | "materialityClass" | "exceptionId" | "tqId" | "decisionId" | "actionId">): ChangeEnvelope {
  if (!sameWorkspace(register, actor)) return deny(register, "cross_workspace_denied");
  if (actor.actingRole !== change.initiatingDiscipline) return deny(register, "Only the initiating discipline can draft this change.");
  if (isAi(actor) && change.criticality === "CRITICAL") return deny(register, "AI cannot assign safety-critical severity.");
  const materialityClass = classifyRevision(change.changedField);
  const created: ChangeRecord = { ...change, status: "draft", materialityClass, exceptionId: null, tqId: null, decisionId: null, actionId: null };
  return ok(audit({ ...register, changes: [...register.changes, created] }, actor, "change_created", { changeId: change.id, materialityClass, recalculated: false }));
}

export function progressChange(register: ChangeRegister, actor: ChangeActor, id: string, to: ChangeStatus): ChangeEnvelope {
  if (!sameWorkspace(register, actor)) return deny(register, "cross_workspace_denied");
  const current = register.changes.find((item) => item.id === id);
  if (!current) return deny(register, "The change was not found.");
  if (!NEXT[current.status].includes(to)) return deny(register, "That change transition is not legal.");
  if (isAi(actor) && (to === "approved_for_implementation" || to === "implemented" || to === "verified" || to === "closed")) {
    return deny(register, "AI cannot approve, implement, verify, or close a change.");
  }
  if ((to === "approved_for_implementation" || to === "verified" || to === "closed") && (genericAuthority(actor) || actor.actingRole !== "change_authority" || AI_CHANGE_APPROVAL_AUTHORITY)) {
    return deny(register, "Change approval is not granted by owner, admin, or AI.");
  }
  if (to === "approved_for_implementation" && register.impacts.some((item) => item.changeId === id && item.materiality === "UNASSESSED")) {
    return deny(register, "Unassessed candidate impacts remain.");
  }
  if (to === "implemented") return ok(audit(replaceChange(register, { ...current, status: to }), actor, "change_implemented", { changeId: id, verified: false, recalculated: false }));
  if (to === "closed") {
    const unresolved = register.impacts.some((item) => item.changeId === id && (item.materiality === "UNASSESSED" || (item.materiality === "MATERIAL_IMPACT" && !item.actionConfirmed)));
    if (unresolved && !current.exceptionId) return deny(register, "Required material impacts remain unresolved.");
  }
  return ok(audit(replaceChange(register, { ...current, status: to }), actor, `change_${to}`, { changeId: id, recalculated: false }));
}

export function addDependency(register: ChangeRegister, actor: ChangeActor, node: ImpactNode, fromId: string | null): ChangeEnvelope {
  if (!sameWorkspace(register, actor)) return deny(register, "cross_workspace_denied");
  const nodes = register.nodes.some((item) => item.id === node.id) ? register.nodes : [...register.nodes, node];
  const edges = fromId ? [...register.edges, { fromId, toId: node.id }] : register.edges;
  return ok({ ...register, nodes, edges });
}

export function discoverImpacts(register: ChangeRegister, actor: ChangeActor, changeId: string, depthLimit = 4): ChangeEnvelope {
  if (!sameWorkspace(register, actor)) return deny(register, "cross_workspace_denied");
  if (isAi(actor)) return deny(register, "AI cannot finalize impact discovery as an authority.");
  const change = register.changes.find((item) => item.id === changeId);
  if (!change) return deny(register, "The change was not found.");
  const limit = Math.max(0, Math.min(depthLimit, MAX_DEPTH));
  const found: CandidateImpact[] = [];
  const walk = (fromId: string, path: string[], depth: number, seen: Set<string>) => {
    if (depth >= limit) return;
    for (const edge of register.edges.filter((item) => item.fromId === fromId)) {
      if (seen.has(edge.toId)) continue;
      const node = register.nodes.find((item) => item.id === edge.toId);
      if (!node) continue;
      const nextPath = [...path, node.id];
      const nextDepth = depth + 1;
      if (!register.impacts.some((item) => item.changeId === changeId && item.objectId === node.id) && !found.some((item) => item.objectId === node.id)) {
        found.push({
          id: `${changeId}:${node.id}`,
          changeId,
          objectType: node.objectType,
          objectId: node.id,
          discipline: node.discipline,
          path: nextPath,
          depth: nextDepth,
          direct: nextDepth === 1,
          categories: nextDepth === 1 ? ["DIRECT", ...node.categories] : ["INDIRECT", ...node.categories],
          classification: "CANDIDATE_IMPACT",
          materiality: "UNASSESSED",
          severity: null,
          confidence: "CONFIRMED_DEPENDENCY",
          reason: "Explicit dependency edge",
          evidence: nextPath.join(" -> "),
          requiredAction: null,
          actionConfirmed: false,
          resolution: null,
          freshness: "potentially_stale",
          previousResult: node.previousResult,
          recalculated: false,
          deliverableRevised: false,
        });
      }
      walk(node.id, nextPath, nextDepth, new Set([...seen, edge.toId]));
    }
  };
  walk(change.sourceObjectId, [change.sourceObjectId], 0, new Set([change.sourceObjectId]));
  return ok(audit({ ...register, impacts: [...register.impacts, ...found] }, actor, "impact_discovery_run", { changeId, count: found.length, bounded: true, recalculated: false }));
}

export function assessMateriality(register: ChangeRegister, actor: ChangeActor, impactId: string, materiality: Materiality, detail?: { severity?: Severity; action?: string; rationale?: string }): ChangeEnvelope {
  if (!sameWorkspace(register, actor)) return deny(register, "cross_workspace_denied");
  if (isAi(actor) || AI_IMPACT_FINALIZATION_AUTHORITY) return deny(register, "AI cannot finalize materiality.");
  const impact = register.impacts.find((item) => item.id === impactId);
  if (!impact) return deny(register, "The candidate impact was not found.");
  if (actor.actingRole !== impact.discipline) return deny(register, "Only the affected discipline can finalize materiality.");
  if (detail?.severity === "CRITICAL" && isAi(actor)) return deny(register, "AI cannot assign safety-critical severity.");
  const next: CandidateImpact = {
    ...impact,
    materiality,
    severity: detail?.severity ?? impact.severity,
    requiredAction: detail?.action ?? (materiality === "NO_MATERIAL_IMPACT" ? "NO_ACTION" : impact.requiredAction),
    actionConfirmed: materiality === "NO_MATERIAL_IMPACT",
    resolution: detail?.rationale ?? (materiality === "NO_MATERIAL_IMPACT" ? "No engineering action is required." : null),
    recalculated: false,
    deliverableRevised: false,
  };
  return ok(audit(replaceImpact(register, next), actor, "materiality_assessed", { changeId: impact.changeId, impactId, materiality, recalculated: false }));
}

export function confirmAction(register: ChangeRegister, actor: ChangeActor, impactId: string): ChangeEnvelope {
  if (!sameWorkspace(register, actor)) return deny(register, "cross_workspace_denied");
  if (isAi(actor) || AUTOMATIC_ENGINEERING_RECALCULATION || AI_AUTOMATIC_RECALCULATION_AUTHORITY || AI_AUTOMATIC_DELIVERABLE_REVISION_AUTHORITY) {
    return deny(register, "AI cannot confirm an engineering action or recalculate a result.");
  }
  const impact = register.impacts.find((item) => item.id === impactId);
  if (!impact) return deny(register, "The candidate impact was not found.");
  if (actor.actingRole !== impact.discipline) return deny(register, "Only the affected discipline can confirm the action.");
  if (!impact.requiredAction) return deny(register, "A required action must be proposed before confirmation.");
  const next: CandidateImpact = { ...impact, actionConfirmed: true, resolution: impact.resolution ?? "Action confirmed. Recalculation was not run.", recalculated: false, deliverableRevised: false };
  return ok(audit(replaceImpact(register, next), actor, "action_confirmed", { changeId: impact.changeId, impactId, action: impact.requiredAction, recalculated: false }));
}

export function linkRecord(register: ChangeRegister, actor: ChangeActor, changeId: string, kind: "tq" | "decision" | "action", recordId: string): ChangeEnvelope {
  if (!sameWorkspace(register, actor)) return deny(register, "cross_workspace_denied");
  const current = register.changes.find((item) => item.id === changeId);
  if (!current) return deny(register, "The change was not found.");
  const next = { ...current, tqId: kind === "tq" ? recordId : current.tqId, decisionId: kind === "decision" ? recordId : current.decisionId, actionId: kind === "action" ? recordId : current.actionId };
  return ok(audit(replaceChange(register, next), actor, `change_${kind}_linked`, { changeId, recordId }));
}

export function recordException(register: ChangeRegister, actor: ChangeActor, changeId: string, exceptionId: string): ChangeEnvelope {
  if (!sameWorkspace(register, actor)) return deny(register, "cross_workspace_denied");
  if (genericAuthority(actor) || actor.actingRole !== "change_authority") return deny(register, "An exception needs change authority.");
  const current = register.changes.find((item) => item.id === changeId);
  if (!current) return deny(register, "The change was not found.");
  return ok(audit(replaceChange(register, { ...current, exceptionId }), actor, "change_exception_recorded", { changeId, exceptionId }));
}

export function supersedeChange(register: ChangeRegister, actor: ChangeActor, earlierId: string, later: Omit<ChangeRecord, "status" | "materialityClass" | "exceptionId" | "tqId" | "decisionId" | "actionId" | "supersedesId">): ChangeEnvelope {
  if (!sameWorkspace(register, actor)) return deny(register, "cross_workspace_denied");
  const earlier = register.changes.find((item) => item.id === earlierId);
  if (!earlier) return deny(register, "The earlier change was not found.");
  const created = addChange(register, actor, { ...later, supersedesId: earlierId, history: [...earlier.history, ...later.history] });
  if (created.error) return created;
  return ok(audit(created.register, actor, "change_superseded", { changeId: later.id, earlierId, recalculated: false }));
}

export function freezeChangeBaseline(register: ChangeRegister, actor: ChangeActor, id: string, baselineType: BaselineType, items: Array<{ objectId: string; revision: string; value: string }>): ChangeEnvelope {
  if (!sameWorkspace(register, actor)) return deny(register, "cross_workspace_denied");
  const lifecycle = createDeliveryLifecycle({ id: `${register.id}-lifecycle`, tenantId: register.tenantId, workspaceId: register.workspaceId, projectId: register.projectId, actorId: actor.actorId, at: actor.at });
  createBaseline({ lifecycle: lifecycle.lifecycle, id, baselineType, actorId: actor.actorId, at: actor.at, unresolvedExceptions: [] });
  return ok(audit({ ...register, baselines: [...register.baselines, { id, type: baselineType, frozen: true, items: items.map((item) => ({ ...item })) }] }, actor, "change_baseline_frozen", { changeId: id, recalculated: false }));
}

export function rewriteBaseline(): ChangeEnvelope {
  const empty = emptyRegister();
  return deny(empty, "A frozen baseline is not rewritten.");
}

export function baselineDisposition(register: ChangeRegister, changeId: string): "BASELINE_UNAFFECTED" | "BASELINE_DEVIATION" | "BASELINE_REVALIDATION_REQUIRED" {
  const change = register.changes.find((item) => item.id === changeId);
  if (!change) return "BASELINE_UNAFFECTED";
  const disturbed = register.baselines.some((baseline) => baseline.items.some((item) => item.objectId === change.sourceObjectId && (item.revision !== change.newRevision || item.value !== change.newValue)));
  if (!disturbed) return "BASELINE_UNAFFECTED";
  return change.materialityClass === "material" ? "BASELINE_REVALIDATION_REQUIRED" : "BASELINE_DEVIATION";
}

export function addRequirement(register: ChangeRegister, actor: ChangeActor, requirement: RequirementRecord): ChangeEnvelope {
  if (!sameWorkspace(register, actor)) return deny(register, "cross_workspace_denied");
  return ok({ ...register, requirements: [...register.requirements, requirement] });
}

export function applyRequirementImpact(register: ChangeRegister, actor: ChangeActor, changeId: string): ChangeEnvelope {
  if (!sameWorkspace(register, actor)) return deny(register, "cross_workspace_denied");
  const change = register.changes.find((item) => item.id === changeId);
  if (!change) return deny(register, "The change was not found.");
  const requirements = register.requirements.map((item) => item.governingInputId === change.sourceObjectId && item.status === "verified"
    ? { ...item, status: "reverification_required" as const }
    : item);
  return ok(audit({ ...register, requirements }, actor, "requirement_reverification_required", { changeId, recalculated: false }));
}

export function changeComparison(change: ChangeRecord): string {
  return `${change.previousValue ?? ""} ${change.unit ?? ""} -> ${change.newValue ?? ""} ${change.unit ?? ""}`.replace(/\s+/g, " ").trim();
}

export function impactPaths(register: ChangeRegister, changeId: string): string[] {
  return register.impacts.filter((item) => item.changeId === changeId).map((item) => item.evidence);
}

export function disciplineChangeSummary(register: ChangeRegister, discipline: Discipline) {
  const impacts = register.impacts.filter((item) => item.discipline === discipline);
  return {
    unassessed: impacts.filter((item) => item.materiality === "UNASSESSED").length,
    material: impacts.filter((item) => item.materiality === "MATERIAL_IMPACT").length,
    recalculationRequired: impacts.filter((item) => item.requiredAction === "RECALCULATE").length,
    modelRevisionRequired: impacts.filter((item) => item.requiredAction === "REMODEL").length,
    deliverableRevisionRequired: impacts.filter((item) => item.requiredAction === "REVISE_DRAWING" || item.requiredAction === "REVISE_SCHEDULE").length,
    awaitingOther: register.impacts.filter((item) => item.discipline !== discipline && register.changes.some((change) => change.id === item.changeId && change.initiatingDiscipline === discipline) && item.materiality === "UNASSESSED").length,
  };
}

export function projectChangeReadiness(register: ChangeRegister) {
  const open = register.changes.filter((item) => item.status !== "closed" && item.status !== "cancelled");
  return {
    open: open.length,
    unassessed: register.impacts.filter((item) => item.materiality === "UNASSESSED").length,
    critical: open.filter((item) => item.criticality === "CRITICAL" || item.criticality === "HIGH").length,
    material: register.impacts.filter((item) => item.materiality === "MATERIAL_IMPACT").length,
    staleCalculations: register.impacts.filter((item) => item.objectType === "calculation").length,
    staleModels: register.impacts.filter((item) => item.objectType === "model").length,
    deliverables: register.impacts.filter((item) => item.objectType === "deliverable").length,
    baselineDeviations: register.changes.filter((item) => baselineDisposition(register, item.id) !== "BASELINE_UNAFFECTED").length,
  };
}

export function feedChangeGate(register: ChangeRegister): { ready: boolean; blockers: string[] } {
  const blockers: string[] = [];
  for (const change of register.changes.filter((item) => item.stage === "feed" && item.criticality === "CRITICAL" && item.status !== "cancelled" && item.status !== "rejected")) {
    if (register.impacts.some((item) => item.changeId === change.id && item.materiality === "UNASSESSED")) blockers.push("unassessed_critical_change");
  }
  return { ready: blockers.length === 0, blockers };
}

export function detailedChangeGate(register: ChangeRegister): { ready: boolean; blockers: string[] } {
  const blockers: string[] = [];
  for (const change of register.changes.filter((item) => (item.criticality === "HIGH" || item.criticality === "CRITICAL") && item.status !== "cancelled" && item.status !== "rejected" && item.status !== "closed")) {
    if (register.impacts.some((item) => item.changeId === change.id && (item.materiality === "UNASSESSED" || (item.materiality === "MATERIAL_IMPACT" && !item.actionConfirmed)))) blockers.push("unresolved_high_change");
  }
  return { ready: blockers.length === 0, blockers };
}

export function impactAdvisory(register: ChangeRegister, changeId: string): string {
  const change = register.changes.find((item) => item.id === changeId);
  const impacts = register.impacts.filter((item) => item.changeId === changeId);
  const paths = impacts.map((item) => item.evidence).join("; ");
  return [
    "FACT: the change record and its revisions are shown as stored.",
    `CHANGE: ${change ? changeComparison(change) : "not found"}.`,
    `DETERMINISTIC_DEPENDENCY: ${paths || "none"}.`,
    "CANDIDATE_IMPACT: discovered records start unassessed.",
    "AI_INFERENCE: none is used as proof.",
    "RECOMMENDATION: the affected discipline reviews each candidate.",
    "HUMAN_DECISION_REQUIRED: materiality is not finalized here.",
    "This statement does not approve the change, recalculate a result, revise a deliverable, or rewrite a baseline.",
  ].join(" ");
}

export function changeHome(register: ChangeRegister) {
  const readiness = projectChangeReadiness(register);
  return {
    ...readiness,
    recent: register.changes.map((item) => item.id),
    approvalGranted: false as const,
    recalculated: AUTOMATIC_ENGINEERING_RECALCULATION,
    baselineRewritten: AI_AUTOMATIC_BASELINE_UPDATE_AUTHORITY,
    advisory: register.changes[0] ? impactAdvisory(register, register.changes[0].id) : "No change is selected.",
  };
}

function replaceChange(register: ChangeRegister, next: ChangeRecord): ChangeRegister {
  return { ...register, changes: register.changes.map((item) => item.id === next.id ? next : item) };
}
function replaceImpact(register: ChangeRegister, next: CandidateImpact): ChangeRegister {
  return { ...register, impacts: register.impacts.map((item) => item.id === next.id ? next : item) };
}
function emptyRegister(): ChangeRegister {
  return {
    id: "none", tenantId: "none", workspaceId: "none", projectId: "none", projectTitle: "none",
    changes: [], nodes: [], edges: [], impacts: [], baselines: [], requirements: [], events: [], audits: [],
    a4Replaced: false, d1kReplaced: false, recalculated: false,
  };
}
