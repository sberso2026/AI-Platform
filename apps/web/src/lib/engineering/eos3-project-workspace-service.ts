/**
 * Thin in-process project workspace service for EOS Pilot UI-1.
 * Wraps Eos3CanonicalObjectStore — no duplicate canonical tables.
 * Project-scoped; does not broaden backend authority semantics.
 */

import { Eos3CanonicalObjectStore } from "./eos3-object-store";
import type { Eos3CanonicalObject, Eos3ObjectType } from "./eos3-canonical-objects";
import { traceDigitalThread } from "./eos3-digital-thread";
import type { Eos3RelationshipType } from "./eos3-relationships";
import {
  DEFAULT_PILOT_LIFECYCLE,
  type GateResult,
} from "./project-workspace-ia";
import {
  EOS3_ACTIVATION_STATUS,
  EOS3_GENERATION,
  EOS3_RELEASE_STATUS,
  EOS3_VERSION,
} from "../commerce/eos3-identity";

export type ProjectSetupProfile = {
  projectCode: string;
  projectName: string;
  client: string;
  site: string;
  location: string;
  industry: string;
  projectType: string;
  description: string;
  jurisdiction: {
    country: string;
    stateRegion: string;
    profileName: string;
  };
  standards: {
    engineeringStandards: string[];
    companyStandards: string[];
    codeProfiles: string[];
  };
  confidentiality: string;
  roles: string[];
  disciplines: string[];
  lifecycleTemplate: string;
  governanceProfile: string;
  qualificationContext: string;
  assetRelationship: string;
  checklist: Record<string, boolean>;
};

export type LifecycleState = {
  templateKey: string;
  currentKey: string;
  history: Array<{
    fromKey: string;
    toKey: string;
    at: string;
    actorId: string;
    authority: string;
    gateResult?: GateResult;
    rationale?: string;
  }>;
  gateEvaluations: Record<
    string,
    {
      result: GateResult | "NOT_EVALUATED";
      blocking: string[];
      conditions: string[];
      evidence: string[];
      evaluatedAt: string | null;
      authority: string | null;
    }
  >;
};

export type PilotFeedback = {
  id: string;
  projectId: string;
  page: string;
  objectRef: string;
  category:
    | "Report Bug"
    | "Report UX Issue"
    | "Report Product Gap"
    | "Too much input"
    | "Repeated information"
    | "EOS should know this already";
  description: string;
  severity: string;
  reference: string;
  createdAt: string;
  actorId: string | null;
};

export type WorkspaceSnapshot = {
  projectId: string;
  setup: ProjectSetupProfile;
  setupComplete: boolean;
  setupStatus: "PROJECT_SETUP_COMPLETE" | "PROJECT_SETUP_INCOMPLETE";
  lifecycle: LifecycleState;
  objects: Eos3CanonicalObject[];
  relationships: ReturnType<Eos3CanonicalObjectStore["view"]>["relationships"];
  audit: Eos3CanonicalObjectStore["audit"];
  events: Eos3CanonicalObjectStore["events"];
  qualification: {
    d1: "QUALIFIED_BOUNDED";
    nonD1: "NOT_QUALIFIED";
    spaceGassGlobal: "NO";
    externalSolverGlobal: "NO";
  };
  integrations: Array<{
    connector: string;
    capability: string;
    status: string;
    qualification: string;
    direction: string;
  }>;
  solvers: Array<{
    name: string;
    mode: string;
    qualification: string;
    executionSupport: string;
  }>;
  migration: {
    claim: string;
    eligibility: string;
    status: string;
    authorization: string;
  };
  trust: {
    generation: number;
    releaseState: string;
    activation: string;
    supported: string[];
    unsupported: string[];
    limitations: string[];
  };
  handover: {
    readiness: string;
    acceptance: string;
    outstanding: string[];
    designVsAsBuilt: string;
  };
  feedback: PilotFeedback[];
  counts: Record<string, number>;
};

type ProjectWorkspaceRuntime = {
  store: Eos3CanonicalObjectStore;
  setup: ProjectSetupProfile;
  lifecycle: LifecycleState;
  feedback: PilotFeedback[];
  tenantId: string;
  workspaceId: string;
};

const runtimes = new Map<string, ProjectWorkspaceRuntime>();

const DEFAULT_CHECKLIST: Record<string, boolean> = {
  projectProfile: false,
  jurisdiction: false,
  standards: false,
  lifecycle: false,
  roles: false,
  engineeringBasis: false,
  requirements: false,
  systemsInterfaces: false,
  deliverablePlan: false,
};

function defaultSetup(): ProjectSetupProfile {
  return {
    projectCode: "",
    projectName: "",
    client: "",
    site: "",
    location: "",
    industry: "",
    projectType: "",
    description: "",
    jurisdiction: { country: "", stateRegion: "", profileName: "" },
    standards: { engineeringStandards: [], companyStandards: [], codeProfiles: [] },
    confidentiality: "Internal",
    roles: [],
    disciplines: [],
    lifecycleTemplate: "pilot-default-p0-g6",
    governanceProfile: "eos-controlled-pilot",
    qualificationContext: "D1 QUALIFIED_BOUNDED; non-D1 NOT_QUALIFIED",
    assetRelationship: "",
    checklist: { ...DEFAULT_CHECKLIST },
  };
}

function defaultLifecycle(): LifecycleState {
  return {
    templateKey: "pilot-default-p0-g6",
    currentKey: "P0",
    history: [],
    gateEvaluations: Object.fromEntries(
      DEFAULT_PILOT_LIFECYCLE.filter((s) => s.kind === "gate").map((g) => [
        g.key,
        {
          result: "NOT_EVALUATED" as const,
          blocking: [],
          conditions: [],
          evidence: [],
          evaluatedAt: null,
          authority: null,
        },
      ]),
    ),
  };
}

function ensureRuntime(
  projectId: string,
  opts?: { tenantId?: string; workspaceId?: string },
): ProjectWorkspaceRuntime {
  let rt = runtimes.get(projectId);
  if (!rt) {
    rt = {
      store: new Eos3CanonicalObjectStore(),
      setup: defaultSetup(),
      lifecycle: defaultLifecycle(),
      feedback: [],
      tenantId: opts?.tenantId ?? "00000000-0000-4000-8000-000000000041",
      workspaceId: opts?.workspaceId ?? "00000000-0000-4000-8000-000000000042",
    };
    runtimes.set(projectId, rt);
  }
  return rt;
}

function isSetupComplete(setup: ProjectSetupProfile): boolean {
  const c = setup.checklist;
  return Boolean(
    c.projectProfile &&
      c.jurisdiction &&
      c.standards &&
      c.lifecycle &&
      c.roles &&
      setup.projectCode &&
      setup.projectName &&
      setup.jurisdiction.country,
  );
}

function countByType(store: Eos3CanonicalObjectStore): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const obj of store.objects.values()) {
    counts[obj.objectType] = (counts[obj.objectType] ?? 0) + 1;
  }
  return counts;
}

export function getOrCreateProjectWorkspace(
  projectId: string,
  opts?: { tenantId?: string; workspaceId?: string },
): ProjectWorkspaceRuntime {
  return ensureRuntime(projectId, opts);
}

export function snapshotProjectWorkspace(projectId: string): WorkspaceSnapshot {
  const rt = ensureRuntime(projectId);
  const setupComplete = isSetupComplete(rt.setup);
  return {
    projectId,
    setup: rt.setup,
    setupComplete,
    setupStatus: setupComplete ? "PROJECT_SETUP_COMPLETE" : "PROJECT_SETUP_INCOMPLETE",
    lifecycle: rt.lifecycle,
    objects: [...rt.store.objects.values()],
    relationships: rt.store.relationships,
    audit: rt.store.audit,
    events: rt.store.events,
    qualification: {
      d1: "QUALIFIED_BOUNDED",
      nonD1: "NOT_QUALIFIED",
      spaceGassGlobal: "NO",
      externalSolverGlobal: "NO",
    },
    integrations: [
      {
        connector: "External CAD/CAE",
        capability: "Import/export",
        status: "NOT_SUPPORTED",
        qualification: "NO",
        direction: "none",
      },
      {
        connector: "SPACE GASS",
        capability: "Structural solver",
        status: "NOT_CONNECTED",
        qualification: "NO",
        direction: "none",
      },
    ],
    solvers: [
      {
        name: "D1 Structural",
        mode: "in-process",
        qualification: "QUALIFIED_BOUNDED",
        executionSupport: "SUPPORTED",
      },
      {
        name: "External solver adapters",
        mode: "external",
        qualification: "NO",
        executionSupport: "NOT_SUPPORTED",
      },
    ],
    migration: {
      claim: "LEGACY_PRODUCTION_MIGRATION=NOT_SUPPORTED_INITIAL_RELEASE",
      eligibility: "NOT_ELIGIBLE_PRODUCTION",
      status: "COEXISTENCE_ONLY",
      authorization: "DENIED_WITHOUT_EXPLICIT_GOVERNANCE",
    },
    trust: {
      generation: EOS3_GENERATION,
      releaseState: `${EOS3_RELEASE_STATUS} ${EOS3_VERSION}`,
      activation: EOS3_ACTIVATION_STATUS,
      supported: [
        "Canonical objects",
        "Digital thread",
        "Decision/optimization (bounded)",
        "Knowledge retrieval (bounded)",
        "Project-to-asset (bounded)",
        "D1 QUALIFIED_BOUNDED",
      ],
      unsupported: [
        "Legacy Production migration",
        "Public self-service",
        "External solver qualification",
        "AI approval authority",
      ],
      limitations: [
        "Controlled design-partner / pilot access only",
        "UI exposes existing EOS 3 capability without broadening authority",
      ],
    },
    handover: {
      readiness: countByType(rt.store).Asset ? "IN_PROGRESS" : "NOT_STARTED",
      acceptance: "PENDING",
      outstanding: [],
      designVsAsBuilt: "DESIGN_BASELINE",
    },
    feedback: rt.feedback,
    counts: countByType(rt.store),
  };
}

/** Hydrate in-process setup from persisted engineering_projects row / metadata. */
export function hydrateProjectSetupFromRecord(
  projectId: string,
  project: Record<string, unknown>,
): WorkspaceSnapshot {
  const metadata =
    project.metadata && typeof project.metadata === "object"
      ? (project.metadata as Record<string, unknown>)
      : {};
  const saved = metadata.eos_project_setup;
  if (saved && typeof saved === "object") {
    updateProjectSetup(projectId, saved as Partial<ProjectSetupProfile>);
  } else {
    updateProjectSetup(projectId, {
      projectCode: String(project.project_code ?? ""),
      projectName: String(project.project_name ?? ""),
      client: String(project.client_name ?? ""),
      site: String(project.site_name ?? ""),
      location: String(project.location ?? ""),
      industry: String(project.industry ?? ""),
      projectType: String(project.project_type ?? ""),
    });
  }
  return snapshotProjectWorkspace(projectId);
}

export function updateProjectSetup(
  projectId: string,
  patch: Partial<ProjectSetupProfile> & { checklist?: Record<string, boolean> },
): WorkspaceSnapshot {
  const rt = ensureRuntime(projectId);
  rt.setup = {
    ...rt.setup,
    ...patch,
    jurisdiction: { ...rt.setup.jurisdiction, ...(patch.jurisdiction ?? {}) },
    standards: {
      engineeringStandards:
        patch.standards?.engineeringStandards ?? rt.setup.standards.engineeringStandards,
      companyStandards: patch.standards?.companyStandards ?? rt.setup.standards.companyStandards,
      codeProfiles: patch.standards?.codeProfiles ?? rt.setup.standards.codeProfiles,
    },
    checklist: { ...rt.setup.checklist, ...(patch.checklist ?? {}) },
  };
  if (rt.setup.projectCode && rt.setup.projectName) {
    rt.setup.checklist.projectProfile = true;
  }
  if (rt.setup.jurisdiction.country) rt.setup.checklist.jurisdiction = true;
  if (
    rt.setup.standards.engineeringStandards.length > 0 ||
    rt.setup.standards.codeProfiles.length > 0
  ) {
    rt.setup.checklist.standards = true;
  }
  if (rt.setup.lifecycleTemplate) rt.setup.checklist.lifecycle = true;
  if (rt.setup.roles.length > 0) rt.setup.checklist.roles = true;
  return snapshotProjectWorkspace(projectId);
}

export function createWorkspaceObject(
  projectId: string,
  input: {
    objectType: Eos3ObjectType;
    stableObjectId: string;
    displayName: string;
    payload?: Record<string, unknown>;
    actorId?: string | null;
    authority?: string | null;
    disciplineType?: string | null;
  },
): Eos3CanonicalObject {
  const rt = ensureRuntime(projectId);
  const obj = rt.store.createObject({
    tenantId: rt.tenantId,
    workspaceId: rt.workspaceId,
    projectId,
    objectType: input.objectType,
    stableObjectId: input.stableObjectId,
    displayName: input.displayName,
    sourceOwnerId: input.actorId ?? "project-engineer",
    payload: input.payload ?? {},
    actorId: input.actorId ?? "project-engineer",
    authority: input.authority ?? "project_engineer",
    disciplineType: input.disciplineType ?? null,
  });
  if (input.objectType === "EngineeringBasis") rt.setup.checklist.engineeringBasis = true;
  if (input.objectType === "Requirement") rt.setup.checklist.requirements = true;
  if (input.objectType === "System" || input.objectType === "Interface") {
    rt.setup.checklist.systemsInterfaces = true;
  }
  if (input.objectType === "Deliverable") rt.setup.checklist.deliverablePlan = true;
  return obj;
}

export function relateWorkspaceObjects(
  projectId: string,
  input: {
    relationshipType: Eos3RelationshipType;
    fromObjectId: string;
    toObjectId: string;
    metadata?: Record<string, unknown>;
  },
) {
  const rt = ensureRuntime(projectId);
  return rt.store.relate({
    tenantId: rt.tenantId,
    workspaceId: rt.workspaceId,
    projectId,
    relationshipType: input.relationshipType,
    fromObjectId: input.fromObjectId,
    toObjectId: input.toObjectId,
    metadata: input.metadata ?? {},
  });
}

export function listWorkspaceObjects(projectId: string, objectType?: Eos3ObjectType) {
  const rt = ensureRuntime(projectId);
  const all = [...rt.store.objects.values()];
  return objectType ? all.filter((o) => o.objectType === objectType) : all;
}

export function getWorkspaceObject(projectId: string, objectId: string) {
  return ensureRuntime(projectId).store.objects.get(objectId) ?? null;
}

export function findByStableId(projectId: string, stableObjectId: string) {
  return (
    [...ensureRuntime(projectId).store.objects.values()].find(
      (o) => o.stableObjectId === stableObjectId,
    ) ?? null
  );
}

export function reviseWorkspaceObject(
  projectId: string,
  objectId: string,
  payload: Record<string, unknown>,
  actorId = "project-engineer",
) {
  const rt = ensureRuntime(projectId);
  const obj = rt.store.objects.get(objectId);
  if (!obj) throw new Error("object_not_found");
  const revCount = [...rt.store.revisions.values()].filter((r) => r.objectId === objectId).length;
  return rt.store.createRevision({
    objectId,
    revisionIdentifier: `R${revCount + 1}`,
    payload,
    actorId,
    authority: "project_engineer",
    source: "eos3.project.workspace.ui",
    changeRationale: "UI revision",
  });
}

export function digitalThreadFrom(projectId: string, objectId: string) {
  const rt = ensureRuntime(projectId);
  const trace = traceDigitalThread(rt.store.view(), objectId);
  const ids = new Set(trace.map((t) => t.objectId));
  return {
    path: trace,
    nodes: [...ids]
      .map((id) => rt.store.objects.get(id))
      .filter(Boolean) as Eos3CanonicalObject[],
    edges: rt.store.relationships.filter(
      (r) => ids.has(r.fromObjectId) || ids.has(r.toObjectId),
    ),
  };
}

export function evaluateGate(
  projectId: string,
  gateKey: string,
  opts?: { forcePass?: boolean; actorId?: string; authority?: string },
): LifecycleState["gateEvaluations"][string] {
  const rt = ensureRuntime(projectId);
  const counts = countByType(rt.store);
  const blocking: string[] = [];
  // G0 mandatory: at least one Requirement must exist
  if (gateKey === "G0" && !counts.Requirement) {
    blocking.push("Mandatory requirement missing for G0 Opportunity Validated");
  }
  if (gateKey === "G0" && !rt.setup.jurisdiction.country) {
    blocking.push("Jurisdiction profile incomplete");
  }
  if (gateKey === "G1" && !counts.EngineeringBasis) {
    blocking.push("Engineering Basis required for G1");
  }
  let result: GateResult | "NOT_EVALUATED" = blocking.length
    ? "HOLD"
    : opts?.forcePass
      ? "PASS"
      : "PASS";
  if (blocking.length && opts?.forcePass) {
    result = "HOLD"; // cannot force past blockers without satisfying criteria
  }
  const evaluation = {
    result,
    blocking,
    conditions: blocking.length ? [] : ["All configured readiness criteria met"],
    evidence: Object.entries(counts).map(([k, v]) => `${k}:${v}`),
    evaluatedAt: new Date().toISOString(),
    authority: opts?.authority ?? null,
  };
  rt.lifecycle.gateEvaluations[gateKey] = evaluation;
  rt.store.audit.push({
    action: "gate_evaluated",
    objectId: projectId,
    actorId: opts?.actorId ?? null,
    at: evaluation.evaluatedAt!,
    detail: { gateKey, result, blocking },
  });
  return evaluation;
}

export function transitionLifecycle(
  projectId: string,
  toKey: string,
  opts: {
    actorId: string;
    authority: string;
    gateResult?: GateResult;
    rationale?: string;
  },
): { ok: boolean; error?: string; lifecycle: LifecycleState } {
  const rt = ensureRuntime(projectId);
  const keys = DEFAULT_PILOT_LIFECYCLE.map((s) => s.key);
  const fromIdx = keys.indexOf(rt.lifecycle.currentKey);
  const toIdx = keys.indexOf(toKey);
  if (toIdx < 0) return { ok: false, error: "Unknown lifecycle key", lifecycle: rt.lifecycle };
  if (toIdx !== fromIdx + 1) {
    return {
      ok: false,
      error: "Invalid lifecycle transition — only governed next-stage advancement is allowed",
      lifecycle: rt.lifecycle,
    };
  }
  const target = DEFAULT_PILOT_LIFECYCLE[toIdx];
  if (target.kind === "gate") {
    const ev = rt.lifecycle.gateEvaluations[toKey] ?? evaluateGate(projectId, toKey);
    if (ev.result === "HOLD" || ev.result === "STOP" || ev.result === "RECYCLE") {
      return {
        ok: false,
        error: `Gate ${toKey} blocks advancement: ${ev.blocking.join("; ") || ev.result}`,
        lifecycle: rt.lifecycle,
      };
    }
    if (!opts.authority) {
      return { ok: false, error: "Human authority required for gate transition", lifecycle: rt.lifecycle };
    }
  }
  const fromKey = rt.lifecycle.currentKey;
  rt.lifecycle.currentKey = toKey;
  rt.lifecycle.history.push({
    fromKey,
    toKey,
    at: new Date().toISOString(),
    actorId: opts.actorId,
    authority: opts.authority,
    gateResult: opts.gateResult,
    rationale: opts.rationale,
  });
  return { ok: true, lifecycle: rt.lifecycle };
}

export function impactForChange(projectId: string, changeObjectId: string) {
  const rt = ensureRuntime(projectId);
  const affected = rt.store.relationships
    .filter(
      (r) =>
        r.fromObjectId === changeObjectId &&
        (r.relationshipType === "CHANGE_AFFECTS_OBJECT" ||
          r.relationshipType === "CHANGE_PRODUCES_IMPACT"),
    )
    .map((r) => {
      const obj = rt.store.objects.get(r.toObjectId);
      return {
        objectId: r.toObjectId,
        objectType: obj?.objectType,
        displayName: obj?.displayName,
        stableObjectId: obj?.stableObjectId,
        governedState: obj?.governedState ?? "POTENTIALLY_STALE",
        relationshipType: r.relationshipType,
      };
    });
  return affected;
}

export function applyChangeMassPilot(
  projectId: string,
  changeStableId: string,
  fromMass: string,
  toMass: string,
) {
  const rt = ensureRuntime(projectId);
  const change =
    findByStableId(projectId, changeStableId) ??
    createWorkspaceObject(projectId, {
      objectType: "Change",
      stableObjectId: changeStableId,
      displayName: `Equipment mass change ${fromMass} → ${toMass}`,
      payload: { fromMass, toMass, reason: "Pilot mass update" },
    });

  const mark = (type: Eos3ObjectType, stable: string, name: string) => {
    let obj = findByStableId(projectId, stable);
    if (!obj) {
      obj = createWorkspaceObject(projectId, {
        objectType: type,
        stableObjectId: stable,
        displayName: name,
        payload: type === "Assumption" ? { equipmentMass: toMass } : {},
      });
    } else if (type === "Assumption") {
      reviseWorkspaceObject(projectId, obj.id, {
        ...obj.payload,
        equipmentMass: toMass,
        priorMass: fromMass,
      });
      rt.store.markStale(obj.id, `mass changed ${fromMass} → ${toMass}`);
      obj = rt.store.objects.get(obj.id)!;
    } else {
      rt.store.markImpactCandidate(obj.id, change.id);
      obj = rt.store.objects.get(obj.id)!;
    }
    relateWorkspaceObjects(projectId, {
      relationshipType: "CHANGE_AFFECTS_OBJECT",
      fromObjectId: change.id,
      toObjectId: obj.id,
    });
    return obj;
  };

  const assumption = mark("Assumption", "ASM-001", "Equipment operating mass assumption");
  const iface = mark("Interface", "INT-001", "Structural–mechanical interface");
  const calc = mark("Calculation", "CALC-001", "Foundation load calculation");
  const decision = mark("Decision", "DEC-001", "Foundation design option decision");
  const deliverable = mark("Deliverable", "DEL-001", "Structural modification deliverable");

  return {
    change,
    affected: [assumption, iface, calc, decision, deliverable],
    impact: impactForChange(projectId, change.id),
  };
}

export function seedPilot001(projectId: string) {
  const specs: Array<{
    objectType: Eos3ObjectType;
    stableObjectId: string;
    displayName: string;
    payload?: Record<string, unknown>;
  }> = [
    {
      objectType: "Requirement",
      stableObjectId: "REQ-001",
      displayName: "Structural modification shall support revised equipment mass",
      payload: { priority: "high", status: "approved", verificationStatus: "planned" },
    },
    {
      objectType: "EngineeringBasis",
      stableObjectId: "EB-001",
      displayName: "Pilot structural engineering basis",
      payload: { designCriteria: "AS/NZS structural", approvalState: "draft" },
    },
    {
      objectType: "Assumption",
      stableObjectId: "ASM-001",
      displayName: "Equipment operating mass assumption",
      payload: { equipmentMass: "12 t", status: "open", verificationRequirement: "vendor data" },
    },
    {
      objectType: "System",
      stableObjectId: "SYS-STR-001",
      displayName: "Primary structural system",
      payload: { hierarchy: "plant/structure" },
    },
    {
      objectType: "Interface",
      stableObjectId: "INT-001",
      displayName: "Structural–mechanical interface",
      payload: { status: "open", owner: "structural" },
    },
    {
      objectType: "Calculation",
      stableObjectId: "CALC-001",
      displayName: "Foundation load calculation",
      payload: {
        qualificationStatus: "QUALIFIED_BOUNDED",
        discipline: "structural",
        stale: false,
      },
    },
    {
      objectType: "Decision",
      stableObjectId: "DEC-001",
      displayName: "Foundation design option decision",
      payload: {
        question: "Which foundation reinforcement option?",
        humanAuthority: true,
        aiIsAuthority: false,
      },
    },
    {
      objectType: "Deliverable",
      stableObjectId: "DEL-001",
      displayName: "Structural modification deliverable",
      payload: { status: "in_progress", revision: "A" },
    },
    {
      objectType: "Review",
      stableObjectId: "REV-001",
      displayName: "G0 readiness review",
      payload: { reviewType: "gate", status: "open", aiMayApprove: false },
    },
    {
      objectType: "Change",
      stableObjectId: "CHG-001",
      displayName: "Equipment mass increase change",
      payload: { fromMass: "12 t", toMass: "15 t", status: "open" },
    },
  ];

  const created: Eos3CanonicalObject[] = [];
  for (const spec of specs) {
    if (!findByStableId(projectId, spec.stableObjectId)) {
      created.push(createWorkspaceObject(projectId, spec));
    } else {
      created.push(findByStableId(projectId, spec.stableObjectId)!);
    }
  }

  const byStable = (id: string) => findByStableId(projectId, id)!;
  const links: Array<[Eos3RelationshipType, string, string]> = [
    ["ENGINEERING_BASIS_RELATES_TO", "EB-001", "REQ-001"],
    ["ASSUMPTION_SUPPORTS_REQUIREMENT", "ASM-001", "REQ-001"],
    ["REQUIREMENT_ALLOCATED_TO_SYSTEM", "REQ-001", "SYS-STR-001"],
    ["INTERFACE_TRACES_SYSTEM", "INT-001", "SYS-STR-001"],
    ["INTERFACE_TRACES_REQUIREMENT", "INT-001", "REQ-001"],
    ["ASSUMPTION_SUPPORTS_CALCULATION", "ASM-001", "CALC-001"],
    ["DECISION_USES_ASSUMPTION", "DEC-001", "ASM-001"],
    ["REVIEW_OF_OBJECT", "REV-001", "REQ-001"],
    ["DELIVERABLE_SNAPSHOT_OF_REVISION", "DEL-001", "CALC-001"],
    ["CHANGE_AFFECTS_OBJECT", "CHG-001", "ASM-001"],
  ];
  for (const [type, from, to] of links) {
    relateWorkspaceObjects(projectId, {
      relationshipType: type,
      fromObjectId: byStable(from).id,
      toObjectId: byStable(to).id,
    });
  }

  updateProjectSetup(projectId, {
    projectCode: "PILOT-001",
    projectName: "Process Plant Structural Modification Pilot",
    client: "Design Partner",
    site: "Process Plant",
    location: "Australia",
    industry: "Process",
    projectType: "Structural Modification",
    description: "PILOT-001 — Process Plant Structural Modification Pilot",
    jurisdiction: { country: "AU", stateRegion: "QLD", profileName: "AU-QLD-structural" },
    standards: {
      engineeringStandards: ["AS/NZS 1170", "AS 4100"],
      companyStandards: ["RTB-ENG-STD-01"],
      codeProfiles: ["structural-steel"],
    },
    roles: ["Project Lead", "Structural Lead", "Reviewer"],
    disciplines: ["Structural", "Mechanical"],
    checklist: {
      projectProfile: true,
      jurisdiction: true,
      standards: true,
      lifecycle: true,
      roles: true,
      engineeringBasis: true,
      requirements: true,
      systemsInterfaces: true,
      deliverablePlan: true,
    },
  });

  return { created, snapshot: snapshotProjectWorkspace(projectId) };
}

export function addPilotFeedback(
  projectId: string,
  input: Omit<PilotFeedback, "id" | "createdAt" | "projectId">,
): PilotFeedback {
  const rt = ensureRuntime(projectId);
  const item: PilotFeedback = {
    id: crypto.randomUUID(),
    projectId,
    createdAt: new Date().toISOString(),
    ...input,
  };
  rt.feedback.push(item);
  return item;
}

/** Test helper — clear process store between suites. */
export function __resetProjectWorkspacesForTests() {
  runtimes.clear();
}
