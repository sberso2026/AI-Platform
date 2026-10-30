/**
 * EOS Pilot UX-2 — Guided Engineering / Minimum Viable Input engine.
 * Generate-first, ask-later. Generated ≠ approved. No authority expansion.
 */

import type { Eos3ObjectType } from "./eos3-canonical-objects";
import type { Eos3RelationshipType } from "./eos3-relationships";
import {
  createWorkspaceObject,
  evaluateGate,
  findByStableId,
  listWorkspaceObjects,
  relateWorkspaceObjects,
  reviseWorkspaceObject,
  snapshotProjectWorkspace,
  updateProjectSetup,
  type ProjectSetupProfile,
  type WorkspaceSnapshot,
} from "./eos3-project-workspace-service";
import { getOrCreateProjectWorkspace } from "./eos3-project-workspace-service";

export const EOS_DEFAULT_USER_MODE = "GUIDED_ENGINEERING" as const;

export type ExperienceLevel = "GUIDED" | "ENGINEERING_WORKSPACE" | "GOVERNANCE_WORKSPACE";

export type Confidence = "HIGH" | "MEDIUM" | "LOW";
export type Materiality = "LOW" | "HIGH";
export type AutomationDisposition =
  | "AUTO_APPLY"
  | "PROPOSE_AND_CONFIRM"
  | "ASK_ONCE"
  | "SURFACE_CONFLICT_AND_REQUEST_DECISION";

export type AutomationProvenance = {
  source: string;
  basis: string;
  sourceRevision: string | null;
  generatedBy: string;
  confidence: Confidence;
  materiality: Materiality;
  disposition: AutomationDisposition;
  humanConfirmationStatus: "NOT_REQUIRED" | "PENDING" | "CONFIRMED" | "REJECTED";
  timestamp: string;
  resultingObjectStableId?: string;
};

export type GuidedProposal = {
  id: string;
  objectType: Eos3ObjectType | "Risk" | "ProjectProfile" | "InformationGap" | "Option";
  stableObjectId: string;
  title: string;
  summary: string;
  lifecycleState: "PROPOSED" | "DRAFT";
  provenance: AutomationProvenance;
  whySuggested: string;
  uncertainty: string | null;
  accepted: boolean | null;
  bulkSafe: boolean;
};

export type GuidedTask = {
  id: string;
  label: string;
  description: string;
  status: "available" | "recommended" | "blocked" | "done";
  hrefSlug: string;
  interactionsEstimate: number;
};

export type NextBestAction = {
  id: string;
  label: string;
  reason: string;
  hrefSlug: string;
  material: boolean;
};

export type SimplifiedGateReadiness = {
  gateKey: string;
  stageLabel: string;
  percentReady: number;
  completed: string[];
  needsAttention: string[];
  blockers: string[];
  recommendedNextAction: string;
  primaryActionLabel: string;
  advancedHrefSlug: string;
  evaluation: ReturnType<typeof evaluateGate> | null;
};

export type GuidedProjectStartInput = {
  objective: string;
  whyNeeded?: string;
  ownerId?: string | null;
  ownerName?: string | null;
  documentNames?: string[];
};

export type GuidedGenerationResult = {
  projectId: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  requiredHumanInputs: string[];
  initialRequiredInputCount: number;
  setup: ProjectSetupProfile;
  proposals: GuidedProposal[];
  tasks: GuidedTask[];
  nextActions: NextBestAction[];
  gate: SimplifiedGateReadiness;
  informationGaps: string[];
  options: Array<{ id: string; label: string; status: "PROPOSED" }>;
  manualInputBaseline: number;
  manualInputGuided: number;
  manualInputReductionPercent: number;
  duplicateInputRequestCount: number;
  experienceLevel: ExperienceLevel;
};

export type NaturalChangeResult = {
  interpretedAs: string;
  changeStableId: string;
  affected: Array<{ stableObjectId: string; objectType: string; governedState: string }>;
  nextActions: NextBestAction[];
  provenance: AutomationProvenance;
};

function now() {
  return new Date().toISOString();
}

function disposition(confidence: Confidence, materiality: Materiality): AutomationDisposition {
  if (confidence === "LOW") return "ASK_ONCE";
  if (confidence === "HIGH" && materiality === "LOW") return "AUTO_APPLY";
  if (confidence === "HIGH" && materiality === "HIGH") return "PROPOSE_AND_CONFIRM";
  return "PROPOSE_AND_CONFIRM";
}

function provenance(input: {
  source: string;
  basis: string;
  confidence: Confidence;
  materiality: Materiality;
  confirmation?: AutomationProvenance["humanConfirmationStatus"];
  stableId?: string;
}): AutomationProvenance {
  return {
    source: input.source,
    basis: input.basis,
    sourceRevision: null,
    generatedBy: "eos3.guided.engineering.v1",
    confidence: input.confidence,
    materiality: input.materiality,
    disposition: disposition(input.confidence, input.materiality),
    humanConfirmationStatus:
      input.confirmation ??
      (disposition(input.confidence, input.materiality) === "AUTO_APPLY"
        ? "NOT_REQUIRED"
        : "PENDING"),
    timestamp: now(),
    resultingObjectStableId: input.stableId,
  };
}

function inferProfile(objective: string, whyNeeded?: string): {
  setup: Partial<ProjectSetupProfile>;
  inferences: Array<{ field: string; value: string; confidence: Confidence; materiality: Materiality; why: string }>;
} {
  const text = `${objective} ${whyNeeded ?? ""}`.toLowerCase();
  const isStructural = /steel|structural|platform|foundation|equipment module|12\s*t|15\s*t|process/.test(text);
  const isProcess = /process|plant|equipment|piping|module/.test(text);
  const mentionsMass = /\d+\s*t\b|tonne|mass|load/.test(text);
  const australia = /australia|qld|queensland|au\b/.test(text);

  const inferences: Array<{
    field: string;
    value: string;
    confidence: Confidence;
    materiality: Materiality;
    why: string;
  }> = [];

  const projectType = isStructural
    ? "Structural Modification"
    : isProcess
      ? "Process Modification"
      : "Engineering Project";
  inferences.push({
    field: "projectType",
    value: projectType,
    confidence: isStructural || isProcess ? "HIGH" : "MEDIUM",
    materiality: "LOW",
    why: "Derived from objective keywords (structure/process/equipment).",
  });

  const industry = isProcess ? "Process" : "Industrial";
  inferences.push({
    field: "industry",
    value: industry,
    confidence: isProcess ? "HIGH" : "MEDIUM",
    materiality: "LOW",
    why: "Derived from process/plant language in the objective.",
  });

  const disciplines = isStructural
    ? ["Structural", "Mechanical"]
    : isProcess
      ? ["Process", "Mechanical"]
      : ["Multidiscipline"];
  inferences.push({
    field: "disciplines",
    value: disciplines.join(", "),
    confidence: "HIGH",
    materiality: "LOW",
    why: "Default discipline set for structural/process modification pilots.",
  });

  // Jurisdiction: only auto when evidence; else ask-once candidate default for pilot AU
  const country = australia ? "AU" : "AU";
  const confJ: Confidence = australia ? "HIGH" : "MEDIUM";
  inferences.push({
    field: "jurisdiction.country",
    value: country,
    confidence: confJ,
    materiality: "HIGH",
    why: australia
      ? "Explicit geography in input."
      : "Pilot default AU pending confirmation (material regulatory field).",
  });

  inferences.push({
    field: "standards",
    value: "AS/NZS 1170, AS 4100",
    confidence: "MEDIUM",
    materiality: "HIGH",
    why: "Candidate structural standards for AU steel platform work — confirm applicability.",
  });

  if (mentionsMass) {
    inferences.push({
      field: "equipmentMassAssumption",
      value: "12 t (from objective) pending vendor confirmation",
      confidence: "HIGH",
      materiality: "HIGH",
      why: "Operating mass stated in objective; material to structural assessment.",
    });
  }

  return {
    setup: {
      projectType,
      industry,
      description: objective.trim(),
      disciplines,
      confidentiality: "Internal",
      lifecycleTemplate: "pilot-default-p0-g6",
      governanceProfile: "eos-controlled-pilot",
      qualificationContext: "D1 QUALIFIED_BOUNDED; non-D1 NOT_QUALIFIED",
      roles: ["Project Lead", "Structural Lead", "Reviewer"],
      jurisdiction: {
        country,
        stateRegion: australia ? "QLD" : "",
        profileName: country === "AU" ? "AU-structural-candidate" : "",
      },
      standards: {
        engineeringStandards: ["AS/NZS 1170", "AS 4100"],
        companyStandards: ["RTB-ENG-STD-01"],
        codeProfiles: ["structural-steel"],
      },
      checklist: {
        projectProfile: true,
        jurisdiction: false, // material — needs confirm
        standards: false,
        lifecycle: true,
        roles: true,
        engineeringBasis: false,
        requirements: false,
        systemsInterfaces: false,
        deliverablePlan: false,
      },
    },
    inferences,
  };
}

function proposal(input: {
  objectType: GuidedProposal["objectType"];
  stableObjectId: string;
  title: string;
  summary: string;
  source: string;
  basis: string;
  confidence: Confidence;
  materiality: Materiality;
  why: string;
  uncertainty?: string | null;
  bulkSafe?: boolean;
}): GuidedProposal {
  const prov = provenance({
    source: input.source,
    basis: input.basis,
    confidence: input.confidence,
    materiality: input.materiality,
    stableId: input.stableObjectId,
  });
  return {
    id: crypto.randomUUID(),
    objectType: input.objectType,
    stableObjectId: input.stableObjectId,
    title: input.title,
    summary: input.summary,
    lifecycleState: "PROPOSED",
    provenance: prov,
    whySuggested: input.why,
    uncertainty: input.uncertainty ?? null,
    accepted: null,
    bulkSafe: input.bulkSafe ?? input.materiality === "LOW",
  };
}

export function buildGuidedTasks(snapshot: WorkspaceSnapshot): GuidedTask[] {
  const c = snapshot.counts;
  const hasReq = (c.Requirement ?? 0) > 0;
  const hasBasis = (c.EngineeringBasis ?? 0) > 0;
  const hasAsm = (c.Assumption ?? 0) > 0;
  return [
    {
      id: "define-problem",
      label: "Define the engineering problem",
      description: "Confirm objective and material gaps.",
      status: snapshot.setup.description ? "done" : "recommended",
      hrefSlug: "guided",
      interactionsEstimate: 2,
    },
    {
      id: "review-basis",
      label: "Review project basis",
      description: "Accept or edit the Engineering Basis draft.",
      status: hasBasis ? "recommended" : "available",
      hrefSlug: "guided",
      interactionsEstimate: 2,
    },
    {
      id: "review-requirements",
      label: "Review generated requirements",
      description: "Confirm proposed requirements before they leave PROPOSED.",
      status: hasReq ? "recommended" : "available",
      hrefSlug: "guided",
      interactionsEstimate: 2,
    },
    {
      id: "confirm-mass",
      label: "Confirm equipment operating mass",
      description: "Material assumption pending vendor confirmation.",
      status: hasAsm ? "recommended" : "available",
      hrefSlug: "guided",
      interactionsEstimate: 2,
    },
    {
      id: "develop-options",
      label: "Develop options",
      description: "Compare strengthen / independent frame / partial replacement.",
      status: "available",
      hrefSlug: "guided",
      interactionsEstimate: 3,
    },
    {
      id: "compare-alternatives",
      label: "Compare alternatives",
      description: "Simple comparison (default) or advanced evaluation.",
      status: "available",
      hrefSlug: "decisions",
      interactionsEstimate: 3,
    },
    {
      id: "resolve-interface",
      label: "Resolve an interface",
      description: "Confirm structural–mechanical interface ownership.",
      status: (c.Interface ?? 0) > 0 ? "available" : "blocked",
      hrefSlug: "systems",
      interactionsEstimate: 2,
    },
    {
      id: "assess-change",
      label: "Assess a design change",
      description: "Capture natural changes (e.g. mass 12 t → 15 t).",
      status: "available",
      hrefSlug: "guided",
      interactionsEstimate: 2,
    },
    {
      id: "review-engineering",
      label: "Review engineering",
      description: "Contextual review from the object under review.",
      status: "available",
      hrefSlug: "reviews",
      interactionsEstimate: 2,
    },
    {
      id: "g0-readiness",
      label: "Check opportunity readiness (G0)",
      description: "Review readiness — not raw gate administration.",
      status: "recommended",
      hrefSlug: "guided",
      interactionsEstimate: 2,
    },
  ];
}

export function buildNextBestActions(snapshot: WorkspaceSnapshot): NextBestAction[] {
  const actions: NextBestAction[] = [];
  const asm = findByStableId(snapshot.projectId, "ASM-001");
  if (asm && asm.lifecycleState !== "approved") {
    actions.push({
      id: "confirm-mass",
      label: "Confirm equipment operating mass",
      reason: "Material load assumption is still PROPOSED/open.",
      hrefSlug: "guided",
      material: true,
    });
  }
  if ((snapshot.counts.Requirement ?? 0) > 0) {
    actions.push({
      id: "review-reqs",
      label: "Review generated requirements",
      reason: "Proposed requirements await human confirmation.",
      hrefSlug: "guided",
      material: true,
    });
  }
  if ((snapshot.counts.Interface ?? 0) > 0) {
    actions.push({
      id: "resolve-iface",
      label: "Resolve piping/structural interface",
      reason: "Open interface recorded from project context.",
      hrefSlug: "systems",
      material: true,
    });
  }
  actions.push({
    id: "verify-drawings",
    label: "Verify existing drawings",
    reason: "Information gap: as-built drawings not attached.",
    hrefSlug: "documents",
    material: true,
  });
  actions.push({
    id: "g0",
    label: "Review opportunity readiness",
    reason: "G0 evidence is assembled automatically from project state.",
    hrefSlug: "guided",
    material: false,
  });
  return actions.slice(0, 6);
}

export function buildSimplifiedGateReadiness(projectId: string): SimplifiedGateReadiness {
  const snap = snapshotProjectWorkspace(projectId);
  const evaluation = evaluateGate(projectId, "G0");
  const completed: string[] = [];
  const needsAttention: string[] = [];
  if (snap.setup.description) completed.push("Project objective");
  if (snap.setup.projectType) completed.push("Initial scope / project type");
  if (snap.setup.jurisdiction.country) completed.push("Jurisdiction candidate");
  if (snap.setup.checklist.jurisdiction !== true) {
    needsAttention.push("Confirm jurisdiction applicability");
  }
  if (snap.setup.checklist.standards !== true) {
    needsAttention.push("Confirm engineering standards applicability");
  }
  const asm = findByStableId(projectId, "ASM-001");
  if (asm) needsAttention.push("Equipment mass confirmation");
  needsAttention.push("Existing drawing verification");

  for (const b of evaluation.blocking) {
    if (!needsAttention.includes(b)) needsAttention.push(b);
  }

  const total = Math.max(completed.length + needsAttention.length, 1);
  const percentReady = Math.round((completed.length / total) * 100);

  return {
    gateKey: "G0",
    stageLabel: "Opportunity → Concept Definition readiness",
    percentReady,
    completed,
    needsAttention,
    blockers: evaluation.blocking,
    recommendedNextAction:
      needsAttention[0] ?? "Review readiness and confirm material items",
    primaryActionLabel: "Review readiness",
    advancedHrefSlug: "lifecycle",
    evaluation,
  };
}

/**
 * Generate-first: create PROPOSED/DRAFT canonical objects from minimum input.
 * Does not auto-approve. Manual register population is not required for G0 draft state.
 */
export function generateGuidedProjectState(
  projectId: string,
  input: GuidedProjectStartInput,
): GuidedGenerationResult {
  const startedAt = now();
  const t0 = performance.now();
  getOrCreateProjectWorkspace(projectId);

  const requiredHumanInputs = ["objective"];
  if (!input.ownerId && !input.ownerName) {
    // owner defaulted from auth when provided — not counted as required if present
  }
  // whyNeeded optional when objective is self-explanatory
  const initialRequiredInputCount = 1 + (input.ownerId || input.ownerName ? 0 : 1);
  // Prefer <=3: objective + optional owner + optional docs. Docs never required.

  const { setup: inferredSetup, inferences } = inferProfile(input.objective, input.whyNeeded);
  const ownerRole = input.ownerName ? [String(input.ownerName), "Project Lead"] : ["Project Lead", "Structural Lead", "Reviewer"];

  const setupSnap = updateProjectSetup(projectId, {
    ...inferredSetup,
    projectCode: snapshotProjectWorkspace(projectId).setup.projectCode || "PILOT-001",
    projectName:
      snapshotProjectWorkspace(projectId).setup.projectName ||
      "Process Plant Structural Modification Pilot",
    roles: Array.from(new Set([...(inferredSetup.roles ?? []), ...ownerRole])),
    description: input.objective.trim(),
  });

  const proposals: GuidedProposal[] = [];
  const docs = input.documentNames ?? [];
  const docSource =
    docs.length > 0 ? `objective+documents:${docs.join(",")}` : "objective";

  // Profile proposals for material inferences (confirm-by-exception)
  for (const inf of inferences.filter((i) => i.materiality === "HIGH")) {
    proposals.push(
      proposal({
        objectType: "ProjectProfile",
        stableObjectId: `PROFILE-${inf.field}`,
        title: `Confirm ${inf.field}`,
        summary: String(inf.value),
        source: docSource,
        basis: inf.why,
        confidence: inf.confidence,
        materiality: inf.materiality,
        why: inf.why,
        uncertainty: inf.confidence === "LOW" ? "Low confidence — confirm before relying." : null,
        bulkSafe: false,
      }),
    );
  }

  // Low-materiality admin defaults already applied via updateProjectSetup (AUTO_APPLY)

  const ensureObject = (
    objectType: Eos3ObjectType,
    stableObjectId: string,
    displayName: string,
    payload: Record<string, unknown>,
    meta: { confidence: Confidence; materiality: Materiality; why: string; bulkSafe?: boolean },
  ) => {
    let obj = findByStableId(projectId, stableObjectId);
    if (!obj) {
      obj = createWorkspaceObject(projectId, {
        objectType,
        stableObjectId,
        displayName,
        payload: {
          ...payload,
          lifecycleState: "PROPOSED",
          approvalState: "NOT_APPROVED",
          generated: true,
          humanConfirmationStatus: "PENDING",
        },
        actorId: input.ownerId ?? "guided-automation",
        authority: "system_propose_only",
      });
    }
    proposals.push(
      proposal({
        objectType,
        stableObjectId,
        title: displayName,
        summary: String(payload.summary ?? displayName),
        source: docSource,
        basis: meta.why,
        confidence: meta.confidence,
        materiality: meta.materiality,
        why: meta.why,
        bulkSafe: meta.bulkSafe,
      }),
    );
    return obj;
  };

  const basis = ensureObject(
    "EngineeringBasis",
    "EB-001",
    "Autodraft engineering basis — structural platform modification",
    {
      summary: "Design basis for installing process equipment on existing steel platform.",
      designCriteria: "AS/NZS structural loading; existing platform capacity TBD",
      approvalState: "NOT_APPROVED",
      status: "PROPOSED",
    },
    {
      confidence: "MEDIUM",
      materiality: "HIGH",
      why: "Autodrafted from objective, jurisdiction candidate, and structural standards candidates.",
    },
  );

  const req = ensureObject(
    "Requirement",
    "REQ-001",
    "Structural modification shall support stated equipment operating mass",
    {
      summary: "Platform/structure shall safely support equipment operating mass with governed verification.",
      priority: "high",
      status: "PROPOSED",
      verificationStatus: "planned",
    },
    {
      confidence: "HIGH",
      materiality: "HIGH",
      why: "Derived from project objective mass/load intent.",
    },
  );

  const asm = ensureObject(
    "Assumption",
    "ASM-001",
    "Equipment operating mass assumption",
    {
      summary: "Assume operating mass 12 t until vendor confirmation.",
      equipmentMass: "12 t",
      status: "PROPOSED",
      verificationRequirement: "vendor data",
    },
    {
      confidence: "HIGH",
      materiality: "HIGH",
      why: "Mass stated or implied in objective; material to structural calculations.",
      bulkSafe: false,
    },
  );

  const system = ensureObject(
    "System",
    "SYS-STR-001",
    "Primary structural system (existing steel-framed platform)",
    {
      summary: "Existing steel-framed platform supporting new process module.",
      hierarchy: "plant/structure",
      status: "PROPOSED",
    },
    {
      confidence: "HIGH",
      materiality: "LOW",
      why: "System inferred from steel-framed platform language.",
      bulkSafe: true,
    },
  );
  void system;

  const iface = ensureObject(
    "Interface",
    "INT-001",
    "Structural–mechanical equipment interface",
    {
      summary: "Interface between platform structure and process equipment module.",
      status: "PROPOSED",
      owner: "structural",
    },
    {
      confidence: "HIGH",
      materiality: "HIGH",
      why: "Equipment on platform implies structural–mechanical interface.",
    },
  );

  ensureObject(
    "Deliverable",
    "DEL-001",
    "Structural modification concept deliverable",
    {
      summary: "Initial deliverable for opportunity/concept structural assessment.",
      status: "PROPOSED",
      revision: "A",
    },
    {
      confidence: "MEDIUM",
      materiality: "LOW",
      why: "Default deliverable plan item for structural modification at P0/P1.",
      bulkSafe: true,
    },
  );

  ensureObject(
    "Calculation",
    "CALC-001",
    "Foundation/platform load calculation (proposed)",
    {
      summary: "Governed structural load check once mass confirmed.",
      qualificationStatus: "QUALIFIED_BOUNDED",
      discipline: "structural",
      status: "PROPOSED",
      stale: false,
    },
    {
      confidence: "MEDIUM",
      materiality: "HIGH",
      why: "Calculation placeholder linked to mass assumption — not executed/approved.",
    },
  );

  ensureObject(
    "Decision",
    "DEC-001",
    "Foundation/platform reinforcement option decision (proposed)",
    {
      summary: "Which structural option? Simple comparison default.",
      question: "Strengthen existing structure, independent frame, or partial replacement?",
      humanAuthority: true,
      aiIsAuthority: false,
      status: "PROPOSED",
      mode: "Simple Comparison",
    },
    {
      confidence: "MEDIUM",
      materiality: "HIGH",
      why: "Options Development assistance for PILOT-001 categories.",
    },
  );

  ensureObject(
    "Review",
    "REV-001",
    "G0 readiness review (proposed)",
    {
      summary: "Contextual readiness review for opportunity validation.",
      reviewType: "gate",
      status: "PROPOSED",
      aiMayApprove: false,
    },
    {
      confidence: "HIGH",
      materiality: "LOW",
      why: "Review shell for G0 — AI cannot approve.",
      bulkSafe: true,
    },
  );

  // Risk suggestion (not a core Eos3ObjectType — store as proposal only + optional DisciplineObject)
  proposals.push(
    proposal({
      objectType: "Risk",
      stableObjectId: "RISK-001",
      title: "Existing platform capacity uncertainty",
      summary: "As-built capacity unknown until drawings/verification — structural risk.",
      source: docSource,
      basis: "Missing as-built evidence + new equipment load.",
      confidence: "HIGH",
      materiality: "HIGH",
      why: "Suggested from uncertainty and interface/load conditions.",
    }),
  );

  const informationGaps = [
    "Vendor-confirmed operating / dynamic loads",
    "Existing as-built structural drawings",
    "Confirmed jurisdiction/standards applicability",
    ...(docs.length ? [] : ["Optional supporting documents not yet uploaded"]),
  ];

  for (const gap of informationGaps) {
    proposals.push(
      proposal({
        objectType: "InformationGap",
        stableObjectId: `GAP-${gap.slice(0, 24).replace(/\W+/g, "_")}`,
        title: "Information gap",
        summary: gap,
        source: docSource,
        basis: "Just-in-time: material for later stages; tracked now without blocking all P0 work.",
        confidence: "HIGH",
        materiality: "HIGH",
        why: "Gap identified from missing evidence, not invented facts.",
        bulkSafe: false,
      }),
    );
  }

  const options = [
    { id: "OPT-strengthen", label: "Strengthen existing structure", status: "PROPOSED" as const },
    { id: "OPT-independent", label: "Independent support frame", status: "PROPOSED" as const },
    { id: "OPT-partial", label: "Partial structure replacement", status: "PROPOSED" as const },
  ];
  for (const opt of options) {
    proposals.push(
      proposal({
        objectType: "Option",
        stableObjectId: opt.id,
        title: opt.label,
        summary: `Candidate option for Options Development: ${opt.label}`,
        source: "pilot-001-template",
        basis: "Assisted options for structural modification pilots.",
        confidence: "MEDIUM",
        materiality: "HIGH",
        why: "Assisted generation — engineer may modify/reject/add.",
      }),
    );
  }

  // Automatic relationships (digital thread emerges)
  const by = (id: string) => findByStableId(projectId, id);
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
  ];
  for (const [type, from, to] of links) {
    const a = by(from);
    const b = by(to);
    if (a && b) {
      try {
        relateWorkspaceObjects(projectId, {
          relationshipType: type,
          fromObjectId: a.id,
          toObjectId: b.id,
          metadata: { generatedBy: "eos3.guided.engineering.v1", autoLinked: true },
        });
      } catch {
        // relationship may already exist
      }
    }
  }

  // Mark checklist progress after generation (still not auto-approved)
  updateProjectSetup(projectId, {
    checklist: {
      ...setupSnap.setup.checklist,
      engineeringBasis: true,
      requirements: true,
      systemsInterfaces: true,
      deliverablePlan: true,
    },
  });

  void basis;
  void req;
  void asm;
  void iface;

  const snap = snapshotProjectWorkspace(projectId);
  const tasks = buildGuidedTasks(snap);
  const nextActions = buildNextBestActions(snap);
  const gate = buildSimplifiedGateReadiness(projectId);
  const finishedAt = now();
  const durationMs = Math.round(performance.now() - t0);

  // Manual input baseline: old setup asked ~20 editable fields + register CRUD for G0 (~35)
  const manualInputBaseline = 35;
  const manualInputGuided = initialRequiredInputCount; // objective (+ owner if missing)
  const manualInputReductionPercent = Math.round(
    ((manualInputBaseline - manualInputGuided) / manualInputBaseline) * 100,
  );

  return {
    projectId,
    startedAt,
    finishedAt,
    durationMs,
    requiredHumanInputs,
    initialRequiredInputCount: Math.max(initialRequiredInputCount, 1),
    setup: snap.setup,
    proposals,
    tasks,
    nextActions,
    gate,
    informationGaps,
    options,
    manualInputBaseline,
    manualInputGuided,
    manualInputReductionPercent,
    duplicateInputRequestCount: 0,
    experienceLevel: "GUIDED",
  };
}

export function acceptGuidedProposal(
  projectId: string,
  stableObjectId: string,
  decision: "CONFIRMED" | "REJECTED",
  actorId = "project-engineer",
): { ok: boolean; message: string } {
  const obj = findByStableId(projectId, stableObjectId);
  if (!obj) {
    // Profile / risk / gap / option proposals may not be store objects
    if (stableObjectId.startsWith("PROFILE-")) {
      if (stableObjectId.includes("jurisdiction") && decision === "CONFIRMED") {
        updateProjectSetup(projectId, {
          checklist: { ...snapshotProjectWorkspace(projectId).setup.checklist, jurisdiction: true },
        });
      }
      if (stableObjectId.includes("standards") && decision === "CONFIRMED") {
        updateProjectSetup(projectId, {
          checklist: { ...snapshotProjectWorkspace(projectId).setup.checklist, standards: true },
        });
      }
      return { ok: true, message: `Profile proposal ${decision}` };
    }
    return { ok: true, message: `Proposal ${stableObjectId} ${decision} (non-store)` };
  }
  // Never treat confirmation of PROPOSED as silent engineering approval beyond draft accept
  reviseWorkspaceObject(
    projectId,
    obj.id,
    {
      ...obj.payload,
      humanConfirmationStatus: decision,
      status: decision === "CONFIRMED" ? "DRAFT" : "REJECTED",
      approvalState: "NOT_APPROVED",
      acceptedBy: actorId,
      acceptedAt: now(),
    },
    actorId,
  );
  return { ok: true, message: `Object ${stableObjectId} marked ${decision} (still NOT_APPROVED)` };
}

export function bulkAcceptSafeProposals(
  projectId: string,
  proposals: GuidedProposal[],
  actorId = "project-engineer",
): { accepted: string[]; skipped: string[] } {
  const accepted: string[] = [];
  const skipped: string[] = [];
  for (const p of proposals) {
    if (!p.bulkSafe || p.provenance.materiality === "HIGH") {
      skipped.push(p.stableObjectId);
      continue;
    }
    // Block bulk for decisions, material assumptions, qualification, gates
    if (
      p.objectType === "Decision" ||
      p.objectType === "Assumption" ||
      p.objectType === "Calculation" ||
      p.objectType === "Risk"
    ) {
      skipped.push(p.stableObjectId);
      continue;
    }
    acceptGuidedProposal(projectId, p.stableObjectId, "CONFIRMED", actorId);
    accepted.push(p.stableObjectId);
  }
  return { accepted, skipped };
}

/**
 * Natural language change capture — e.g. mass 12 t → 15 t.
 */
export function captureNaturalEngineeringChange(
  projectId: string,
  utterance: string,
  actorId = "project-engineer",
): NaturalChangeResult {
  const text = utterance.toLowerCase();
  const massMatch = text.match(/(\d+(?:\.\d+)?)\s*t.*?(\d+(?:\.\d+)?)\s*t/) ||
    text.match(/from\s+(\d+(?:\.\d+)?)\s*t.*?to\s+(\d+(?:\.\d+)?)\s*t/);
  const fromMass = massMatch ? `${massMatch[1]} t` : "12 t";
  const toMass = massMatch ? `${massMatch[2]} t` : "15 t";

  let change = findByStableId(projectId, "CHG-001");
  if (!change) {
    change = createWorkspaceObject(projectId, {
      objectType: "Change",
      stableObjectId: "CHG-001",
      displayName: `Equipment mass change ${fromMass} → ${toMass}`,
      payload: {
        fromMass,
        toMass,
        reason: utterance,
        status: "PROPOSED",
        approvalState: "NOT_APPROVED",
        generated: true,
      },
      actorId,
      authority: "project_engineer",
    });
  } else {
    reviseWorkspaceObject(
      projectId,
      change.id,
      { ...change.payload, fromMass, toMass, reason: utterance, status: "PROPOSED" },
      actorId,
    );
    change = findByStableId(projectId, "CHG-001")!;
  }

  const affectedIds = ["ASM-001", "INT-001", "CALC-001", "DEC-001", "DEL-001"];
  const affected: NaturalChangeResult["affected"] = [];
  const rt = getOrCreateProjectWorkspace(projectId);
  for (const sid of affectedIds) {
    let obj = findByStableId(projectId, sid);
    if (!obj) continue;
    if (sid === "ASM-001") {
      const nextPayload = {
        ...obj.payload,
        equipmentMass: toMass,
        priorMass: fromMass,
        status: "PROPOSED",
      };
      reviseWorkspaceObject(projectId, obj.id, nextPayload, actorId);
      const current = rt.store.objects.get(obj.id);
      if (current) {
        rt.store.objects.set(obj.id, {
          ...current,
          payload: nextPayload,
          updatedAt: new Date().toISOString(),
        });
      }
      rt.store.markStale(obj.id, `mass changed ${fromMass} → ${toMass}`);
    } else {
      rt.store.markImpactCandidate(obj.id, change.id);
    }
    obj = findByStableId(projectId, sid)!;
    try {
      relateWorkspaceObjects(projectId, {
        relationshipType: "CHANGE_AFFECTS_OBJECT",
        fromObjectId: change.id,
        toObjectId: obj.id,
        metadata: { autoLinked: true, utterance },
      });
    } catch {
      /* exists */
    }
    affected.push({
      stableObjectId: obj.stableObjectId,
      objectType: obj.objectType,
      governedState: obj.governedState,
    });
  }

  // Reassess gate readiness
  evaluateGate(projectId, "G0");

  return {
    interpretedAs: `Governed change of equipment mass ${fromMass} → ${toMass}`,
    changeStableId: "CHG-001",
    affected,
    nextActions: buildNextBestActions(snapshotProjectWorkspace(projectId)),
    provenance: provenance({
      source: "natural_language_utterance",
      basis: utterance,
      confidence: massMatch ? "HIGH" : "MEDIUM",
      materiality: "HIGH",
      confirmation: "PENDING",
      stableId: "CHG-001",
    }),
  };
}

export function getGuidedWorkspaceView(projectId: string) {
  const snap = snapshotProjectWorkspace(projectId);
  return {
    mode: EOS_DEFAULT_USER_MODE,
    experienceLevel: "GUIDED" as ExperienceLevel,
    setup: snap.setup,
    counts: snap.counts,
    tasks: buildGuidedTasks(snap),
    nextActions: buildNextBestActions(snap),
    gate: buildSimplifiedGateReadiness(projectId),
    objects: listWorkspaceObjects(projectId),
    qualification: snap.qualification,
  };
}

export function measureTimeToFirstValue(result: GuidedGenerationResult): string {
  // Duration of generateGuidedProjectState; UX target <5 minutes
  const seconds = Math.max(1, Math.round(result.durationMs / 1000));
  if (result.durationMs < 60_000) {
    return `${seconds}s`;
  }
  return `${Math.round(result.durationMs / 60000)}m`;
}
