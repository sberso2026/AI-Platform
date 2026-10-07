import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AI_EN1992_EDITION_AUTHORITY,
  AI_ENGINEERING_APPROVAL,
  AI_EU_CONCRETE_CODE_CAPACITY_AUTHORITY,
  AI_EU_CONCRETE_NATIONAL_ANNEX_AUTHORITY,
  AI_EU_CONCRETE_NDP_AUTHORITY,
  AI_EU_CONCRETE_STANDARD_ASSISTANCE_ADVISORY_ONLY,
  AI_EU_CONCRETE_STANDARD_CONFORMANCE_AUTHORITY,
  AI_PARTIAL_FACTOR_AUTHORITY,
  AU_CONCRETE_PARAMETER_LEAKAGE_INTO_EU,
  AU_CONCRETE_STANDARD_FAMILY_BOUND,
  COPYRIGHTED_EN1992_TEXT_COMMITTED,
  CROSS_GENERATION_RULE_MIXING_ALLOWED,
  D1E_EU1_SCOPE_CONFIRMED,
  DEFAULT_EU_CONCRETE_NATIONAL_ANNEX,
  DEFAULT_EU_CONCRETE_COVER,
  DEFAULT_EU_CONCRETE_CARBON_FACTOR,
  DEFAULT_EU_CONCRETE_COST_RATE,
  DEFAULT_EU_CREEP_MODEL,
  DEFAULT_EU_LAP_LENGTH,
  DEFAULT_EU_REINFORCEMENT_CARBON_FACTOR,
  DEFAULT_EU_SHRINKAGE_MODEL,
  EOS_D1E_EU1_CLOSED,
  EU_CONCRETE_FIRE_DESIGN_IMPLEMENTED,
  EU_CONCRETE_GRADE_AUTOMATICALLY_GENERATES_PROPERTIES,
  EU_CONCRETE_IMPLEMENTATION_MATURITY,
  EU_CONCRETE_NATIONAL_ANNEX_INFERRED_FROM_USER_LOCATION,
  EU_CONCRETE_NDP_VALUE_GUESSED,
  EU_CONCRETE_PACK_CERTIFIED,
  EU_CONCRETE_PARAMETER_LEAKAGE_INTO_AU,
  EU_CONCRETE_PARAMETER_LEAKAGE_INTO_COMMON,
  EU_CONCRETE_PARTIAL_FACTOR_GUESSED,
  EU_CONCRETE_PRODUCT_CLAIM_LEVEL,
  EU_CONCRETE_SEISMIC_DESIGN_IMPLEMENTED,
  EU_CONCRETE_STANDARD_AMENDMENT_STATE,
  EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
  EU_CONCRETE_STANDARD_EDITION,
  EU_CONCRETE_STANDARD_FAMILY_BOUND,
  EU_CONCRETE_STRAIN_LIMIT_GUESSED,
  EU_CONCRETE_STRESS_BLOCK_PARAMETER_GUESSED,
  EU_HIGH_WATER_MARK_INHERITED,
  EUROCODE_CONCRETE_NOT_HARDCODED_TO_EU_MEMBERSHIP,
  GEOMETRIC_CLEARANCE_EQUALS_EN1992_COVER_COMPLIANCE,
  IMPLEMENTED_EU_CONCRETE_CODE_FLEXURE_METHODS,
  NUMERICAL_EU_CONCRETE_SHEAR_IMPLEMENTED,
  NUMERICAL_EU_PUNCHING_SHEAR_IMPLEMENTED,
  PARALLEL_EU_CONCRETE_STANDARD_FRAMEWORK_CREATED,
  PARALLEL_EU_RC_SECTION_KERNEL_CREATED,
  PARALLEL_CAPABILITY_MANIFEST_CREATED,
  PARALLEL_EU_CONCRETE_NEUTRAL_AXIS_SOLVER_CREATED,
  PARALLEL_EU_CONCRETE_SECTION_INTEGRATOR_CREATED,
  RECOMMENDED_D1E_NEXT_PHASE,
  RECOMMENDED_D1E_NEXT_PHASE_SCOPE,
  SCHEMA_CHANGE_REQUIRED_FOR_D1E_EU1,
  SILENT_EN1992_EDITION_INFERENCE,
  STANDARD_TEXT_REQUIRED_BY_RUNTIME,
  STEEL_STABILITY_RULE_REUSED_FOR_EU_CONCRETE,
  type ConcreteMaterial,
  type EurocodeConcreteProjectContext,
  type EurocodeNationalAnnex,
  type ReinforcementLayout,
  type ReinforcementMaterial,
} from "@rtb/types";
import { disciplineMaturity } from "../discipline-capability";
import { isEuOnlyArchitecture, isGlobalFirstArchitecture } from "../global-governance";
import { createConfiguredKnowledgeContext, exampleEurocodeAnnex } from "../structural-domain/binding";
import { governedProvenance } from "../structural-domain/catalog";
import { D1D_CAPABILITY_MANIFEST, STEEL_ADAPTER_BOUNDARIES } from "../structural-steel";
import {
  AU_CONCRETE_FLEXURE_METHODS,
  AU_STRESS_BLOCK_RULE,
  CONCRETE_ADAPTER_BOUNDARIES,
  CONCRETE_CAPABILITY_MANIFEST,
  D1E_EU1_D0_RISK_DISPOSITION,
  D1E_INTERNAL_ROADMAP,
  D1E_VALIDATION_DEBT_REGISTER,
  EN1992_PART_CATALOG,
  EU_CONCRETE_FLEXURE_PROFILE,
  EU_CONCRETE_MATERIAL_CATALOG,
  EU_CONCRETE_MATERIAL_RESPONSE_ADAPTER,
  EU_CONCRETE_PARTIAL_FACTOR_DEPENDENCY,
  EU_CONCRETE_STRAIN_LIMIT_DEPENDENCY,
  EU_CONCRETE_STRESS_BLOCK_DEPENDENCY,
  EU_REINFORCEMENT_CATALOG,
  GOVERNED_EU_CONCRETE_NDP_CATALOG,
  IMPLEMENTED_AU_CONCRETE_CODE_FLEXURE_METHODS,
  STRUCTURAL_CAPABILITY_MANIFEST,
  assertAiEuConcreteAssistanceAdvisoryOnly,
  assertEuConcreteOptimizerRejectsUndetermined,
  assertEuConcreteReusesD1e1Kernel,
  assertMultiCountryEuConcreteContexts,
  assertNoCrossGenerationMixing,
  bindEn1992ConcreteFamily,
  bindEuConcreteStandardFamily,
  denyAiEuConcreteConformanceClaim,
  denyAiEuConcreteNationalAnnexChoice,
  denyAiEuConcreteNdpSupply,
  denyEuConcreteAnnexFromUserLocation,
  emptyResolverInput,
  euConcreteMtoHandoff,
  geometricClearances,
  historicalEuConcreteContextRemainsReproducible,
  rectangleSection,
  resolveEn1992Part,
  resolveEuConcreteCatalogGrade,
  resolveEurocodeConcreteContext,
  screenEuRcCandidate,
  snapshotIssuedEuConcreteContext,
} from "./index";

const here = dirname(fileURLToPath(import.meta.url));

function provenance() {
  return governedProvenance({ jurisdiction: "eu-eea", standard: "EN 1992", version: "d1e-eu1" });
}

function annex(country: string, overrides: Partial<EurocodeNationalAnnex> = {}): EurocodeNationalAnnex {
  return {
    nationalAnnexId: `NA-${country}-EN1992-1-1`,
    countryCode: country,
    standardPartRef: "EN_1992_1_1",
    edition: "UNKNOWN_PENDING_CONFIRMATION",
    publicationDate: null,
    amendment: null,
    effectiveDate: null,
    status: "FRAMEWORK_ONLY",
    nationalParameterSetRef: `NDP-${country}-EN1992-1-1`,
    sourceAuthorityRef: "project-declared-annex-metadata",
    validationState: "FRAMEWORK_ONLY",
    generationFamily: "UNKNOWN_PENDING_CONFIRMATION",
    ...overrides,
  };
}

function project(country: string, overrides: Partial<EurocodeConcreteProjectContext> = {}): EurocodeConcreteProjectContext {
  return {
    projectRef: `proj-${country}`,
    tenantId: "tenant-1",
    workspaceId: "ws-1",
    jurisdictionProfileRef: "eu-eea",
    countryCode: country,
    standardFamily: "EN 1992",
    standardGeneration: "UNKNOWN_PENDING_CONFIRMATION",
    standardEdition: "UNKNOWN_PENDING_CONFIRMATION",
    amendmentState: "UNKNOWN_PENDING_CONFIRMATION",
    standardPartRefs: ["EN_1992_1_1"],
    nationalAnnexRef: `NA-${country}-EN1992-1-1`,
    nationalAnnexSet: [annex(country)],
    ndpSetRef: `NDP-${country}-EN1992-1-1`,
    ndpSet: [],
    concreteMaterialStandardRefs: ["EN 206"],
    reinforcementMaterialStandardRefs: ["EN 10080"],
    loadStandardContextRef: "EN 1990/EN 1991",
    durabilityContextRef: null,
    serviceabilityContextRef: null,
    projectOverrideRefs: [],
    authorityRefs: ["VALIDATED_ENGINEERING_REFERENCE"],
    technicalBasisRefs: ["d1e-eu1-standard-binding"],
    provenance: provenance(),
    validationState: "STANDARD_BINDING_FRAMEWORK",
    conformanceState: "INTENDED_PROFILE",
    workspaceGlobalAnnexId: null,
    statutoryEuMembershipRequired: false,
    statutoryEuComplianceClaimed: false,
    internationalContractualUse: false,
    ...overrides,
  };
}

function governed(name: string, value: number, unit: string) {
  return { name, value, unit, provenanceRef: "cert-1", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" as const };
}

function concrete(): ConcreteMaterial {
  return {
    materialRef: "c1",
    designation: "C30/37",
    compressiveStrength: governed("fc", 30, "MPa"),
    tensileStrength: null,
    elasticModulus: governed("E", 33000, "MPa"),
    density: null,
    poissonRatio: null,
    age: null,
    strengthReferenceAge: null,
    materialClass: null,
    materialStandardRef: "EN 206",
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
    designation: "B500B",
    yieldStrength: governed("fy", 500, "MPa"),
    ultimateStrength: null,
    elasticModulus: governed("Es", 200000, "MPa"),
    ductilityClass: "B",
    productStandardRef: "EN 10080",
    sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE",
    version: "1",
    provenance: provenance(),
  };
}

function emptyLayout(): ReinforcementLayout {
  return { layoutId: "L0", bars: [], groups: [], layers: [], transverse: [], provenanceRef: "p" };
}

function twoBarLayout(): ReinforcementLayout {
  return {
    layoutId: "L1",
    bars: [
      { barId: "b1", designation: "H16", diameterMm: governed("d", 16, "mm"), areaMm2: governed("a", 201, "mm2"), count: 1, xMm: 50, yMm: 50, layerId: null, face: "bottom", direction: null, spacingMm: null, groupId: null, materialRef: "s1", anchorageMetadata: null, lapMetadata: null, provenanceRef: "p" },
      { barId: "b2", designation: "H16", diameterMm: governed("d", 16, "mm"), areaMm2: governed("a", 201, "mm2"), count: 1, xMm: 250, yMm: 50, layerId: null, face: "bottom", direction: null, spacingMm: null, groupId: null, materialRef: "s1", anchorageMetadata: null, lapMetadata: null, provenanceRef: "p" },
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

describe("EOS-D1E-EU-1 Eurocode concrete standard binding", () => {
  it("binds EN 1992 family/part/generation without inferring edition or defaulting an annex", () => {
    expect(D1E_EU1_SCOPE_CONFIRMED).toBe(true);
    expect(EU_CONCRETE_STANDARD_FAMILY_BOUND).toBe(true);
    expect(bindEn1992ConcreteFamily().familyId).toBe("EN_1992");
    expect(resolveEn1992Part("EN_1992_1_1").initialGeneralDesignPart).toBe(true);
    expect(EN1992_PART_CATALOG.every((row) => row.numericalImplemented === false)).toBe(true);
    expect(EU_CONCRETE_STANDARD_EDITION).toBe("UNKNOWN_PENDING_CONFIRMATION");
    expect(EU_CONCRETE_STANDARD_AMENDMENT_STATE).toBe("UNKNOWN_PENDING_CONFIRMATION");
    expect(SILENT_EN1992_EDITION_INFERENCE).toBe(false);
    expect(DEFAULT_EU_CONCRETE_NATIONAL_ANNEX).toBe(false);
    expect(EU_CONCRETE_NATIONAL_ANNEX_INFERRED_FROM_USER_LOCATION).toBe(false);
    expect(EU_CONCRETE_STANDARD_CONFORMANCE_STATE).toBe("INTENDED_PROFILE");
    expect(EU_CONCRETE_PACK_CERTIFIED).toBe(false);
    expect(EU_CONCRETE_IMPLEMENTATION_MATURITY).toBe("FRAMEWORK_PLUS_COMMON_MECHANICS");
    expect(EU_CONCRETE_PRODUCT_CLAIM_LEVEL).toBe("EU_CONCRETE_MECHANICS_REFERENCE_CAPABILITY");
    expect(IMPLEMENTED_EU_CONCRETE_CODE_FLEXURE_METHODS).toBe("NONE");
    expect(PARALLEL_EU_CONCRETE_STANDARD_FRAMEWORK_CREATED).toBe(false);
    expect(EUROCODE_CONCRETE_NOT_HARDCODED_TO_EU_MEMBERSHIP).toBe(true);
    const uk = createConfiguredKnowledgeContext({
      contextId: "ctx-uk-en1992",
      jurisdictionProfileRef: "united-kingdom",
      standardFamily: "EN",
      standardCode: "EN 1992",
      edition: "UNKNOWN_PENDING_CONFIRMATION",
      materialScope: "concrete",
    });
    bindEuConcreteStandardFamily(uk);
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "D1E-EU")?.status).toBe("CLOSED");
    expect(D1E_INTERNAL_ROADMAP.some((row) => row.id === RECOMMENDED_D1E_NEXT_PHASE)).toBe(true);
    expect(RECOMMENDED_D1E_NEXT_PHASE_SCOPE.length).toBeGreaterThan(0);
    expect(EOS_D1E_EU1_CLOSED).toBe(true);
    expect(SCHEMA_CHANGE_REQUIRED_FOR_D1E_EU1).toBe(false);
    expect(disciplineMaturity("structural")).toBe("REFERENCE_PARTIALLY_IMPLEMENTED");
  });

  it("isolates multi-country, UK, international, and second-generation contexts", () => {
    const de = resolveEurocodeConcreteContext(emptyResolverInput({ projectContext: project("DE"), ruleRequiresNdp: false }));
    const fr = resolveEurocodeConcreteContext(emptyResolverInput({ projectContext: project("FR"), ruleRequiresNdp: false }));
    expect(de.ok).toBe(true);
    expect(fr.ok).toBe(true);
    if (!de.ok || !fr.ok) throw new Error("expected resolved contexts");
    expect(de.context.nationalAnnex?.nationalAnnexId).toBe("NA-DE-EN1992-1-1");
    expect(fr.context.nationalAnnex?.nationalAnnexId).toBe("NA-FR-EN1992-1-1");
    expect(de.context.nationalAnnex?.nationalAnnexId).not.toBe(fr.context.nationalAnnex?.nationalAnnexId);
    assertMultiCountryEuConcreteContexts([de.context, fr.context]);
    const uk = resolveEurocodeConcreteContext(emptyResolverInput({
      projectContext: project("GB", { jurisdictionProfileRef: "united-kingdom", nationalAnnexSet: [annex("GB")] }),
    }));
    expect(uk.ok).toBe(true);
    if (!uk.ok) throw new Error("expected UK context");
    expect(uk.context.jurisdictionProfileRef).toBe("united-kingdom");
    expect(uk.context.statutoryEuMembershipRequired).toBe(false);
    const intl = resolveEurocodeConcreteContext(emptyResolverInput({
      projectContext: project("SG", {
        jurisdictionProfileRef: "other",
        internationalContractualUse: true,
        nationalAnnexSet: [annex("SG")],
      }),
    }));
    expect(intl.ok).toBe(true);
    if (!intl.ok) throw new Error("expected international context");
    expect(intl.context.internationalContractualUse).toBe(true);
    expect(intl.context.statutoryEuComplianceClaimed).toBe(false);
    expect(intl.context.jurisdictionProfileRef).not.toBe("eu-eea");
    const first = resolveEurocodeConcreteContext(emptyResolverInput({
      projectContext: project("DE", { standardGeneration: "FIRST_GENERATION", nationalAnnexSet: [annex("DE", { generationFamily: "FIRST_GENERATION" })] }),
    }));
    const second = resolveEurocodeConcreteContext(emptyResolverInput({
      projectContext: project("DE", {
        projectRef: "proj-DE-g2",
        standardGeneration: "SECOND_GENERATION",
        nationalAnnexSet: [annex("DE", { generationFamily: "SECOND_GENERATION" })],
      }),
    }));
    expect(first.ok && second.ok).toBe(true);
    if (!first.ok || !second.ok) throw new Error("expected generation contexts");
    expect(CROSS_GENERATION_RULE_MIXING_ALLOWED).toBe(false);
    expect(() => assertNoCrossGenerationMixing(first.context.version, second.context.version)).toThrow(/generation/i);
    const mismatch = resolveEurocodeConcreteContext(emptyResolverInput({
      projectContext: project("DE", { standardGeneration: "FIRST_GENERATION", nationalAnnexSet: [annex("DE", { generationFamily: "SECOND_GENERATION" })] }),
    }));
    expect(mismatch.ok).toBe(false);
    if (mismatch.ok) throw new Error("expected generation mismatch");
    expect(mismatch.failReason).toBe("STANDARD_VERSION_CONFLICT");
    expect(mismatch.checkState).toBe("CHECK_UNDETERMINED");
  });

  it("fails closed on location inference, missing annex/NDP, AI authority, and stale historical rewrite", () => {
    expect(resolveEurocodeConcreteContext(emptyResolverInput({ source: "locale", projectContext: project("DE") })).failReason).toBe("USER_LOCATION_INFERENCE_DENIED");
    expect(resolveEurocodeConcreteContext(emptyResolverInput({ source: "ip" })).failReason).toBe("USER_LOCATION_INFERENCE_DENIED");
    expect(() => denyEuConcreteAnnexFromUserLocation("ui_location")).toThrow(/USER_LOCATION_INFERENCE_DENIED/);
    const located = resolveEurocodeConcreteContext(emptyResolverInput({
      projectContext: project("DE"),
      uiLocation: "Berlin",
    }));
    expect(located.ok).toBe(true);
    const missingAnnex = resolveEurocodeConcreteContext(emptyResolverInput({
      projectContext: project("DE", { nationalAnnexSet: [], nationalAnnexRef: null }),
      ruleRequiresNdp: true,
      requiredNdpIds: ["gamma_c"],
    }));
    expect(missingAnnex.ok).toBe(false);
    if (missingAnnex.ok) throw new Error("expected missing annex");
    expect(missingAnnex.failReason).toBe("NATIONAL_ANNEX_REQUIRED");
    expect(missingAnnex.checkState).toBe("CHECK_UNDETERMINED");
    const missingNdp = resolveEurocodeConcreteContext(emptyResolverInput({
      projectContext: project("DE"),
      ruleRequiresNdp: true,
      requiredNdpIds: ["gamma_c"],
    }));
    expect(missingNdp.ok).toBe(false);
    if (missingNdp.ok) throw new Error("expected missing NDP");
    expect(["NDP_REQUIRED", "NATIONAL_ANNEX_REQUIRED"]).toContain(missingNdp.failReason);
    expect(resolveEurocodeConcreteContext(emptyResolverInput({ aiSelectedAnnex: true })).failReason).toBe("AI_AUTHORITY_DENIED");
    expect(resolveEurocodeConcreteContext(emptyResolverInput({ aiSuppliedNdp: true })).failReason).toBe("AI_AUTHORITY_DENIED");
    expect(resolveEurocodeConcreteContext(emptyResolverInput({ aiInferredEdition: true })).failReason).toBe("AI_AUTHORITY_DENIED");
    expect(resolveEurocodeConcreteContext(emptyResolverInput({ aiClaimedConformance: true })).failReason).toBe("AI_AUTHORITY_DENIED");
    expect(resolveEurocodeConcreteContext(emptyResolverInput({ ruleAuthorityType: "LLM_MEMORY_ONLY" })).failReason).toBe("RULE_AUTHORITY_DENIED");
    expect(resolveEurocodeConcreteContext(emptyResolverInput({ requestedPartId: "EN_1992_99" })).failReason).toBe("STANDARD_PART_UNSUPPORTED");
    const issued = resolveEurocodeConcreteContext(emptyResolverInput({ projectContext: project("DE") }));
    expect(issued.ok).toBe(true);
    if (!issued.ok) throw new Error("expected issued seed");
    const frozen = snapshotIssuedEuConcreteContext(issued.context);
    const later = historicalEuConcreteContextRemainsReproducible(
      frozen,
      project("FR", { standardGeneration: "SECOND_GENERATION", standardEdition: "2023" }),
    );
    expect(later.countryCode).toBe("DE");
    expect(later.version.generationFamily).toBe(frozen.version.generationFamily);
    expect(later.issued).toBe(true);
    expect(() => denyAiEuConcreteNationalAnnexChoice()).toThrow(/National Annex/);
    expect(() => denyAiEuConcreteNdpSupply()).toThrow(/NDP/);
    expect(() => denyAiEuConcreteConformanceClaim()).toThrow(/conformance/);
  });

  it("reuses the D1E-1 kernel and keeps code parameters unpopulated", () => {
    assertEuConcreteReusesD1e1Kernel();
    expect(PARALLEL_EU_RC_SECTION_KERNEL_CREATED).toBe(false);
    expect(PARALLEL_EU_CONCRETE_SECTION_INTEGRATOR_CREATED).toBe(false);
    expect(PARALLEL_EU_CONCRETE_NEUTRAL_AXIS_SOLVER_CREATED).toBe(false);
    expect(GEOMETRIC_CLEARANCE_EQUALS_EN1992_COVER_COMPLIANCE).toBe(false);
    expect(geometricClearances(twoBarLayout(), rectangleSection("r", 300, 500, "p"))[0]?.codeCoverCompliance).toBe(false);
    expect(EU_CONCRETE_STRESS_BLOCK_DEPENDENCY.parameters.eta.value).toBeNull();
    expect(EU_CONCRETE_STRESS_BLOCK_DEPENDENCY.parameters.lambda.value).toBeNull();
    expect(EU_CONCRETE_STRAIN_LIMIT_DEPENDENCY.ultimateConcreteStrain.value).toBeNull();
    expect(EU_CONCRETE_PARTIAL_FACTOR_DEPENDENCY.concreteMaterial.value).toBeNull();
    expect(EU_CONCRETE_MATERIAL_RESPONSE_ADAPTER.numericalImplemented).toBe(false);
    expect(EU_CONCRETE_FLEXURE_PROFILE.numericalImplemented).toBe(false);
    expect(EU_CONCRETE_NDP_VALUE_GUESSED).toBe(false);
    expect(EU_CONCRETE_STRESS_BLOCK_PARAMETER_GUESSED).toBe(false);
    expect(EU_CONCRETE_STRAIN_LIMIT_GUESSED).toBe(false);
    expect(EU_CONCRETE_PARTIAL_FACTOR_GUESSED).toBe(false);
    expect(GOVERNED_EU_CONCRETE_NDP_CATALOG).toEqual([]);
    expect(EU_CONCRETE_MATERIAL_CATALOG.populated).toBe(false);
    expect(EU_REINFORCEMENT_CATALOG.defaultNationalCatalog).toBeNull();
    expect(() => resolveEuConcreteCatalogGrade("C30/37")).toThrow(/catalog unpopulated/i);
    expect(EU_CONCRETE_GRADE_AUTOMATICALLY_GENERATES_PROPERTIES).toBe(false);
    expect(NUMERICAL_EU_CONCRETE_SHEAR_IMPLEMENTED).toBe(false);
    expect(NUMERICAL_EU_PUNCHING_SHEAR_IMPLEMENTED).toBe(false);
    expect(DEFAULT_EU_CREEP_MODEL).toBe(false);
    expect(DEFAULT_EU_SHRINKAGE_MODEL).toBe(false);
    expect(DEFAULT_EU_CONCRETE_COVER).toBe(false);
    expect(DEFAULT_EU_LAP_LENGTH).toBe(false);
    expect(STEEL_STABILITY_RULE_REUSED_FOR_EU_CONCRETE).toBe(false);
    expect(EU_CONCRETE_FIRE_DESIGN_IMPLEMENTED).toBe(false);
    expect(EU_CONCRETE_SEISMIC_DESIGN_IMPLEMENTED).toBe(false);
    const ctx = resolveEurocodeConcreteContext(emptyResolverInput({ projectContext: project("DE") }));
    expect(ctx.ok).toBe(true);
    if (!ctx.ok) throw new Error("expected context");
    expect(screenEuRcCandidate({ geometry: rectangleSection("r", 300, 500, "p"), layout: twoBarLayout(), concrete: concrete(), reinforcement: reo(), standardContext: ctx.context }).accepted).toBe(true);
    expect(() => screenEuRcCandidate({
      geometry: rectangleSection("r", 300, 500, "p"),
      layout: twoBarLayout(),
      concrete: concrete(),
      reinforcement: reo(),
      standardContext: ctx.context,
      generativeSelectedAnnex: true,
    })).toThrow(/National Annex/);
    expect(() => assertEuConcreteOptimizerRejectsUndetermined("CHECK_UNDETERMINED")).toThrow(/undetermined/i);
    expect(euConcreteMtoHandoff({ geometry: rectangleSection("r", 300, 500, "p"), layout: twoBarLayout() }).emissionFactorEmbedded).toBe(false);
    expect(DEFAULT_EU_CONCRETE_COST_RATE).toBe(false);
    expect(DEFAULT_EU_CONCRETE_CARBON_FACTOR).toBe(false);
    expect(DEFAULT_EU_REINFORCEMENT_CARBON_FACTOR).toBe(false);
  });

  it("preserves AU/steel regression, leakage boundaries, AI limits, debt, and copyright", () => {
    expect(AU_CONCRETE_STANDARD_FAMILY_BOUND).toBe(true);
    expect(IMPLEMENTED_AU_CONCRETE_CODE_FLEXURE_METHODS).toBe("NONE");
    expect(AU_STRESS_BLOCK_RULE.parameters).toBeNull();
    expect(AU_CONCRETE_FLEXURE_METHODS.length).toBeGreaterThan(0);
    expect(AU_CONCRETE_PARAMETER_LEAKAGE_INTO_EU).toBe(false);
    expect(EU_CONCRETE_PARAMETER_LEAKAGE_INTO_AU).toBe(false);
    expect(EU_CONCRETE_PARAMETER_LEAKAGE_INTO_COMMON).toBe(false);
    expect(exampleEurocodeAnnex().standardCode).toMatch(/EN 1993/);
    expect(STEEL_ADAPTER_BOUNDARIES.EU_STEEL.ready).toBe(true);
    expect(STEEL_ADAPTER_BOUNDARIES.AU_STEEL.implemented).toBe(true);
    expect(CONCRETE_ADAPTER_BOUNDARIES.EU_CONCRETE.implemented).toBe(false);
    expect(CONCRETE_ADAPTER_BOUNDARIES.AU_CONCRETE.implemented).toBe(false);
    expect(AI_EU_CONCRETE_STANDARD_ASSISTANCE_ADVISORY_ONLY).toBe(true);
    expect(AI_EN1992_EDITION_AUTHORITY).toBe(false);
    expect(AI_EU_CONCRETE_NATIONAL_ANNEX_AUTHORITY).toBe(false);
    expect(AI_EU_CONCRETE_NDP_AUTHORITY).toBe(false);
    expect(AI_PARTIAL_FACTOR_AUTHORITY).toBe(false);
    expect(AI_EU_CONCRETE_CODE_CAPACITY_AUTHORITY).toBe(false);
    expect(AI_EU_CONCRETE_STANDARD_CONFORMANCE_AUTHORITY).toBe(false);
    expect(AI_ENGINEERING_APPROVAL).toBe(false);
    assertAiEuConcreteAssistanceAdvisoryOnly();
    expect(D1E_EU1_D0_RISK_DISPOSITION.CLOSED).toBe("NONE");
    expect(D1E_VALIDATION_DEBT_REGISTER.some((row) => row.debtId === "D1E-EU-VD-NDP")).toBe(true);
    expect(CONCRETE_CAPABILITY_MANIFEST.some((row) => row.capabilityId === "D1E.EU.STANDARD_CONTEXT")).toBe(true);
    expect(PARALLEL_CAPABILITY_MANIFEST_CREATED).toBe(false);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.length).toBeGreaterThan(D1D_CAPABILITY_MANIFEST.length);
    expect(isGlobalFirstArchitecture()).toBe(true);
    expect(isEuOnlyArchitecture()).toBe(false);
    expect(EU_HIGH_WATER_MARK_INHERITED).toBe(true);
    expect(STANDARD_TEXT_REQUIRED_BY_RUNTIME).toBe(false);
    expect(COPYRIGHTED_EN1992_TEXT_COMMITTED).toBe(false);
    const corpus = `${readTree(join(here, "eu-standard"))}\n${readFileSync(join(here, "../../../../docs/architecture/engineering-os/EOS_D1E_EU1_CONCRETE_STANDARD_BINDING.md"), "utf8")}`;
    for (const pattern of [/is EN 1992 compliant/i, /γc\s*=\s*1\.5/, /eta\s*=\s*1\.0/, /lambda\s*=\s*0\.8/, /CONCRETE_PACK_CERTIFIED\s*=\s*true/i]) {
      expect(corpus).not.toMatch(pattern);
    }
  });
});
