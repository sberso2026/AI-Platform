import { createBaseline, createDeliveryLifecycle } from "../delivery-lifecycle";
import type { BaselineType, DeliveryStage } from "../delivery-lifecycle/model";
import {
  AI_AUTOMATIC_ENGINEERING_RECALCULATION,
  AI_INTERFACE_VALUE_MUTATION_AUTHORITY,
  type EngineeringInterface,
  type InterfaceDiscipline,
  type InterfaceRegister,
  type InterfaceStatus,
  type ReceiverDecision,
} from "./model";

export type InterfaceActor = {
  actorId: string;
  actorRole: string | null;
  actingRole: InterfaceDiscipline | "ai" | "owner";
  at: string;
  workspaceId: string;
};

export type InterfaceEnvelope = { register: InterfaceRegister; error: string | null; approvalGranted: false };

const SOURCE_NEXT: Partial<Record<InterfaceStatus, InterfaceStatus[]>> = {
  draft: ["ready_for_issue", "cancelled"],
  ready_for_issue: ["issued", "cancelled"],
  issued: ["cancelled"],
  rejected: ["cancelled"],
  accepted: ["cancelled"],
  accepted_with_conditions: ["cancelled"],
};
const RECEIVER_NEXT: Record<ReceiverDecision, ReceiverDecision[]> = {
  pending: ["received"],
  received: ["under_review"],
  under_review: ["accepted", "accepted_with_conditions", "rejected"],
  accepted: [],
  accepted_with_conditions: [],
  rejected: [],
};

const UNIT_BASE: Record<string, { dimension: string; factor: number }> = {
  n: { dimension: "force", factor: 1 },
  kn: { dimension: "force", factor: 1000 },
  pa: { dimension: "pressure", factor: 1 },
  kpa: { dimension: "pressure", factor: 1000 },
  mpa: { dimension: "pressure", factor: 1_000_000 },
  kg: { dimension: "mass", factor: 1 },
  t: { dimension: "mass", factor: 1000 },
  m: { dimension: "length", factor: 1 },
  mm: { dimension: "length", factor: 0.001 },
  kw: { dimension: "power", factor: 1000 },
  w: { dimension: "power", factor: 1 },
};

function deny(register: InterfaceRegister, error: string): InterfaceEnvelope {
  return { register, error, approvalGranted: false };
}
function ok(register: InterfaceRegister): InterfaceEnvelope {
  return { register, error: null, approvalGranted: false };
}
function sameWorkspace(register: InterfaceRegister, actor: InterfaceActor): boolean {
  return register.workspaceId === actor.workspaceId;
}
function audit(register: InterfaceRegister, actor: InterfaceActor, action: string, detail: Record<string, string | number | boolean | null>): InterfaceRegister {
  return {
    ...register,
    audits: [...register.audits, { action, at: actor.at, actorId: actor.actorId, actingRole: actor.actingRole, detail }],
    events: [...register.events, { type: action, interfaceId: typeof detail.id === "string" ? detail.id : null, at: actor.at }],
  };
}
function normUnit(unit: string): string {
  return unit.trim().toLowerCase().replace(/\s+/g, "");
}
function currentOf(register: InterfaceRegister, id: string): EngineeringInterface | undefined {
  return register.interfaces.find((item) => item.id === id && item.current);
}
function replaceInterface(register: InterfaceRegister, next: EngineeringInterface): InterfaceRegister {
  return { ...register, interfaces: register.interfaces.map((item) => item.id === next.id ? next : item) };
}

export function compareUnits(left: string, leftUnit: string | null, right: string, rightUnit: string | null, tolerance = 0): { code: "MISSING_UNIT" | "UNIT_MISMATCH" | "COMPATIBLE_EQUIVALENT" | "VALUE_CONFLICT"; normalizedLeft: number | null; normalizedRight: number | null } {
  if (!leftUnit || !rightUnit) return { code: "MISSING_UNIT", normalizedLeft: null, normalizedRight: null };
  const a = UNIT_BASE[normUnit(leftUnit)];
  const b = UNIT_BASE[normUnit(rightUnit)];
  if (!a || !b || a.dimension !== b.dimension) return { code: "UNIT_MISMATCH", normalizedLeft: null, normalizedRight: null };
  const normalizedLeft = Number(left) * a.factor;
  const normalizedRight = Number(right) * b.factor;
  if (!Number.isFinite(normalizedLeft) || !Number.isFinite(normalizedRight)) return { code: "UNIT_MISMATCH", normalizedLeft: null, normalizedRight: null };
  return { code: Math.abs(normalizedLeft - normalizedRight) <= tolerance ? "COMPATIBLE_EQUIVALENT" : "VALUE_CONFLICT", normalizedLeft, normalizedRight };
}

export function coordinateDiagnostic(input: { sourceSystem: string | null; expectedSystem: string | null; sourceAxis: string | null; expectedAxis: string | null; transformationId: string | null; datum: string | null; requiresDatum: boolean }): "COORDINATE_SYSTEM_MISSING" | "COORDINATE_SYSTEM_MISMATCH" | "AXIS_AMBIGUITY" | "REFERENCE_DATUM_MISSING" | null {
  if (input.requiresDatum && !input.datum) return "REFERENCE_DATUM_MISSING";
  if (!input.sourceSystem || !input.expectedSystem) return "COORDINATE_SYSTEM_MISSING";
  if (input.sourceSystem !== input.expectedSystem && !input.transformationId) return "COORDINATE_SYSTEM_MISMATCH";
  if (input.sourceAxis && input.expectedAxis && input.sourceAxis !== input.expectedAxis && !input.transformationId) return "AXIS_AMBIGUITY";
  return null;
}

export function createInterfaceRegister(input: {
  id: string; tenantId: string; workspaceId: string; projectId: string; projectTitle: string; actorId: string; at: string;
}): InterfaceEnvelope {
  const lifecycle = createDeliveryLifecycle({ id: `${input.id}-lifecycle`, tenantId: input.tenantId, workspaceId: input.workspaceId, projectId: input.projectId, actorId: input.actorId, at: input.at });
  const register: InterfaceRegister = {
    id: input.id, tenantId: input.tenantId, workspaceId: input.workspaceId, projectId: input.projectId, projectTitle: input.projectTitle,
    stage: "concept", lifecycle: lifecycle.lifecycle, interfaces: [], packages: [], dependencies: [], dependents: [], events: [], baselines: [],
    audits: [{ action: "interface_register_created", at: input.at, actorId: input.actorId, actingRole: "owner", detail: { canonicalInterfaceReplaced: false, d1kReplaced: false, recalculated: false } }],
    canonicalInterfaceReplaced: false, d1kReplaced: false,
  };
  return ok(register);
}

export function addInterface(register: InterfaceRegister, actor: InterfaceActor, item: Omit<EngineeringInterface, "status" | "current" | "previousId" | "receivers" | "tqId" | "decisionId"> & { receivers: InterfaceDiscipline[] }): InterfaceEnvelope {
  if (!sameWorkspace(register, actor)) return deny(register, "cross_workspace_denied");
  if (actor.actingRole !== item.sourceDiscipline) return deny(register, "Only the source discipline can create this interface.");
  if (item.value && !item.unit) return deny(register, "An interface value needs a unit.");
  if (actor.actorRole === "ai" && item.criticality === "CRITICAL") return deny(register, "AI cannot assign safety criticality.");
  const duplicate = register.interfaces.some((existing) => existing.current && existing.sourceObjectId && existing.sourceObjectId === item.sourceObjectId && existing.parameter === item.parameter && existing.receivers.some((receiver) => item.receivers.includes(receiver.discipline)));
  if (duplicate) return deny(register, "DUPLICATE_INTERFACE");
  const created: EngineeringInterface = {
    ...item,
    status: "draft",
    current: true,
    previousId: null,
    tqId: null,
    decisionId: null,
    receivers: item.receivers.map((discipline) => ({ discipline, status: "pending", condition: null, blocksStage: null, rationale: null })),
  };
  return ok(audit({ ...register, interfaces: [...register.interfaces, created] }, actor, "interface_created", { id: item.id, recalculated: false }));
}

export function progressInterface(register: InterfaceRegister, actor: InterfaceActor, id: string, to: InterfaceStatus): InterfaceEnvelope {
  if (!sameWorkspace(register, actor)) return deny(register, "cross_workspace_denied");
  const current = currentOf(register, id);
  if (!current) return deny(register, "The interface revision was not found.");
  if (current.status === "superseded") return deny(register, "A superseded interface revision cannot become current again.");
  if (to === "accepted" || to === "accepted_with_conditions" || to === "rejected" || to === "received" || to === "under_review") {
    return deny(register, "Interface state cannot skip to acceptance. Receiver decisions are recorded separately.");
  }
  const allowed = SOURCE_NEXT[current.status] ?? [];
  if (!allowed.includes(to)) return deny(register, "That interface transition is not legal.");
  if (actor.actingRole !== current.sourceDiscipline) return deny(register, "Only the source discipline can issue this interface.");
  const next = { ...current, status: to };
  return ok(audit(replaceInterface(register, next), actor, to === "issued" ? "interface_issued" : `interface_${to}`, { id, recalculated: false }));
}

export function recordReceiver(register: InterfaceRegister, actor: InterfaceActor, id: string, discipline: InterfaceDiscipline, to: ReceiverDecision, detail?: { condition?: string; blocksStage?: DeliveryStage; rationale?: string }): InterfaceEnvelope {
  if (!sameWorkspace(register, actor)) return deny(register, "cross_workspace_denied");
  if (actor.actorRole === "ai" || actor.actingRole === "ai") return deny(register, "AI cannot accept or reject an interface.");
  if (actor.actingRole !== discipline) return deny(register, "Source cannot record receiver acceptance.");
  const current = currentOf(register, id);
  if (!current) return deny(register, "The interface revision was not found.");
  if (current.status !== "issued" && current.status !== "accepted" && current.status !== "accepted_with_conditions" && current.status !== "under_review" && current.status !== "received") {
    return deny(register, "The interface has not been issued.");
  }
  const receiver = current.receivers.find((item) => item.discipline === discipline);
  if (!receiver) return deny(register, "That discipline is not a receiver.");
  if (!RECEIVER_NEXT[receiver.status].includes(to)) return deny(register, "That receiver transition is not legal.");
  if (to === "accepted_with_conditions" && !detail?.condition) return deny(register, "Conditional acceptance needs an explicit condition.");
  if (to === "rejected" && !detail?.rationale) return deny(register, "Rejection needs a rationale.");
  const receivers = current.receivers.map((item) => item.discipline === discipline ? { ...item, status: to, condition: detail?.condition ?? null, blocksStage: detail?.blocksStage ?? null, rationale: detail?.rationale ?? null } : item);
  const allAccepted = receivers.every((item) => item.status === "accepted" || item.status === "accepted_with_conditions");
  const rejected = receivers.some((item) => item.status === "rejected");
  const status: InterfaceStatus = allAccepted ? (receivers.some((item) => item.status === "accepted_with_conditions") ? "accepted_with_conditions" : "accepted") : rejected && receivers.length === 1 ? "rejected" : "issued";
  const next = { ...current, receivers, status };
  const action = to === "accepted" ? "interface_accepted" : to === "accepted_with_conditions" ? "interface_accepted_with_conditions" : to === "rejected" ? "interface_rejected" : `interface_${to}`;
  return ok(audit(replaceInterface(register, next), actor, action, { id, receiver: discipline, approvalGranted: false, recalculated: false }));
}

export function overwriteSourceValue(register: InterfaceRegister, actor: InterfaceActor, id: string, value: string): InterfaceEnvelope {
  if (!sameWorkspace(register, actor)) return deny(register, "cross_workspace_denied");
  if (actor.actorRole === "ai" || actor.actingRole === "ai" || AI_INTERFACE_VALUE_MUTATION_AUTHORITY) return deny(register, "AI cannot modify an authoritative interface value.");
  const current = currentOf(register, id);
  if (!current) return deny(register, "The interface revision was not found.");
  if (actor.actingRole !== current.sourceDiscipline) return deny(register, "The receiver cannot overwrite a source-owned value.");
  if (current.status === "accepted" || current.status === "accepted_with_conditions") return deny(register, "An accepted revision is not mutated silently.");
  return deny(register, "Use a new interface revision. The stored value was not overwritten.");
}

export function reviseInterface(register: InterfaceRegister, actor: InterfaceActor, id: string, value: string, unit: string): InterfaceEnvelope {
  if (!sameWorkspace(register, actor)) return deny(register, "cross_workspace_denied");
  if (actor.actorRole === "ai" || actor.actingRole === "ai") return deny(register, "AI cannot modify an authoritative interface value.");
  const current = currentOf(register, id);
  if (!current) return deny(register, "The interface revision was not found.");
  if (actor.actingRole !== current.sourceDiscipline) return deny(register, "The receiver cannot overwrite a source-owned value.");
  if (!unit) return deny(register, "An interface value needs a unit.");
  const successorId = `${current.id}-r${current.revision + 1}`;
  const successor: EngineeringInterface = {
    ...current,
    id: successorId,
    revision: current.revision + 1,
    previousId: current.id,
    value,
    unit,
    status: "issued",
    current: true,
    receivers: current.receivers.map((receiver) => ({ ...receiver, status: "pending", condition: null, blocksStage: null, rationale: null })),
  };
  const superseded = { ...current, status: "superseded" as const, current: false };
  const dependents = register.dependents.map((item) => item.inputIds.includes(current.id) ? { ...item, freshness: "potentially_stale" as const, conclusion: null } : item);
  const next: InterfaceRegister = {
    ...register,
    interfaces: register.interfaces.map((item) => item.id === current.id ? superseded : item).concat(successor),
    dependents,
  };
  return ok(audit(next, actor, "interface_superseded", { id: successor.id, previous: current.id, recalculated: false, freshness: "potentially_stale", impactReviewRequired: true }));
}

export function restoreSuperseded(register: InterfaceRegister): InterfaceEnvelope {
  return deny(register, "A superseded interface revision cannot become current again.");
}

export function addDependency(register: InterfaceRegister, actor: InterfaceActor, edge: InterfaceRegister["dependencies"][number]): InterfaceEnvelope {
  if (!sameWorkspace(register, actor)) return deny(register, "cross_workspace_denied");
  if (reaches(register, edge.toId, edge.fromId, 0, new Set())) return deny(register, "CIRCULAR_DEPENDENCY");
  return ok(audit({ ...register, dependencies: [...register.dependencies, edge] }, actor, "interface_dependency_linked", { id: edge.id, recalculated: false }));
}

function reaches(register: InterfaceRegister, from: string, target: string, depth: number, seen: Set<string>): boolean {
  if (depth > 8 || seen.has(from)) return false;
  if (from === target) return true;
  seen.add(from);
  return register.dependencies.some((edge) => edge.fromId === from && reaches(register, edge.toId, target, depth + 1, seen));
}

export function traverseDependencies(register: InterfaceRegister, rootId: string, depthLimit = 4): { nodes: string[]; bounded: true } {
  const limit = Math.min(Math.max(depthLimit, 0), 8);
  const nodes: string[] = [];
  const seen = new Set<string>();
  function walk(id: string, depth: number) {
    if (depth > limit || seen.has(id)) return;
    seen.add(id);
    nodes.push(id);
    for (const edge of register.dependencies) {
      if (edge.fromId === id) walk(edge.toId, depth + 1);
    }
  }
  walk(rootId, 0);
  return { nodes, bounded: true };
}

export function addDependent(register: InterfaceRegister, actor: InterfaceActor, item: InterfaceRegister["dependents"][number]): InterfaceEnvelope {
  if (!sameWorkspace(register, actor)) return deny(register, "cross_workspace_denied");
  return ok(audit({ ...register, dependents: [...register.dependents, { ...item, conclusion: null }] }, actor, "interface_downstream_linked", { id: item.id, recalculated: false }));
}

export function addPackage(register: InterfaceRegister, actor: InterfaceActor, item: InterfaceRegister["packages"][number]): InterfaceEnvelope {
  if (!sameWorkspace(register, actor)) return deny(register, "cross_workspace_denied");
  return ok(audit({ ...register, packages: [...register.packages, item] }, actor, "interface_package_recorded", { id: item.id }));
}

export function linkTechnicalQuery(register: InterfaceRegister, actor: InterfaceActor, id: string, tqId: string): InterfaceEnvelope {
  if (!sameWorkspace(register, actor)) return deny(register, "cross_workspace_denied");
  const current = register.interfaces.find((item) => item.id === id);
  if (!current) return deny(register, "The interface revision was not found.");
  return ok(audit(replaceInterface(register, { ...current, tqId }), actor, "interface_tq_linked", { id, tqId }));
}

export function linkDecision(register: InterfaceRegister, actor: InterfaceActor, id: string, decisionId: string): InterfaceEnvelope {
  if (!sameWorkspace(register, actor)) return deny(register, "cross_workspace_denied");
  const current = register.interfaces.find((item) => item.id === id);
  if (!current) return deny(register, "The interface revision was not found.");
  return ok(audit(replaceInterface(register, { ...current, decisionId }), actor, "interface_decision_linked", { id, decisionId }));
}

export function freezeInterfaceBaseline(register: InterfaceRegister, actor: InterfaceActor, baselineType: BaselineType, id: string): InterfaceEnvelope {
  if (!sameWorkspace(register, actor)) return deny(register, "cross_workspace_denied");
  const lifecycleBaseline = createBaseline({ lifecycle: register.lifecycle, id, baselineType, actorId: actor.actorId, at: actor.at, unresolvedExceptions: [] });
  const revisions = register.interfaces.filter((item) => item.current).map((item) => ({ id: item.id, revision: item.revision, status: item.status }));
  return ok(audit({
    ...register,
    lifecycle: lifecycleBaseline.lifecycle,
    baselines: [...register.baselines, { id, type: baselineType, frozen: true, revisions }],
  }, actor, "interface_baseline_frozen", { id, recalculated: false }));
}

export function diagnoseInterfaces(register: InterfaceRegister, at: string): string[] {
  const codes = new Set<string>();
  const current = register.interfaces.filter((item) => item.current);
  for (const item of current) {
    if (!item.sourceObjectId) codes.add("ORPHAN_INTERFACE");
    if (!item.receivers.length) codes.add("MISSING_RECEIVER");
    if (item.value && !item.unit) codes.add("MISSING_UNIT");
    if (item.stage !== register.stage) codes.add("LIFECYCLE_STAGE_MISMATCH");
    if (register.stage === "detailed_engineering" && item.maturity === "preliminary") codes.add("MATURITY_MISMATCH");
    if (item.dueDate && item.dueDate < at && item.receivers.some((receiver) => receiver.status !== "accepted" && receiver.status !== "accepted_with_conditions")) codes.add("OVERDUE_INTERFACE");
    if (item.receivers.some((receiver) => receiver.status === "pending" || receiver.status === "received" || receiver.status === "under_review")) codes.add("UNACCEPTED_INTERFACE");
    if (item.status === "rejected" || item.receivers.some((receiver) => receiver.status === "rejected")) codes.add("REJECTED_INTERFACE");
    if (item.receivers.some((receiver) => receiver.status === "accepted_with_conditions")) codes.add("ACCEPTED_WITH_CONDITIONS");
    if (item.assumption) codes.add("UNRESOLVED_ASSUMPTION");
    const frame = coordinateDiagnostic({
      sourceSystem: item.coordinateSystem,
      expectedSystem: item.category === "PIPING_LOAD" ? "PROJECT_GLOBAL" : item.coordinateSystem,
      sourceAxis: item.axisConvention,
      expectedAxis: item.category === "PIPING_LOAD" ? "GLOBAL" : item.axisConvention,
      transformationId: item.transformationId,
      datum: item.datum,
      requiresDatum: item.category === "CIVIL_LEVEL" || item.category === "ELEVATION",
    });
    if (frame) codes.add(frame);
  }
  for (let index = 0; index < current.length; index += 1) {
    for (const other of current.slice(index + 1)) {
      const left = current[index];
      if (!left || !left.canonicalParameterId || left.canonicalParameterId !== other.canonicalParameterId || left.value === null || other.value === null) continue;
      const compared = compareUnits(left.value, left.unit, other.value, other.unit);
      if (compared.code === "VALUE_CONFLICT" || compared.code === "UNIT_MISMATCH" || compared.code === "MISSING_UNIT") codes.add(compared.code);
    }
  }
  if (register.dependents.some((item) => item.freshness === "potentially_stale")) codes.add("DOWNSTREAM_STALE_DEPENDENCY");
  if (register.baselines.some((baseline) => baseline.revisions.some((revision) => {
    const live = register.interfaces.find((item) => item.previousId === revision.id && item.current);
    return Boolean(live);
  }))) codes.add("BASELINE_INTERFACE_MISMATCH");
  return [...codes];
}

export function interfaceMatrix(register: InterfaceRegister): Array<{ source: InterfaceDiscipline; receiver: InterfaceDiscipline; active: number; open: number; rejected: number; conditional: number; stale: number }> {
  const rows: Array<{ source: InterfaceDiscipline; receiver: InterfaceDiscipline; active: number; open: number; rejected: number; conditional: number; stale: number }> = [];
  for (const item of register.interfaces.filter((entry) => entry.current)) {
    for (const receiver of item.receivers) {
      const stale = register.dependents.some((dependent) => dependent.inputIds.includes(item.id) && dependent.freshness === "potentially_stale") ? 1 : 0;
      const existing = rows.find((row) => row.source === item.sourceDiscipline && row.receiver === receiver.discipline);
      const open = receiver.status === "pending" || receiver.status === "received" || receiver.status === "under_review" ? 1 : 0;
      const rejected = receiver.status === "rejected" ? 1 : 0;
      const conditional = receiver.status === "accepted_with_conditions" ? 1 : 0;
      if (existing) {
        existing.active += 1;
        existing.open += open;
        existing.rejected += rejected;
        existing.conditional += conditional;
        existing.stale += stale;
      } else {
        rows.push({ source: item.sourceDiscipline, receiver: receiver.discipline, active: 1, open, rejected, conditional, stale });
      }
    }
  }
  return rows;
}

export function interfaceRegisterView(register: InterfaceRegister, filter?: { source?: InterfaceDiscipline; receiver?: InterfaceDiscipline; stale?: boolean }) {
  return register.interfaces.filter((item) => {
    if (filter?.source && item.sourceDiscipline !== filter.source) return false;
    if (filter?.receiver && !item.receivers.some((receiver) => receiver.discipline === filter.receiver)) return false;
    if (filter?.stale && !register.dependents.some((dependent) => dependent.inputIds.includes(item.id) && dependent.freshness === "potentially_stale")) return false;
    return true;
  });
}

export function disciplineInterfaceSummary(register: InterfaceRegister, discipline: InterfaceDiscipline) {
  const incoming = register.interfaces.filter((item) => item.current && item.receivers.some((receiver) => receiver.discipline === discipline));
  const outgoing = register.interfaces.filter((item) => item.current && item.sourceDiscipline === discipline);
  return {
    waiting: incoming.filter((item) => item.status === "draft" || item.status === "ready_for_issue").length,
    received: incoming.filter((item) => item.receivers.some((receiver) => receiver.discipline === discipline && receiver.status !== "pending")).length,
    owed: outgoing.filter((item) => item.status === "draft" || item.status === "ready_for_issue").length,
    accepted: outgoing.filter((item) => item.receivers.every((receiver) => receiver.status === "accepted" || receiver.status === "accepted_with_conditions")).length,
    rejected: outgoing.filter((item) => item.receivers.some((receiver) => receiver.status === "rejected")).length,
    stale: register.dependents.filter((item) => item.freshness === "potentially_stale" && item.inputIds.some((id) => register.interfaces.some((iface) => iface.id === id && (iface.sourceDiscipline === discipline || iface.receivers.some((receiver) => receiver.discipline === discipline))))).length,
  };
}

export function projectInterfaceReadiness(register: InterfaceRegister, at: string) {
  const current = register.interfaces.filter((item) => item.current);
  const accepted = current.filter((item) => item.receivers.every((receiver) => receiver.status === "accepted")).length;
  const conditional = current.filter((item) => item.receivers.some((receiver) => receiver.status === "accepted_with_conditions")).length;
  const pending = current.filter((item) => item.receivers.some((receiver) => receiver.status === "pending" || receiver.status === "received" || receiver.status === "under_review")).length;
  const rejected = current.filter((item) => item.receivers.some((receiver) => receiver.status === "rejected")).length;
  const overdue = current.filter((item) => item.dueDate && item.dueDate < at && item.receivers.some((receiver) => receiver.status !== "accepted" && receiver.status !== "accepted_with_conditions")).length;
  const stale = register.dependents.filter((item) => item.freshness === "potentially_stale").length;
  return { active: current.length, accepted, conditional, pending, rejected, overdue, stale, blocking: rejected + overdue };
}

export function feedInterfaceGate(register: InterfaceRegister): { ready: boolean; blockers: string[] } {
  const blockers: string[] = [];
  for (const item of register.interfaces.filter((entry) => entry.current && entry.criticality === "CRITICAL" && entry.stage === "feed")) {
    if (item.status !== "issued" && item.status !== "accepted" && item.status !== "accepted_with_conditions") blockers.push("critical_interface_not_issued");
    if (item.receivers.some((receiver) => receiver.status === "rejected")) blockers.push("rejected_critical_interface");
    if (item.receivers.some((receiver) => receiver.status === "pending")) blockers.push("critical_receiver_not_accepted");
  }
  return { ready: blockers.length === 0, blockers };
}

export function detailedInterfaceGate(register: InterfaceRegister): { ready: boolean; blockers: string[] } {
  const blockers: string[] = [];
  for (const item of register.interfaces.filter((entry) => entry.current && (entry.criticality === "CRITICAL" || entry.criticality === "HIGH"))) {
    if (item.receivers.some((receiver) => receiver.status !== "accepted" && receiver.status !== "accepted_with_conditions")) blockers.push("critical_interface_not_accepted");
    if (item.receivers.some((receiver) => receiver.blocksStage === "detailed_engineering" && receiver.status === "accepted_with_conditions")) blockers.push("unresolved_condition");
  }
  if (register.dependents.some((item) => item.freshness === "potentially_stale")) blockers.push("stale_downstream_dependency");
  return { ready: blockers.length === 0, blockers };
}

export function publishOverdue(register: InterfaceRegister, actor: InterfaceActor): InterfaceEnvelope {
  if (!sameWorkspace(register, actor)) return deny(register, "cross_workspace_denied");
  const overdue = register.interfaces.filter((item) => item.current && item.dueDate && item.dueDate < actor.at && item.receivers.some((receiver) => receiver.status !== "accepted" && receiver.status !== "accepted_with_conditions"));
  if (!overdue.length) return deny(register, "No interface is overdue.");
  return ok(audit(register, actor, "interface_overdue", { id: overdue[0]?.id ?? null, count: overdue.length }));
}

export function interfaceAdvisory(register: InterfaceRegister): string {
  const stale = register.dependents.filter((item) => item.freshness === "potentially_stale").length;
  return [
    "Advisory only.",
    `FACT: ${register.interfaces.filter((item) => item.current).length} current interface revision(s) are recorded.`,
    "INTERFACE_VALUE: source-owned values are shown with their units and revisions.",
    `STALE_DEPENDENCY: ${stale} downstream record(s) are potentially stale.`,
    "CONFLICT: a value or unit disagreement is a review candidate. This statement does not decide which discipline is wrong.",
    "ASSUMPTION: acceptance is not design approval.",
    "RECOMMENDATION: the receiving discipline reviews a superseded handoff before further use.",
    "HUMAN_DECISION_REQUIRED: a human decides whether downstream work must be revised.",
    "This statement does not accept an interface or change a source value.",
  ].join(" ");
}

export function interfaceHome(register: InterfaceRegister, at: string) {
  const readiness = projectInterfaceReadiness(register, at);
  return {
    stage: register.stage,
    ...readiness,
    issued: register.interfaces.filter((item) => item.status === "issued").length,
    underReview: register.interfaces.filter((item) => item.receivers.some((receiver) => receiver.status === "under_review")).length,
    critical: register.interfaces.filter((item) => item.current && item.criticality === "CRITICAL").length,
    blockers: detailedInterfaceGate(register).blockers,
    matrix: interfaceMatrix(register),
    diagnostics: diagnoseInterfaces(register, at),
    advisory: interfaceAdvisory(register),
    approvalGranted: false as const,
    recalculated: AI_AUTOMATIC_ENGINEERING_RECALCULATION,
  };
}
