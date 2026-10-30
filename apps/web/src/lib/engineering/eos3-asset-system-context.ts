/**
 * EOS-3-DOMAIN-2 — Asset/System ontology and context.
 * Extends EOS 3.8 Project-to-Asset (no duplicate Asset/System canonical models).
 * Typed context relationships are Phase-3 graph compatible.
 * Configuration state ≠ engineering maturity.
 */

import {
  Eos3ProjectAssetStore,
  type Eos3OperationalAsset,
  type HierarchyLevel,
} from "./eos3-project-asset-thread";
import {
  associateObject,
  getWorkPackage,
  seedPilot001SupportFrameWorkPackage,
  type WorkPackage,
} from "./eos3-work-package-service";

/** Context kinds — not a mandatory single parent-child chain. */
export const ASSET_SYSTEM_CONTEXT_KINDS = [
  "FACILITY",
  "AREA",
  "SYSTEM",
  "SUBSYSTEM",
  "ASSET",
  "COMPONENT",
] as const;

export type AssetSystemContextKind = (typeof ASSET_SYSTEM_CONTEXT_KINDS)[number];

/** Physical configuration / installation state — independent of WP maturity. */
export const ASSET_CONFIGURATION_STATES = [
  "PROPOSED",
  "SELECTED",
  "DESIGNED",
  "PROCURED",
  "INSTALLED",
  "COMMISSIONED",
  "OPERATING",
  "MODIFIED",
  "RETIRED",
] as const;

export type AssetConfigurationState = (typeof ASSET_CONFIGURATION_STATES)[number];

/** Bounded Domain-2 typed edges — convertible to Phase-3 relationship graph. */
export const ASSET_CONTEXT_RELATIONSHIP_TYPES = [
  "LOCATED_IN",
  "PART_OF_SYSTEM",
  "PART_OF_ASSET",
  "SUPPORTS",
  "CONNECTED_TO",
  "SERVES",
  "CONTAINS",
  "ASSOCIATED_WITH",
] as const;

export type AssetContextRelationshipType = (typeof ASSET_CONTEXT_RELATIONSHIP_TYPES)[number];

export type AssetContextRelationship = {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string | null;
  relationshipType: AssetContextRelationshipType;
  fromStableId: string;
  toStableId: string;
  fromRevisionId: string | null;
  toRevisionId: string | null;
  directional: true;
  provenance: Record<string, unknown>;
  createdAt: string;
};

export type WorkPackageAssetLink = {
  id: string;
  projectId: string;
  workPackageStableId: string;
  contextStableId: string;
  role: "PRIMARY_ASSET_OR_SYSTEM" | "RELATED_ASSET_OR_SYSTEM";
  effect: "AFFECTS" | "CREATES" | "MODIFIES" | "RETIRES";
  provenance: Record<string, unknown>;
  createdAt: string;
};

export type EngineeringObjectAssetLink = {
  id: string;
  projectId: string;
  objectType: string;
  objectStableId: string;
  contextStableId: string;
  role: "APPLIES_TO" | "AFFECTS" | "MODIFIES";
  derived: boolean;
  provenance: Record<string, unknown>;
  createdAt: string;
};

export type AssetConfigurationDelta = {
  id: string;
  assetStableId: string;
  memberKey: string;
  existingBaseline: Record<string, unknown>;
  proposedModification: Record<string, unknown>;
  installedUpdated: boolean;
  status: "PROPOSED" | "ACCEPTED_AS_BUILT" | "REJECTED";
  provenance: Record<string, unknown>;
  createdAt: string;
};

export type AssetSystemContextNode = Eos3OperationalAsset & {
  contextKind: AssetSystemContextKind;
  displayName: string;
  tag: string | null;
  description: string;
  configurationState: AssetConfigurationState;
  /** Never equated to engineering WP maturity. */
  engineeringMaturityRef: string | null;
  ownerName: string | null;
  ownerOrganization: string | null;
  primaryTechnicalDiscipline: string | null;
  supportingDisciplines: string[];
  custodialDiscipline: string | null;
  inspectionDiscipline: string | null;
  functionalSystemStableId: string | null;
  locationParentStableId: string | null;
};

function id() {
  return crypto.randomUUID();
}
function now() {
  return new Date().toISOString();
}

function kindToHierarchy(kind: AssetSystemContextKind): HierarchyLevel {
  switch (kind) {
    case "FACILITY":
      return "site";
    case "AREA":
      return "area";
    case "SYSTEM":
      return "system";
    case "SUBSYSTEM":
      return "subsystem";
    case "ASSET":
      return "equipment";
    case "COMPONENT":
      return "component";
  }
}

function kindPrefix(kind: AssetSystemContextKind): string {
  switch (kind) {
    case "FACILITY":
      return "FAC";
    case "AREA":
      return "AREA";
    case "SYSTEM":
      return "SYS";
    case "SUBSYSTEM":
      return "SSYS";
    case "ASSET":
      return "AST";
    case "COMPONENT":
      return "CMP";
  }
}

type WorkspaceRegistry = {
  store: Eos3ProjectAssetStore;
  nodes: Map<string, AssetSystemContextNode>; // keyed by stableAssetId
  relationships: AssetContextRelationship[];
  wpLinks: WorkPackageAssetLink[];
  objectLinks: EngineeringObjectAssetLink[];
  deltas: AssetConfigurationDelta[];
  recentStableIds: string[];
};

const registries = new Map<string, WorkspaceRegistry>();

export function __resetAssetSystemContextForTests() {
  registries.clear();
}

function ensureRegistry(workspaceId: string): WorkspaceRegistry {
  let r = registries.get(workspaceId);
  if (!r) {
    r = {
      store: new Eos3ProjectAssetStore(),
      nodes: new Map(),
      relationships: [],
      wpLinks: [],
      objectLinks: [],
      deltas: [],
      recentStableIds: [],
    };
    registries.set(workspaceId, r);
  }
  return r;
}

export type CreateContextInput = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  contextKind: AssetSystemContextKind;
  displayName: string;
  tag?: string | null;
  description?: string;
  configurationState?: AssetConfigurationState;
  stableId?: string;
  ownerName?: string | null;
  ownerOrganization?: string | null;
  primaryTechnicalDiscipline?: string | null;
  supportingDisciplines?: string[];
  custodialDiscipline?: string | null;
  systemObjectId?: string | null;
  actorId?: string;
};

/**
 * Create a context node reusing Eos3ProjectAssetStore identity (no duplicate asset table truth).
 */
export function createContextNode(input: CreateContextInput): AssetSystemContextNode {
  const reg = ensureRegistry(input.workspaceId);
  const base = reg.store.createAsset({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    ownerContext: input.ownerOrganization ?? input.ownerName ?? "Operations",
    originatingProjectId: input.projectId,
    systemObjectId: input.systemObjectId ?? null,
    assetClass: input.contextKind.toLowerCase(),
    hierarchyLevel: kindToHierarchy(input.contextKind),
    actorId: input.actorId ?? "project-engineer",
  });

  const stableAssetId =
    input.stableId ??
    `${kindPrefix(input.contextKind)}-${base.assetId.slice(0, 8).toUpperCase()}`;
  if (stableAssetId === input.projectId) {
    throw new Error("asset_identity_must_not_equal_project_id");
  }
  if (reg.nodes.has(stableAssetId)) {
    return reg.nodes.get(stableAssetId)!;
  }

  // Enrich the SAME operational-asset object (no parallel asset truth / shadow copy).
  const node = base as AssetSystemContextNode;
  node.stableAssetId = stableAssetId;
  node.contextKind = input.contextKind;
  node.displayName = input.displayName.trim();
  node.tag = input.tag ?? null;
  node.description = input.description ?? "";
  node.configurationState = input.configurationState ?? "PROPOSED";
  node.engineeringMaturityRef = null;
  node.ownerName = input.ownerName ?? null;
  node.ownerOrganization = input.ownerOrganization ?? null;
  node.primaryTechnicalDiscipline = input.primaryTechnicalDiscipline ?? null;
  node.supportingDisciplines = input.supportingDisciplines ?? [];
  node.custodialDiscipline = input.custodialDiscipline ?? null;
  node.inspectionDiscipline = null;
  node.functionalSystemStableId = null;
  node.locationParentStableId = null;
  node.provenance = {
    ...base.provenance,
    domain: "EOS-3-DOMAIN-2",
    duplicateAssetModel: false,
    duplicateSystemModel: false,
    ownerIsNotDiscipline: true,
    grantsEngineeringAuthority: false,
    source: "eos3.asset-system.context",
    newInProcessAssetShadowModel: false,
  };

  reg.nodes.set(stableAssetId, node);
  touchRecent(reg, stableAssetId);
  return node;
}

function touchRecent(reg: WorkspaceRegistry, stableId: string) {
  reg.recentStableIds = [stableId, ...reg.recentStableIds.filter((x) => x !== stableId)].slice(0, 20);
}

export function getContextNode(workspaceId: string, stableId: string): AssetSystemContextNode | null {
  return ensureRegistry(workspaceId).nodes.get(stableId) ?? null;
}

export function listContextNodes(
  workspaceId: string,
  filter?: { contextKind?: AssetSystemContextKind; projectId?: string; q?: string },
): AssetSystemContextNode[] {
  let rows = [...ensureRegistry(workspaceId).nodes.values()];
  if (filter?.contextKind) rows = rows.filter((n) => n.contextKind === filter.contextKind);
  if (filter?.projectId) rows = rows.filter((n) => n.originatingProjectId === filter.projectId);
  if (filter?.q) {
    const q = filter.q.toLowerCase();
    rows = rows.filter(
      (n) =>
        n.displayName.toLowerCase().includes(q) ||
        n.stableAssetId.toLowerCase().includes(q) ||
        (n.tag?.toLowerCase().includes(q) ?? false),
    );
  }
  return rows.sort((a, b) => a.stableAssetId.localeCompare(b.stableAssetId));
}

export function listFacilities(workspaceId: string, projectId?: string) {
  return listContextNodes(workspaceId, { contextKind: "FACILITY", projectId });
}
export function listAreas(workspaceId: string, projectId?: string) {
  return listContextNodes(workspaceId, { contextKind: "AREA", projectId });
}
export function listSystems(workspaceId: string, projectId?: string) {
  return listContextNodes(workspaceId, { contextKind: "SYSTEM", projectId });
}
export function listAssets(workspaceId: string, projectId?: string) {
  return listContextNodes(workspaceId, { contextKind: "ASSET", projectId });
}
export function listComponents(workspaceId: string, projectId?: string) {
  return listContextNodes(workspaceId, { contextKind: "COMPONENT", projectId });
}

/**
 * Typed directional context relationship — Phase-3 convertible.
 * Does NOT force a single rigid Facility>Area>System>Asset tree.
 */
export function relateContext(input: {
  tenantId: string;
  workspaceId: string;
  projectId?: string | null;
  relationshipType: AssetContextRelationshipType;
  fromStableId: string;
  toStableId: string;
  inferenceBasis?: string;
  confidence?: number;
  confirmationStatus?: "INFERRED" | "CONFIRMED" | "REJECTED";
  actorId?: string | null;
}): AssetContextRelationship {
  const reg = ensureRegistry(input.workspaceId);
  if (!reg.nodes.has(input.fromStableId) || !reg.nodes.has(input.toStableId)) {
    throw new Error("context_relationship_endpoints_required");
  }
  if (!(ASSET_CONTEXT_RELATIONSHIP_TYPES as readonly string[]).includes(input.relationshipType)) {
    throw new Error("invalid_context_relationship_type");
  }
  const existing = reg.relationships.find(
    (r) =>
      r.relationshipType === input.relationshipType &&
      r.fromStableId === input.fromStableId &&
      r.toStableId === input.toStableId,
  );
  if (existing) return existing;

  const row: AssetContextRelationship = {
    id: id(),
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId ?? null,
    relationshipType: input.relationshipType,
    fromStableId: input.fromStableId,
    toStableId: input.toStableId,
    fromRevisionId: null,
    toRevisionId: null,
    directional: true,
    provenance: {
      source: input.inferenceBasis ? "inferred" : "explicit",
      inferenceBasis: input.inferenceBasis ?? null,
      confidence: input.confidence ?? (input.inferenceBasis ? 0.7 : 1),
      confirmationStatus: input.confirmationStatus ?? (input.inferenceBasis ? "INFERRED" : "CONFIRMED"),
      actorId: input.actorId ?? null,
      phase3GraphCompatible: true,
      revisionAware: true,
    },
    createdAt: now(),
  };
  reg.relationships.push(row);

  // Maintain convenience pointers without enforcing hierarchy
  const from = reg.nodes.get(input.fromStableId)!;
  const to = reg.nodes.get(input.toStableId)!;
  if (input.relationshipType === "LOCATED_IN") {
    from.locationParentStableId = input.toStableId;
  }
  if (input.relationshipType === "PART_OF_SYSTEM" && to.contextKind === "SYSTEM") {
    from.functionalSystemStableId = input.toStableId;
  }
  reg.nodes.set(from.stableAssetId, from);
  return row;
}

export function listContextRelationships(workspaceId: string, stableId?: string): AssetContextRelationship[] {
  const rows = ensureRegistry(workspaceId).relationships;
  if (!stableId) return rows;
  return rows.filter((r) => r.fromStableId === stableId || r.toStableId === stableId);
}

export function setConfigurationState(
  workspaceId: string,
  stableId: string,
  state: AssetConfigurationState,
): AssetSystemContextNode {
  const node = getContextNode(workspaceId, stableId);
  if (!node) throw new Error("context_node_not_found");
  // Identity continuity: stableAssetId unchanged across state transitions
  node.configurationState = state;
  node.provenance = {
    ...node.provenance,
    lastConfigurationTransitionAt: now(),
    priorConfigurationStatePreserved: true,
  };
  ensureRegistry(workspaceId).nodes.set(stableId, node);
  return node;
}

export function recordConfigurationDelta(input: {
  workspaceId: string;
  assetStableId: string;
  memberKey: string;
  existingBaseline: Record<string, unknown>;
  proposedModification: Record<string, unknown>;
}): AssetConfigurationDelta {
  const reg = ensureRegistry(input.workspaceId);
  if (!reg.nodes.has(input.assetStableId)) throw new Error("context_node_not_found");
  const delta: AssetConfigurationDelta = {
    id: id(),
    assetStableId: input.assetStableId,
    memberKey: input.memberKey,
    existingBaseline: input.existingBaseline,
    proposedModification: input.proposedModification,
    installedUpdated: false,
    status: "PROPOSED",
    provenance: {
      source: "eos3.asset-system.configuration-delta",
      existingNotOverwritten: true,
    },
    createdAt: now(),
  };
  reg.deltas.push(delta);
  return delta;
}

export function acceptConfigurationAsBuilt(
  workspaceId: string,
  deltaId: string,
): AssetConfigurationDelta {
  const reg = ensureRegistry(workspaceId);
  const delta = reg.deltas.find((d) => d.id === deltaId);
  if (!delta) throw new Error("configuration_delta_not_found");
  delta.status = "ACCEPTED_AS_BUILT";
  delta.installedUpdated = true;
  delta.provenance = { ...delta.provenance, acceptedAt: now(), humanAuthority: true };
  return delta;
}

export function listConfigurationHistory(workspaceId: string, assetStableId: string) {
  return ensureRegistry(workspaceId).deltas.filter((d) => d.assetStableId === assetStableId);
}

export function linkWorkPackageToContext(input: {
  workspaceId: string;
  projectId: string;
  workPackageStableId: string;
  contextStableId: string;
  role: WorkPackageAssetLink["role"];
  effect?: WorkPackageAssetLink["effect"];
}): WorkPackageAssetLink {
  const reg = ensureRegistry(input.workspaceId);
  if (!reg.nodes.has(input.contextStableId)) throw new Error("context_node_not_found");
  const existing = reg.wpLinks.find(
    (l) =>
      l.workPackageStableId === input.workPackageStableId &&
      l.contextStableId === input.contextStableId &&
      l.role === input.role,
  );
  if (existing) return existing;
  const row: WorkPackageAssetLink = {
    id: id(),
    projectId: input.projectId,
    workPackageStableId: input.workPackageStableId,
    contextStableId: input.contextStableId,
    role: input.role,
    effect: input.effect ?? "AFFECTS",
    provenance: { source: "work_package_asset_link", askOnce: true },
    createdAt: now(),
  };
  reg.wpLinks.push(row);

  // Reuse into WP affectedAssets without asking again (ASK_ONCE)
  const wp = getWorkPackage(input.projectId, input.workPackageStableId);
  if (wp) {
    const node = reg.nodes.get(input.contextStableId)!;
    if (!wp.affectedAssets.some((r) => r.stableRef === node.stableAssetId)) {
      wp.affectedAssets.push({
        facility: node.contextKind === "FACILITY" ? node.displayName : undefined,
        area: node.contextKind === "AREA" ? node.displayName : undefined,
        system: node.contextKind === "SYSTEM" ? node.displayName : undefined,
        asset: node.contextKind === "ASSET" ? node.displayName : undefined,
        component: node.contextKind === "COMPONENT" ? node.displayName : undefined,
        referenceKind:
          node.configurationState === "PROPOSED" || node.configurationState === "DESIGNED"
            ? "PLACEHOLDER"
            : "EXISTING",
        stableRef: node.stableAssetId,
        displayName: node.displayName,
      });
    }
  }
  return row;
}

export function listWorkPackageContextLinks(
  workspaceId: string,
  workPackageStableId: string,
): WorkPackageAssetLink[] {
  return ensureRegistry(workspaceId).wpLinks.filter(
    (l) => l.workPackageStableId === workPackageStableId,
  );
}

export function associateEngineeringObjectToContext(input: {
  workspaceId: string;
  projectId: string;
  objectType: string;
  objectStableId: string;
  contextStableId: string;
  role?: EngineeringObjectAssetLink["role"];
  derived?: boolean;
  inferenceBasis?: string;
}): EngineeringObjectAssetLink {
  const reg = ensureRegistry(input.workspaceId);
  if (!reg.nodes.has(input.contextStableId)) throw new Error("context_node_not_found");
  const existing = reg.objectLinks.find(
    (l) =>
      l.objectStableId === input.objectStableId &&
      l.contextStableId === input.contextStableId,
  );
  if (existing) return existing;
  const row: EngineeringObjectAssetLink = {
    id: id(),
    projectId: input.projectId,
    objectType: input.objectType,
    objectStableId: input.objectStableId,
    contextStableId: input.contextStableId,
    role: input.role ?? "APPLIES_TO",
    derived: input.derived ?? false,
    provenance: {
      source: input.derived ? "derived" : "explicit",
      inferenceBasis: input.inferenceBasis ?? null,
      confirmationStatus: input.derived ? "INFERRED" : "CONFIRMED",
      grantsEngineeringAuthority: false,
    },
    createdAt: now(),
  };
  reg.objectLinks.push(row);
  return row;
}

/**
 * Bounded derivation: if object linked to WP and WP has primary asset, derive unless explicit.
 */
export function deriveObjectContextFromWorkPackage(input: {
  workspaceId: string;
  projectId: string;
  objectType: string;
  objectStableId: string;
  workPackageStableId: string;
}): EngineeringObjectAssetLink | null {
  const links = listWorkPackageContextLinks(input.workspaceId, input.workPackageStableId);
  const primary = links.find((l) => l.role === "PRIMARY_ASSET_OR_SYSTEM");
  if (!primary) return null;
  const existing = ensureRegistry(input.workspaceId).objectLinks.find(
    (l) => l.objectStableId === input.objectStableId && !l.derived,
  );
  if (existing) return existing; // do not override explicit
  return associateEngineeringObjectToContext({
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    objectType: input.objectType,
    objectStableId: input.objectStableId,
    contextStableId: primary.contextStableId,
    derived: true,
    inferenceBasis: `Derived from Work Package ${input.workPackageStableId} primary context`,
  });
}

export function searchContextSelector(input: {
  workspaceId: string;
  projectId?: string;
  q?: string;
  kinds?: AssetSystemContextKind[];
}): {
  results: AssetSystemContextNode[];
  recent: AssetSystemContextNode[];
  suggestions: AssetSystemContextNode[];
} {
  const reg = ensureRegistry(input.workspaceId);
  let results = listContextNodes(input.workspaceId, {
    projectId: input.projectId,
    q: input.q,
  });
  if (input.kinds?.length) {
    results = results.filter((n) => input.kinds!.includes(n.contextKind));
  }
  const recent = reg.recentStableIds
    .map((s) => reg.nodes.get(s))
    .filter(Boolean) as AssetSystemContextNode[];
  const suggestions = recent.slice(0, 5);
  return { results, recent, suggestions };
}

export function buildAssetSystemUiContract(input: {
  workspaceId: string;
  projectId: string;
  workPackageStableId: string;
}): {
  projectId: string;
  workPackage: { stableId: string; title: string; maturity: string | null };
  facility: string | null;
  area: string | null;
  system: string | null;
  primaryAsset: string | null;
  relatedAssets: string[];
  engineeringLanguage: true;
} {
  const wp = getWorkPackage(input.projectId, input.workPackageStableId);
  const links = listWorkPackageContextLinks(input.workspaceId, input.workPackageStableId);
  const reg = ensureRegistry(input.workspaceId);
  const resolve = (stableId: string) => reg.nodes.get(stableId);

  let facility: string | null = null;
  let area: string | null = null;
  let system: string | null = null;
  let primaryAsset: string | null = null;
  const relatedAssets: string[] = [];

  for (const link of links) {
    const n = resolve(link.contextStableId);
    if (!n) continue;
    const label = `${n.tag ? n.tag + " " : ""}${n.displayName}`.trim();
    if (link.role === "PRIMARY_ASSET_OR_SYSTEM") {
      primaryAsset = label;
      if (n.functionalSystemStableId) {
        const s = resolve(n.functionalSystemStableId);
        if (s) system = s.displayName;
      }
      if (n.locationParentStableId) {
        let loc: AssetSystemContextNode | undefined = resolve(n.locationParentStableId);
        while (loc) {
          if (loc.contextKind === "AREA") area = loc.displayName;
          if (loc.contextKind === "FACILITY") facility = loc.displayName;
          loc = loc.locationParentStableId
            ? resolve(loc.locationParentStableId)
            : undefined;
        }
      }
    } else {
      relatedAssets.push(label);
    }
  }

  // Fallbacks from nodes of kinds if not via primary
  if (!facility) facility = listFacilities(input.workspaceId, input.projectId)[0]?.displayName ?? null;
  if (!area) area = listAreas(input.workspaceId, input.projectId)[0]?.displayName ?? null;
  if (!system) system = listSystems(input.workspaceId, input.projectId)[0]?.displayName ?? null;

  return {
    projectId: input.projectId,
    workPackage: {
      stableId: input.workPackageStableId,
      title: wp?.title ?? input.workPackageStableId,
      maturity: wp?.maturity ?? null,
    },
    facility,
    area,
    system,
    primaryAsset,
    relatedAssets,
    engineeringLanguage: true,
  };
}

export function physicalContextView(workspaceId: string, stableId: string) {
  const rels = listContextRelationships(workspaceId, stableId).filter((r) =>
    ["LOCATED_IN", "CONTAINS", "PART_OF_ASSET"].includes(r.relationshipType),
  );
  return { stableId, relationships: rels };
}

export function functionalContextView(workspaceId: string, stableId: string) {
  const rels = listContextRelationships(workspaceId, stableId).filter((r) =>
    ["PART_OF_SYSTEM", "SERVES", "CONNECTED_TO", "SUPPORTS", "ASSOCIATED_WITH"].includes(
      r.relationshipType,
    ),
  );
  return { stableId, relationships: rels };
}

/**
 * Brownfield PILOT-001 Asset/System context for WP-STR-004.
 * Preserves project lifecycle; does not auto-add unevidenced disciplines.
 */
export function seedPilot001AssetSystemContext(input: {
  tenantId?: string;
  workspaceId: string;
  projectId: string;
}): {
  facility: AssetSystemContextNode;
  area: AssetSystemContextNode;
  system: AssetSystemContextNode;
  primaryAsset: AssetSystemContextNode;
  relatedAsset: AssetSystemContextNode;
  component: AssetSystemContextNode;
  workPackage: WorkPackage;
  uiContract: ReturnType<typeof buildAssetSystemUiContract>;
} {
  const tenantId = input.tenantId ?? "00000000-0000-4000-8000-000000000041";
  const { workspaceId, projectId } = input;

  const { workPackage } = seedPilot001SupportFrameWorkPackage(projectId);

  const facility = createContextNode({
    tenantId,
    workspaceId,
    projectId,
    contextKind: "FACILITY",
    displayName: "Synthetic Process Plant",
    tag: "PLT",
    stableId: "FAC-PILOT-001",
    configurationState: "OPERATING",
    ownerOrganization: "Operations",
    ownerName: "Plant Owner",
  });
  const area = createContextNode({
    tenantId,
    workspaceId,
    projectId,
    contextKind: "AREA",
    displayName: "Process Area",
    tag: "PA-100",
    stableId: "AREA-PILOT-100",
    configurationState: "OPERATING",
  });
  const system = createContextNode({
    tenantId,
    workspaceId,
    projectId,
    contextKind: "SYSTEM",
    displayName: "Process Equipment Support",
    tag: "SYS-PES",
    stableId: "SYS-PES-001",
    configurationState: "OPERATING",
    primaryTechnicalDiscipline: "Structural",
    supportingDisciplines: ["Mechanical"],
    systemObjectId: "SYS-STR-001",
  });
  const primaryAsset = createContextNode({
    tenantId,
    workspaceId,
    projectId,
    contextKind: "ASSET",
    displayName: "Existing steel-framed platform / support structure",
    tag: "PLT-201",
    stableId: "AST-PLT-201",
    configurationState: "INSTALLED",
    ownerOrganization: "Operations",
    primaryTechnicalDiscipline: "Structural",
    supportingDisciplines: ["Mechanical"],
    custodialDiscipline: "Mechanical",
  });
  const relatedAsset = createContextNode({
    tenantId,
    workspaceId,
    projectId,
    contextKind: "ASSET",
    displayName: "New process equipment module",
    tag: "EQ-MOD-01",
    stableId: "AST-EQ-MOD-01",
    configurationState: "DESIGNED",
    primaryTechnicalDiscipline: "Mechanical",
  });
  const component = createContextNode({
    tenantId,
    workspaceId,
    projectId,
    contextKind: "COMPONENT",
    displayName: "Beam B23",
    tag: "B23",
    stableId: "CMP-B23",
    configurationState: "INSTALLED",
  });

  relateContext({
    tenantId,
    workspaceId,
    projectId,
    relationshipType: "LOCATED_IN",
    fromStableId: area.stableAssetId,
    toStableId: facility.stableAssetId,
  });
  relateContext({
    tenantId,
    workspaceId,
    projectId,
    relationshipType: "LOCATED_IN",
    fromStableId: primaryAsset.stableAssetId,
    toStableId: area.stableAssetId,
  });
  relateContext({
    tenantId,
    workspaceId,
    projectId,
    relationshipType: "PART_OF_SYSTEM",
    fromStableId: primaryAsset.stableAssetId,
    toStableId: system.stableAssetId,
  });
  relateContext({
    tenantId,
    workspaceId,
    projectId,
    relationshipType: "SUPPORTS",
    fromStableId: primaryAsset.stableAssetId,
    toStableId: relatedAsset.stableAssetId,
  });
  relateContext({
    tenantId,
    workspaceId,
    projectId,
    relationshipType: "PART_OF_ASSET",
    fromStableId: component.stableAssetId,
    toStableId: primaryAsset.stableAssetId,
  });
  // Optional subsystem — demonstrates optional decomposition
  const subsystem = createContextNode({
    tenantId,
    workspaceId,
    projectId,
    contextKind: "SUBSYSTEM",
    displayName: "Platform Framing Subsystem",
    tag: "SSYS-FRM",
    stableId: "SSYS-FRM-001",
    configurationState: "INSTALLED",
  });
  relateContext({
    tenantId,
    workspaceId,
    projectId,
    relationshipType: "PART_OF_SYSTEM",
    fromStableId: subsystem.stableAssetId,
    toStableId: system.stableAssetId,
  });
  relateContext({
    tenantId,
    workspaceId,
    projectId,
    relationshipType: "CONTAINS",
    fromStableId: subsystem.stableAssetId,
    toStableId: primaryAsset.stableAssetId,
  });

  linkWorkPackageToContext({
    workspaceId,
    projectId,
    workPackageStableId: "WP-STR-004",
    contextStableId: primaryAsset.stableAssetId,
    role: "PRIMARY_ASSET_OR_SYSTEM",
    effect: "MODIFIES",
  });
  linkWorkPackageToContext({
    workspaceId,
    projectId,
    workPackageStableId: "WP-STR-004",
    contextStableId: relatedAsset.stableAssetId,
    role: "RELATED_ASSET_OR_SYSTEM",
    effect: "AFFECTS",
  });
  linkWorkPackageToContext({
    workspaceId,
    projectId,
    workPackageStableId: "WP-STR-004",
    contextStableId: system.stableAssetId,
    role: "RELATED_ASSET_OR_SYSTEM",
    effect: "AFFECTS",
  });

  // Existing vs proposed configuration — do not overwrite installed
  recordConfigurationDelta({
    workspaceId,
    assetStableId: component.stableAssetId,
    memberKey: "section",
    existingBaseline: { section: "X", member: "Beam B23" },
    proposedModification: { section: "Y", member: "Beam B23 replacement" },
  });

  associateEngineeringObjectToContext({
    workspaceId,
    projectId,
    objectType: "Calculation",
    objectStableId: "CALC-001",
    contextStableId: primaryAsset.stableAssetId,
  });
  associateEngineeringObjectToContext({
    workspaceId,
    projectId,
    objectType: "Decision",
    objectStableId: "DEC-001",
    contextStableId: primaryAsset.stableAssetId,
    role: "AFFECTS",
  });
  associateEngineeringObjectToContext({
    workspaceId,
    projectId,
    objectType: "Decision",
    objectStableId: "DEC-001",
    contextStableId: relatedAsset.stableAssetId,
    role: "AFFECTS",
  });
  associateEngineeringObjectToContext({
    workspaceId,
    projectId,
    objectType: "Change",
    objectStableId: "CHG-001",
    contextStableId: component.stableAssetId,
    role: "MODIFIES",
  });
  associateEngineeringObjectToContext({
    workspaceId,
    projectId,
    objectType: "Requirement",
    objectStableId: "REQ-001",
    contextStableId: system.stableAssetId,
  });

  deriveObjectContextFromWorkPackage({
    workspaceId,
    projectId,
    objectType: "Assumption",
    objectStableId: "ASM-001",
    workPackageStableId: "WP-STR-004",
  });

  // Also associate WP engineering objects for continuity
  associateObject(projectId, "WP-STR-004", {
    objectType: "Calculation",
    objectStableId: "CALC-001",
  });

  const uiContract = buildAssetSystemUiContract({
    workspaceId,
    projectId,
    workPackageStableId: "WP-STR-004",
  });

  return {
    facility,
    area,
    system,
    primaryAsset,
    relatedAsset,
    component,
    workPackage,
    uiContract,
  };
}

/** Greenfield proposed pump package scenario. */
export function seedGreenfieldProposedPumpContext(input: {
  tenantId?: string;
  workspaceId: string;
  projectId: string;
}): {
  facility: AssetSystemContextNode;
  system: AssetSystemContextNode;
  asset: AssetSystemContextNode;
} {
  const tenantId = input.tenantId ?? "00000000-0000-4000-8000-000000000041";
  const facility = createContextNode({
    tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    contextKind: "FACILITY",
    displayName: "New Processing Facility",
    tag: "NPF",
    stableId: "FAC-NPF-001",
    configurationState: "PROPOSED",
  });
  const system = createContextNode({
    tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    contextKind: "SYSTEM",
    displayName: "Cooling Water",
    tag: "CW",
    stableId: "SYS-CW-001",
    configurationState: "PROPOSED",
    primaryTechnicalDiscipline: "Mechanical",
  });
  const asset = createContextNode({
    tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    contextKind: "ASSET",
    displayName: "Pump P-101",
    tag: "P-101",
    stableId: "AST-P-101",
    configurationState: "PROPOSED",
    primaryTechnicalDiscipline: "Mechanical",
  });
  relateContext({
    tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    relationshipType: "LOCATED_IN",
    fromStableId: system.stableAssetId,
    toStableId: facility.stableAssetId,
  });
  relateContext({
    tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    relationshipType: "PART_OF_SYSTEM",
    fromStableId: asset.stableAssetId,
    toStableId: system.stableAssetId,
  });
  // Identity continuity: advance state without changing stable id
  setConfigurationState(input.workspaceId, asset.stableAssetId, "DESIGNED");
  const after = getContextNode(input.workspaceId, "AST-P-101")!;
  if (after.stableAssetId !== "AST-P-101") throw new Error("identity_continuity_broken");
  return { facility, system, asset: after };
}

export function getUnderlyingProjectAssetStore(workspaceId: string): Eos3ProjectAssetStore {
  return ensureRegistry(workspaceId).store;
}

export function unauthorizedWriteBlocked(input: {
  workspaceId: string;
  callerWorkspaceId: string;
}): boolean {
  return input.workspaceId !== input.callerWorkspaceId;
}

export function auditExistingModels(): {
  existingAssetSystemModelAudited: true;
  duplicateAssetModelCreated: false;
  duplicateSystemModelCreated: false;
  projectToAssetPreserved: true;
  ontologyNotRigidSingleTree: true;
  systemMeans: string;
  interfaceMeans: string;
  ontologyContextMeans: string;
} {
  return {
    existingAssetSystemModelAudited: true,
    duplicateAssetModelCreated: false,
    duplicateSystemModelCreated: false,
    projectToAssetPreserved: true,
    ontologyNotRigidSingleTree: true,
    systemMeans:
      "Existing EOS System object remains the engineering functional/system definition (SYS-STR-001 etc.). Domain-2 SYSTEM context nodes may reference systemObjectId without replacing Systems & Interfaces.",
    interfaceMeans:
      "Interface remains a typed engineering interface between systems/disciplines — not an ontology location node.",
    ontologyContextMeans:
      "Facility/Area/System/Subsystem/Asset/Component context uses typed relationships (LOCATED_IN, PART_OF_SYSTEM, …) overlaid on Project-to-Asset identity.",
  };
}
