import { describe, expect, it } from "vitest";
import {
  AI_STANDARD_INTERPRETATION_AUTHORITY,
  AI_STANDARD_SELECTION_ADVISORY_ONLY,
  CONFIGURED_STANDARD_EQUALS_IMPLEMENTED_ENGINE,
  EOS_EU_ONLY_ARCHITECTURE,
  EU_SPECIFIC_METADATA_CONDITIONAL,
  GENERIC_ENGINE_HARDCODES_NATIONAL_VALUES,
  GLOBAL_JURISDICTION_FRAMEWORK_REUSED,
  IMPLEMENTED_ENGINE_EQUALS_CERTIFIED_ENGINE,
  PARALLEL_STANDARD_CONTEXT_REMAINS,
  PARALLEL_STRUCTURAL_JURISDICTION_FRAMEWORK,
  PROFESSIONAL_AUTHORITY_PROFILE_EXTENSIBILITY,
  SILENT_JURISDICTION_INFERENCE_ALLOWED,
  STANDARD_CONTENT_LICENSING_BOUNDARY,
  STRUCTURAL_STANDARD_TEXT_EMBEDDED,
  SYNTHETIC_UDL_ENGINE_DESIGN_CODE_CERTIFIED,
  TOOL_AVAILABILITY_EQUALS_CERTIFICATION,
  type StructuralProjectStandardDefaults,
  type StructuralStandardContext,
} from "@rtb/types";
import { disciplineMaturity } from "../discipline-capability";
import { EOS_JURISDICTION_PROFILES, isGlobalFirstArchitecture } from "../global-governance";
import { buildDefaultDisciplineProfile } from "../discipline-intelligence/profile-defaults";
import { crusherStructuralStandards } from "../work-generator/structural/fixture";
import { STRUCTURAL_SOLVER_BOUNDARY } from "../work-generator/structural/freeze";
import {
  applyProjectDefaultOverride,
  assertAiStandardSuggestion,
  assertConfiguredIsNotEngine,
  assertGlobalFirstBindingArchitecture,
  assertGovernedResultBinding,
  assertGovernedStandardContext,
  assertHumanStandardConfirmation,
  assertJurisdictionExplicit,
  assertLegacySupersededPolicy,
  assertMultiStandardProject,
  assertNoHardcodedNationalValues,
  assertToolScope,
  createConfiguredKnowledgeContext,
  createGovernedCalculationBinding,
  createSyntheticStaticsContext,
  D1B_CLOSED_GAPS,
  D1B_D0_RISK_DISPOSITION,
  D1B_RISK_ALLOCATION,
  detectStandardContextConflicts,
  emptyStandardContext,
  exampleEurocodeAnnex,
  JURISDICTION_PARAMETER_SET_ARCHITECTURE,
  nationalAnnexRequired,
  resolveGovernedBinding,
  snapshotIssuedContext,
  STRUCTURAL_PROFESSIONAL_AUTHORITY_EXTENSIBILITY,
  STRUCTURAL_STANDARD_PACKS,
  SYNTHETIC_UDL_TOOL_SCOPE,
  toStandardContextRef,
} from "./index";

const defaults: StructuralProjectStandardDefaults = {
  tenantId: "tenant-a",
  workspaceId: "ws-a",
  projectId: "proj-1",
  defaultJurisdictionProfile: "australia",
  defaultStructuralStandardsProfile: "au-configured",
};

function eurocodeContext(annex = true): StructuralStandardContext {
  const base = createConfiguredKnowledgeContext({
    contextId: "ctx-en1993",
    jurisdictionProfileRef: "eu-eea",
    standardFamily: "EN",
    standardCode: "EN 1993-1-1",
    edition: "2005",
    materialScope: "steel",
  });
  return {
    ...base,
    calculationScope: "governed-design-check",
    nationalAnnexRef: annex ? exampleEurocodeAnnex() : null,
  };
}

describe("EOS-D1B structural standard binding", () => {
  it("reuses the global jurisdiction framework and does not create a parallel Structural one", () => {
    expect(GLOBAL_JURISDICTION_FRAMEWORK_REUSED).toBe(true);
    expect(PARALLEL_STRUCTURAL_JURISDICTION_FRAMEWORK).toBe(false);
    expect(EOS_JURISDICTION_PROFILES.some((row) => row.jurisdictionId === "australia")).toBe(true);
    expect(isGlobalFirstArchitecture()).toBe(true);
    expect(EOS_EU_ONLY_ARCHITECTURE).toBe(false);
    expect(EU_SPECIFIC_METADATA_CONDITIONAL).toBe(true);
    expect(() => assertGlobalFirstBindingArchitecture()).not.toThrow();
    expect(disciplineMaturity("structural")).toBe("REFERENCE_PARTIALLY_IMPLEMENTED");
  });

  it("requires explicit jurisdiction and forbids silent locale inference", () => {
    expect(SILENT_JURISDICTION_INFERENCE_ALLOWED).toBe(false);
    expect(() => assertJurisdictionExplicit(null, "explicit")).toThrow(/explicit jurisdiction/);
    expect(() => assertJurisdictionExplicit("unknown", "explicit")).toThrow(/explicit jurisdiction/);
    expect(() => assertJurisdictionExplicit("australia", "locale")).toThrow(/user locale/);
    expect(() => assertJurisdictionExplicit("australia", "explicit")).not.toThrow();
    expect(() =>
      resolveGovernedBinding({
        explicitContext: null,
        defaults,
        issued: false,
        aiSelected: false,
        humanConfirmed: false,
        source: "locale",
      }),
    ).toThrow(/user locale/);
  });

  it("requires a complete standard context including edition for governed calculations", () => {
    const synthetic = createSyntheticStaticsContext();
    expect(() => assertGovernedStandardContext(synthetic)).not.toThrow();
    expect(() => assertGovernedStandardContext({ ...synthetic, standardCode: "" })).toThrow(/standard code/);
    expect(() => assertGovernedStandardContext({ ...synthetic, edition: "" })).toThrow(/edition/);
    expect(() =>
      resolveGovernedBinding({
        explicitContext: null,
        defaults,
        issued: false,
        aiSelected: false,
        humanConfirmed: false,
        source: "project_default",
      }),
    ).toThrow(/explicit/);
    expect(emptyStandardContext().standardCode).toBeNull();
  });

  it("requires a National Annex for Eurocode in EU/EEA and keeps it optional otherwise", () => {
    expect(nationalAnnexRequired(eurocodeContext(false))).toBe(true);
    expect(() => assertGovernedStandardContext(eurocodeContext(false))).toThrow(/National Annex/);
    expect(() => assertGovernedStandardContext(eurocodeContext(true))).not.toThrow();
    const auSteel = createConfiguredKnowledgeContext({
      contextId: "ctx-as4100",
      jurisdictionProfileRef: "australia",
      standardFamily: "AS",
      standardCode: "AS 4100",
      edition: "2020",
      materialScope: "steel",
    });
    expect(nationalAnnexRequired(auSteel)).toBe(false);
    expect(() => assertGovernedStandardContext(auSteel)).not.toThrow();
    expect(() => assertGovernedStandardContext({ ...auSteel, nationalAnnexRef: exampleEurocodeAnnex() })).toThrow(/not applicable/);
    const usSteel = createConfiguredKnowledgeContext({
      contextId: "ctx-aisc",
      jurisdictionProfileRef: "united-states",
      standardFamily: "AISC",
      standardCode: "AISC 360",
      edition: "2022",
      materialScope: "steel",
    });
    expect(nationalAnnexRequired(usSteel)).toBe(false);
    expect(() => assertGovernedStandardContext(usSteel)).not.toThrow();
  });

  it("rejects incompatible annex/jurisdiction and edition combinations", () => {
    const context = eurocodeContext(true);
    expect(() =>
      assertGovernedStandardContext({
        ...context,
        nationalAnnexRef: { ...exampleEurocodeAnnex(), jurisdiction: "australia" },
      }),
    ).toThrow(/jurisdiction/);
    expect(() =>
      assertGovernedStandardContext({
        ...context,
        nationalAnnexRef: { ...exampleEurocodeAnnex(), edition: "2010" },
      }),
    ).toThrow(/edition/);
  });

  it("fails closed when a tool is asked to execute outside its supported standard scope", () => {
    const as4100 = createConfiguredKnowledgeContext({
      contextId: "ctx-as4100-exec",
      jurisdictionProfileRef: "australia",
      standardFamily: "AS",
      standardCode: "AS 4100",
      edition: "2020",
      materialScope: "steel",
    });
    expect(() => assertToolScope(SYNTHETIC_UDL_TOOL_SCOPE, as4100, STRUCTURAL_SOLVER_BOUNDARY.method)).toThrow(/fails closed/);
    expect(() =>
      assertToolScope(SYNTHETIC_UDL_TOOL_SCOPE, createSyntheticStaticsContext(), "AS4100_MEMBER_CHECK"),
    ).toThrow(/fails closed/);
    expect(() =>
      detectStandardContextConflicts({
        context: as4100,
        tool: SYNTHETIC_UDL_TOOL_SCOPE,
        calculationType: STRUCTURAL_SOLVER_BOUNDARY.method,
        asOf: "2026-10-05",
      }),
    ).toThrow(/fails closed/);
  });

  it("keeps the synthetic UDL engine jurisdiction-neutral and not design-code certified", () => {
    expect(SYNTHETIC_UDL_ENGINE_DESIGN_CODE_CERTIFIED).toBe(false);
    expect(SYNTHETIC_UDL_TOOL_SCOPE.designCodeCertified).toBe(false);
    expect(SYNTHETIC_UDL_TOOL_SCOPE.certificationState).toBe("NOT_CERTIFIED");
    expect(SYNTHETIC_UDL_TOOL_SCOPE.supportedStandardCodes).toEqual(["SYNTHETIC_STATICS"]);
    expect(STRUCTURAL_SOLVER_BOUNDARY.jurisdictionNeutralStatics).toBe(true);
    expect(STRUCTURAL_SOLVER_BOUNDARY.designCodeCertified).toBe(false);
    expect(TOOL_AVAILABILITY_EQUALS_CERTIFICATION).toBe(false);
    const synthetic = createSyntheticStaticsContext();
    expect(synthetic.standardFamily).toBe("JURISDICTION_NEUTRAL");
    expect(synthetic.nationalAnnexRef).toBeNull();
    expect(() => assertToolScope(SYNTHETIC_UDL_TOOL_SCOPE, synthetic, STRUCTURAL_SOLVER_BOUNDARY.method)).not.toThrow();
    const binding = createGovernedCalculationBinding({
      calculationId: "calc-synthetic",
      context: synthetic,
      tool: SYNTHETIC_UDL_TOOL_SCOPE,
      calculationMethodRef: STRUCTURAL_SOLVER_BOUNDARY.method,
      inputEvidenceRefs: ["ev-span", "ev-udl"],
      humanStandardConfirmation: true,
    });
    expect(() => assertGovernedResultBinding(binding)).not.toThrow();
    expect(binding.jurisdictionProfileRef).toBe("global-baseline");
    expect(binding.provenanceRef.standard).toBe("SYNTHETIC_STATICS");
    expect(binding.provenanceRef.tool).toBe(STRUCTURAL_SOLVER_BOUNDARY.engineId);
  });

  it("does not treat configured standard knowledge as an implemented or certified engine", () => {
    expect(CONFIGURED_STANDARD_EQUALS_IMPLEMENTED_ENGINE).toBe(false);
    expect(IMPLEMENTED_ENGINE_EQUALS_CERTIFIED_ENGINE).toBe(false);
    expect(() => assertConfiguredIsNotEngine()).not.toThrow();
    const catalog = buildDefaultDisciplineProfile({ tenantId: "tenant-a", code: "STRUCTURAL" });
    for (const row of catalog.standards) {
      expect(row.status).toBe("CONFIGURED");
      expect(row.edition).toBeNull();
      expect(row.engineState).toBe("NOT_IMPLEMENTED");
      expect(row.certificationState).toBe("NOT_CERTIFIED");
    }
    const workGen = crusherStructuralStandards();
    expect(PARALLEL_STANDARD_CONTEXT_REMAINS).toBe(false);
    for (const row of workGen) {
      expect(row.context.standardCode).toContain(row.identifier.split(" ")[0] === "AS/NZS" ? "AS/NZS" : row.identifier);
      expect(row.context.edition).toBe(row.editionYear);
      expect(row.engineState).toBe("NOT_IMPLEMENTED");
      expect(row.certificationState).toBe("NOT_CERTIFIED");
      expect(row.context.validationState).toBe("CONFIGURED_KNOWLEDGE_NOT_ENGINE");
    }
  });

  it("lets calculation bindings override project defaults and keeps issued context immutable", () => {
    const explicit = createSyntheticStaticsContext();
    const nextDefaults: StructuralProjectStandardDefaults = {
      ...defaults,
      defaultJurisdictionProfile: "eu-eea",
      defaultStructuralStandardsProfile: "eu-en1993",
    };
    expect(applyProjectDefaultOverride(explicit, nextDefaults).jurisdictionProfileRef).toBe("global-baseline");
    const issued = resolveGovernedBinding({
      explicitContext: eurocodeContext(true),
      defaults: nextDefaults,
      issued: true,
      previousIssuedContext: explicit,
      aiSelected: false,
      humanConfirmed: true,
      source: "project_default",
    });
    expect(issued.contextId).toBe(explicit.contextId);
    expect(snapshotIssuedContext(explicit, nextDefaults).jurisdictionProfileRef).toBe("global-baseline");
    expect(issued.jurisdictionProfileRef).not.toBe(nextDefaults.defaultJurisdictionProfile);
  });

  it("supports multi-standard projects and an explicit superseded-standard policy", () => {
    const steel = createConfiguredKnowledgeContext({
      contextId: "ctx-steel",
      jurisdictionProfileRef: "australia",
      standardFamily: "AS",
      standardCode: "AS 4100",
      edition: "2020",
      materialScope: "steel",
    });
    const concrete = createConfiguredKnowledgeContext({
      contextId: "ctx-aci",
      jurisdictionProfileRef: "united-states",
      standardFamily: "ACI",
      standardCode: "ACI 318",
      edition: "2019",
      materialScope: "concrete",
    });
    expect(() => assertMultiStandardProject([steel, concrete])).not.toThrow();
    const superseded: StructuralStandardContext = { ...steel, lifecycle: "SUPERSEDED" };
    expect(() => assertGovernedStandardContext(superseded)).toThrow(/legacy policy/);
    expect(() => assertLegacySupersededPolicy("SUPERSEDED", "DENY")).toThrow(/legacy policy/);
    expect(() => assertGovernedStandardContext(superseded, { supersededPolicy: "CUSTOMER_APPROVED_LEGACY" })).not.toThrow();
    expect(() =>
      assertGovernedStandardContext(
        { ...steel, effectiveTo: "2020-12-31" },
        { asOf: "2026-10-05" },
      ),
    ).toThrow(/effective period/);
  });

  it("keeps AI standard selection advisory-only with required human confirmation", () => {
    expect(AI_STANDARD_SELECTION_ADVISORY_ONLY).toBe(true);
    expect(AI_STANDARD_INTERPRETATION_AUTHORITY).toBe(false);
    expect(() =>
      resolveGovernedBinding({
        explicitContext: createSyntheticStaticsContext(),
        defaults,
        issued: false,
        aiSelected: true,
        humanConfirmed: false,
        source: "ai",
      }),
    ).toThrow(/silently choose/);
    const binding = createGovernedCalculationBinding({
      calculationId: "calc-ai",
      context: createSyntheticStaticsContext(),
      tool: SYNTHETIC_UDL_TOOL_SCOPE,
      calculationMethodRef: STRUCTURAL_SOLVER_BOUNDARY.method,
      inputEvidenceRefs: ["ev-1"],
      humanStandardConfirmation: true,
      aiAssistedStandardSelection: true,
    });
    expect(() => assertHumanStandardConfirmation(binding)).not.toThrow();
    expect(() => assertHumanStandardConfirmation({ ...binding, humanStandardConfirmation: false })).toThrow(/silently choose/);
    expect(() =>
      assertAiStandardSuggestion({
        suggestedContextId: "ctx-synthetic-statics",
        modelOrTool: "eos-standard-lookup",
        source: "catalog-metadata",
        confidence: 0.4,
        humanConfirmation: true,
        advisory: true,
        authoritative: false,
      }),
    ).not.toThrow();
    expect(() =>
      assertAiStandardSuggestion({
        suggestedContextId: "ctx-synthetic-statics",
        modelOrTool: "eos-standard-lookup",
        source: "catalog-metadata",
        confidence: 0.4,
        humanConfirmation: false,
        advisory: true,
        authoritative: false,
      }),
    ).toThrow(/silently choose/);
  });

  it("preserves global provenance, licensing boundary, packs, and D1 risk allocation", () => {
    expect(STANDARD_CONTENT_LICENSING_BOUNDARY).toBe(true);
    expect(STRUCTURAL_STANDARD_TEXT_EMBEDDED).toBe(false);
    expect(GENERIC_ENGINE_HARDCODES_NATIONAL_VALUES).toBe(false);
    expect(() => assertNoHardcodedNationalValues()).not.toThrow();
    expect(JURISDICTION_PARAMETER_SET_ARCHITECTURE.declaredParameterKeys.length).toBeGreaterThan(0);
    expect(STRUCTURAL_STANDARD_PACKS.map((row) => row.packId)).toEqual(["AU", "EU", "US", "UK", "CA", "ME", "APAC", "OTHER"]);
    expect(STRUCTURAL_STANDARD_PACKS.every((row) => row.maturity === "FRAMEWORK_ONLY")).toBe(true);
    expect(PROFESSIONAL_AUTHORITY_PROFILE_EXTENSIBILITY).toBe(true);
    expect(STRUCTURAL_PROFESSIONAL_AUTHORITY_EXTENSIBILITY.roleKey).toBe("authorized-engineering-role");
    expect(D1B_CLOSED_GAPS).toEqual([
      "NO_STANDARD_EDITION_ANNEX_BINDING_ON_CALCULATIONS",
      "DETERMINISTIC_TOOL_JURISDICTION_UNBOUND",
    ]);
    expect(D1B_D0_RISK_DISPOSITION.CLOSED).toEqual(["D0-R02", "D0-R06"]);
    expect(D1B_RISK_ALLOCATION.D1C).toMatch(/StructuralStandardContext/);
    expect(D1B_RISK_ALLOCATION.D1D).toMatch(/fail closed/);
    expect(D1B_RISK_ALLOCATION.D1E).toMatch(/AS 3600/);
    expect(D1B_RISK_ALLOCATION.D1G).toMatch(/certificationState/);
    const ref = toStandardContextRef(createSyntheticStaticsContext());
    expect(ref.standardCode).toBe("SYNTHETIC_STATICS");
    expect(ref.nationalAnnex).toBeNull();
    expect(createSyntheticStaticsContext().provenanceRef.humanReviewer).toBeNull();
  });
});
