import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AI_AISC_EDITION_AUTHORITY,
  AI_ENGINEERING_APPROVAL,
  AI_LOCAL_AMENDMENT_AUTHORITY,
  AI_LRFD_ASD_AUTHORITY,
  AI_STANDARD_CONFORMANCE_AUTHORITY,
  AISC_STANDARD_EDITION,
  AISC_STEEL_FAMILY_REGISTERED,
  AISC_UNKNOWN_EDITION_TOKEN,
  AUST300_US_DEFAULT,
  BUILDING_CODE_AND_STEEL_STANDARD_SEPARATE,
  CROSS_EDITION_RULE_MIXING_ALLOWED,
  DEFAULT_LRFD_OR_ASD,
  DESIGN_METHOD_AND_UNIT_SYSTEM_SEPARATE,
  DESIGN_METHOD_EXPLICIT,
  DIRECT_CONTRACT_STANDARD_PROFILE_SUPPORTED,
  EMPLOYEE_BEHAVIOR_PROFILING,
  EOS_D1D_US1_PHASE,
  EU_ONLY_STEEL_CORE,
  EU_SECTION_CATALOG_US_DEFAULT,
  GLOBAL_STANDARD_FRAMEWORK_REUSED,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  LOCAL_AMENDMENT_VALUE_GUESSED,
  PARALLEL_US_GOVERNANCE_CREATED,
  PARALLEL_US_STANDARD_FRAMEWORK_CREATED,
  READY_FOR_US2_TENSION_ARCHITECTURE,
  SCHEMA_CHANGE_REQUIRED_FOR_US1,
  SILENT_AISC_EDITION_INFERENCE,
  SILENT_ASCE_EDITION_INFERENCE,
  SILENT_LRFD_ASD_CONVERSION,
  SILENT_SEISMIC_STANDARD_EDITION_INFERENCE,
  STANDARD_UPDATE_OVERWRITES_HISTORICAL_RULE,
  STRUCTURAL_STANDARD_TEXT_EMBEDDED,
  THREE_JURISDICTION_ARCHITECTURE_VALIDATED,
  US1_LOAD_COMBINATION_ENGINE_CREATED,
  US_CODE_PROFILE_INFERRED_FROM_USER_LOCATION,
  US_CONNECTION_DESIGN_IMPLEMENTED,
  US_GOVERNANCE_DOES_NOT_REDUCE_EU_HIGH_WATER_MARK,
  US_JURISDICTION_AND_STANDARD_SEPARATE,
  US_ONLY_STEEL_CORE,
  US_SEISMIC_PROFILE_ALWAYS_REQUIRED,
  US_SECTION_PROPERTIES_FROM_UNGOVERNED_DESIGNATION,
  US_STANDARD_ECOSYSTEM_MODEL,
  US_STANDARD_FAMILY_NOT_HARDCODED_TO_US_GEOGRAPHY,
  US_STEEL_DESIGN_AVAILABLE,
  US_STEEL_PACK_CERTIFIED,
  US_VALIDATION_PILOT_EXPOSURE,
  type BuildingCodeAdoptionContext,
  type USSteelDesignContext,
  type UsLocalAmendment,
  type UsProjectStandardContext,
  type UsSteelResolverInput,
} from "@rtb/types";
import { disciplineMaturity } from "../discipline-capability";
import { isGlobalFirstArchitecture } from "../global-governance";
import { createConfiguredKnowledgeContext, STRUCTURAL_STANDARD_PACKS } from "../structural-domain/binding";
import { governedProvenance } from "../structural-domain/catalog";
import { LOAD_FACTOR_PACK_INTERFACES } from "../structural-demand/combine";
import {
  AU_METHOD_VALIDATION_INVENTORY,
  AU_STEEL_VALIDATION_MATRIX,
  D1D_US1_D0_RISK_DISPOSITION,
  EU_METHOD_VALIDATION_INVENTORY,
  EU_STEEL_VALIDATION_MATRIX,
  GOVERNED_US_LOCAL_AMENDMENT_CATALOG,
  IMPLEMENTED_EU_INTERACTION_METHODS,
  IMPLEMENTED_INTERACTION_METHODS,
  STEEL_ADAPTER_BOUNDARIES,
  US_CONNECTION_STANDARD_DEPENDENCY,
  US_MATERIAL_SOURCE_BOUNDARY_RECORD,
  US_SECTION_CATALOG_ADAPTER,
  US_STANDARD_SOURCE_REFERENCES,
  US_STEEL_ECOSYSTEM_CATALOG,
  US_STEEL_IMPLEMENTATION_SUBPHASES,
  assertAiscEditionExplicitOrUnknown,
  assertAust300NotUsDefault,
  assertBuildingCodeAndSteelStandardSeparate,
  assertEuCatalogNotUsDefault,
  assertHumanUsStandardConfirmation,
  assertJurisdictionAndStandardSeparate,
  assertLocalAmendmentNotGuessed,
  assertMultiJurisdictionUsContexts,
  assertNoUsCrossEditionMixing,
  assertUsD1cDemandEngineReused,
  assertUsRuleAuthority,
  assertUsSectionPropertiesNotFromUngovernedDesignation,
  assertUsSteelEcosystemComplete,
  assertUsTenantWorkspaceIsolation,
  denyAiAiscEditionChoice,
  denyAiLocalAmendment,
  denyAiLrfdAsdChoice,
  denyAiUsConformanceClaim,
  denyCodeProfileFromUserLocation,
  evaluateSteelCapacity,
  historicalUsContextRemainsReproducible,
  projectContextDoesNotForceWorkspaceCode,
  resolveAiscSteelFamily,
  resolveUsSteelContext,
  selectSteelAdapter,
  snapshotIssuedUsContext,
  unknownAiscVersion,
  unknownEditionBlocksUsConformance,
} from "./index";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..", "..", "..", "..");

function adoption(overrides: Partial<BuildingCodeAdoptionContext> = {}): BuildingCodeAdoptionContext {
  return {
    adoptionId: "adopt-ca-ibc",
    jurisdiction: "california",
    adoptingAuthority: "state-of-california",
    buildingCodeFamily: "IBC",
    buildingCodeEdition: "UNKNOWN_PENDING_CONFIRMATION",
    effectiveDate: null,
    localAmendmentSetRef: null,
    referencedStandards: ["AISC 360", "ASCE 7"],
    projectOverrideRefs: [],
    validationState: "FRAMEWORK_ONLY",
    sourceAuthorityRef: "metadata-reference-only",
    ...overrides,
  };
}

function amendment(overrides: Partial<UsLocalAmendment> = {}): UsLocalAmendment {
  return {
    amendmentSetId: "ca-ibc-amend-1",
    jurisdiction: "california",
    authority: "state-of-california",
    baseCodeRef: "IBC",
    editionCompatibility: "UNKNOWN_PENDING_CONFIRMATION",
    effectiveDate: null,
    ruleOverrides: [],
    sourceAuthorityRef: "metadata-reference-only",
    validationState: "FRAMEWORK_ONLY",
    ...overrides,
  };
}

function designContext(overrides: Partial<USSteelDesignContext> = {}): USSteelDesignContext {
  return {
    contextId: "ctx-us-steel-1",
    tenantId: "tenant-a",
    workspaceId: "ws-a",
    projectId: "proj-us",
    assetId: "asset-1",
    jurisdictionProfileRef: "united-states",
    buildingCodeAdoptionRef: "adopt-ca-ibc",
    buildingCodeAdoption: adoption(),
    steelStandardFamily: "AISC",
    steelStandardId: "AISC_360",
    steelStandardCode: "AISC 360",
    edition: AISC_UNKNOWN_EDITION_TOKEN,
    amendmentErrataState: AISC_UNKNOWN_EDITION_TOKEN,
    designMethod: "LRFD",
    unitSystem: "US_CUSTOMARY",
    referencedStandardRefs: ["ASCE 7"],
    localAmendmentSetRef: null,
    localAmendment: null,
    loadStandard: {
      standardId: "ASCE_7",
      standardCode: "ASCE 7",
      edition: AISC_UNKNOWN_EDITION_TOKEN,
      combinationBasis: "UNKNOWN_PENDING_CONFIRMATION",
      implemented: false,
    },
    seismicApplicable: false,
    seismicStandard: null,
    connectionStandardRefs: ["RCSC", "AISC 358"],
    materialSourceKind: "UNBOUND",
    sectionCatalogRef: null,
    projectStandardContextRef: "proj-us",
    calculationContextRef: "calc-1",
    engineeringRuleAuthorityRefs: ["VALIDATED_ENGINEERING_REFERENCE"],
    projectOverride: null,
    sourcePrecedence: ["MANDATORY_ADOPTED_CODE", "REFERENCED_STANDARD"],
    intendedStandardProfile: "AISC360",
    standardConformanceState: "INTENDED_PROFILE",
    validationState: "FRAMEWORK_ONLY",
    provenanceRef: "us1:ctx-us-steel-1",
    issued: false,
    humanConfirmation: null,
    piiPresent: false,
    directContractProfile: false,
    ...overrides,
  };
}

function project(overrides: Partial<UsProjectStandardContext> = {}): UsProjectStandardContext {
  return {
    tenantId: "tenant-a",
    workspaceId: "ws-a",
    projectId: "proj-us",
    jurisdictionProfileRef: "united-states",
    buildingCodeFamily: "IBC",
    buildingCodeEdition: "UNKNOWN_PENDING_CONFIRMATION",
    aiscEdition: AISC_UNKNOWN_EDITION_TOKEN,
    designMethod: "LRFD",
    unitSystem: "US_CUSTOMARY",
    asceEdition: AISC_UNKNOWN_EDITION_TOKEN,
    seismicApplicable: false,
    seismicEdition: null,
    localAmendmentSetRef: null,
    directContractProfile: false,
    workspaceGlobalCodeProfileId: null,
    designBasisReference: "governed-project-profile",
    ...overrides,
  };
}

function input(overrides: Partial<UsSteelResolverInput> = {}): UsSteelResolverInput {
  return {
    projectContext: project(),
    explicitCalculationContext: designContext(),
    issuedContext: null,
    adoptionRequired: true,
    loadStandardRequired: false,
    ruleRequiresSeismic: false,
    enforceLoadMethodCompatibility: false,
    unresolvedSourceConflict: false,
    collapseDesignMethodFromUnits: false,
    convertLrfdToAsdSilently: false,
    convertAsdToLrfdSilently: false,
    source: "explicit",
    aiSelectedEdition: false,
    aiSelectedDesignMethod: false,
    aiInventedAmendment: false,
    aiClaimedConformance: false,
    humanConfirmationRequired: false,
    ...overrides,
  };
}

describe("EOS-D1D-US-1 US steel standard binding", () => {
  it("registers the AISC family with explicit edition, LRFD/ASD, and unit separation", () => {
    expect(EOS_D1D_US1_PHASE).toBe("EOS-D1D-US-1");
    expect(GLOBAL_STANDARD_FRAMEWORK_REUSED).toBe(true);
    expect(PARALLEL_US_STANDARD_FRAMEWORK_CREATED).toBe(false);
    expect(US_STANDARD_ECOSYSTEM_MODEL).toBe(true);
    expect(AISC_STEEL_FAMILY_REGISTERED).toBe(true);
    assertUsSteelEcosystemComplete();
    expect(resolveAiscSteelFamily().standardCode).toBe("AISC 360");
    expect(US_STEEL_ECOSYSTEM_CATALOG.map((row) => row.familyId)).toEqual(expect.arrayContaining(["AISC_360", "AISC_341", "ASCE_7", "IBC", "ASTM_MATERIAL", "RCSC", "AISC_358"]));
    expect(AISC_STANDARD_EDITION).toBe(AISC_UNKNOWN_EDITION_TOKEN);
    expect(SILENT_AISC_EDITION_INFERENCE).toBe(false);
    expect(assertAiscEditionExplicitOrUnknown(null)).toBe(AISC_UNKNOWN_EDITION_TOKEN);
    expect(unknownAiscVersion("AISC 360").edition).toBe(AISC_UNKNOWN_EDITION_TOKEN);
    expect(CROSS_EDITION_RULE_MIXING_ALLOWED).toBe(false);
    expect(() => assertNoUsCrossEditionMixing("2016", "2022")).toThrow(/STANDARD_VERSION_CONFLICT/);
    expect(DEFAULT_LRFD_OR_ASD).toBe(false);
    expect(DESIGN_METHOD_EXPLICIT).toBe(true);
    expect(DESIGN_METHOD_AND_UNIT_SYSTEM_SEPARATE).toBe(true);
    const lrfd = resolveUsSteelContext(input());
    expect(lrfd.ok).toBe(true);
    if (lrfd.ok) {
      expect(lrfd.context.designMethod).toBe("LRFD");
      expect(lrfd.context.unitSystem).toBe("US_CUSTOMARY");
      expect(lrfd.context.edition).toBe(AISC_UNKNOWN_EDITION_TOKEN);
    }
    const asd = resolveUsSteelContext(input({
      explicitCalculationContext: designContext({ designMethod: "ASD", unitSystem: "SI" }),
    }));
    expect(asd.ok).toBe(true);
    if (asd.ok) {
      expect(asd.context.designMethod).toBe("ASD");
      expect(asd.context.unitSystem).toBe("SI");
    }
    const missingMethod = resolveUsSteelContext(input({
      explicitCalculationContext: designContext({ designMethod: null }),
    }));
    expect(missingMethod).toMatchObject({ ok: false, failReason: "DESIGN_METHOD_REQUIRED" });
    const collapsed = resolveUsSteelContext(input({ collapseDesignMethodFromUnits: true }));
    expect(collapsed).toMatchObject({ ok: false, failReason: "STANDARD_CONTEXT_CONFLICT" });
    const converted = resolveUsSteelContext(input({ convertLrfdToAsdSilently: true }));
    expect(converted).toMatchObject({ ok: false, failReason: "STANDARD_CONTEXT_CONFLICT" });
    expect(SILENT_LRFD_ASD_CONVERSION).toBe(false);
    expect(() => unknownEditionBlocksUsConformance(designContext({ standardConformanceState: "CONFORMANCE_VALIDATED" }))).toThrow(/AISC_EDITION_REQUIRED/);
  });

  it("keeps building code, jurisdiction, adoption, and direct-contract profiles distinct", () => {
    expect(BUILDING_CODE_AND_STEEL_STANDARD_SEPARATE).toBe(true);
    expect(US_JURISDICTION_AND_STANDARD_SEPARATE).toBe(true);
    expect(() => assertBuildingCodeAndSteelStandardSeparate("IBC", "AISC 360")).not.toThrow();
    expect(() => assertBuildingCodeAndSteelStandardSeparate("AISC 360", "AISC 360")).toThrow(/not a substitute/);
    expect(() => assertJurisdictionAndStandardSeparate("california", "AISC 360")).not.toThrow();
    expect(() => assertJurisdictionAndStandardSeparate("AISC 360", "AISC 360")).toThrow(/not a substitute/);
    expect(US_CODE_PROFILE_INFERRED_FROM_USER_LOCATION).toBe(false);
    expect(() => denyCodeProfileFromUserLocation("ip")).toThrow(/USER_LOCATION_INFERENCE_DENIED/);
    expect(resolveUsSteelContext(input({ source: "ip" }))).toMatchObject({ ok: false, failReason: "USER_LOCATION_INFERENCE_DENIED" });
    expect(LOCAL_AMENDMENT_VALUE_GUESSED).toBe(false);
    expect(GOVERNED_US_LOCAL_AMENDMENT_CATALOG).toEqual([]);
    assertLocalAmendmentNotGuessed(amendment());
    const wrongEdition = resolveUsSteelContext(input({
      explicitCalculationContext: designContext({
        buildingCodeAdoption: adoption({ buildingCodeEdition: "2021" }),
        localAmendment: amendment({ editionCompatibility: "2018" }),
      }),
    }));
    expect(wrongEdition).toMatchObject({ ok: false, failReason: "LOCAL_AMENDMENT_CONFLICT" });
    const missingAdoption = resolveUsSteelContext(input({
      adoptionRequired: true,
      explicitCalculationContext: designContext({ buildingCodeAdoption: null, buildingCodeAdoptionRef: null, directContractProfile: false }),
    }));
    expect(missingAdoption).toMatchObject({ ok: false, failReason: "BUILDING_CODE_CONTEXT_REQUIRED" });
    expect(DIRECT_CONTRACT_STANDARD_PROFILE_SUPPORTED).toBe(true);
    const direct = resolveUsSteelContext(input({
      adoptionRequired: true,
      explicitCalculationContext: designContext({
        directContractProfile: true,
        buildingCodeAdoption: null,
        buildingCodeAdoptionRef: null,
        jurisdictionProfileRef: "other",
      }),
    }));
    expect(direct.ok).toBe(true);
    if (direct.ok) {
      expect(direct.context.directContractProfile).toBe(true);
      expect(direct.context.jurisdictionProfileRef).toBe("other");
      expect(direct.context.buildingCodeAdoption).toBeNull();
    }
    expect(US_STANDARD_FAMILY_NOT_HARDCODED_TO_US_GEOGRAPHY).toBe(true);
    const otherCtx = createConfiguredKnowledgeContext({
      contextId: "ctx-aisc-other",
      jurisdictionProfileRef: "other",
      standardFamily: "AISC",
      standardCode: "AISC 360",
      edition: AISC_UNKNOWN_EDITION_TOKEN,
      materialScope: "steel",
    });
    expect(() => selectSteelAdapter("US_STEEL", otherCtx)).not.toThrow();
  });

  it("models ASCE, seismic, and connection dependencies without implementing equations", () => {
    expect(US1_LOAD_COMBINATION_ENGINE_CREATED).toBe(false);
    expect(SILENT_ASCE_EDITION_INFERENCE).toBe(false);
    expect(LOAD_FACTOR_PACK_INTERFACES.US.implemented).toBe(false);
    assertUsD1cDemandEngineReused();
    const asceUnknown = resolveUsSteelContext(input({
      loadStandardRequired: true,
      explicitCalculationContext: designContext({
        edition: "2022",
        loadStandard: { standardId: "ASCE_7", standardCode: "ASCE 7", edition: AISC_UNKNOWN_EDITION_TOKEN, combinationBasis: "UNKNOWN_PENDING_CONFIRMATION", implemented: false },
      }),
    }));
    expect(asceUnknown).toMatchObject({ ok: false, failReason: "LOAD_STANDARD_CONTEXT_REQUIRED" });
    const incompatible = resolveUsSteelContext(input({
      enforceLoadMethodCompatibility: true,
      explicitCalculationContext: designContext({
        designMethod: "ASD",
        loadStandard: { standardId: "ASCE_7", standardCode: "ASCE 7", edition: "2022", combinationBasis: "STRENGTH", implemented: false },
      }),
    }));
    expect(incompatible).toMatchObject({ ok: false, failReason: "STANDARD_CONTEXT_CONFLICT" });
    expect(US_SEISMIC_PROFILE_ALWAYS_REQUIRED).toBe(false);
    expect(SILENT_SEISMIC_STANDARD_EDITION_INFERENCE).toBe(false);
    const seismicMissing = resolveUsSteelContext(input({
      ruleRequiresSeismic: true,
      explicitCalculationContext: designContext({
        seismicApplicable: true,
        seismicStandard: { applicable: true, standardId: "AISC_341", standardCode: "AISC 341", edition: AISC_UNKNOWN_EDITION_TOKEN, implemented: false },
      }),
    }));
    expect(seismicMissing).toMatchObject({ ok: false, failReason: "SEISMIC_CONTEXT_REQUIRED" });
    const nonSeismic = resolveUsSteelContext(input({
      ruleRequiresSeismic: false,
      explicitCalculationContext: designContext({ seismicApplicable: false, seismicStandard: null }),
    }));
    expect(nonSeismic.ok).toBe(true);
    expect(US_CONNECTION_DESIGN_IMPLEMENTED).toBe(false);
    expect(US_CONNECTION_STANDARD_DEPENDENCY).toEqual({ modeled: true, implemented: false, standardRefs: ["RCSC", "AISC 358"] });
  });

  it("governs catalogs, overrides, precedence, history, AI, and fail-closed conflicts", () => {
    expect(AUST300_US_DEFAULT).toBe(false);
    expect(EU_SECTION_CATALOG_US_DEFAULT).toBe(false);
    expect(US_SECTION_CATALOG_ADAPTER.ready).toBe(true);
    expect(US_SECTION_CATALOG_ADAPTER.implemented).toBe(false);
    expect(() => assertAust300NotUsDefault("AUST300")).toThrow(/not a US default/);
    expect(() => assertEuCatalogNotUsDefault("EU_SECTION_CATALOG")).toThrow(/not a US default/);
    expect(US_SECTION_PROPERTIES_FROM_UNGOVERNED_DESIGNATION).toBe(false);
    expect(() => assertUsSectionPropertiesNotFromUngovernedDesignation("W12x50", null)).toThrow(/designation/);
    expect(US_MATERIAL_SOURCE_BOUNDARY_RECORD.aiscIsUniversalMaterialSource).toBe(false);
    expect(US_STANDARD_SOURCE_REFERENCES).toEqual([]);
    expect(LLM_MEMORY_ONLY_RULE_ALLOWED).toBe(false);
    expect(() => assertUsRuleAuthority("LLM_MEMORY_ONLY")).toThrow(/RULE_AUTHORITY_DENIED/);
    const override = resolveUsSteelContext(input({
      explicitCalculationContext: designContext({
        projectOverride: { overrideId: "ov-1", sourceExplicit: true, authorityExplicit: true, scopeExplicit: true, conflictBehavior: "FAIL_CLOSED", humanConfirmation: false },
      }),
    }));
    expect(override).toMatchObject({ ok: false, failReason: "HUMAN_CONFIRMATION_REQUIRED" });
    const conflict = resolveUsSteelContext(input({ unresolvedSourceConflict: true }));
    expect(conflict).toMatchObject({ ok: false, failReason: "STANDARD_CONTEXT_CONFLICT" });
    const issued = snapshotIssuedUsContext(designContext({ issued: true }));
    const frozen = historicalUsContextRemainsReproducible(issued, project({ aiscEdition: "2022", jurisdictionProfileRef: "other" }));
    expect(frozen.edition).toBe(AISC_UNKNOWN_EDITION_TOKEN);
    expect(frozen.issued).toBe(true);
    expect(STANDARD_UPDATE_OVERWRITES_HISTORICAL_RULE).toBe(false);
    projectContextDoesNotForceWorkspaceCode(project());
    const ca = designContext({ buildingCodeAdoptionRef: "ca", buildingCodeAdoption: adoption({ adoptionId: "ca" }) });
    const tx = designContext({ buildingCodeAdoptionRef: "tx", buildingCodeAdoption: adoption({ adoptionId: "tx", jurisdiction: "texas" }) });
    expect(() => assertMultiJurisdictionUsContexts([ca, tx])).not.toThrow();
    expect(() => assertUsTenantWorkspaceIsolation(ca, { tenantId: "tenant-b", workspaceId: "ws-a" })).toThrow(/tenants/);
    expect(() => denyAiAiscEditionChoice()).toThrow(/AISC edition/);
    expect(() => denyAiLrfdAsdChoice()).toThrow(/LRFD or ASD/);
    expect(() => denyAiLocalAmendment()).toThrow(/local amendment/);
    expect(() => denyAiUsConformanceClaim()).toThrow(/compliance/);
    expect(AI_AISC_EDITION_AUTHORITY).toBe(false);
    expect(AI_LRFD_ASD_AUTHORITY).toBe(false);
    expect(AI_LOCAL_AMENDMENT_AUTHORITY).toBe(false);
    expect(AI_STANDARD_CONFORMANCE_AUTHORITY).toBe(false);
    expect(AI_ENGINEERING_APPROVAL).toBe(false);
    expect(() => assertHumanUsStandardConfirmation(null, true)).toThrow(/HUMAN_CONFIRMATION_REQUIRED/);
    const aiEdition = resolveUsSteelContext(input({ source: "ai", aiSelectedEdition: true }));
    expect(aiEdition).toMatchObject({ ok: false, failReason: "AI_AUTHORITY_DENIED" });
  });

  it("preserves AU/EU isolation, three-jurisdiction architecture, and pack boundaries", () => {
    expect(PARALLEL_US_GOVERNANCE_CREATED).toBe(false);
    expect(US_ONLY_STEEL_CORE).toBe(false);
    expect(EU_ONLY_STEEL_CORE).toBe(false);
    expect(THREE_JURISDICTION_ARCHITECTURE_VALIDATED).toBe(true);
    expect(US_GOVERNANCE_DOES_NOT_REDUCE_EU_HIGH_WATER_MARK).toBe(true);
    expect(STRUCTURAL_STANDARD_PACKS.map((row) => row.packId)).toEqual(expect.arrayContaining(["AU", "EU", "US"]));
    expect(AU_METHOD_VALIDATION_INVENTORY).toHaveLength(18);
    expect(AU_STEEL_VALIDATION_MATRIX).toHaveLength(11);
    expect(EU_METHOD_VALIDATION_INVENTORY.length).toBeGreaterThan(20);
    expect(EU_STEEL_VALIDATION_MATRIX).toHaveLength(13);
    expect(IMPLEMENTED_INTERACTION_METHODS).toEqual([]);
    expect(IMPLEMENTED_EU_INTERACTION_METHODS).toEqual([]);
    expect(STEEL_ADAPTER_BOUNDARIES.US_STEEL.implemented).toBe(false);
    expect(STEEL_ADAPTER_BOUNDARIES.US_STEEL).toEqual({ ready: true, implemented: false, standards: ["AISC 360"], loadContext: ["ASCE 7"] });
    expect(US_STEEL_IMPLEMENTATION_SUBPHASES[0]).toMatch(/US-1/);
    expect(US_STEEL_DESIGN_AVAILABLE).toBe(false);
    expect(US_STEEL_PACK_CERTIFIED).toBe(false);
    expect(READY_FOR_US2_TENSION_ARCHITECTURE).toBe(true);
    expect(US_VALIDATION_PILOT_EXPOSURE).toBe(false);
    expect(SCHEMA_CHANGE_REQUIRED_FOR_US1).toBe(false);
    expect(STRUCTURAL_STANDARD_TEXT_EMBEDDED).toBe(false);
    expect(EMPLOYEE_BEHAVIOR_PROFILING).toBe(false);
    const usBound = createConfiguredKnowledgeContext({
      contextId: "ctx-us1-eval",
      jurisdictionProfileRef: "united-states",
      standardFamily: "AISC",
      standardCode: "AISC 360",
      edition: AISC_UNKNOWN_EDITION_TOKEN,
      materialScope: "steel",
    });
    expect(evaluateSteelCapacity({
      adapterId: "US_STEEL",
      designContext: {
        designContextId: "dc-us1",
        memberRef: "m1",
        sectionRef: "sec-1",
        materialRef: "mat-1",
        demandRefs: ["d1"],
        standardContextRef: usBound.contextId,
        parameterSetRef: null,
        effectiveLengthContextRef: null,
        restraintContextRef: null,
        stabilityContextRef: null,
        fabricationContextRef: null,
        evidenceRefs: [],
        toolRef: "EOS_STRUCTURAL_DETERMINISTIC_V1",
        methodRef: "STEEL_DESIGN_FRAMEWORK",
        provenanceRef: governedProvenance({ jurisdiction: "united-states", standard: "AISC 360" }),
        validationState: "FRAMEWORK_ONLY",
        reviewState: "required",
      },
      standardContext: usBound,
      material: {
        materialRef: "mat-1",
        grade: "unbound",
        yieldStrength: null,
        ultimateStrength: null,
        elasticModulus: null,
        shearModulus: null,
        poissonRatio: null,
        density: null,
        thicknessDependentMetadata: null,
        jurisdictionApplicability: ["united-states"],
      },
      section: {
        sectionRef: "sec-1",
        sectionFamily: "W",
        catalogSource: "UNBOUND",
        catalogVersion: null,
        jurisdictionApplicability: ["united-states"],
        area: null,
        Iyy: null,
        Izz: null,
        sectionModulusYy: null,
        sectionModulusZz: null,
        plasticModulusYy: null,
        plasticModulusZz: null,
        torsionConstant: null,
        warpingConstant: null,
        radiusOfGyrationYy: null,
        radiusOfGyrationZz: null,
        netArea: null,
        geometricDimensions: {},
      },
      stability: null,
      demand: {
        resultId: "d1",
        memberId: "m1",
        shear: { value: 0, unit: "N", locationM: 0, signed: 0 },
        moment: { value: 0, unit: "N.m", locationM: 0, signed: 0 },
        axial: { status: "NO_AXIAL_COMPONENTS", valueN: 0 },
        deflection: { status: "NOT_IMPLEMENTED", reason: "not required" },
        capacityPresent: false,
        standardContext: usBound,
        inputEvidenceRefs: [],
        combinationId: null,
      },
      limitState: "SERVICEABILITY",
      requiredProperties: [],
    }).implemented).toBe(false);
    const usSrc = ["family.ts", "adoption.ts", "resolver.ts", "authority.ts", "catalogs.ts"].map((name) => readFileSync(join(here, "us-standard", name), "utf8")).join("\n");
    expect(usSrc).not.toMatch(/AUST300 default|National Annex|γM0|0\.9 fy Ag|AS 4100 φ/);
    const mechanics = readFileSync(join(here, "mechanics", "tension-force.ts"), "utf8");
    expect(mechanics).not.toMatch(/LRFD|ASD|ASCE 7 combination|Ωb\s*=/);
    const files = [join(repoRoot, "docs", "architecture", "engineering-os"), join(here, "us-standard")].flatMap((dir) => readdirSync(dir));
    expect(files.filter((name) => name.toLowerCase().endsWith(".pdf"))).toEqual([]);
    expect(isGlobalFirstArchitecture()).toBe(true);
    expect(disciplineMaturity("structural")).toBe("REFERENCE_PARTIALLY_IMPLEMENTED");
    expect(D1D_US1_D0_RISK_DISPOSITION.CLOSED).toEqual([]);
    expect(D1D_US1_D0_RISK_DISPOSITION.REDUCED).toEqual(["D0-R03", "D0-R05"]);
    const usDoc = readdirSync(join(repoRoot, "docs", "architecture", "engineering-os")).filter((name) => name.startsWith("EOS_D1D_US")).join(",");
    expect(usDoc).toMatch(/EOS_D1D_US1/);
  });
});
