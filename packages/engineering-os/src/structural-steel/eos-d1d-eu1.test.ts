import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AI_ENGINEERING_APPROVAL,
  AI_EU_STANDARD_ASSISTANCE_ADVISORY_ONLY,
  AI_NATIONAL_ANNEX_AUTHORITY,
  AI_NDP_AUTHORITY,
  AI_STANDARD_CONFORMANCE_AUTHORITY,
  AUST300_EU_DEFAULT,
  COUNTRY_AND_STANDARD_SEPARATE,
  CROSS_EDITION_RULE_MIXING_ALLOWED,
  DEFAULT_EU_NATIONAL_ANNEX,
  EMPLOYEE_BEHAVIOR_PROFILING,
  EN1993_STEEL_FAMILY_REGISTERED,
  EOS_D1D_EU1_PHASE,
  EU1_LOAD_COMBINATION_ENGINE_CREATED,
  EU_AI_NUMERICAL_AUTHORITY,
  EU_INITIAL_STEEL_STANDARD_PART,
  EU_ONLY_STEEL_CORE,
  EU_STEEL_CONTEXT_PII_REQUIRED,
  EU_STEEL_DESIGN_AVAILABLE,
  EU_STEEL_PACK_CERTIFIED,
  EUROCODE_FAMILY_NOT_HARDCODED_TO_EU_MEMBERSHIP,
  EUROCODE_UNKNOWN_EDITION_TOKEN,
  GLOBAL_STANDARD_FRAMEWORK_REUSED,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  NATIONAL_ANNEX_INFERRED_FROM_USER_LOCATION,
  NDP_VALUE_GUESSED,
  PARALLEL_EU_GOVERNANCE_CREATED,
  PARALLEL_EU_STANDARD_FRAMEWORK_CREATED,
  READY_FOR_EU2_TENSION_ARCHITECTURE,
  SCHEMA_CHANGE_REQUIRED_FOR_EU1,
  SILENT_EU_STANDARD_EDITION_INFERENCE,
  STANDARD_UPDATE_OVERWRITES_HISTORICAL_RULE,
  STRUCTURAL_STANDARD_TEXT_EMBEDDED,
  UK_EUROCODE_EXTENSIBILITY,
  type EurocodeNationalAnnex,
  type EurocodeProjectStandardContext,
  type EurocodeSteelDesignContext,
  type EurocodeSteelResolverInput,
} from "@rtb/types";
import { disciplineMaturity } from "../discipline-capability";
import { isGlobalFirstArchitecture } from "../global-governance";
import { assertGovernedStandardContext } from "../structural-domain/binding";
import { governedProvenance } from "../structural-domain/catalog";
import { LOAD_FACTOR_PACK_INTERFACES } from "../structural-demand/combine";
import { A15A_V5_FEATURE_FREEZE } from "../work-generator/structural/freeze";
import {
  AU_METHOD_VALIDATION_INVENTORY,
  AU_STEEL_VALIDATION_MATRIX,
  D1D_EU1_D0_RISK_DISPOSITION,
  EN1993_PART_CATALOG,
  EU_MATERIAL_SOURCE_BOUNDARY,
  EU_SECTION_CATALOG_ADAPTER,
  EU_STANDARD_SOURCE_REFERENCES,
  EU_STEEL_IMPLEMENTATION_SUBPHASES,
  EUROCODE_COUNTRY_CODES,
  EUROCODE_DEPENDENCY_MODEL,
  EUROCODE_FAMILY_CATALOG,
  GOVERNED_NDP_CATALOG,
  IMPLEMENTED_INTERACTION_METHODS,
  STEEL_ADAPTER_BOUNDARIES,
  UK_EUROCODE_COUNTRY_CODE,
  US_STEEL_IMPLEMENTATION_SUBPHASES,
  assertAiEuStandardAssistanceAdvisoryOnly,
  assertAust300NotEuDefault,
  assertCountryAndStandardSeparate,
  assertD1cDemandEngineReused,
  assertEditionExplicitOrUnknown,
  assertEurocodeFamilyComplete,
  assertEurocodeRuleAuthority,
  assertEurocodeTenantWorkspaceIsolation,
  assertHumanEurocodeConfirmation,
  assertMultiCountryWorkspaceContexts,
  assertNoCrossEditionMixing,
  assertNoDefaultNationalAnnex,
  assertNoEmbeddedStandardText,
  denyAiConformanceClaim,
  denyAiEditionInference,
  denyAiNationalAnnexChoice,
  denyAiNdpSupply,
  denyNationalAnnexFromUserLocation,
  evaluateSteelCapacity,
  historicalContextRemainsReproducible,
  resolveEn1993Family,
  resolveEurocodeFamily,
  resolveEurocodePart,
  resolveEurocodeSteelContext,
  resolveInitialSteelStandardPart,
  resolveNdp,
  selectSteelAdapter,
  snapshotIssuedEurocodeContext,
  toStructuralStandardContext,
  unknownEurocodeVersion,
} from "./index";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..", "..", "..", "..");

function walkNames(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".git" || name === ".next") continue;
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) walkNames(path, acc);
    else acc.push(path);
  }
  return acc;
}

function annex(country: string, overrides: Partial<EurocodeNationalAnnex> = {}): EurocodeNationalAnnex {
  return {
    nationalAnnexId: `NA-${country}-EN1993-1-1`,
    countryCode: country,
    standardPartRef: "EN_1993_1_1",
    edition: "UNKNOWN_PENDING_CONFIRMATION",
    publicationDate: null,
    amendment: null,
    effectiveDate: null,
    status: "FRAMEWORK_ONLY",
    nationalParameterSetRef: null,
    sourceAuthorityRef: "metadata-reference-only",
    validationState: "FRAMEWORK_ONLY",
    generationFamily: "UNKNOWN_PENDING_CONFIRMATION",
    ...overrides,
  };
}

function designContext(overrides: Partial<EurocodeSteelDesignContext> = {}): EurocodeSteelDesignContext {
  return {
    contextId: "ctx-eu-steel-1",
    tenantId: "tenant-a",
    workspaceId: "ws-a",
    projectId: "proj-eu",
    assetId: "asset-1",
    jurisdictionProfileRef: "eu-eea",
    countryCode: "DE",
    standardFamily: "EUROCODE",
    standardPart: "EN_1993_1_1",
    standardCode: "EN 1993-1-1",
    version: unknownEurocodeVersion("EN 1993-1-1"),
    nationalAnnex: null,
    ndpSet: [],
    materialSourceKind: "UNBOUND",
    sectionCatalogRef: null,
    projectContextRef: "proj-eu",
    calculationContextRef: "calc-1",
    sourceAuthorityRef: "governed-project-profile",
    intendedStandardProfile: "EN1993",
    standardConformanceState: "INTENDED_PROFILE",
    validationState: "FRAMEWORK_ONLY",
    provenanceRef: "eu1:ctx-eu-steel-1",
    issued: false,
    humanConfirmation: null,
    piiPresent: false,
    ...overrides,
  };
}

function project(overrides: Partial<EurocodeProjectStandardContext> = {}): EurocodeProjectStandardContext {
  return {
    tenantId: "tenant-a",
    workspaceId: "ws-a",
    projectId: "proj-eu",
    jurisdictionProfileRef: "eu-eea",
    countryCode: "DE",
    generationFamily: "UNKNOWN_PENDING_CONFIRMATION",
    governingParts: ["EN_1993_1_1"],
    nationalAnnexSet: [],
    projectSpecificGovernedParameters: [],
    designBasisReference: "project-en1993-profile",
    workspaceGlobalAnnexId: null,
    ...overrides,
  };
}

function input(overrides: Partial<EurocodeSteelResolverInput> = {}): EurocodeSteelResolverInput {
  return {
    projectContext: project(),
    explicitCalculationContext: null,
    issuedContext: null,
    requestedMethodId: "EU_STEEL_FRAMEWORK",
    requestedPartId: "EN_1993_1_1",
    requiredNdpIds: [],
    ruleRequiresNdp: false,
    source: "explicit",
    aiSelectedAnnex: false,
    aiSuppliedNdp: false,
    aiInferredEdition: false,
    aiClaimedConformance: false,
    humanConfirmed: false,
    ruleAuthorityType: "AUTHORITATIVE_STANDARD_DERIVED",
    ...overrides,
  };
}

describe("EOS-D1D-EU-1 Eurocode steel standard binding", () => {
  it("reuses the global standard framework and registers the Eurocode family and EN 1993-1-1", () => {
    expect(EOS_D1D_EU1_PHASE).toBe("EOS-D1D-EU-1");
    expect(GLOBAL_STANDARD_FRAMEWORK_REUSED).toBe(true);
    expect(PARALLEL_EU_STANDARD_FRAMEWORK_CREATED).toBe(false);
    expect(PARALLEL_EU_GOVERNANCE_CREATED).toBe(false);
    expect(EN1993_STEEL_FAMILY_REGISTERED).toBe(true);
    expect(() => assertEurocodeFamilyComplete()).not.toThrow();
    expect(resolveEurocodeFamily("EN_1990").standardCode).toBe("EN 1990");
    expect(resolveEn1993Family().d1dEuScope).toBe("IN_SCOPE");
    expect(resolveEurocodePart("EN_1993_1_1").standardCode).toBe("EN 1993-1-1");
    expect(resolveInitialSteelStandardPart().partId).toBe(EU_INITIAL_STEEL_STANDARD_PART);
    expect(EN1993_PART_CATALOG.every((row) => row.implementationState === "REGISTERED_ARCHITECTURE" || row.implementationState === "NOT_IMPLEMENTED" || row.implementationState === "FRAMEWORK_ONLY")).toBe(true);
    expect(EUROCODE_FAMILY_CATALOG).toHaveLength(10);
  });

  it("keeps edition explicit or UNKNOWN_PENDING_CONFIRMATION and never infers it", () => {
    expect(SILENT_EU_STANDARD_EDITION_INFERENCE).toBe(false);
    expect(assertEditionExplicitOrUnknown(null)).toBe(EUROCODE_UNKNOWN_EDITION_TOKEN);
    expect(assertEditionExplicitOrUnknown("")).toBe(EUROCODE_UNKNOWN_EDITION_TOKEN);
    expect(unknownEurocodeVersion("EN 1993-1-1").edition).toBe(EUROCODE_UNKNOWN_EDITION_TOKEN);
    const resolved = resolveEurocodeSteelContext(input({ explicitCalculationContext: designContext() }));
    expect(resolved.ok).toBe(true);
    if (resolved.ok) {
      expect(resolved.context.version.edition).toBe(EUROCODE_UNKNOWN_EDITION_TOKEN);
      expect(resolved.context.standardConformanceState).toBe("INTENDED_PROFILE");
    }
    expect(() => denyAiEditionInference()).toThrow(/infer a Eurocode edition/);
  });

  it("treats National Annex, country, and standard as separate and fails closed when a required annex is missing", () => {
    expect(DEFAULT_EU_NATIONAL_ANNEX).toBe(false);
    expect(COUNTRY_AND_STANDARD_SEPARATE).toBe(true);
    expect(EUROCODE_COUNTRY_CODES).toEqual(expect.arrayContaining(["DE", "FR", "NL", "BE", "IE"]));
    expect(() => assertCountryAndStandardSeparate("DE", "EN 1993-1-1")).not.toThrow();
    expect(() => assertCountryAndStandardSeparate("DE", "DE")).toThrow(/not a substitute/);
    expect(() => assertNoDefaultNationalAnnex(null)).not.toThrow();
    const missing = resolveEurocodeSteelContext(input({
      explicitCalculationContext: designContext({ nationalAnnex: null }),
      ruleRequiresNdp: true,
      requiredNdpIds: ["required-ndp-slot"],
    }));
    expect(missing).toMatchObject({ ok: false, failReason: "NATIONAL_ANNEX_REQUIRED", checkState: "CHECK_UNDETERMINED" });
  });

  it("rejects wrong-country and wrong-edition annexes and does not guess NDP values", () => {
    expect(NDP_VALUE_GUESSED).toBe(false);
    expect(GOVERNED_NDP_CATALOG).toEqual([]);
    const wrongCountry = resolveEurocodeSteelContext(input({
      explicitCalculationContext: designContext({
        nationalAnnex: annex("FR"),
        version: { ...unknownEurocodeVersion("EN 1993-1-1"), generationFamily: "UNKNOWN_PENDING_CONFIRMATION" },
      }),
    }));
    expect(wrongCountry.ok).toBe(false);
    if (!wrongCountry.ok) expect(wrongCountry.failReason).toBe("NATIONAL_ANNEX_MISMATCH");
    const known = designContext({
      version: { ...unknownEurocodeVersion("EN 1993-1-1"), edition: "CONFIRMED-A", generationFamily: "FIRST_GENERATION" },
      nationalAnnex: annex("DE", { edition: "CONFIRMED-B", generationFamily: "FIRST_GENERATION" }),
    });
    const wrongEdition = resolveEurocodeSteelContext(input({ explicitCalculationContext: known }));
    expect(wrongEdition.ok).toBe(false);
    if (!wrongEdition.ok) expect(wrongEdition.failReason).toBe("NATIONAL_ANNEX_MISMATCH");
    const missingNdp = resolveNdp({
      ruleRequiresNdp: true,
      annex: annex("DE"),
      ndpSet: [],
      parameterId: "required-ndp-slot",
    });
    expect(missingNdp).toEqual({ kind: "FAIL_CLOSED", reason: "NDP_REQUIRED", checkState: "CHECK_UNDETERMINED" });
  });

  it("resolves a project default and lets an explicit calculation context override it", () => {
    const fromProject = resolveEurocodeSteelContext(input({
      source: "project_default",
      explicitCalculationContext: null,
      projectContext: project({ nationalAnnexSet: [annex("DE")] }),
    }));
    expect(fromProject.ok).toBe(true);
    if (fromProject.ok) {
      expect(fromProject.context.countryCode).toBe("DE");
      expect(fromProject.context.nationalAnnex?.nationalAnnexId).toBe("NA-DE-EN1993-1-1");
    }
    const override = resolveEurocodeSteelContext(input({
      projectContext: project({ countryCode: "DE", nationalAnnexSet: [annex("DE")] }),
      explicitCalculationContext: designContext({
        countryCode: "FR",
        nationalAnnex: annex("FR"),
      }),
    }));
    expect(override.ok).toBe(true);
    if (override.ok) expect(override.context.countryCode).toBe("FR");
  });

  it("keeps issued calculation context immutable and historically reproducible", () => {
    expect(STANDARD_UPDATE_OVERWRITES_HISTORICAL_RULE).toBe(false);
    const issued = snapshotIssuedEurocodeContext(designContext({ issued: true, countryCode: "DE", nationalAnnex: annex("DE") }));
    const later = project({ countryCode: "FR", nationalAnnexSet: [annex("FR")] });
    const frozen = historicalContextRemainsReproducible(issued, later);
    expect(frozen.countryCode).toBe("DE");
    expect(frozen.issued).toBe(true);
    const resolved = resolveEurocodeSteelContext(input({
      issuedContext: issued,
      projectContext: later,
      explicitCalculationContext: designContext({ countryCode: "FR", nationalAnnex: annex("FR") }),
    }));
    expect(resolved.ok).toBe(true);
    if (resolved.ok) expect(resolved.context.countryCode).toBe("DE");
  });

  it("supports multi-country, UK Eurocode, and non-EU contractual Eurocode profiles", () => {
    expect(UK_EUROCODE_EXTENSIBILITY).toBe(true);
    expect(EUROCODE_FAMILY_NOT_HARDCODED_TO_EU_MEMBERSHIP).toBe(true);
    const de = designContext({ countryCode: "DE", assetId: "pkg-de", nationalAnnex: annex("DE") });
    const fr = designContext({ contextId: "ctx-fr", countryCode: "FR", assetId: "pkg-fr", nationalAnnex: annex("FR") });
    expect(() => assertMultiCountryWorkspaceContexts([de, fr])).not.toThrow();
    expect(() => assertEurocodeTenantWorkspaceIsolation(de, fr)).not.toThrow();
    expect(() => assertEurocodeTenantWorkspaceIsolation(de, { ...fr, tenantId: "tenant-b" })).toThrow(/tenants/);
    const uk = resolveEurocodeSteelContext(input({
      explicitCalculationContext: designContext({
        jurisdictionProfileRef: "united-kingdom",
        countryCode: UK_EUROCODE_COUNTRY_CODE,
        nationalAnnex: annex(UK_EUROCODE_COUNTRY_CODE),
      }),
    }));
    expect(uk.ok).toBe(true);
    const contractual = resolveEurocodeSteelContext(input({
      explicitCalculationContext: designContext({
        jurisdictionProfileRef: "other",
        countryCode: "AE",
        nationalAnnex: annex("AE"),
      }),
    }));
    expect(contractual.ok).toBe(true);
    expect(() =>
      selectSteelAdapter("EU_STEEL", toStructuralStandardContext(designContext({
        jurisdictionProfileRef: "united-kingdom",
        countryCode: "GB",
        nationalAnnex: annex("GB"),
      }))),
    ).not.toThrow();
    expect(() =>
      assertGovernedStandardContext(toStructuralStandardContext(designContext({
        jurisdictionProfileRef: "united-kingdom",
        countryCode: "GB",
        nationalAnnex: annex("GB"),
      }))),
    ).not.toThrow();
  });

  it("does not infer a National Annex from user location and keeps AI advisory-only", () => {
    expect(NATIONAL_ANNEX_INFERRED_FROM_USER_LOCATION).toBe(false);
    expect(AI_EU_STANDARD_ASSISTANCE_ADVISORY_ONLY).toBe(true);
    expect(AI_NATIONAL_ANNEX_AUTHORITY).toBe(false);
    expect(AI_NDP_AUTHORITY).toBe(false);
    expect(AI_STANDARD_CONFORMANCE_AUTHORITY).toBe(false);
    expect(AI_ENGINEERING_APPROVAL).toBe(false);
    expect(EU_AI_NUMERICAL_AUTHORITY).toBe(false);
    expect(() => denyNationalAnnexFromUserLocation("ip")).toThrow(/USER_LOCATION_INFERENCE_DENIED/);
    expect(() => denyNationalAnnexFromUserLocation("locale")).toThrow(/USER_LOCATION_INFERENCE_DENIED/);
    expect(resolveEurocodeSteelContext(input({ source: "browser_locale" })).failReason).toBe("USER_LOCATION_INFERENCE_DENIED");
    expect(() => denyAiNationalAnnexChoice()).toThrow(/cannot choose a National Annex/);
    expect(() => denyAiNdpSupply()).toThrow(/cannot supply NDP/);
    expect(() => denyAiConformanceClaim()).toThrow(/cannot claim Eurocode conformance/);
    expect(() => assertAiEuStandardAssistanceAdvisoryOnly()).not.toThrow();
    expect(resolveEurocodeSteelContext(input({ aiSelectedAnnex: true })).failReason).toBe("AI_AUTHORITY_DENIED");
    expect(resolveEurocodeSteelContext(input({ aiSuppliedNdp: true })).failReason).toBe("AI_AUTHORITY_DENIED");
    expect(resolveEurocodeSteelContext(input({ aiInferredEdition: true })).failReason).toBe("AI_AUTHORITY_DENIED");
    expect(resolveEurocodeSteelContext(input({ aiClaimedConformance: true })).failReason).toBe("AI_AUTHORITY_DENIED");
    expect(() => assertEurocodeRuleAuthority("LLM_MEMORY_ONLY")).toThrow(/RULE_AUTHORITY_DENIED/);
    expect(LLM_MEMORY_ONLY_RULE_ALLOWED).toBe(false);
    expect(() => assertHumanEurocodeConfirmation(null, true)).toThrow(/HUMAN_CONFIRMATION_REQUIRED/);
  });

  it("reuses D1C demand, keeps AUST300 out of EU defaults, and does not create a load engine", () => {
    expect(EU1_LOAD_COMBINATION_ENGINE_CREATED).toBe(false);
    expect(LOAD_FACTOR_PACK_INTERFACES.EU.implemented).toBe(false);
    expect(() => assertD1cDemandEngineReused()).not.toThrow();
    expect(EUROCODE_DEPENDENCY_MODEL.EN_1990).toMatch(/D1C/);
    expect(AUST300_EU_DEFAULT).toBe(false);
    expect(EU_SECTION_CATALOG_ADAPTER.ready).toBe(true);
    expect(EU_SECTION_CATALOG_ADAPTER.implemented).toBe(false);
    expect(EU_SECTION_CATALOG_ADAPTER.defaultCatalog).toBeNull();
    expect(EU_MATERIAL_SOURCE_BOUNDARY.en1993IsUniversalMaterialSource).toBe(false);
    expect(EU_MATERIAL_SOURCE_BOUNDARY.designValuesPopulated).toBe(false);
    expect(() => assertAust300NotEuDefault("AUST300")).toThrow(/not an EU default/);
    expect(EU_STANDARD_SOURCE_REFERENCES).toEqual([]);
    expect(STRUCTURAL_STANDARD_TEXT_EMBEDDED).toBe(false);
    expect(() => assertNoEmbeddedStandardText()).not.toThrow();
    expect(EU_STEEL_CONTEXT_PII_REQUIRED).toBe(false);
    expect(EMPLOYEE_BEHAVIOR_PROFILING).toBe(false);
  });

  it("rejects cross-edition mixing and unsupported parts without implementing design methods", () => {
    expect(CROSS_EDITION_RULE_MIXING_ALLOWED).toBe(false);
    expect(() =>
      assertNoCrossEditionMixing(
        { generationFamily: "FIRST_GENERATION", edition: "A" },
        { generationFamily: "SECOND_GENERATION", edition: "A" },
      ),
    ).toThrow(/STANDARD_VERSION_CONFLICT/);
    const mixed = resolveEurocodeSteelContext(input({
      explicitCalculationContext: designContext({
        version: { ...unknownEurocodeVersion("EN 1993-1-1"), generationFamily: "FIRST_GENERATION" },
        nationalAnnex: annex("DE", { generationFamily: "SECOND_GENERATION" }),
      }),
    }));
    expect(mixed.ok).toBe(false);
    if (!mixed.ok) expect(mixed.failReason).toBe("STANDARD_VERSION_CONFLICT");
    expect(resolveEurocodeSteelContext(input({ requestedPartId: "EN_1993_99_99" })).failReason).toBe("STANDARD_PART_UNSUPPORTED");
    expect(EU_STEEL_DESIGN_AVAILABLE).toBe(false);
    expect(EU_STEEL_PACK_CERTIFIED).toBe(false);
    expect(READY_FOR_EU2_TENSION_ARCHITECTURE).toBe(true);
    expect(STEEL_ADAPTER_BOUNDARIES.EU_STEEL.implemented).toBe(false);
    expect(EU_STEEL_IMPLEMENTATION_SUBPHASES[0]).toMatch(/EU-1/);
  });

  it("does not regress AU validation or change the US adapter, and keeps the global core jurisdiction-neutral", () => {
    expect(AU_METHOD_VALIDATION_INVENTORY).toHaveLength(18);
    expect(AU_STEEL_VALIDATION_MATRIX).toHaveLength(11);
    expect(IMPLEMENTED_INTERACTION_METHODS).toEqual([]);
    expect(STEEL_ADAPTER_BOUNDARIES.AU_STEEL.implemented).toBe(true);
    expect(STEEL_ADAPTER_BOUNDARIES.US_STEEL.implemented).toBe(false);
    expect(US_STEEL_IMPLEMENTATION_SUBPHASES[0]).toMatch(/US-1/);
    expect(EU_ONLY_STEEL_CORE).toBe(false);
    expect(isGlobalFirstArchitecture()).toBe(true);
    expect(disciplineMaturity("structural")).toBe("REFERENCE_PARTIALLY_IMPLEMENTED");
    expect(A15A_V5_FEATURE_FREEZE.spaceGassRealSolverExecution).toBe("NOT_CERTIFIED");
    expect(SCHEMA_CHANGE_REQUIRED_FOR_EU1).toBe(false);
    expect(D1D_EU1_D0_RISK_DISPOSITION.CLOSED).toEqual([]);
    expect(D1D_EU1_D0_RISK_DISPOSITION.REDUCED).toEqual(["D0-R03", "D0-R05"]);
    const euBound = toStructuralStandardContext(designContext({ nationalAnnex: annex("DE") }));
    expect(() => selectSteelAdapter("EU_STEEL", euBound)).not.toThrow();
    expect(evaluateSteelCapacity({
      adapterId: "EU_STEEL",
      designContext: {
        designContextId: "dc-eu",
        memberRef: "m1",
        sectionRef: "sec-1",
        materialRef: "mat-1",
        demandRefs: ["d1"],
        standardContextRef: euBound.contextId,
        parameterSetRef: null,
        effectiveLengthContextRef: null,
        restraintContextRef: null,
        stabilityContextRef: null,
        fabricationContextRef: null,
        evidenceRefs: [],
        toolRef: "EOS_STRUCTURAL_DETERMINISTIC_V1",
        methodRef: "STEEL_DESIGN_FRAMEWORK",
        provenanceRef: governedProvenance({ jurisdiction: "eu-eea", standard: "EN 1993-1-1" }),
        validationState: "FRAMEWORK_ONLY",
        reviewState: "required",
      },
      standardContext: euBound,
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
        jurisdictionApplicability: ["eu-eea"],
      },
      section: {
        sectionRef: "sec-1",
        sectionFamily: "IPE",
        catalogSource: "UNBOUND",
        catalogVersion: null,
        jurisdictionApplicability: ["eu-eea"],
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
        standardContext: euBound,
        inputEvidenceRefs: [],
        combinationId: null,
      },
      limitState: "SHEAR",
      requiredProperties: [],
    }).implemented).toBe(false);
  });

  it("contains no copyrighted Eurocode PDFs and no EU numerical design values in the global steel core", () => {
    const scoped = [
      join(repoRoot, "docs", "architecture", "engineering-os"),
      join(repoRoot, "packages", "engineering-os", "src", "structural-steel"),
      join(repoRoot, "packages", "types", "src"),
    ];
    const files = scoped.flatMap((dir) => walkNames(dir));
    const pdfs = files.filter((path) => path.toLowerCase().endsWith(".pdf"));
    expect(pdfs.filter((path) => /en\s*1993|eurocode|national.?annex/i.test(path))).toEqual([]);
    const core = ["adapters.ts", "properties.ts", "orchestrate.ts"].map((name) => readFileSync(join(here, name), "utf8")).join("\n");
    expect(core).not.toMatch(/gamma_M0|γM0|chi_LT|buckling curve a0|EN 1993-1-1 clause/i);
    expect(readFileSync(join(here, "eu-standard", "annex.ts"), "utf8")).not.toMatch(/value:\s*1\.0/);
  });
});
