/**
 * EOS-3-DOMAIN-1 — Work Package execution model.
 * Project remains the organizational container; Work Package is the engineering execution boundary.
 * In-process pilot store + schema-compatible shapes. No duplicate engineering object tables.
 */

import type { Eos3ObjectType } from "./eos3-canonical-objects";
import {
  createWorkspaceObject,
  findByStableId,
  listWorkspaceObjects,
  snapshotProjectWorkspace,
  seedPilot001,
} from "./eos3-project-workspace-service";

export const WORK_PACKAGE_MATURITY_STATES = [
  "Initiation",
  "Concept",
  "Feasibility",
  "FEED",
  "Detailed Engineering",
  "Verification / Review",
  "Ready for Construction",
  "Construction",
  "Commissioning",
  "Complete",
  "Closed",
] as const;

export type WorkPackageMaturity = (typeof WORK_PACKAGE_MATURITY_STATES)[number];

export type WorkPackageAssociationRole =
  | "PRIMARY_EXECUTION_CONTEXT"
  | "RELATED_WORK_PACKAGE"
  | "AFFECTED_WORK_PACKAGE";

export type WorkPackageAssociation = {
  id: string;
  workPackageId: string;
  objectType: Eos3ObjectType | "Risk" | "TechnicalQuery" | "Action" | "Document";
  objectStableId: string;
  objectId: string | null;
  role: WorkPackageAssociationRole;
  confirmationState: "PROPOSED" | "CONFIRMED" | "SUPERSEDED" | "STALE";
  provenance: Record<string, unknown>;
  createdAt: string;
};

export type WorkPackageDependency = {
  id: string;
  projectId: string;
  sourceWorkPackageId: string;
  targetWorkPackageId: string;
  dependencyType: "REQUIRES" | "DEPENDS_ON" | "AFFECTS";
  status: "ACTIVE" | "RESOLVED" | "CANCELLED";
  provenance: Record<string, unknown>;
  createdAt: string;
};

export type WorkPackageDisciplineSet = {
  initiating: string | null;
  lead: string | null;
  participating: string[];
  reviewing: string[];
  approvingAuthorityRefs: string[];
};

export type WorkPackageAssetRef = {
  facility?: string | null;
  area?: string | null;
  system?: string | null;
  subsystem?: string | null;
  asset?: string | null;
  component?: string | null;
  /** Placeholder-compatible until DOMAIN-2 ontology. */
  referenceKind: "EXISTING" | "PLACEHOLDER";
  stableRef: string;
  displayName: string;
};

export type WorkPackageBlocker = {
  id: string;
  kind: string;
  label: string;
  sourceObjectStableId: string | null;
  material: boolean;
};

export type WorkPackageReadiness = {
  percent: number;
  rule: string;
  inputsAvailable: number;
  inputsExpected: number;
  openBlockers: number;
  calculations: number;
  deliverables: number;
  reviews: number;
  decisions: number;
};

export type WorkPackage = {
  id: string;
  stableId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  title: string;
  description: string;
  workType: string | null;
  engineeringPatternRef: string | null;
  status: "ACTIVE" | "ON_HOLD" | "CLOSED";
  maturity: WorkPackageMaturity;
  /** Independent of project lifecycle — never forced equal. */
  projectLifecycleKeyPreserved: true;
  ownerId: string | null;
  ownerName: string | null;
  responsibleEngineeringLead: string | null;
  disciplines: WorkPackageDisciplineSet;
  affectedAssets: WorkPackageAssetRef[];
  startDate: string | null;
  targetDate: string | null;
  priority: "low" | "medium" | "high";
  riskState: "UNKNOWN" | "LOW" | "MEDIUM" | "HIGH";
  active: boolean;
  revision: string;
  provenance: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type WorkPackageUiContract = {
  header: { stableId: string; title: string };
  context: {
    projectId: string;
    assetSystem: string;
    engineeringPattern: string | null;
    workType: string | null;
    currentMaturity: WorkPackageMaturity;
    currentStage: string;
    nextCheckpoint: string | null;
    responsibleDisciplines: string[];
    userResponsibility: string | null;
    readinessPercent: number;
    status: string;
    riskState: string;
  };
  sections: {
    overview: Record<string, unknown>;
    design: WorkPackageAssociation[];
    inputs: WorkPackageAssociation[];
    dependencies: WorkPackageDependency[];
    decisions: WorkPackageAssociation[];
    deliverables: WorkPackageAssociation[];
    reviews: WorkPackageAssociation[];
    changes: WorkPackageAssociation[];
  };
  cards: {
    needsAttention: WorkPackageBlocker[];
    nextRecommendedAction: string | null;
    keyInformation: string[];
    progressReadiness: WorkPackageReadiness;
  };
};

type Store = {
  packages: Map<string, WorkPackage>;
  associations: WorkPackageAssociation[];
  dependencies: WorkPackageDependency[];
};

const stores = new Map<string, Store>();

function now() {
  return new Date().toISOString();
}

function id() {
  return crypto.randomUUID();
}

function ensureStore(projectId: string): Store {
  let s = stores.get(projectId);
  if (!s) {
    s = { packages: new Map(), associations: [], dependencies: [] };
    stores.set(projectId, s);
  }
  return s;
}

export function __resetWorkPackagesForTests() {
  stores.clear();
}

export type CreateWorkPackageInput = {
  tenantId?: string;
  workspaceId?: string;
  projectId: string;
  /** Required human input #1 */
  title: string;
  description?: string;
  /** Required only if not derivable — optional */
  affectedAssetHint?: string;
  /** Optional if inferable from actor */
  ownerId?: string | null;
  ownerName?: string | null;
  stableId?: string;
  maturity?: WorkPackageMaturity;
  initiatingDiscipline?: string | null;
  leadDiscipline?: string | null;
  participatingDisciplines?: string[];
};

/**
 * Guided creation: title required; asset/owner derived when possible.
 * WORK_PACKAGE_REQUIRED_HUMAN_INPUTS <= 3
 */
export function createWorkPackage(input: CreateWorkPackageInput): WorkPackage {
  const title = input.title.trim();
  if (!title) throw new Error("work_package_title_required");

  const store = ensureStore(input.projectId);
  const text = `${title} ${input.description ?? ""} ${input.affectedAssetHint ?? ""}`.toLowerCase();
  const inferredLead =
    input.leadDiscipline ??
    input.initiatingDiscipline ??
    (/structur|steel|platform|frame|support/.test(text)
      ? "Structural"
      : /mechanic|equipment|compressor|pump/.test(text)
        ? "Mechanical"
        : /piping|pipe/.test(text)
          ? "Piping"
          : null);

  const stableId = input.stableId ?? allocateStableId(input.projectId, inferredLead);
  if ([...store.packages.values()].some((p) => p.stableId === stableId)) {
    throw new Error("work_package_stable_id_exists");
  }

  const participating = new Set(input.participatingDisciplines ?? []);
  if (inferredLead === "Structural") participating.add("Mechanical");
  if (inferredLead === "Mechanical") participating.add("Structural");

  const assetHint = input.affectedAssetHint?.trim();
  const affectedAssets: WorkPackageAssetRef[] = assetHint
    ? [
        {
          asset: assetHint,
          system: /platform|structure|frame/.test(assetHint.toLowerCase())
            ? assetHint
            : null,
          referenceKind: "PLACEHOLDER",
          stableRef: `ASSET-REF-${stableId}`,
          displayName: assetHint,
        },
      ]
    : /platform|steel|support frame|frame|support/.test(text)
      ? [
          {
            system: "Existing steel-framed process plant structure",
            asset: "Existing platform / support structure",
            referenceKind: "PLACEHOLDER",
            stableRef: `ASSET-REF-${stableId}`,
            displayName: "Existing platform / support structure",
          },
        ]
      : [];

  const wp: WorkPackage = {
    id: id(),
    stableId,
    tenantId: input.tenantId ?? "00000000-0000-4000-8000-000000000041",
    workspaceId: input.workspaceId ?? "00000000-0000-4000-8000-000000000042",
    projectId: input.projectId,
    title,
    description: (input.description ?? "").trim(),
    workType: inferredLead ? `${inferredLead} modification` : null,
    engineeringPatternRef: null, // Assigned by Engineering Pattern Engine (Workflow-1)
    status: "ACTIVE",
    maturity: input.maturity ?? "Initiation",
    projectLifecycleKeyPreserved: true,
    ownerId: input.ownerId ?? null,
    ownerName: input.ownerName ?? null,
    responsibleEngineeringLead: input.ownerName ?? inferredLead,
    disciplines: {
      initiating: input.initiatingDiscipline ?? inferredLead,
      lead: inferredLead,
      participating: [...participating].filter((d) => d !== inferredLead),
      reviewing: [],
      approvingAuthorityRefs: [],
    },
    affectedAssets,
    startDate: null,
    targetDate: null,
    priority: "medium",
    riskState: "UNKNOWN",
    active: true,
    revision: "A",
    provenance: {
      source: "guided_creation",
      generatedBy: "eos3.work-package.domain-1",
      humanConfirmationStatus: "NOT_REQUIRED_FOR_ADMIN_DEFAULTS",
      ownerIsNotApprovalAuthority: true,
      createdAt: now(),
    },
    createdAt: now(),
    updatedAt: now(),
  };

  store.packages.set(wp.id, wp);
  return wp;
}

function allocateStableId(projectId: string, disciplineHint?: string | null): string {
  const store = ensureStore(projectId);
  const prefix =
    disciplineHint === "Structural"
      ? "WP-STR"
      : disciplineHint === "Mechanical"
        ? "WP-MEC"
        : disciplineHint === "Piping"
          ? "WP-PIP"
          : disciplineHint === "Civil"
            ? "WP-CIV"
            : "WP-GEN";
  let n = 1;
  while ([...store.packages.values()].some((p) => p.stableId === `${prefix}-${String(n).padStart(3, "0")}`)) {
    n += 1;
  }
  return `${prefix}-${String(n).padStart(3, "0")}`;
}

export function listWorkPackages(projectId: string): WorkPackage[] {
  return [...ensureStore(projectId).packages.values()].sort((a, b) =>
    a.stableId.localeCompare(b.stableId),
  );
}

export function getWorkPackage(projectId: string, workPackageIdOrStable: string): WorkPackage | null {
  const store = ensureStore(projectId);
  return (
    store.packages.get(workPackageIdOrStable) ??
    [...store.packages.values()].find((p) => p.stableId === workPackageIdOrStable) ??
    null
  );
}

export function updateWorkPackage(
  projectId: string,
  workPackageIdOrStable: string,
  patch: Partial<{
    title: string;
    description: string;
    maturity: WorkPackageMaturity;
    status: WorkPackage["status"];
    priority: WorkPackage["priority"];
    riskState: WorkPackage["riskState"];
    ownerName: string | null;
    ownerId: string | null;
    responsibleEngineeringLead: string | null;
    leadDiscipline: string | null;
    participatingDisciplines: string[];
    reviewingDisciplines: string[];
    active: boolean;
  }>,
): WorkPackage {
  const wp = getWorkPackage(projectId, workPackageIdOrStable);
  if (!wp) throw new Error("work_package_not_found");
  const store = ensureStore(projectId);

  if (patch.maturity && !WORK_PACKAGE_MATURITY_STATES.includes(patch.maturity)) {
    throw new Error("invalid_work_package_maturity");
  }

  const next: WorkPackage = {
    ...wp,
    title: patch.title?.trim() || wp.title,
    description: patch.description !== undefined ? patch.description : wp.description,
    maturity: patch.maturity ?? wp.maturity,
    status: patch.status ?? wp.status,
    priority: patch.priority ?? wp.priority,
    riskState: patch.riskState ?? wp.riskState,
    ownerName: patch.ownerName !== undefined ? patch.ownerName : wp.ownerName,
    ownerId: patch.ownerId !== undefined ? patch.ownerId : wp.ownerId,
    responsibleEngineeringLead:
      patch.responsibleEngineeringLead !== undefined
        ? patch.responsibleEngineeringLead
        : wp.responsibleEngineeringLead,
    active: patch.active ?? wp.active,
    disciplines: {
      ...wp.disciplines,
      lead: patch.leadDiscipline !== undefined ? patch.leadDiscipline : wp.disciplines.lead,
      participating:
        patch.participatingDisciplines !== undefined
          ? patch.participatingDisciplines
          : wp.disciplines.participating,
      reviewing:
        patch.reviewingDisciplines !== undefined
          ? patch.reviewingDisciplines
          : wp.disciplines.reviewing,
    },
    updatedAt: now(),
    projectLifecycleKeyPreserved: true,
  };
  store.packages.set(wp.id, next);
  return next;
}

/**
 * Association semantics:
 * - PRIMARY_EXECUTION_CONTEXT: object primarily executed in this WP
 * - RELATED_WORK_PACKAGE: shared/relevant without exclusive ownership
 * - AFFECTED_WORK_PACKAGE: change/impact touches this WP
 * Objects are NOT copied; only association rows are stored.
 */
export function associateObject(
  projectId: string,
  workPackageIdOrStable: string,
  input: {
    objectType: WorkPackageAssociation["objectType"];
    objectStableId: string;
    objectId?: string | null;
    role?: WorkPackageAssociationRole;
    confirmationState?: WorkPackageAssociation["confirmationState"];
  },
): WorkPackageAssociation {
  const wp = getWorkPackage(projectId, workPackageIdOrStable);
  if (!wp) throw new Error("work_package_not_found");
  const store = ensureStore(projectId);
  const existing = store.associations.find(
    (a) =>
      a.workPackageId === wp.id &&
      a.objectStableId === input.objectStableId &&
      a.role === (input.role ?? "PRIMARY_EXECUTION_CONTEXT"),
  );
  if (existing) return existing;

  const row: WorkPackageAssociation = {
    id: id(),
    workPackageId: wp.id,
    objectType: input.objectType,
    objectStableId: input.objectStableId,
    objectId: input.objectId ?? findByStableId(projectId, input.objectStableId)?.id ?? null,
    role: input.role ?? "PRIMARY_EXECUTION_CONTEXT",
    confirmationState: input.confirmationState ?? "PROPOSED",
    provenance: {
      source: "work_package_association",
      duplicateObjectCreated: false,
      ownerAutoApproval: false,
    },
    createdAt: now(),
  };
  store.associations.push(row);
  return row;
}

export function listAssociations(projectId: string, workPackageIdOrStable: string): WorkPackageAssociation[] {
  const wp = getWorkPackage(projectId, workPackageIdOrStable);
  if (!wp) return [];
  return ensureStore(projectId).associations.filter((a) => a.workPackageId === wp.id);
}

export function addDependency(
  projectId: string,
  input: {
    sourceStableId: string;
    targetStableId: string;
    dependencyType: WorkPackageDependency["dependencyType"];
  },
): WorkPackageDependency {
  const source = getWorkPackage(projectId, input.sourceStableId);
  const target = getWorkPackage(projectId, input.targetStableId);
  if (!source || !target) throw new Error("work_package_dependency_endpoints_required");
  const store = ensureStore(projectId);
  const row: WorkPackageDependency = {
    id: id(),
    projectId,
    sourceWorkPackageId: source.id,
    targetWorkPackageId: target.id,
    dependencyType: input.dependencyType,
    status: "ACTIVE",
    provenance: { source: "work_package_dependency_foundation" },
    createdAt: now(),
  };
  store.dependencies.push(row);
  return row;
}

export function listDependencies(projectId: string, workPackageIdOrStable: string): WorkPackageDependency[] {
  const wp = getWorkPackage(projectId, workPackageIdOrStable);
  if (!wp) return [];
  return ensureStore(projectId).dependencies.filter(
    (d) => d.sourceWorkPackageId === wp.id || d.targetWorkPackageId === wp.id,
  );
}

/** Deterministic pilot readiness — not a universal algorithm; not manually entered. */
export function deriveReadiness(projectId: string, workPackageIdOrStable: string): WorkPackageReadiness {
  const associations = listAssociations(projectId, workPackageIdOrStable);
  const byType = (t: string) => associations.filter((a) => a.objectType === t);
  const calculations = byType("Calculation").length;
  const deliverables = byType("Deliverable").length;
  const reviews = byType("Review").length;
  const decisions = byType("Decision").length;
  const assumptions = byType("Assumption").length;
  const requirements = byType("Requirement").length;
  const evidence = byType("Evidence").length + byType("Document").length;
  const inputsAvailable = requirements + assumptions + evidence;
  const inputsExpected = Math.max(inputsAvailable, 3);
  const blockers = deriveBlockers(projectId, workPackageIdOrStable);
  const openBlockers = blockers.length;

  // Weighted deterministic pilot rule (documented):
  // readiness = round(100 * (0.25*inputs + 0.2*calcs + 0.2*deliverables + 0.2*reviews + 0.15*decisions) / caps) - 10*openBlockers
  const score =
    0.25 * Math.min(1, inputsAvailable / inputsExpected) +
    0.2 * Math.min(1, calculations / Math.max(1, 1)) +
    0.2 * Math.min(1, deliverables / Math.max(1, 1)) +
    0.2 * Math.min(1, reviews / Math.max(1, 1)) +
    0.15 * Math.min(1, decisions / Math.max(1, 1));
  const percent = Math.max(0, Math.min(100, Math.round(score * 100 - openBlockers * 10)));

  return {
    percent,
    rule: "DOMAIN1_PILOT_WEIGHTED_V1: 25% inputs + 20% calcs + 20% deliverables + 20% reviews + 15% decisions − 10pts/open blocker",
    inputsAvailable,
    inputsExpected,
    openBlockers,
    calculations,
    deliverables,
    reviews,
    decisions,
  };
}

export function deriveBlockers(projectId: string, workPackageIdOrStable: string): WorkPackageBlocker[] {
  const associations = listAssociations(projectId, workPackageIdOrStable);
  const blockers: WorkPackageBlocker[] = [];
  for (const a of associations) {
    const obj = findByStableId(projectId, a.objectStableId);
    const status = String(obj?.payload?.status ?? a.confirmationState);
    if (a.objectType === "Assumption" && (status === "PROPOSED" || status === "open" || a.confirmationState === "PROPOSED")) {
      blockers.push({
        id: `blk-${a.id}`,
        kind: "stale_or_unconfirmed_assumption",
        label: `Assumption ${a.objectStableId} pending confirmation`,
        sourceObjectStableId: a.objectStableId,
        material: true,
      });
    }
    if (a.objectType === "Interface" && (status === "PROPOSED" || status === "open")) {
      blockers.push({
        id: `blk-${a.id}`,
        kind: "unresolved_interface",
        label: `Interface ${a.objectStableId} unresolved`,
        sourceObjectStableId: a.objectStableId,
        material: true,
      });
    }
    if (
      a.objectType === "Decision" &&
      (status === "PROPOSED" || a.confirmationState === "PROPOSED")
    ) {
      blockers.push({
        id: `blk-${a.id}`,
        kind: "pending_decision",
        label: `Decision ${a.objectStableId} awaiting human authority`,
        sourceObjectStableId: a.objectStableId,
        material: true,
      });
    }
    if (
      a.objectType === "Review" &&
      (status === "PROPOSED" ||
        status === "open" ||
        a.confirmationState === "PROPOSED")
    ) {
      blockers.push({
        id: `blk-${a.id}`,
        kind: "required_review_incomplete",
        label: `Review ${a.objectStableId} incomplete`,
        sourceObjectStableId: a.objectStableId,
        material: true,
      });
    }
    if (a.confirmationState === "STALE") {
      blockers.push({
        id: `blk-stale-${a.id}`,
        kind: "stale_association",
        label: `${a.objectStableId} marked stale / potentially affected`,
        sourceObjectStableId: a.objectStableId,
        material: true,
      });
    }
    // Intelligence-1: material impact states on associated engineering objects
    const impactState = String(obj?.payload?.impactState ?? "");
    if (
      a.objectType === "Calculation" &&
      (impactState === "STALE" || impactState === "REVIEW_REQUIRED")
    ) {
      blockers.push({
        id: `blk-impact-calc-${a.id}`,
        kind: "calculation_requires_review",
        label: `${a.objectStableId} requires review`,
        sourceObjectStableId: a.objectStableId,
        material: true,
      });
    }
    if (a.objectType === "Decision" && impactState === "REASSESSMENT_REQUIRED") {
      blockers.push({
        id: `blk-impact-dec-${a.id}`,
        kind: "decision_requires_reassessment",
        label: `${a.objectStableId} requires reassessment`,
        sourceObjectStableId: a.objectStableId,
        material: true,
      });
    }
  }
  // Missing vendor input placeholder when mass assumption present
  if (associations.some((a) => a.objectStableId === "ASM-001")) {
    blockers.push({
      id: "blk-vendor-input",
      kind: "missing_vendor_input",
      label: "Missing vendor-confirmed operating / dynamic load",
      sourceObjectStableId: "ASM-001",
      material: true,
    });
  }
  return blockers;
}

export function deriveNextAction(projectId: string, workPackageIdOrStable: string): string | null {
  const blockers = deriveBlockers(projectId, workPackageIdOrStable);
  if (blockers.some((b) => b.kind === "missing_vendor_input")) {
    return "Review revised vendor load";
  }
  if (blockers.some((b) => b.kind === "calculation_requires_review")) {
    return "Review calculation affected by upstream change";
  }
  if (blockers.some((b) => b.kind === "decision_requires_reassessment")) {
    return "Reassess decision under human authority";
  }
  if (blockers.some((b) => b.kind === "stale_or_unconfirmed_assumption")) {
    return "Confirm material engineering assumption";
  }
  if (blockers.some((b) => b.kind === "unresolved_interface")) {
    return "Resolve piping / mechanical interface";
  }
  const associations = listAssociations(projectId, workPackageIdOrStable);
  if (!associations.some((a) => a.objectType === "Calculation")) {
    return "Complete structural calculation";
  }
  if (blockers.some((b) => b.kind === "required_review_incomplete")) {
    return "Submit design for review";
  }
  if (blockers.some((b) => b.kind === "pending_decision")) {
    return "Record human engineering decision";
  }
  return "Continue engineering design";
}

export function buildWorkPackageUiContract(
  projectId: string,
  workPackageIdOrStable: string,
): WorkPackageUiContract | null {
  const wp = getWorkPackage(projectId, workPackageIdOrStable);
  if (!wp) return null;
  const associations = listAssociations(projectId, workPackageIdOrStable);
  const byTypes = (...types: string[]) =>
    associations.filter((a) => types.includes(a.objectType));
  const readiness = deriveReadiness(projectId, workPackageIdOrStable);
  const blockers = deriveBlockers(projectId, workPackageIdOrStable);
  const disciplines = [
    wp.disciplines.lead,
    ...wp.disciplines.participating,
  ].filter(Boolean) as string[];

  return {
    header: { stableId: wp.stableId, title: wp.title },
    context: {
      projectId: wp.projectId,
      assetSystem: wp.affectedAssets.map((a) => a.displayName).join("; ") || "Not linked",
      engineeringPattern: wp.engineeringPatternRef,
      workType: wp.workType,
      currentMaturity: wp.maturity,
      // Pattern-native stage label preferred; legacy maturity remains separate reporting field
      currentStage:
        wp.maturity === "Detailed Engineering" ? "Engineering Design" : wp.maturity,
      nextCheckpoint: deriveNextAction(projectId, workPackageIdOrStable),
      responsibleDisciplines: disciplines,
      userResponsibility: wp.ownerName ?? wp.responsibleEngineeringLead,
      readinessPercent: readiness.percent,
      status: wp.status,
      riskState: wp.riskState,
    },
    sections: {
      overview: {
        description: wp.description,
        workType: wp.workType,
        maturity: wp.maturity,
        owner: wp.ownerName,
        leadDiscipline: wp.disciplines.lead,
        participating: wp.disciplines.participating,
        // Proposed objects remain visible
        proposedVisible: associations.filter((a) => a.confirmationState === "PROPOSED").length,
      },
      design: byTypes("EngineeringBasis", "Requirement", "System", "Interface", "Calculation"),
      inputs: byTypes("Assumption", "Evidence", "Document", "Requirement"),
      dependencies: listDependencies(projectId, workPackageIdOrStable),
      decisions: byTypes("Decision"),
      deliverables: byTypes("Deliverable"),
      reviews: byTypes("Review"),
      changes: byTypes("Change"),
    },
    cards: {
      needsAttention: blockers,
      nextRecommendedAction: deriveNextAction(projectId, workPackageIdOrStable),
      keyInformation: [
        `Maturity: ${wp.maturity}`,
        `Lead: ${wp.disciplines.lead ?? "—"}`,
        `Owner: ${wp.ownerName ?? "—"} (not auto-approval authority)`,
        `Assets: ${wp.affectedAssets.map((a) => a.displayName).join(", ") || "—"}`,
      ],
      progressReadiness: readiness,
    },
  };
}

/**
 * Seed / migrate PILOT-001 brownfield Work Package without mutating project lifecycle history.
 */
export function seedPilot001SupportFrameWorkPackage(projectId: string): {
  workPackage: WorkPackage;
  projectLifecycleKey: string;
  associations: WorkPackageAssociation[];
} {
  // Ensure canonical pilot objects exist in workspace store (does not change project lifecycle)
  try {
    seedPilot001(projectId);
  } catch {
    /* may already be seeded */
  }

  const projectSnap = snapshotProjectWorkspace(projectId);
  const projectLifecycleKey = projectSnap.lifecycle.currentKey;

  let wp = getWorkPackage(projectId, "WP-STR-004");
  if (!wp) {
    wp = createWorkPackage({
      projectId,
      stableId: "WP-STR-004",
      title: "Support Frame Modification",
      description:
        "Modify an existing steel platform / support frame to support new process equipment module (brownfield detailed engineering).",
      affectedAssetHint: "Existing steel-framed process plant platform / support structure",
      ownerName: "Project Engineer",
      ownerId: "pilot-project-engineer",
      maturity: "Detailed Engineering",
      initiatingDiscipline: "Structural",
      leadDiscipline: "Structural",
      participatingDisciplines: ["Mechanical"],
    });
  } else {
    wp = updateWorkPackage(projectId, "WP-STR-004", {
      maturity: "Detailed Engineering",
      leadDiscipline: "Structural",
      participatingDisciplines: ["Mechanical"],
      ownerName: wp.ownerName ?? "Project Engineer",
    });
  }

  const links: Array<{
    objectType: WorkPackageAssociation["objectType"];
    objectStableId: string;
    role?: WorkPackageAssociationRole;
    confirmationState?: WorkPackageAssociation["confirmationState"];
  }> = [
    { objectType: "Requirement", objectStableId: "REQ-001" },
    { objectType: "EngineeringBasis", objectStableId: "EB-001" },
    { objectType: "Assumption", objectStableId: "ASM-001", confirmationState: "PROPOSED" },
    { objectType: "System", objectStableId: "SYS-STR-001" },
    { objectType: "Interface", objectStableId: "INT-001", confirmationState: "PROPOSED" },
    { objectType: "Calculation", objectStableId: "CALC-001" },
    { objectType: "Decision", objectStableId: "DEC-001", confirmationState: "PROPOSED" },
    { objectType: "Deliverable", objectStableId: "DEL-001" },
    { objectType: "Review", objectStableId: "REV-001", confirmationState: "PROPOSED" },
    { objectType: "Change", objectStableId: "CHG-001", role: "AFFECTED_WORK_PACKAGE" },
    { objectType: "Evidence", objectStableId: "EVD-WP-STR-004", confirmationState: "PROPOSED" },
  ];

  // Ensure evidence association target exists as workspace object if missing
  if (!findByStableId(projectId, "EVD-WP-STR-004")) {
    createWorkspaceObject(projectId, {
      objectType: "Evidence",
      stableObjectId: "EVD-WP-STR-004",
      displayName: "Support frame modification evidence pack (proposed)",
      payload: { status: "PROPOSED", approvalState: "NOT_APPROVED" },
      actorId: "pilot-project-engineer",
      authority: "system_propose_only",
    });
  }

  const associations = links.map((l) =>
    associateObject(projectId, wp!.stableId, {
      objectType: l.objectType,
      objectStableId: l.objectStableId,
      role: l.role,
      confirmationState: l.confirmationState,
    }),
  );

  // Verify project lifecycle unchanged
  const after = snapshotProjectWorkspace(projectId);
  if (after.lifecycle.currentKey !== projectLifecycleKey) {
    throw new Error("pilot_project_lifecycle_mutated");
  }

  return { workPackage: wp, projectLifecycleKey, associations };
}

export function countRequiredHumanInputsForCreate(input: {
  title: string;
  affectedAssetHint?: string;
  ownerName?: string;
}): number {
  let n = 0;
  if (input.title.trim()) n += 1;
  // asset only counted if user had to supply because not derivable — for measurement of minimum path:
  // guided path with structural title derives asset → not required
  const text = input.title.toLowerCase();
  const assetDerived = /platform|steel|support frame|structural/.test(text);
  if (!assetDerived && input.affectedAssetHint) n += 1;
  if (input.ownerName) n += 1; // only if not defaulted from auth in API layer
  return n;
}

/** Export object types present for association coverage tests. */
export function supportedAssociationObjectTypes(): string[] {
  return [
    "Requirement",
    "EngineeringBasis",
    "Assumption",
    "System",
    "Interface",
    "Calculation",
    "Decision",
    "Change",
    "Risk",
    "Deliverable",
    "Review",
    "Evidence",
    "Document",
    "Action",
    "TechnicalQuery",
  ];
}

export function listObjectsForWorkPackageVisibility(
  projectId: string,
  workPackageIdOrStable: string,
): Array<{ stableId: string; objectType: string; confirmationState: string; proposedVisible: boolean }> {
  return listAssociations(projectId, workPackageIdOrStable).map((a) => ({
    stableId: a.objectStableId,
    objectType: a.objectType,
    confirmationState: a.confirmationState,
    proposedVisible: a.confirmationState === "PROPOSED" || a.confirmationState === "STALE",
  }));
}

export function workspaceObjectsStillExist(projectId: string): number {
  return listWorkspaceObjects(projectId).length;
}
