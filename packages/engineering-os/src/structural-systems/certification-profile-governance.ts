/**
 * EOS-D1L-R3 standards and jurisdiction profile governance.
 * Binds the R1 catalog and reuses the R2 eligibility evaluator.
 */

import { D1L_0_CLAIM_SCOPES, D1L_0_CLAIM_TYPES, STRUCTURAL_STANDARD_LIFECYCLES } from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import type { D1lR1Actor, D1lR1JurisdictionProfile, D1lR1ManifestRecord, D1lR1StandardProfile, D1lR1Store } from "./certification-claim-manifest";
import { D1L_R2_ELIGIBILITY_RUNTIME_COUNT, type D1lR2LedgerRow, type D1lR2Store, evaluateCertificationEligibility } from "./certification-eligibility";
import { D1G_CERTIFIED_SOLVER_STATUS, D1G_CONFORMANCE_VALIDATED, D1G_ENGINEER_VALIDATED, D1G_LIVE_VALIDATED } from "./roadmap-after-twin-closeout";

export const D1L_R3_STATUS = "PROFILE_GOVERNANCE_IMPLEMENTED" as const;
export const D1L_R3_MATURITY_STATE = "STRUCTURAL_CERTIFICATION_STANDARDS_JURISDICTION_PROFILE_GOVERNANCE_IMPLEMENTED" as const;
export const D1L_R3_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D1L_R3_STANDARDS_JURISDICTION_PROFILE_GOVERNANCE_CLOSEOUT.md" as const;
export const D1L_R3_ARCHITECTURE_READY = true as const;
export const D1L_R3_ELIGIBILITY_MODEL_READY = true as const;
export const D1L_R3_CERTIFICATION_RUNTIME_READY = false as const;
export const D1L_R3_CERTIFICATION_ELIGIBILITY_SATISFIED = false as const;
export const D1L_R3_CERTIFICATION_AUTHORITY_READY = false as const;
export const D1L_R3_STRUCTURAL_PACK_COMPLETE = false as const;
export const D1L_R3_STANDARD_PROFILE_RUNTIME_COUNT = 1 as const;
export const D1L_R3_JURISDICTION_PROFILE_RUNTIME_COUNT = 1 as const;
export const D1L_R3_MAPPING_RUNTIME_COUNT = 1 as const;
export const D1L_R3_REQUIREMENT_MAPPING_RUNTIME_COUNT = 1 as const;
export const D1L_R3_REQUIREMENT_SET_RUNTIME_COUNT = 1 as const;
export const D1L_R3_ELIGIBILITY_RUNTIME_COUNT = D1L_R2_ELIGIBILITY_RUNTIME_COUNT;
export const D1L_R3_STANDARD_FAMILY_EQUALS_LATEST_EDITION = false as const;
export const D1L_R3_FLOATING_STANDARD_ALLOWED = false as const;
export const D1L_R3_STANDARD_VERSION_PINNING_REQUIRED = true as const;
export const D1L_R3_STANDARD_AUTO_UPGRADED = false as const;
export const D1L_R3_FLOATING_JURISDICTION_ALLOWED = false as const;
export const D1L_R3_JURISDICTION_PIN_REQUIRED = true as const;
export const D1L_R3_JURISDICTION_AUTO_UPGRADED = false as const;
export const D1L_R3_JURISDICTION_INFERRED_FROM_USER_LOCATION = false as const;
export const D1L_R3_JURISDICTION_INFERRED_FROM_IP_LOCATION = false as const;
export const D1L_R3_CALLER_CAN_DOWNGRADE_REQUIREMENTS = false as const;
export const D1L_R3_CALLER_CAN_DISABLE_MANDATORY_REQUIREMENT = false as const;
export const D1L_R3_UNKNOWN_MAPPING_USES_GENERIC_FALLBACK = false as const;
export const D1L_R3_UNKNOWN_STANDARD_AUTO_CREATED = false as const;
export const D1L_R3_UNKNOWN_JURISDICTION_AUTO_CREATED = false as const;
export const D1L_R3_AUTOMATIC_PROFILE_CONFLICT_RESOLUTION_COUNT = 0 as const;
export const D1L_R3_PROFILE_SUPERSESSION_PRESERVES_HISTORY = true as const;
export const D1L_R3_CAN_MUTATE_R1_MANIFEST = false as const;
export const D1L_R3_REEVALUATION_REQUIRED_AFTER_PROFILE_CHANGE = true as const;
export const D1L_R3_CANONICAL_FINGERPRINT_REUSED = true as const;
export const D1L_R3_SECOND_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D1L_R3_CANONICAL_DIGITAL_THREAD_REUSED = true as const;
export const D1L_R3_PARALLEL_PROFILE_THREAD_CREATED = false as const;
export const D1L_R3_R2_ELIGIBILITY_ENGINE_REUSED = true as const;
export const D1L_R3_PARALLEL_ELIGIBILITY_ENGINE_CREATED = false as const;
export const D1L_R3_PROFILE_SELECTED_EQUALS_CONFORMANT = false as const;
export const D1L_R3_LEGAL_ADJUDICATION_RUNTIME_COUNT = 0 as const;
export const D1L_R3_CODE_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D1L_R3_CONSEQUENCE_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D1L_R3_AUTOMATIC_STANDARD_UPDATE_RUNTIME_COUNT = 0 as const;
export const D1L_R3_PROFILE_AUTHORITY_EQUALS_CERTIFICATION_AUTHORITY = false as const;
export const D1L_R3_ADMIN_EQUALS_PROFILE_AUTHORITY = false as const;
export const D1L_R3_ADMIN_EQUALS_CERTIFICATION_AUTHORITY = false as const;
export const D1L_R3_AI_CAN_CREATE_STANDARD_PROFILE = false as const;
export const D1L_R3_AI_CAN_CREATE_JURISDICTION_PROFILE = false as const;
export const D1L_R3_AI_CAN_CHANGE_SEVERITY = false as const;
export const D1L_R3_AI_CAN_WAIVE_REQUIREMENT = false as const;
export const D1L_R3_AI_CAN_RESOLVE_CONFLICT = false as const;
export const D1L_R3_AI_CAN_MARK_CERTIFIED = false as const;
export const D1L_R3_D1G_CERTIFICATION_BLOCKER_PRESERVED = true as const;
export const D1L_R3_D1K_HANDOFF_REUSES_D1K = true as const;
export const D1L_R3_PARALLEL_CROSS_DISCIPLINE_INTERFACE_CREATED = false as const;
export const D1L_R3_DECISION_RUNTIME_COUNT = 0 as const;
export const D1L_R3_ISSUANCE_RUNTIME_COUNT = 0 as const;
export const D1L_R3_REVOCATION_RUNTIME_COUNT = 0 as const;
export const D1L_R3_NEW_CONFORMANCE_RUNTIME_COUNT = 0 as const;
export const D1L_R3_NEW_ENGINEER_VALIDATION_RUNTIME_COUNT = 0 as const;
export const D1L_R3_NEW_SOLVER_CERTIFICATION_RUNTIME_COUNT = 0 as const;
export const D1L_R3_NEW_SOLVER_RUNTIME_COUNT = 0 as const;
export const D1L_R3_NEW_ENGINEERING_FORMULA_COUNT = 0 as const;
export const D1L_R3_D2_D8_RUNTIME_COUNT = 0 as const;
export const D1L_R3_D9_RUNTIME_COUNT = 0 as const;
export const D1L_R3_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT = 0 as const;
export const D1L_R3_D1M_ABSORBED = false as const;
export const D1L_R3_D1N_ABSORBED = false as const;
export const D1L_R3_DATABASE_SCHEMA_CHANGED = false as const;
export const D1L_R3_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY = true as const;
export const D1L_R3_UNAUTHORIZED_PRODUCT_CLAIM = false as const;
export const D1L_R3_PROJECT_OVERLAY_CAN_WEAKEN_MANDATORY = false as const;
export const D1L_R3_PRECEDENCE = ["BASE_CERTIFICATION_ARCHITECTURE", "JURISDICTION_PROFILE", "STANDARD_PROFILE", "CONSEQUENCE_RELIABILITY_PROFILE", "PROJECT_CLIENT_OVERLAY"] as const;
export const D1L_R4_CANONICAL_PHASE = "EOS-D1L-R4-CERTIFICATION-AUTHORITY-DECISION-RECORD" as const;
export const D1L_R4_PHASE_TYPE = "STRUCTURAL_CERTIFICATION_AUTHORITY_DECISION_RECORD" as const;
export const D1L_R4_CANONICAL_SCOPE =
  "Implement governed certification authority identity, authority checks, and a bounded certification decision record that can act only on an exact eligible claim and exact evidence and profile fingerprints. Do not bypass eligibility or fabricate engineering validation." as const;

const FLOATING = new Set(["latest", "current", "newest", "applicable edition", "latest amendment"]);

export type D1lR3StandardGovernance = {
  profileId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  standardFamily: string;
  standardCode: string;
  edition: string;
  amendment: string;
  version: string;
  fingerprint: string;
  publisherAuthority: string;
  adoptionAuthority: string;
  maintainerAuthority: string;
  provenanceRef: string;
  status: (typeof STRUCTURAL_STANDARD_LIFECYCLES)[number];
};

export type D1lR3JurisdictionGovernance = {
  profileId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  jurisdictionId: string;
  version: string;
  fingerprint: string;
  country: string;
  region: string;
  authority: string;
  provenanceRef: string;
  status: (typeof STRUCTURAL_STANDARD_LIFECYCLES)[number];
};

export type D1lR3RequirementSet = {
  requirementSetId: string;
  version: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  claimType: string;
  claimScope: string;
  mandatory: string[];
  conditional: Array<{ requirementId: string; when: "CONSEQUENCE_PROFILE_REQUIRED" | "CROSS_DISCIPLINE_DECLARED" }>;
  advisory: string[];
  authority: string;
  provenanceRef: string;
  status: (typeof STRUCTURAL_STANDARD_LIFECYCLES)[number];
  fingerprint: string;
};

export type D1lR3Mapping = {
  mappingId: string;
  version: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  standardProfileId: string;
  jurisdictionProfileId: string;
  claimType: string;
  claimScope: string;
  requirementSetId: string;
  authority: string;
  provenanceRef: string;
  status: (typeof STRUCTURAL_STANDARD_LIFECYCLES)[number];
  fingerprint: string;
};

export type D1lR3Overlay = {
  overlayId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  claimType: string;
  addedRequirements: string[];
  removedRequirements: string[];
};

export type D1lR3Store = {
  now: () => string;
  standards: D1lR3StandardGovernance[];
  jurisdictions: D1lR3JurisdictionGovernance[];
  requirementSets: D1lR3RequirementSet[];
  mappings: D1lR3Mapping[];
  overlays: D1lR3Overlay[];
  history: Array<{ historyId: string; kind: string; recordId: string; fingerprint: string; action: "RECORDED" | "SUPERSEDED" }>;
};

export type D1lR3Resolution = {
  status: "RESOLVED" | "UNKNOWN_STANDARD" | "UNKNOWN_JURISDICTION" | "UNKNOWN_MAPPING" | "PROFILE_CONFLICT" | "UNSUPPORTED_COMBINATION";
  standard: D1lR3StandardGovernance | null;
  jurisdiction: D1lR3JurisdictionGovernance | null;
  mapping: D1lR3Mapping | null;
  requirementSet: D1lR3RequirementSet | null;
  applicableRequirements: string[];
  precedence: readonly string[];
  successorRequiresReevaluation: boolean;
  automaticResolutionCount: 0;
  certificationAuthority: null;
  digitalThreadRefs: string[];
};

function fail(code: string): never {
  throw new Error(code);
}

function floating(value: string): boolean {
  return FLOATING.has(value.trim().toLowerCase());
}

function assertGovernor(actor: D1lR1Actor): void {
  if (actor.authority !== "PROFILE_GOVERNANCE_AUTHORITY" || /^AI(?:\b|_)/i.test(actor.actorId) || /^AI(?:\b|_)/i.test(actor.authority)) fail("UNAUTHORIZED");
}

function assertScope(actor: D1lR1Actor, row: { tenantId: string; workspaceId: string; projectId: string }): void {
  if (actor.tenantId !== row.tenantId) fail("CROSS_TENANT_OPERATION");
  if (actor.workspaceId !== row.workspaceId || actor.projectId !== row.projectId) fail("CROSS_PROJECT_OPERATION");
}

function pinned(value: string, code: string): void {
  if (!value.trim() || floating(value)) fail(code);
}

function remember(store: D1lR3Store, kind: string, recordId: string, fingerprint: string, action: "RECORDED" | "SUPERSEDED"): void {
  store.history.push({ historyId: `hist-${store.history.length + 1}`, kind, recordId, fingerprint, action });
}

export function createD1lR3Store(now: () => string): D1lR3Store {
  return { now, standards: [], jurisdictions: [], requirementSets: [], mappings: [], overlays: [], history: [] };
}

export function registerStandardProfile(store: D1lR3Store, actor: D1lR1Actor, catalogProfile: D1lR1StandardProfile, input: { publisherAuthority: string; adoptionAuthority: string; maintainerAuthority: string; provenanceRef: string; status?: D1lR3StandardGovernance["status"]; upgradeToLatest?: boolean }): D1lR3StandardGovernance {
  assertGovernor(actor);
  assertScope(actor, catalogProfile);
  if (input.upgradeToLatest) fail("STANDARD_AUTO_UPGRADE_REJECTED");
  pinned(catalogProfile.edition, "FLOATING_STANDARD_REJECTED");
  pinned(catalogProfile.version, "FLOATING_STANDARD_REJECTED");
  pinned(catalogProfile.fingerprint, "FLOATING_STANDARD_REJECTED");
  if (catalogProfile.amendment) pinned(catalogProfile.amendment, "FLOATING_STANDARD_REJECTED");
  if (catalogProfile.standardFamily === catalogProfile.edition || catalogProfile.standardFamily === catalogProfile.version) fail("STANDARD_FAMILY_NOT_EDITION");
  if (!input.publisherAuthority.trim() || !input.provenanceRef.trim()) fail("INVALID_PROVENANCE");
  if (input.maintainerAuthority === "CERTIFICATION_AUTHORITY" || input.maintainerAuthority === "ADMINISTRATOR") fail("PROFILE_AUTHORITY_NOT_CERTIFIER");
  const status = input.status ?? "ACTIVE";
  if (!(STRUCTURAL_STANDARD_LIFECYCLES as readonly string[]).includes(status)) fail("PROFILE_STATUS_INVALID");
  const record: D1lR3StandardGovernance = {
    ...catalogProfile,
    publisherAuthority: input.publisherAuthority,
    adoptionAuthority: input.adoptionAuthority,
    maintainerAuthority: input.maintainerAuthority,
    provenanceRef: input.provenanceRef,
    status,
  };
  store.standards.push(record);
  remember(store, "STANDARD", record.profileId, record.fingerprint, "RECORDED");
  return record;
}

export function registerJurisdictionProfile(store: D1lR3Store, actor: D1lR1Actor, catalogProfile: D1lR1JurisdictionProfile, input: { country: string; region: string; authority: string; provenanceRef: string; status?: D1lR3JurisdictionGovernance["status"]; inferFromUserLocation?: boolean; inferFromIp?: boolean; upgradeToLatest?: boolean }): D1lR3JurisdictionGovernance {
  assertGovernor(actor);
  assertScope(actor, catalogProfile);
  if (input.inferFromUserLocation) fail("JURISDICTION_LOCATION_INFERENCE_REJECTED");
  if (input.inferFromIp) fail("JURISDICTION_IP_INFERENCE_REJECTED");
  if (input.upgradeToLatest) fail("JURISDICTION_AUTO_UPGRADE_REJECTED");
  pinned(catalogProfile.version, "FLOATING_JURISDICTION_REJECTED");
  pinned(catalogProfile.fingerprint, "FLOATING_JURISDICTION_REJECTED");
  if (!input.authority.trim() || !input.provenanceRef.trim()) fail("INVALID_PROVENANCE");
  const record: D1lR3JurisdictionGovernance = {
    ...catalogProfile,
    country: input.country,
    region: input.region,
    authority: input.authority,
    provenanceRef: input.provenanceRef,
    status: input.status ?? "ACTIVE",
  };
  store.jurisdictions.push(record);
  remember(store, "JURISDICTION", record.profileId, record.fingerprint, "RECORDED");
  return record;
}

export function registerRequirementSet(store: D1lR3Store, actor: D1lR1Actor, input: Omit<D1lR3RequirementSet, "fingerprint" | "status"> & { status?: D1lR3RequirementSet["status"]; solverCertified?: boolean; downgradeMandatory?: boolean }): D1lR3RequirementSet {
  assertGovernor(actor);
  assertScope(actor, input);
  if (input.downgradeMandatory) fail("REQUIREMENT_DOWNGRADE_REJECTED");
  if (!(D1L_0_CLAIM_TYPES as readonly string[]).includes(input.claimType)) fail("UNSUPPORTED_CLAIM_TYPE");
  if (!(D1L_0_CLAIM_SCOPES as readonly string[]).includes(input.claimScope)) fail("CLAIM_SCOPE_REQUIRED");
  if (input.solverCertified || input.mandatory.includes("SOLVER_CERTIFIED")) fail("SOLVER_CERTIFICATION_REJECTED");
  const solverStatus: string = D1G_CERTIFIED_SOLVER_STATUS;
  if (solverStatus !== "NOT_CERTIFIED" || D1G_LIVE_VALIDATED || D1G_ENGINEER_VALIDATED || D1G_CONFORMANCE_VALIDATED) fail("D1G_BLOCKER_REDEFINED");
  pinned(input.version, "FLOATING_REQUIREMENT_SET_REJECTED");
  const fingerprint = fingerprintCanonical({
    requirementSetId: input.requirementSetId,
    version: input.version,
    claimType: input.claimType,
    claimScope: input.claimScope,
    mandatory: input.mandatory,
    conditional: input.conditional,
    advisory: input.advisory,
    authority: input.authority,
  });
  const record: D1lR3RequirementSet = { ...input, status: input.status ?? "ACTIVE", fingerprint };
  store.requirementSets.push(record);
  remember(store, "REQUIREMENT_SET", record.requirementSetId, fingerprint, "RECORDED");
  return record;
}

export function registerProfileMapping(store: D1lR3Store, actor: D1lR1Actor, input: Omit<D1lR3Mapping, "fingerprint" | "status"> & { status?: D1lR3Mapping["status"] }): D1lR3Mapping {
  assertGovernor(actor);
  assertScope(actor, input);
  if (!store.standards.some((row) => row.profileId === input.standardProfileId)) fail("UNKNOWN_STANDARD_PROFILE");
  if (!store.jurisdictions.some((row) => row.profileId === input.jurisdictionProfileId)) fail("UNKNOWN_JURISDICTION_PROFILE");
  if (!store.requirementSets.some((row) => row.requirementSetId === input.requirementSetId)) fail("UNKNOWN_REQUIREMENT_SET");
  pinned(input.version, "FLOATING_MAPPING_REJECTED");
  const fingerprint = fingerprintCanonical({
    mappingId: input.mappingId,
    version: input.version,
    standardProfileId: input.standardProfileId,
    jurisdictionProfileId: input.jurisdictionProfileId,
    claimType: input.claimType,
    claimScope: input.claimScope,
    requirementSetId: input.requirementSetId,
    authority: input.authority,
  });
  const record: D1lR3Mapping = { ...input, status: input.status ?? "ACTIVE", fingerprint };
  store.mappings.push(record);
  remember(store, "MAPPING", record.mappingId, fingerprint, "RECORDED");
  return record;
}

export function registerProjectOverlay(store: D1lR3Store, actor: D1lR1Actor, input: D1lR3Overlay, requirementSet: D1lR3RequirementSet): D1lR3Overlay {
  assertGovernor(actor);
  assertScope(actor, input);
  if (input.removedRequirements.some((requirementId) => requirementSet.mandatory.includes(requirementId))) fail("OVERLAY_CANNOT_WEAKEN_MANDATORY");
  store.overlays.push(input);
  return input;
}

export function supersedeStandardProfile(store: D1lR3Store, actor: D1lR1Actor, predecessorId: string, successorProfile: D1lR1StandardProfile, input: { publisherAuthority: string; adoptionAuthority: string; maintainerAuthority: string; provenanceRef: string }): D1lR3StandardGovernance {
  const predecessor = store.standards.find((row) => row.profileId === predecessorId && row.status === "ACTIVE");
  if (!predecessor) fail("PROFILE_NOT_FOUND");
  const created = registerStandardProfile(store, actor, successorProfile, input);
  predecessor.status = "SUPERSEDED";
  remember(store, "STANDARD", predecessor.profileId, predecessor.fingerprint, "SUPERSEDED");
  return created;
}

export function mutateStandardVersion(): never {
  fail("PROFILE_TAMPER_REJECTED");
}

export function resolveCertificationProfile(store: D1lR3Store, actor: D1lR1Actor, manifest: D1lR1ManifestRecord): D1lR3Resolution {
  if (actor.tenantId !== manifest.tenantId) fail("CROSS_TENANT_OPERATION");
  if (actor.workspaceId !== manifest.workspaceId || actor.projectId !== manifest.projectId) fail("CROSS_PROJECT_OPERATION");
  const standard = store.standards.find((row) => row.profileId === manifest.standardProfileId && row.fingerprint === manifest.standardFingerprint) ?? null;
  const jurisdiction = store.jurisdictions.find((row) => row.profileId === manifest.jurisdictionProfileId && row.fingerprint === manifest.jurisdictionFingerprint) ?? null;
  const base = {
    precedence: D1L_R3_PRECEDENCE,
    automaticResolutionCount: 0 as const,
    certificationAuthority: null,
    successorRequiresReevaluation: false,
    digitalThreadRefs: [manifest.claimId, manifest.standardProfileId, manifest.jurisdictionProfileId],
  };
  if (!standard) return { ...base, status: "UNKNOWN_STANDARD", standard: null, jurisdiction, mapping: null, requirementSet: null, applicableRequirements: [] };
  if (!jurisdiction) return { ...base, status: "UNKNOWN_JURISDICTION", standard, jurisdiction: null, mapping: null, requirementSet: null, applicableRequirements: [] };
  const candidates = store.mappings.filter((row) => row.status === "ACTIVE" && row.standardProfileId === standard.profileId && row.jurisdictionProfileId === jurisdiction.profileId && row.claimType === manifest.claimType && row.claimScope === manifest.claimScope);
  if (candidates.length > 1) return { ...base, status: "PROFILE_CONFLICT", standard, jurisdiction, mapping: null, requirementSet: null, applicableRequirements: [] };
  const mapping = candidates[0] ?? null;
  if (!mapping) return { ...base, status: "UNSUPPORTED_COMBINATION", standard, jurisdiction, mapping: null, requirementSet: null, applicableRequirements: [] };
  const requirementSet = store.requirementSets.find((row) => row.requirementSetId === mapping.requirementSetId && row.claimType === manifest.claimType && row.status === "ACTIVE") ?? null;
  if (!requirementSet) return { ...base, status: "UNKNOWN_MAPPING", standard, jurisdiction, mapping, requirementSet: null, applicableRequirements: [] };
  const diagnostics = [manifest.designEvidence?.upstreamDiagnostic, manifest.analysisEvidence?.upstreamDiagnostic];
  const conditional = requirementSet.conditional.filter((item) => (item.when === "CONSEQUENCE_PROFILE_REQUIRED" ? diagnostics.includes("CONSEQUENCE_PROFILE_REQUIRED") : manifest.crossDisciplineEvidence != null)).map((item) => item.requirementId);
  const overlay = store.overlays.find((row) => row.claimType === manifest.claimType && row.workspaceId === manifest.workspaceId && row.projectId === manifest.projectId);
  const applicableRequirements = [...requirementSet.mandatory, ...conditional, ...(overlay?.addedRequirements ?? [])];
  const successorRequiresReevaluation = store.standards.some((row) => row.standardFamily === standard.standardFamily && row.profileId !== standard.profileId && row.status === "ACTIVE");
  return {
    ...base,
    status: "RESOLVED",
    standard,
    jurisdiction,
    mapping,
    requirementSet,
    applicableRequirements,
    successorRequiresReevaluation,
    digitalThreadRefs: [manifest.claimId, standard.profileId, jurisdiction.profileId, mapping.mappingId, requirementSet.requirementSetId],
  };
}

export function bindGovernedProfile(store: D1lR3Store, actor: D1lR1Actor, manifest: D1lR1ManifestRecord): D1lR3Resolution {
  const before = fingerprintCanonical(manifest);
  const resolved = resolveCertificationProfile(store, actor, manifest);
  if (fingerprintCanonical(manifest) !== before) fail("R1_MANIFEST_MUTATED");
  return resolved;
}

export function evaluateUnderGovernedProfile(profiles: D1lR3Store, claims: D1lR1Store, results: D1lR2Store, actor: D1lR1Actor, manifest: D1lR1ManifestRecord, ledger: D1lR2LedgerRow[]) {
  if (actor.authority !== "EVIDENCE_PRODUCER") fail("UNAUTHORIZED");
  const resolved = bindGovernedProfile(profiles, actor, manifest);
  if (resolved.status !== "RESOLVED" || !resolved.standard || !resolved.jurisdiction || !resolved.mapping || !resolved.requirementSet) fail(resolved.status);
  return evaluateCertificationEligibility(claims, results, actor, {
    claimId: manifest.claimId,
    manifestId: manifest.manifestId,
    expectedManifestFingerprint: manifest.manifestFingerprint,
    ledger,
    governedProfile: {
      standardFingerprint: resolved.standard.fingerprint,
      jurisdictionFingerprint: resolved.jurisdiction.fingerprint,
      requirementSetId: resolved.requirementSet.requirementSetId,
      requirementSetVersion: resolved.requirementSet.version,
      requirementSetFingerprint: resolved.requirementSet.fingerprint,
      mappingFingerprint: resolved.mapping.fingerprint,
    },
  });
}
