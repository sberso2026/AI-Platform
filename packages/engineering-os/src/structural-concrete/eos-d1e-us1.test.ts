import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  ACI_CONCRETE_DESIGN_EQUALS_BUILDING_CODE_COMPLIANCE,
  ACI_CONCRETE_NOT_HARDCODED_TO_US_GEOGRAPHY,
  AI_ACI318_EDITION_AUTHORITY,
  AI_ACI_CONFORMANCE_AUTHORITY,
  AI_BUILDING_CODE_ADOPTION_AUTHORITY,
  AI_BUILDING_CODE_COMPLIANCE_AUTHORITY,
  AI_CODE_CAPACITY_AUTHORITY,
  AI_ENGINEERING_APPROVAL,
  AI_LOAD_STANDARD_AUTHORITY,
  AI_LOCAL_AMENDMENT_AUTHORITY,
  AI_STRENGTH_FACTOR_AUTHORITY,
  AI_STRESS_BLOCK_AUTHORITY,
  AI_US_CONCRETE_STANDARD_ASSISTANCE_ADVISORY_ONLY,
  AU_CONCRETE_PARAMETER_LEAKAGE_INTO_US,
  AU_CONCRETE_STANDARD_FAMILY_BOUND,
  COMMON_RC_SECTION_KERNEL_REUSED,
  COPYRIGHTED_ACI318_TEXT_COMMITTED,
  D1C_ACTION_MODEL_REUSED,
  D1C_DEMAND_ENGINE_REUSED_FOR_US_CONCRETE,
  D1D_ARCHITECTURE_CONTRACT_FROZEN,
  D1E1_EQUILIBRIUM_SOLVER_REUSED_FOR_US_CONCRETE,
  D1E1_GEOMETRY_REUSED_FOR_US_CONCRETE,
  D1E1_KINEMATICS_REUSED_FOR_US_CONCRETE,
  D1E1_SECTION_INTEGRATOR_REUSED_FOR_US_CONCRETE,
  D1E_US1_SCOPE_CONFIRMED,
  D1E_US_ROADMAP_HANDOFF_VALIDATED,
  D1E_US_VALIDATION_DEBT_UPDATED,
  DEFAULT_US_CONCRETE_BUILDING_CODE,
  DEFAULT_US_CONCRETE_CARBON_FACTOR,
  DEFAULT_US_CONCRETE_COST_RATE,
  DEFAULT_US_CONCRETE_COVER,
  DEFAULT_US_CONCRETE_EXPOSURE_CLASS,
  DEFAULT_US_CREEP_MODEL,
  DEFAULT_US_LAP_LENGTH,
  DEFAULT_US_REINFORCEMENT_CARBON_FACTOR,
  DEFAULT_US_REINFORCEMENT_COST_RATE,
  DEFAULT_US_SHRINKAGE_MODEL,
  DIRECT_CONTRACT_ACI_PROFILE_EQUALS_BUILDING_CODE_COMPLIANCE,
  EOS_D1E_US1_CLOSED,
  EU_CONCRETE_NDP_VALUE_GUESSED,
  EU_CONCRETE_PARAMETER_LEAKAGE_INTO_US,
  EU_CONCRETE_STANDARD_FAMILY_BOUND,
  EU_HIGH_WATER_MARK_INHERITED,
  GENERAL_CONCRETE_FEA_CLAIMED,
  GENERATIVE_MODEL_SELECTS_ACI_EDITION,
  GENERATIVE_MODEL_SELECTS_BUILDING_CODE,
  GENERATIVE_MODEL_SELECTS_LOAD_STANDARD_EDITION,
  GENERATIVE_MODEL_SELECTS_LOCAL_AMENDMENT,
  GENERATIVE_OPTIMIZER_CAN_SILENTLY_CHANGE_US_STANDARD_CONTEXT,
  GEOMETRIC_CLEARANCE_EQUALS_ACI_COVER_COMPLIANCE,
  GLOBAL_CONCRETE_SAFETY_FACTOR_MODEL_NEUTRAL,
  GLOBAL_STANDARD_FRAMEWORK_REUSED,
  IMPLEMENTED_US_CONCRETE_CODE_FLEXURE_METHODS,
  INTERNATIONAL_ACI_CONCRETE_PROFILE_SUPPORTED,
  ISSUED_US_CONCRETE_CALCULATION_CONTEXT_IMMUTABLE,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  NUMERICAL_US_ANCHORAGE_DESIGN_IMPLEMENTED,
  NUMERICAL_US_CODE_COVER_CHECK_IMPLEMENTED,
  NUMERICAL_US_CONCRETE_SHEAR_IMPLEMENTED,
  NUMERICAL_US_CONCRETE_TORSION_IMPLEMENTED,
  NUMERICAL_US_DEVELOPMENT_LENGTH_IMPLEMENTED,
  NUMERICAL_US_PUNCHING_SHEAR_IMPLEMENTED,
  PARALLEL_CAPABILITY_MANIFEST_CREATED,
  PARALLEL_US_CONCRETE_LOAD_COMBINATION_ENGINE_CREATED,
  PARALLEL_US_CONCRETE_NEUTRAL_AXIS_SOLVER_CREATED,
  PARALLEL_US_CONCRETE_SECTION_INTEGRATOR_CREATED,
  PARALLEL_US_CONCRETE_STANDARD_FRAMEWORK_CREATED,
  PARALLEL_US_RC_SECTION_KERNEL_CREATED,
  RECOMMENDED_D1E_NEXT_PHASE,
  SCHEMA_CHANGE_REQUIRED_FOR_D1E_US1,
  SILENT_ACI318_EDITION_INFERENCE,
  SILENT_US_BUILDING_CODE_EDITION_INFERENCE,
  SILENT_US_LOAD_STANDARD_EDITION_INFERENCE,
  STANDARD_TEXT_REQUIRED_BY_RUNTIME,
  STANDARD_UPDATE_OVERWRITES_HISTORICAL_US_CONCRETE_RULE,
  STEEL_LRFD_ASD_SEMANTICS_REUSED_FOR_US_CONCRETE,
  STEEL_STABILITY_RULE_REUSED_FOR_US_CONCRETE,
  US_BUILDING_CODE_AND_ACI_CONCRETE_STANDARD_SEPARATE,
  US_CONCRETE_CONNECTION_DESIGN_IMPLEMENTED,
  US_CONCRETE_FIRE_DESIGN_IMPLEMENTED,
  US_CONCRETE_GRADE_AUTOMATICALLY_GENERATES_PROPERTIES,
  US_CONCRETE_IMPLEMENTATION_MATURITY,
  US_CONCRETE_JURISDICTION_AND_STANDARD_SEPARATE,
  US_CONCRETE_LOCAL_AMENDMENT_VALUE_GUESSED,
  US_CONCRETE_PACK_CERTIFIED,
  US_CONCRETE_PARAMETER_LEAKAGE_INTO_AU,
  US_CONCRETE_PARAMETER_LEAKAGE_INTO_COMMON,
  US_CONCRETE_PARAMETER_LEAKAGE_INTO_EU,
  US_CONCRETE_PRODUCT_CLAIM_LEVEL,
  US_CONCRETE_PROFILE_AND_CONFORMANCE_SEPARATE,
  US_CONCRETE_SEISMIC_DESIGN_IMPLEMENTED,
  US_CONCRETE_STANDARD_AMENDMENT_STATE,
  US_CONCRETE_STANDARD_CONFORMANCE_STATE,
  US_CONCRETE_STANDARD_CONTEXT_UNIT_INDEPENDENT,
  US_CONCRETE_STANDARD_EDITION,
  US_CONCRETE_STANDARD_ERRATA_STATE,
  US_CONCRETE_STANDARD_FAMILY_BOUND,
  US_CONCRETE_STANDARD_INFERRED_FROM_USER_LOCATION,
  US_CONCRETE_STRAIN_LIMIT_GUESSED,
  US_CONCRETE_STRENGTH_FACTOR_SEMANTICS_CONFINED_TO_US_ADAPTER,
  US_CONCRETE_STRENGTH_REDUCTION_FACTOR_GUESSED,
  US_CONCRETE_STRESS_BLOCK_PARAMETER_GUESSED,
  US_PRESTRESSED_CONCRETE_DESIGN_IMPLEMENTED,
  type ConcreteMaterial,
  type ReinforcementLayout,
  type ReinforcementMaterial,
  type UsConcreteBuildingCodeAdoptionContext,
  type UsConcreteLocalAmendment,
  type UsConcreteProjectOverride,
  type UsConcreteProjectStandardContext,
  type UsConcreteStandardContextConfirmation,
} from "@rtb/types";
import { disciplineMaturity } from "../discipline-capability";
import { isEuOnlyArchitecture, isGlobalFirstArchitecture } from "../global-governance";
import { createConfiguredKnowledgeContext } from "../structural-domain/binding";
import { governedProvenance, listStructuralObjectKinds } from "../structural-domain/catalog";
import { D1D_CAPABILITY_MANIFEST, STEEL_ADAPTER_BOUNDARIES } from "../structural-steel";
import {
  AU_CONCRETE_FLEXURE_METHODS,
  AU_STRESS_BLOCK_RULE,
  CONCRETE_ADAPTER_BOUNDARIES,
  CONCRETE_CAPABILITY_MANIFEST,
  D1E_INTERNAL_ROADMAP,
  D1E_US1_D0_RISK_DISPOSITION,
  D1E_VALIDATION_DEBT_REGISTER,
  GOVERNED_EU_CONCRETE_NDP_CATALOG,
  GOVERNED_US_CONCRETE_LOCAL_AMENDMENT_CATALOG,
  IMPLEMENTED_AU_CONCRETE_CODE_FLEXURE_METHODS,
  STRUCTURAL_CAPABILITY_MANIFEST,
  US_CONCRETE_AXIAL_FLEXURE_PROFILE,
  US_CONCRETE_BOUNDARY_FLAGS,
  US_CONCRETE_DETAILING_PROFILE,
  US_CONCRETE_DURABILITY_PROFILE,
  US_CONCRETE_FLEXURE_PROFILE,
  US_CONCRETE_MATERIAL_CATALOG,
  US_CONCRETE_MATERIAL_RESPONSE_ADAPTER,
  US_CONCRETE_PUNCHING_PROFILE,
  US_CONCRETE_SECOND_ORDER_PROFILE,
  US_CONCRETE_SERVICEABILITY_PROFILE,
  US_CONCRETE_SHEAR_PROFILE,
  US_CONCRETE_STRAIN_LIMIT_DEPENDENCY,
  US_CONCRETE_STRENGTH_REDUCTION_FACTOR_DEPENDENCY,
  US_CONCRETE_STRESS_BLOCK_DEPENDENCY,
  US_CONCRETE_TIME_DEPENDENT_INTERFACE,
  US_CONCRETE_TORSION_PROFILE,
  US_REINFORCEMENT_CATALOG,
  assertAiUsConcreteAssistanceAdvisoryOnly,
  assertBuildingCodeAndAciStandardSeparate,
  assertMultiJurisdictionUsConcreteContexts,
  assertNoCopyrightedAci318Text,
  assertUsConcreteOptimizerRejectsUndetermined,
  assertUsConcreteReusesD1cDemand,
  assertUsConcreteReusesD1e1Kernel,
  bindAci318ConcreteFamily,
  bindUsConcreteStandardFamily,
  denyAiAci318EditionChoice,
  denyAiAciConformanceClaim,
  denyAiBuildingCodeAdoption,
  denyAiBuildingCodeComplianceClaim,
  denyAiLoadStandardEdition,
  denyAiUsConcreteLocalAmendment,
  denyUsConcreteProfileFromUserLocation,
  emptyUsConcreteResolverInput,
  geometricClearances,
  historicalUsConcreteContextRemainsReproducible,
  rectangleSection,
  resolveUsConcreteCatalogGrade,
  resolveUsConcreteContext,
  screenUsRcCandidate,
  snapshotIssuedUsConcreteContext,
  usConcreteMtoHandoff,
} from "./index";

const here = dirname(fileURLToPath(import.meta.url));

function provenance() {
  return governedProvenance({ jurisdiction: "united-states", standard: "ACI 318", version: "d1e-us1" });
}

function adoption(profile: string, overrides: Partial<UsConcreteBuildingCodeAdoptionContext> = {}): UsConcreteBuildingCodeAdoptionContext {
  return {
    adoptionId: `adopt-${profile}`,
    jurisdiction: `us-${profile.toLowerCase()}`,
    adoptingAuthority: `authority-${profile}`,
    buildingCodeFamily: `IBC-PROFILE-${profile}`,
    buildingCodeEdition: `${profile}-ADOPTION-PROFILE`,
    effectiveDate: null,
    localAmendmentSetRef: `amend-${profile}`,
    referencedStandards: ["ACI 318"],
    projectOverrideRefs: [],
    validationState: "FRAMEWORK_ONLY",
    sourceAuthorityRef: `source-${profile}`,
    referencedConcreteStandard: "ACI 318",
    referencedConcreteStandardEdition: `ACI-318-PROFILE-${profile}`,
    version: "d1e-us1",
    provenanceRef: `prov-adopt-${profile}`,
    ...overrides,
  };
}

function amendment(profile: string, overrides: Partial<UsConcreteLocalAmendment> = {}): UsConcreteLocalAmendment {
  return {
    amendmentSetId: `amend-set-${profile}`,
    jurisdiction: `us-${profile.toLowerCase()}`,
    authority: `authority-${profile}`,
    baseCodeRef: `IBC-PROFILE-${profile}`,
    editionCompatibility: `${profile}-ADOPTION-PROFILE`,
    effectiveDate: null,
    ruleOverrides: [],
    sourceAuthorityRef: `source-${profile}`,
    validationState: "FRAMEWORK_ONLY",
    amendmentId: `amend-${profile}`,
    affectedStandardProfile: `ACI-318-PROFILE-${profile}`,
    scope: "concrete-design-context",
    version: "d1e-us1",
    provenanceRef: `prov-amend-${profile}`,
    ...overrides,
  };
}

function override(profile: string): UsConcreteProjectOverride {
  return {
    overrideId: `ovr-${profile}`,
    sourceExplicit: true,
    authorityExplicit: true,
    scopeExplicit: true,
    conflictBehavior: "FAIL_CLOSED",
    humanConfirmation: true,
    baseStandardFamily: "ACI 318",
    edition: `ACI-318-PROFILE-${profile}`,
    buildingCodeContextRef: `adopt-${profile}`,
    localAmendmentContextRef: `amend-${profile}`,
    authorityRef: `authority-${profile}`,
    scope: "project-exception",
    reason: "explicit project exception",
    reviewContextRef: `review-${profile}`,
    version: "d1e-us1",
    provenanceRef: `prov-ovr-${profile}`,
  };
}

function project(profile: string, overrides: Partial<UsConcreteProjectStandardContext> = {}): UsConcreteProjectStandardContext {
  return {
    projectRef: `proj-${profile}`,
    tenantId: "tenant-1",
    workspaceId: "ws-1",
    jurisdictionProfileRef: "united-states",
    buildingCodeContextRef: `adopt-${profile}`,
    buildingCodeAdoption: adoption(profile),
    concreteStandardFamily: "ACI 318",
    concreteStandardEdition: `ACI-318-PROFILE-${profile}`,
    amendmentState: "UNKNOWN_PENDING_CONFIRMATION",
    errataState: "UNKNOWN_PENDING_CONFIRMATION",
    loadStandardContextRef: "asce-7-unconfirmed",
    loadStandard: {
      standardId: "ASCE_7",
      standardCode: "ASCE 7",
      edition: "UNKNOWN_PENDING_CONFIRMATION",
      combinationBasis: "UNKNOWN_PENDING_CONFIRMATION",
      implemented: false,
    },
    seismicStandardContextRef: "seismic-unconfirmed",
    seismicStandard: {
      applicable: true,
      standardId: "US_CONCRETE_SEISMIC_DEPENDENCY",
      standardCode: "SEISMIC_STANDARD_UNSPECIFIED",
      edition: "UNKNOWN_PENDING_CONFIRMATION",
      implemented: false,
    },
    concreteMaterialStandardRefs: ["ASTM"],
    reinforcementMaterialStandardRefs: ["ASTM"],
    localAmendmentSetRef: `amend-${profile}`,
    localAmendmentSet: [amendment(profile)],
    directContractProfileRef: null,
    durabilityContextRef: null,
    serviceabilityContextRef: null,
    projectOverrideRefs: [override(profile)],
    authorityRefs: ["VALIDATED_ENGINEERING_REFERENCE"],
    technicalBasisRefs: ["d1e-us1-standard-binding"],
    provenance: provenance(),
    validationState: "STANDARD_BINDING_FRAMEWORK",
    conformanceState: "INTENDED_PROFILE",
    workspaceGlobalCodeProfileId: null,
    statutoryUsComplianceClaimed: false,
    internationalContractualUse: false,
    ...overrides,
  };
}

function confirmation(overrides: Partial<UsConcreteStandardContextConfirmation> = {}): UsConcreteStandardContextConfirmation {
  return {
    aciEditionConfirmed: true,
    amendmentErrataConfirmed: true,
    buildingCodeAdoptionConfirmed: true,
    referencedStandardProfileConfirmed: true,
    localAmendmentsConfirmed: true,
    loadStandardConfirmed: true,
    materialStandardsConfirmed: true,
    projectOverridesConfirmed: true,
    confirmedAt: "2026-10-07T00:00:00.000Z",
    reviewerAuthorityRef: "engineer-1",
    aiConfirmed: false,
    engineeringApprovalImplied: false,
    ...overrides,
  };
}

function governed(name: string, value: number, unit: string) {
  return { name, value, unit, provenanceRef: "cert-1", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" as const };
}

function concrete(): ConcreteMaterial {
  return {
    materialRef: "c1",
    designation: "fc-governed",
    compressiveStrength: governed("fc", 28, "MPa"),
    tensileStrength: null,
    elasticModulus: governed("E", 25000, "MPa"),
    density: null,
    poissonRatio: null,
    age: null,
    strengthReferenceAge: null,
    materialClass: null,
    materialStandardRef: "ASTM",
    sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE",
    testCertificateRef: null,
    environmentalMetadata: null,
    version: "1",
    provenance: provenance(),
  };
}

function reo(): ReinforcementMaterial {
  return {
    materialRef: "s1",
    designation: "fy-governed",
    yieldStrength: governed("fy", 420, "MPa"),
    ultimateStrength: null,
    elasticModulus: governed("Es", 200000, "MPa"),
    ductilityClass: null,
    productStandardRef: "ASTM",
    sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE",
    version: "1",
    provenance: provenance(),
  };
}

function twoBarLayout(): ReinforcementLayout {
  return {
    layoutId: "L1",
    bars: [
      { barId: "b1", designation: "16", diameterMm: governed("d", 16, "mm"), areaMm2: governed("a", 201, "mm2"), count: 1, xMm: 50, yMm: 50, layerId: null, face: "bottom", direction: null, spacingMm: null, groupId: null, materialRef: "s1", anchorageMetadata: null, lapMetadata: null, provenanceRef: "p" },
      { barId: "b2", designation: "16", diameterMm: governed("d", 16, "mm"), areaMm2: governed("a", 201, "mm2"), count: 1, xMm: 250, yMm: 50, layerId: null, face: "bottom", direction: null, spacingMm: null, groupId: null, materialRef: "s1", anchorageMetadata: null, lapMetadata: null, provenanceRef: "p" },
    ],
    groups: [],
    layers: [],
    transverse: [],
    provenanceRef: "p",
  };
}

function readTree(dir: string): string {
  return readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return [readTree(path)];
      if (!entry.name.endsWith(".ts") && !entry.name.endsWith(".md")) return [];
      return [readFileSync(path, "utf8")];
    })
    .join("\n");
}

describe("EOS-D1E-US-1 ACI concrete standard binding", () => {
  it("confirms D1E-US-1 scope and binds ACI 318 family without inferring edition", () => {
    expect(D1E_US1_SCOPE_CONFIRMED).toBe(true);
    expect(GLOBAL_STANDARD_FRAMEWORK_REUSED).toBe(true);
    expect(PARALLEL_US_CONCRETE_STANDARD_FRAMEWORK_CREATED).toBe(false);
    expect(COMMON_RC_SECTION_KERNEL_REUSED).toBe(true);
    expect(PARALLEL_US_RC_SECTION_KERNEL_CREATED).toBe(false);
    expect(US_CONCRETE_STANDARD_FAMILY_BOUND).toBe(true);
    expect(bindAci318ConcreteFamily().familyId).toBe("ACI_318");
    expect(US_CONCRETE_STANDARD_EDITION).toBe("UNKNOWN_PENDING_CONFIRMATION");
    expect(US_CONCRETE_STANDARD_AMENDMENT_STATE).toBe("UNKNOWN_PENDING_CONFIRMATION");
    expect(US_CONCRETE_STANDARD_ERRATA_STATE).toBe("UNKNOWN_PENDING_CONFIRMATION");
    expect(SILENT_ACI318_EDITION_INFERENCE).toBe(false);
    expect(US_CONCRETE_PROFILE_AND_CONFORMANCE_SEPARATE).toBe(true);
    expect(US_CONCRETE_STANDARD_CONFORMANCE_STATE).toBe("INTENDED_PROFILE");
    expect(US_CONCRETE_PACK_CERTIFIED).toBe(false);
    expect(US_CONCRETE_IMPLEMENTATION_MATURITY).toBe("FRAMEWORK_PLUS_COMMON_MECHANICS");
    expect(US_CONCRETE_PRODUCT_CLAIM_LEVEL).toBe("US_CONCRETE_MECHANICS_REFERENCE_CAPABILITY");
    expect(IMPLEMENTED_US_CONCRETE_CODE_FLEXURE_METHODS).toBe("NONE");
    expect(US_CONCRETE_JURISDICTION_AND_STANDARD_SEPARATE).toBe(true);
    expect(US_CONCRETE_STANDARD_INFERRED_FROM_USER_LOCATION).toBe(false);
    expect(US_BUILDING_CODE_AND_ACI_CONCRETE_STANDARD_SEPARATE).toBe(true);
    expect(ACI_CONCRETE_DESIGN_EQUALS_BUILDING_CODE_COMPLIANCE).toBe(false);
    expect(DEFAULT_US_CONCRETE_BUILDING_CODE).toBe(false);
    expect(SILENT_US_BUILDING_CODE_EDITION_INFERENCE).toBe(false);
    expect(DIRECT_CONTRACT_ACI_PROFILE_EQUALS_BUILDING_CODE_COMPLIANCE).toBe(false);
    expect(ACI_CONCRETE_NOT_HARDCODED_TO_US_GEOGRAPHY).toBe(true);
    expect(INTERNATIONAL_ACI_CONCRETE_PROFILE_SUPPORTED).toBe(true);
    const us = createConfiguredKnowledgeContext({
      contextId: "ctx-us-aci318",
      jurisdictionProfileRef: "united-states",
      standardFamily: "ACI",
      standardCode: "ACI 318",
      edition: "UNKNOWN_PENDING_CONFIRMATION",
      materialScope: "concrete",
    });
    bindUsConcreteStandardFamily(us);
    expect(() => assertBuildingCodeAndAciStandardSeparate("IBC-PROFILE-CA", "ACI 318")).not.toThrow();
    expect(() => assertBuildingCodeAndAciStandardSeparate("ACI 318", "ACI 318")).toThrow(/not a substitute/);
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "D1E-US")?.status).toBe("CLOSED");
    expect(D1E_INTERNAL_ROADMAP.some((row) => row.id === RECOMMENDED_D1E_NEXT_PHASE)).toBe(true);
    expect(RECOMMENDED_D1E_NEXT_PHASE).toBe("EOS-D1E-EU-C5-EVIDENCE");
    expect(D1E_US_ROADMAP_HANDOFF_VALIDATED).toBe(true);
    expect(EOS_D1E_US1_CLOSED).toBe(true);
    expect(SCHEMA_CHANGE_REQUIRED_FOR_D1E_US1).toBe(false);
    expect(disciplineMaturity("structural")).toBe("REFERENCE_PARTIALLY_IMPLEMENTED");
  });

  it("isolates multi-jurisdiction adoption, location inference, international direct-contract, and historical context", () => {
    const ca = resolveUsConcreteContext(emptyUsConcreteResolverInput({ projectContext: project("CA") }));
    const ny = resolveUsConcreteContext(emptyUsConcreteResolverInput({ projectContext: project("NY") }));
    expect(ca.ok).toBe(true);
    expect(ny.ok).toBe(true);
    if (!ca.ok || !ny.ok) throw new Error("expected resolved contexts");
    expect(ca.context.buildingCodeAdoption?.adoptionId).toBe("adopt-CA");
    expect(ny.context.buildingCodeAdoption?.adoptionId).toBe("adopt-NY");
    expect(ca.context.concreteStandardEdition).toBe("ACI-318-PROFILE-CA");
    expect(ny.context.concreteStandardEdition).toBe("ACI-318-PROFILE-NY");
    expect(ca.context.localAmendmentSet[0]?.amendmentId).not.toBe(ny.context.localAmendmentSet[0]?.amendmentId);
    assertMultiJurisdictionUsConcreteContexts([ca.context, ny.context]);
    expect(resolveUsConcreteContext(emptyUsConcreteResolverInput({ source: "locale", projectContext: project("CA") })).failReason).toBe("USER_LOCATION_INFERENCE_DENIED");
    expect(resolveUsConcreteContext(emptyUsConcreteResolverInput({ source: "ui_location", projectContext: project("CA") })).failReason).toBe("USER_LOCATION_INFERENCE_DENIED");
    expect(() => denyUsConcreteProfileFromUserLocation("physical_location")).toThrow(/USER_LOCATION_INFERENCE_DENIED/);
    const intl = resolveUsConcreteContext(emptyUsConcreteResolverInput({
      projectContext: project("SG", {
        jurisdictionProfileRef: "other",
        buildingCodeContextRef: null,
        buildingCodeAdoption: null,
        localAmendmentSetRef: null,
        localAmendmentSet: [],
        projectOverrideRefs: [],
        directContractProfileRef: "aci-direct-sg",
        internationalContractualUse: true,
        concreteStandardEdition: "ACI-318-PROFILE-CONTRACT",
      }),
    }));
    expect(intl.ok).toBe(true);
    if (!intl.ok) throw new Error("expected international context");
    expect(intl.context.directContractProfile).toBe(true);
    expect(intl.context.internationalContractualUse).toBe(true);
    expect(intl.context.statutoryUsComplianceClaimed).toBe(false);
    expect(intl.context.jurisdictionProfileRef).not.toBe("united-states");
    expect(intl.context.buildingCodeAdoption).toBeNull();
    const issued = snapshotIssuedUsConcreteContext(ca.context);
    expect(ISSUED_US_CONCRETE_CALCULATION_CONTEXT_IMMUTABLE).toBe(true);
    expect(STANDARD_UPDATE_OVERWRITES_HISTORICAL_US_CONCRETE_RULE).toBe(false);
    const later = historicalUsConcreteContextRemainsReproducible(issued, project("NY", { concreteStandardEdition: "ACI-318-PROFILE-NY" }));
    expect(later.concreteStandardEdition).toBe("ACI-318-PROFILE-CA");
    expect(later.buildingCodeAdoption?.adoptionId).toBe("adopt-CA");
    expect(later.issued).toBe(true);
    const replay = resolveUsConcreteContext(emptyUsConcreteResolverInput({ issuedContext: issued }));
    expect(replay.ok).toBe(true);
    if (!replay.ok) throw new Error("expected issued replay");
    expect(replay.context.concreteStandardEdition).toBe("ACI-318-PROFILE-CA");
    expect(US_CONCRETE_STANDARD_CONTEXT_UNIT_INDEPENDENT).toBe(true);
    expect(ca.context.unitSystemIndependent).toBe(true);
  });

  it("fails closed on adoption conflicts, guessed amendments, missing context, and AI authority", () => {
    const missingAdoption = resolveUsConcreteContext(emptyUsConcreteResolverInput({
      projectContext: project("CA", { buildingCodeAdoption: null, buildingCodeContextRef: null, localAmendmentSet: [], projectOverrideRefs: [] }),
      adoptionRequired: true,
    }));
    expect(missingAdoption.ok).toBe(false);
    if (missingAdoption.ok) throw new Error("expected missing adoption");
    expect(missingAdoption.failReason).toBe("BUILDING_CODE_CONTEXT_REQUIRED");
    expect(missingAdoption.checkState).toBe("CHECK_UNDETERMINED");
    const editionMismatch = resolveUsConcreteContext(emptyUsConcreteResolverInput({
      projectContext: project("CA", {
        concreteStandardEdition: "ACI-318-PROFILE-NY",
        buildingCodeAdoption: adoption("CA"),
      }),
    }));
    expect(editionMismatch.failReason).toBe("ACI_REFERENCED_EDITION_MISMATCH");
    const wrongAmendment = resolveUsConcreteContext(emptyUsConcreteResolverInput({
      projectContext: project("CA", { localAmendmentSet: [amendment("NY")] }),
    }));
    expect(wrongAmendment.failReason).toBe("LOCAL_AMENDMENT_CONFLICT");
    const guessed = resolveUsConcreteContext(emptyUsConcreteResolverInput({
      projectContext: project("CA", { localAmendmentSet: [amendment("CA", { ruleOverrides: [{}] })] }),
    }));
    expect(guessed.failReason).toBe("LOCAL_AMENDMENT_CONFLICT");
    expect(US_CONCRETE_LOCAL_AMENDMENT_VALUE_GUESSED).toBe(false);
    expect(GOVERNED_US_CONCRETE_LOCAL_AMENDMENT_CATALOG).toEqual([]);
    const missingLocal = resolveUsConcreteContext(emptyUsConcreteResolverInput({
      projectContext: project("CA", { localAmendmentSet: [] }),
      localAmendmentRequired: true,
    }));
    expect(missingLocal.failReason).toBe("LOCAL_AMENDMENT_REQUIRED");
    const missingLoad = resolveUsConcreteContext(emptyUsConcreteResolverInput({
      projectContext: project("CA", { loadStandard: null, loadStandardContextRef: null }),
      loadStandardRequired: true,
    }));
    expect(missingLoad.failReason).toBe("LOAD_STANDARD_CONTEXT_REQUIRED");
    expect(SILENT_US_LOAD_STANDARD_EDITION_INFERENCE).toBe(false);
    expect(resolveUsConcreteContext(emptyUsConcreteResolverInput({ unresolvedSourceConflict: true, projectContext: project("CA") })).failReason).toBe("STANDARD_CONTEXT_CONFLICT");
    expect(resolveUsConcreteContext(emptyUsConcreteResolverInput({ aiSelectedAciEdition: true })).failReason).toBe("AI_AUTHORITY_DENIED");
    expect(resolveUsConcreteContext(emptyUsConcreteResolverInput({ aiSelectedBuildingCode: true })).failReason).toBe("AI_AUTHORITY_DENIED");
    expect(resolveUsConcreteContext(emptyUsConcreteResolverInput({ aiInventedAmendment: true })).failReason).toBe("AI_AUTHORITY_DENIED");
    expect(resolveUsConcreteContext(emptyUsConcreteResolverInput({ aiSelectedLoadStandardEdition: true })).failReason).toBe("AI_AUTHORITY_DENIED");
    expect(resolveUsConcreteContext(emptyUsConcreteResolverInput({ aiClaimedConformance: true })).failReason).toBe("AI_AUTHORITY_DENIED");
    expect(resolveUsConcreteContext(emptyUsConcreteResolverInput({ aiClaimedBuildingCodeCompliance: true })).failReason).toBe("AI_AUTHORITY_DENIED");
    expect(resolveUsConcreteContext(emptyUsConcreteResolverInput({ ruleAuthorityType: "LLM_MEMORY_ONLY" })).failReason).toBe("RULE_AUTHORITY_DENIED");
    expect(resolveUsConcreteContext(emptyUsConcreteResolverInput({ generativeAttemptedStandardContextChange: true })).failReason).toBe("AI_AUTHORITY_DENIED");
    const confirmed = resolveUsConcreteContext(emptyUsConcreteResolverInput({
      projectContext: project("CA"),
      humanConfirmed: true,
    }));
    expect(confirmed.failReason).toBe("HUMAN_CONFIRMATION_REQUIRED");
    const seed = resolveUsConcreteContext(emptyUsConcreteResolverInput({ projectContext: project("CA") }));
    expect(seed.ok).toBe(true);
    if (!seed.ok) throw new Error("expected seed");
    const withConfirm = resolveUsConcreteContext(emptyUsConcreteResolverInput({
      explicitCalculationContext: { ...seed.context, humanConfirmation: confirmation() },
      humanConfirmed: true,
    }));
    expect(withConfirm.ok).toBe(true);
    expect(() => denyAiAci318EditionChoice()).toThrow(/ACI 318 edition/);
    expect(() => denyAiBuildingCodeAdoption()).toThrow(/building-code/);
    expect(() => denyAiUsConcreteLocalAmendment()).toThrow(/local amendment/);
    expect(() => denyAiLoadStandardEdition()).toThrow(/load-standard/);
    expect(() => denyAiAciConformanceClaim()).toThrow(/ACI compliance/);
    expect(() => denyAiBuildingCodeComplianceClaim()).toThrow(/building-code compliance/);
    expect(LLM_MEMORY_ONLY_RULE_ALLOWED).toBe(false);
  });

  it("reuses the D1E-1 kernel and keeps ACI code parameters unpopulated", () => {
    assertUsConcreteReusesD1e1Kernel();
    expect(D1E1_GEOMETRY_REUSED_FOR_US_CONCRETE).toBe(true);
    expect(D1E1_KINEMATICS_REUSED_FOR_US_CONCRETE).toBe(true);
    expect(D1E1_SECTION_INTEGRATOR_REUSED_FOR_US_CONCRETE).toBe(true);
    expect(D1E1_EQUILIBRIUM_SOLVER_REUSED_FOR_US_CONCRETE).toBe(true);
    expect(PARALLEL_US_CONCRETE_SECTION_INTEGRATOR_CREATED).toBe(false);
    expect(PARALLEL_US_CONCRETE_NEUTRAL_AXIS_SOLVER_CREATED).toBe(false);
    expect(GEOMETRIC_CLEARANCE_EQUALS_ACI_COVER_COMPLIANCE).toBe(false);
    expect(geometricClearances(twoBarLayout(), rectangleSection("r", 300, 500, "p"))[0]?.codeCoverCompliance).toBe(false);
    expect(US_CONCRETE_STRESS_BLOCK_DEPENDENCY.parameters.beta1.value).toBeNull();
    expect(US_CONCRETE_STRAIN_LIMIT_DEPENDENCY.ultimateConcreteStrain.value).toBeNull();
    expect(US_CONCRETE_STRENGTH_REDUCTION_FACTOR_DEPENDENCY.value.value).toBeNull();
    expect(US_CONCRETE_STRENGTH_REDUCTION_FACTOR_DEPENDENCY.dependsOn).toEqual(expect.arrayContaining(["limitState", "strainState", "memberType", "standardEdition"]));
    expect(US_CONCRETE_STRESS_BLOCK_PARAMETER_GUESSED).toBe(false);
    expect(US_CONCRETE_STRAIN_LIMIT_GUESSED).toBe(false);
    expect(US_CONCRETE_STRENGTH_REDUCTION_FACTOR_GUESSED).toBe(false);
    expect(STEEL_LRFD_ASD_SEMANTICS_REUSED_FOR_US_CONCRETE).toBe(false);
    expect(US_CONCRETE_STRENGTH_FACTOR_SEMANTICS_CONFINED_TO_US_ADAPTER).toBe(true);
    expect(GLOBAL_CONCRETE_SAFETY_FACTOR_MODEL_NEUTRAL).toBe(true);
    expect(US_CONCRETE_MATERIAL_RESPONSE_ADAPTER.numericalImplemented).toBe(false);
    expect(US_CONCRETE_FLEXURE_PROFILE.numericalImplemented).toBe(false);
    expect(US_CONCRETE_AXIAL_FLEXURE_PROFILE.numericalImplemented).toBe(false);
    expect(US_CONCRETE_SHEAR_PROFILE.numericalImplemented).toBe(false);
    expect(US_CONCRETE_PUNCHING_PROFILE.numericalImplemented).toBe(false);
    expect(US_CONCRETE_TORSION_PROFILE.numericalImplemented).toBe(false);
    expect(US_CONCRETE_SERVICEABILITY_PROFILE.numericalImplemented).toBe(false);
    expect(NUMERICAL_US_CONCRETE_SHEAR_IMPLEMENTED).toBe(false);
    expect(NUMERICAL_US_PUNCHING_SHEAR_IMPLEMENTED).toBe(false);
    expect(NUMERICAL_US_CONCRETE_TORSION_IMPLEMENTED).toBe(false);
    expect(US_CONCRETE_TIME_DEPENDENT_INTERFACE.defaultCreepModel).toBe(false);
    expect(DEFAULT_US_CREEP_MODEL).toBe(false);
    expect(DEFAULT_US_SHRINKAGE_MODEL).toBe(false);
    expect(US_CONCRETE_DURABILITY_PROFILE.defaultExposureClass).toBe(false);
    expect(DEFAULT_US_CONCRETE_EXPOSURE_CLASS).toBe(false);
    expect(NUMERICAL_US_CODE_COVER_CHECK_IMPLEMENTED).toBe(false);
    expect(DEFAULT_US_CONCRETE_COVER).toBe(false);
    expect(US_CONCRETE_DETAILING_PROFILE.numericalDevelopment).toBe(false);
    expect(NUMERICAL_US_DEVELOPMENT_LENGTH_IMPLEMENTED).toBe(false);
    expect(NUMERICAL_US_ANCHORAGE_DESIGN_IMPLEMENTED).toBe(false);
    expect(DEFAULT_US_LAP_LENGTH).toBe(false);
    expect(US_CONCRETE_SECOND_ORDER_PROFILE.reusesSteelStability).toBe(false);
    expect(STEEL_STABILITY_RULE_REUSED_FOR_US_CONCRETE).toBe(false);
    expect(US_PRESTRESSED_CONCRETE_DESIGN_IMPLEMENTED).toBe(false);
    expect(US_CONCRETE_CONNECTION_DESIGN_IMPLEMENTED).toBe(false);
    expect(US_CONCRETE_FIRE_DESIGN_IMPLEMENTED).toBe(false);
    expect(US_CONCRETE_SEISMIC_DESIGN_IMPLEMENTED).toBe(false);
    expect(US_CONCRETE_BOUNDARY_FLAGS.seismicImplemented).toBe(false);
    expect(GENERAL_CONCRETE_FEA_CLAIMED).toBe(false);
    expect(US_CONCRETE_MATERIAL_CATALOG.populated).toBe(false);
    expect(US_REINFORCEMENT_CATALOG.defaultProductTable).toBeNull();
    expect(US_CONCRETE_GRADE_AUTOMATICALLY_GENERATES_PROPERTIES).toBe(false);
    expect(() => resolveUsConcreteCatalogGrade("4000psi")).toThrow(/catalog unpopulated/i);
    expect(D1C_DEMAND_ENGINE_REUSED_FOR_US_CONCRETE).toBe(true);
    expect(D1C_ACTION_MODEL_REUSED).toBe(true);
    expect(PARALLEL_US_CONCRETE_LOAD_COMBINATION_ENGINE_CREATED).toBe(false);
    expect(assertUsConcreteReusesD1cDemand({ resultId: "d1", capacityPresent: false, memberId: "m1" })).toBe("d1");
    const ctx = resolveUsConcreteContext(emptyUsConcreteResolverInput({ projectContext: project("CA") }));
    expect(ctx.ok).toBe(true);
    if (!ctx.ok) throw new Error("expected context");
    expect(screenUsRcCandidate({
      geometry: rectangleSection("r", 300, 500, "p"),
      layout: twoBarLayout(),
      concrete: concrete(),
      reinforcement: reo(),
      standardContext: ctx.context,
    }).accepted).toBe(true);
    expect(() => screenUsRcCandidate({
      geometry: rectangleSection("r", 300, 500, "p"),
      layout: twoBarLayout(),
      concrete: concrete(),
      reinforcement: reo(),
      standardContext: ctx.context,
      generativeSelectedAciEdition: true,
    })).toThrow(/ACI 318 edition/);
    expect(() => assertUsConcreteOptimizerRejectsUndetermined("CHECK_UNDETERMINED")).toThrow(/undetermined/i);
    expect(usConcreteMtoHandoff({ geometry: rectangleSection("r", 300, 500, "p"), layout: twoBarLayout() }).emissionFactorEmbedded).toBe(false);
    expect(DEFAULT_US_CONCRETE_COST_RATE).toBe(false);
    expect(DEFAULT_US_REINFORCEMENT_COST_RATE).toBe(false);
    expect(DEFAULT_US_CONCRETE_CARBON_FACTOR).toBe(false);
    expect(DEFAULT_US_REINFORCEMENT_CARBON_FACTOR).toBe(false);
    expect(GENERATIVE_OPTIMIZER_CAN_SILENTLY_CHANGE_US_STANDARD_CONTEXT).toBe(false);
    expect(GENERATIVE_MODEL_SELECTS_ACI_EDITION).toBe(false);
    expect(GENERATIVE_MODEL_SELECTS_BUILDING_CODE).toBe(false);
    expect(GENERATIVE_MODEL_SELECTS_LOCAL_AMENDMENT).toBe(false);
    expect(GENERATIVE_MODEL_SELECTS_LOAD_STANDARD_EDITION).toBe(false);
  });

  it("preserves three-jurisdiction architecture, regressions, AI limits, debt, and copyright", () => {
    expect(AU_CONCRETE_STANDARD_FAMILY_BOUND).toBe(true);
    expect(EU_CONCRETE_STANDARD_FAMILY_BOUND).toBe(true);
    expect(IMPLEMENTED_AU_CONCRETE_CODE_FLEXURE_METHODS).toBe("NONE");
    expect(AU_STRESS_BLOCK_RULE.parameters).toBeNull();
    expect(AU_CONCRETE_FLEXURE_METHODS.length).toBeGreaterThan(0);
    expect(EU_CONCRETE_NDP_VALUE_GUESSED).toBe(false);
    expect(GOVERNED_EU_CONCRETE_NDP_CATALOG).toEqual([]);
    expect(AU_CONCRETE_PARAMETER_LEAKAGE_INTO_US).toBe(false);
    expect(EU_CONCRETE_PARAMETER_LEAKAGE_INTO_US).toBe(false);
    expect(US_CONCRETE_PARAMETER_LEAKAGE_INTO_AU).toBe(false);
    expect(US_CONCRETE_PARAMETER_LEAKAGE_INTO_EU).toBe(false);
    expect(US_CONCRETE_PARAMETER_LEAKAGE_INTO_COMMON).toBe(false);
    expect(CONCRETE_ADAPTER_BOUNDARIES.US_CONCRETE.implemented).toBe(false);
    expect(CONCRETE_ADAPTER_BOUNDARIES.US_CONCRETE.implementationMaturity).toBe("FRAMEWORK_PLUS_COMMON_MECHANICS");
    expect(CONCRETE_ADAPTER_BOUNDARIES.AU_CONCRETE.implemented).toBe(false);
    expect(CONCRETE_ADAPTER_BOUNDARIES.EU_CONCRETE.implemented).toBe(false);
    expect(STEEL_ADAPTER_BOUNDARIES.AU_STEEL.implemented).toBe(true);
    expect(STEEL_ADAPTER_BOUNDARIES.EU_STEEL.ready).toBe(true);
    expect(STEEL_ADAPTER_BOUNDARIES.US_STEEL.ready).toBe(true);
    expect(D1D_ARCHITECTURE_CONTRACT_FROZEN).toBe(true);
    expect(listStructuralObjectKinds().length).toBeGreaterThan(0);
    expect(AI_US_CONCRETE_STANDARD_ASSISTANCE_ADVISORY_ONLY).toBe(true);
    expect(AI_ACI318_EDITION_AUTHORITY).toBe(false);
    expect(AI_BUILDING_CODE_ADOPTION_AUTHORITY).toBe(false);
    expect(AI_LOCAL_AMENDMENT_AUTHORITY).toBe(false);
    expect(AI_LOAD_STANDARD_AUTHORITY).toBe(false);
    expect(AI_STRENGTH_FACTOR_AUTHORITY).toBe(false);
    expect(AI_STRESS_BLOCK_AUTHORITY).toBe(false);
    expect(AI_CODE_CAPACITY_AUTHORITY).toBe(false);
    expect(AI_ACI_CONFORMANCE_AUTHORITY).toBe(false);
    expect(AI_BUILDING_CODE_COMPLIANCE_AUTHORITY).toBe(false);
    expect(AI_ENGINEERING_APPROVAL).toBe(false);
    assertAiUsConcreteAssistanceAdvisoryOnly();
    expect(D1E_US1_D0_RISK_DISPOSITION.CLOSED).toBe("NONE");
    expect(D1E_US1_D0_RISK_DISPOSITION.INTRODUCED).toBe("NONE");
    expect(D1E_US_VALIDATION_DEBT_UPDATED).toBe(true);
    expect(D1E_VALIDATION_DEBT_REGISTER.some((row) => row.debtId === "D1E-US-VD-EDITION")).toBe(true);
    expect(D1E_VALIDATION_DEBT_REGISTER.some((row) => row.debtId === "D1E-US-VD-PHI")).toBe(true);
    expect(D1E_VALIDATION_DEBT_REGISTER.some((row) => row.debtId === "D1E-US-VD-FLEXURE")).toBe(true);
    expect(CONCRETE_CAPABILITY_MANIFEST.some((row) => row.capabilityId === "D1E.US.STANDARD_CONTEXT")).toBe(true);
    expect(CONCRETE_CAPABILITY_MANIFEST.some((row) => row.capabilityId === "D1E.AU.ADAPTER")).toBe(true);
    expect(CONCRETE_CAPABILITY_MANIFEST.some((row) => row.capabilityId === "D1E.EU.ADAPTER")).toBe(true);
    expect(CONCRETE_CAPABILITY_MANIFEST.some((row) => row.capabilityId === "D1E.GLOBAL.RC_SECTION_MECHANICS")).toBe(true);
    expect(PARALLEL_CAPABILITY_MANIFEST_CREATED).toBe(false);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.length).toBeGreaterThan(D1D_CAPABILITY_MANIFEST.length);
    expect(isGlobalFirstArchitecture()).toBe(true);
    expect(isEuOnlyArchitecture()).toBe(false);
    expect(EU_HIGH_WATER_MARK_INHERITED).toBe(true);
    expect(STANDARD_TEXT_REQUIRED_BY_RUNTIME).toBe(false);
    expect(COPYRIGHTED_ACI318_TEXT_COMMITTED).toBe(false);
    assertNoCopyrightedAci318Text();
    const corpus = `${readTree(join(here, "us-standard"))}\n${readFileSync(join(here, "../../../../docs/architecture/engineering-os/EOS_D1E_US1_CONCRETE_STANDARD_BINDING.md"), "utf8")}`;
    for (const pattern of [/is ACI 318 compliant/i, /phi\s*=\s*0\.9/i, /beta1\s*=\s*0\.85/, /ecu\s*=\s*0\.003/, /CONCRETE_PACK_CERTIFIED\s*=\s*true/i]) {
      expect(corpus).not.toMatch(pattern);
    }
  });
});
