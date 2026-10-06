import type {
  StructuralDeterministicToolScope,
  StructuralGovernedCalculationBinding,
  StructuralJurisdictionParameterSet,
  StructuralNationalAnnexRef,
  StructuralProfessionalAuthorityProfile,
  StructuralProjectStandardDefaults,
  StructuralStandardAiSuggestion,
  StructuralStandardContext,
  StructuralStandardContextRef,
  StructuralStandardPackDeclaration,
} from "@rtb/types";
import {
  AI_STANDARD_INTERPRETATION_AUTHORITY,
  AI_STANDARD_SELECTION_ADVISORY_ONLY,
  AMBIGUOUS_STANDARD_GOVERNED_RESULT_ALLOWED,
  CONFIGURED_STANDARD_EQUALS_IMPLEMENTED_ENGINE,
  GENERIC_ENGINE_HARDCODES_NATIONAL_VALUES,
  IMPLEMENTED_ENGINE_EQUALS_CERTIFIED_ENGINE,
  ISSUED_CALCULATION_STANDARD_CONTEXT_IMMUTABLE,
  PARALLEL_STRUCTURAL_JURISDICTION_FRAMEWORK,
  PERSONAL_DATA_MINIMIZED,
  SILENT_JURISDICTION_INFERENCE_ALLOWED,
  STRUCTURAL_STANDARD_TEXT_EMBEDDED,
  SYNTHETIC_UDL_ENGINE_DESIGN_CODE_CERTIFIED,
  TENANT_ISOLATION_PRESERVED,
  TOOL_AVAILABILITY_EQUALS_CERTIFICATION,
  WORKSPACE_ISOLATION_PRESERVED,
} from "@rtb/types";
import { STRUCTURAL_SOLVER_BOUNDARY } from "../work-generator/structural/freeze";
import { governedProvenance } from "./catalog";

export const SYNTHETIC_UDL_TOOL_SCOPE: StructuralDeterministicToolScope = {
  toolId: STRUCTURAL_SOLVER_BOUNDARY.engineId,
  toolVersion: STRUCTURAL_SOLVER_BOUNDARY.engineVersion,
  supportedStandardCodes: ["SYNTHETIC_STATICS"],
  supportedEditions: ["1.0.0"],
  supportedJurisdictions: ["global-baseline"],
  supportedCalculationTypes: [STRUCTURAL_SOLVER_BOUNDARY.method],
  validationState: STRUCTURAL_SOLVER_BOUNDARY.methodClassification,
  certificationState: "NOT_CERTIFIED",
  designCodeCertified: SYNTHETIC_UDL_ENGINE_DESIGN_CODE_CERTIFIED,
};

export const STRUCTURAL_STANDARD_PACKS: readonly StructuralStandardPackDeclaration[] = [
  { packId: "AU", jurisdictionProfileRef: "australia", standardCodes: ["AS/NZS 1170", "AS 4100", "AS 3600"], maturity: "FRAMEWORK_ONLY", nationalAnnexRequiredWhenApplicable: false },
  { packId: "EU", jurisdictionProfileRef: "eu-eea", standardCodes: ["EN 1990", "EN 1991", "EN 1992", "EN 1993", "EN 1998"], maturity: "FRAMEWORK_ONLY", nationalAnnexRequiredWhenApplicable: true },
  { packId: "US", jurisdictionProfileRef: "united-states", standardCodes: ["ASCE 7", "AISC 360", "ACI 318"], maturity: "FRAMEWORK_ONLY", nationalAnnexRequiredWhenApplicable: false },
  { packId: "UK", jurisdictionProfileRef: "united-kingdom", standardCodes: [], maturity: "FRAMEWORK_ONLY", nationalAnnexRequiredWhenApplicable: false },
  { packId: "CA", jurisdictionProfileRef: "canada", standardCodes: [], maturity: "FRAMEWORK_ONLY", nationalAnnexRequiredWhenApplicable: false },
  { packId: "ME", jurisdictionProfileRef: "middle-east", standardCodes: [], maturity: "FRAMEWORK_ONLY", nationalAnnexRequiredWhenApplicable: false },
  { packId: "APAC", jurisdictionProfileRef: "apac-other", standardCodes: [], maturity: "FRAMEWORK_ONLY", nationalAnnexRequiredWhenApplicable: false },
  { packId: "OTHER", jurisdictionProfileRef: "other", standardCodes: [], maturity: "FRAMEWORK_ONLY", nationalAnnexRequiredWhenApplicable: false },
];

export const JURISDICTION_PARAMETER_SET_ARCHITECTURE: StructuralJurisdictionParameterSet = {
  parameterSetId: "architecture-only",
  jurisdictionProfileRef: "global-baseline",
  annexId: null,
  declaredParameterKeys: ["partialFactor", "combinationFactor", "materialFactor", "reliabilityParameter", "nationallyDeterminedValue"],
  hardcodedIntoGenericEngine: false,
};

export const STRUCTURAL_PROFESSIONAL_AUTHORITY_EXTENSIBILITY: StructuralProfessionalAuthorityProfile = {
  profileId: "jurisdiction-selected-authority",
  jurisdictionProfileRef: "global-baseline",
  roleKey: "authorized-engineering-role",
  confirmationRequiredForStandardSelection: true,
};

export const D1B_CLOSED_GAPS = [
  "NO_STANDARD_EDITION_ANNEX_BINDING_ON_CALCULATIONS",
  "DETERMINISTIC_TOOL_JURISDICTION_UNBOUND",
] as const;

export const D1B_D0_RISK_DISPOSITION = {
  CLOSED: ["D0-R02", "D0-R06"] as const,
  REDUCED: ["D0-R03", "D0-R05", "D0-R07", "D0-R08"] as const,
  UNCHANGED: ["D0-R01", "D0-R04", "D0-R09", "D0-R10", "D0-R11", "D0-R12"] as const,
} as const;

export const D1B_RISK_ALLOCATION = {
  D1C: "Load/combination engines must consume bound StructuralStandardContext; combination factors come from bound parameter sets or human-entered governed values, never silent defaults.",
  D1D: "Steel adapters fail closed unless jurisdiction, code, edition, amendment, and annex (when applicable) are bound. No generic 4100/EC3/AISC formula file.",
  D1E: "Concrete adapters fail closed on the same bind invariant for AS 3600 / EN 1992 / ACI 318.",
  D1G: "External solvers declare supportedStandardCodes/jurisdictions/certificationState; uncertified or out-of-scope execution fails closed.",
} as const;

export function isEurocodeFamily(standardFamily: string, standardCode: string): boolean {
  return standardFamily === "EN" || standardCode.startsWith("EN 199");
}

export function nationalAnnexRequired(context: Pick<StructuralStandardContext, "standardFamily" | "standardCode" | "jurisdictionProfileRef">): boolean {
  return isEurocodeFamily(context.standardFamily, context.standardCode) && context.jurisdictionProfileRef === "eu-eea";
}

export function toStandardContextRef(context: StructuralStandardContext): StructuralStandardContextRef {
  return {
    jurisdictionProfile: context.jurisdictionProfileRef,
    standardProfile: context.contextId,
    standardFamily: context.standardFamily,
    standardCode: context.standardCode,
    edition: context.edition,
    amendment: context.amendment,
    nationalAnnex: context.nationalAnnexRef?.annexId ?? null,
    effectiveDate: context.effectiveFrom,
  };
}

export function createSyntheticStaticsContext(contextId = "ctx-synthetic-statics"): StructuralStandardContext {
  return {
    contextId,
    jurisdictionProfileRef: "global-baseline",
    standardFamily: "JURISDICTION_NEUTRAL",
    standardCode: "SYNTHETIC_STATICS",
    edition: "1.0.0",
    amendment: null,
    nationalAnnexRef: null,
    effectiveFrom: "2026-10-05",
    effectiveTo: null,
    discipline: "structural",
    materialScope: "demonstration",
    calculationScope: STRUCTURAL_SOLVER_BOUNDARY.method,
    sourceReference: "EOS-D1B synthetic statics method, not a design code",
    approvalStatus: "REFERENCE",
    validationState: "SYNTHETIC_DEMONSTRATION_DATA",
    provenanceRef: governedProvenance({
      jurisdiction: "global-baseline",
      standard: "SYNTHETIC_STATICS",
      calculationMethod: STRUCTURAL_SOLVER_BOUNDARY.method,
      tool: STRUCTURAL_SOLVER_BOUNDARY.engineId,
      version: STRUCTURAL_SOLVER_BOUNDARY.engineVersion,
      validationState: STRUCTURAL_SOLVER_BOUNDARY.methodClassification,
    }),
    lifecycle: "ACTIVE",
  };
}

export function createConfiguredKnowledgeContext(input: {
  contextId: string;
  jurisdictionProfileRef: string;
  standardFamily: string;
  standardCode: string;
  edition: string;
  amendment?: string | null;
  materialScope: string;
}): StructuralStandardContext {
  return {
    contextId: input.contextId,
    jurisdictionProfileRef: input.jurisdictionProfileRef,
    standardFamily: input.standardFamily,
    standardCode: input.standardCode,
    edition: input.edition,
    amendment: input.amendment ?? null,
    nationalAnnexRef: null,
    effectiveFrom: `${input.edition}-01-01`,
    effectiveTo: null,
    discipline: "structural",
    materialScope: input.materialScope,
    calculationScope: "configured-knowledge",
    sourceReference: "project configured standard knowledge; not an implemented or certified engine",
    approvalStatus: "REFERENCE",
    validationState: "CONFIGURED_KNOWLEDGE_NOT_ENGINE",
    provenanceRef: governedProvenance({
      jurisdiction: input.jurisdictionProfileRef,
      standard: input.standardCode,
      calculationMethod: null,
      version: "d1b",
      validationState: "CONFIGURED_KNOWLEDGE_NOT_ENGINE",
    }),
    lifecycle: "ACTIVE",
  };
}

export function exampleEurocodeAnnex(standardCode = "EN 1993-1-1", edition = "2005"): StructuralNationalAnnexRef {
  return {
    annexId: "NA-DE-EN1993-1-1",
    country: "DE",
    jurisdiction: "eu-eea",
    standardCode,
    edition,
    annexEdition: "2015",
    effectiveFrom: "2015-01-01",
    effectiveTo: null,
    parameterSetRef: null,
    sourceReference: "National Annex metadata reference only; parameters not populated",
    validationState: "FRAMEWORK_ONLY",
  };
}

export function assertJurisdictionExplicit(jurisdictionProfileRef: string | null | undefined, source: string): void {
  if (SILENT_JURISDICTION_INFERENCE_ALLOWED) throw new Error("silent jurisdiction inference must remain denied");
  if (!jurisdictionProfileRef || jurisdictionProfileRef === "unknown") {
    throw new Error("governed calculations require an explicit jurisdiction profile");
  }
  if (source === "locale") throw new Error("jurisdiction must not be inferred from user locale");
}

export function assertEffectivePeriod(context: StructuralStandardContext, asOf: string): void {
  if (context.effectiveFrom && asOf < context.effectiveFrom) {
    throw new Error("standard context is outside its effective period");
  }
  if (context.effectiveTo && asOf > context.effectiveTo) {
    throw new Error("standard context is outside its effective period");
  }
}

export function assertGovernedStandardContext(
  context: StructuralStandardContext,
  options?: { supersededPolicy?: "DENY" | "CUSTOMER_APPROVED_LEGACY"; asOf?: string },
): void {
  assertJurisdictionExplicit(context.jurisdictionProfileRef, "explicit");
  if (!context.standardCode?.trim()) throw new Error("governed calculations require a standard code");
  if (!context.edition?.trim()) throw new Error("governed calculations require a standard edition");
  if (AMBIGUOUS_STANDARD_GOVERNED_RESULT_ALLOWED) throw new Error("ambiguous standard context is forbidden");
  if (nationalAnnexRequired(context) && !context.nationalAnnexRef) {
    throw new Error("Eurocode governed context requires a National Annex");
  }
  if (context.nationalAnnexRef) {
    if (!isEurocodeFamily(context.standardFamily, context.standardCode)) {
      throw new Error("National Annex is not applicable outside a Eurocode context");
    }
    assertAnnexCompatible(context, context.nationalAnnexRef);
  }
  if (context.lifecycle === "SUPERSEDED" || context.lifecycle === "WITHDRAWN") {
    assertLegacySupersededPolicy(context.lifecycle, options?.supersededPolicy ?? "DENY");
  }
  if (options?.asOf) assertEffectivePeriod(context, options.asOf);
}

export function assertAnnexCompatible(context: StructuralStandardContext, annex: StructuralNationalAnnexRef): void {
  if (annex.jurisdiction !== context.jurisdictionProfileRef) {
    throw new Error("National Annex jurisdiction does not match the calculation jurisdiction");
  }
  if (annex.standardCode !== context.standardCode) {
    throw new Error("National Annex standard code does not match the calculation standard");
  }
  if (annex.edition !== context.edition) {
    throw new Error("National Annex edition does not match the calculation edition");
  }
}

export function assertToolScope(tool: StructuralDeterministicToolScope, context: StructuralStandardContext, calculationType: string): void {
  if (TOOL_AVAILABILITY_EQUALS_CERTIFICATION) throw new Error("tool availability is not certification");
  if (!tool.supportedCalculationTypes.includes(calculationType)) {
    throw new Error("unsupported tool/standard execution fails closed");
  }
  if (tool.supportedStandardCodes.length > 0 && !tool.supportedStandardCodes.includes(context.standardCode)) {
    throw new Error("unsupported tool/standard execution fails closed");
  }
  if (tool.supportedEditions.length > 0 && !tool.supportedEditions.includes(context.edition)) {
    throw new Error("unsupported tool/standard execution fails closed");
  }
  if (tool.supportedJurisdictions.length > 0 && !tool.supportedJurisdictions.includes(context.jurisdictionProfileRef)) {
    throw new Error("unsupported tool/standard execution fails closed");
  }
  if (calculationType !== STRUCTURAL_SOLVER_BOUNDARY.method && !tool.designCodeCertified && tool.certificationState !== "CERTIFIED") {
    throw new Error("unsupported tool/standard execution fails closed");
  }
}

export function detectStandardContextConflicts(input: {
  context: StructuralStandardContext;
  tool: StructuralDeterministicToolScope;
  calculationType: string;
  asOf: string;
  supersededPolicy?: "DENY" | "CUSTOMER_APPROVED_LEGACY";
}): void {
  assertGovernedStandardContext(input.context, { supersededPolicy: input.supersededPolicy, asOf: input.asOf });
  assertToolScope(input.tool, input.context, input.calculationType);
}

export function snapshotIssuedContext(
  issuedContext: StructuralStandardContext,
  _defaults: StructuralProjectStandardDefaults,
): StructuralStandardContext {
  if (!ISSUED_CALCULATION_STANDARD_CONTEXT_IMMUTABLE) {
    throw new Error("issued calculation standard context must remain immutable");
  }
  return issuedContext;
}

export function resolveGovernedBinding(input: {
  explicitContext: StructuralStandardContext | null;
  defaults: StructuralProjectStandardDefaults | null;
  issued: boolean;
  previousIssuedContext?: StructuralStandardContext;
  aiSelected: boolean;
  humanConfirmed: boolean;
  source: "explicit" | "project_default" | "locale" | "ai";
}): StructuralStandardContext {
  if (input.issued && input.previousIssuedContext) {
    return snapshotIssuedContext(input.previousIssuedContext, input.defaults ?? {
      tenantId: "unknown-tenant",
      workspaceId: "unknown-workspace",
      projectId: "unknown-project",
      defaultJurisdictionProfile: "global-baseline",
      defaultStructuralStandardsProfile: "none",
    });
  }
  if (input.source === "locale") throw new Error("jurisdiction must not be inferred from user locale");
  if (input.source === "ai" || input.aiSelected) {
    if (!input.humanConfirmed) {
      throw new Error("AI must not silently choose or switch the applicable standard");
    }
  }
  if (input.explicitContext) {
    assertGovernedStandardContext(input.explicitContext);
    return input.explicitContext;
  }
  if (input.defaults && !input.issued) {
    throw new Error("project defaults cannot create a governed calculation without an explicit standard context");
  }
  throw new Error("governed calculations require an explicit jurisdiction and standard context");
}

export function applyProjectDefaultOverride(explicit: StructuralStandardContext, defaults: StructuralProjectStandardDefaults): StructuralStandardContext {
  void defaults;
  return explicit;
}

export function createGovernedCalculationBinding(input: {
  calculationId: string;
  context: StructuralStandardContext;
  tool: StructuralDeterministicToolScope;
  calculationMethodRef: string;
  inputEvidenceRefs: string[];
  issued?: boolean;
  humanStandardConfirmation: boolean;
  aiAssistedStandardSelection?: boolean;
}): StructuralGovernedCalculationBinding {
  detectStandardContextConflicts({
    context: input.context,
    tool: input.tool,
    calculationType: input.calculationMethodRef,
    asOf: input.context.effectiveFrom,
  });
  return {
    calculationId: input.calculationId,
    jurisdictionProfileRef: input.context.jurisdictionProfileRef,
    structuralStandardContextRef: input.context.contextId,
    toolRef: input.tool.toolId,
    toolVersion: input.tool.toolVersion,
    calculationMethodRef: input.calculationMethodRef,
    inputEvidenceRefs: input.inputEvidenceRefs,
    provenanceRef: input.context.provenanceRef,
    issued: input.issued === true,
    humanStandardConfirmation: input.humanStandardConfirmation,
    aiAssistedStandardSelection: input.aiAssistedStandardSelection === true,
    aiSuggestionAdvisory: true,
  };
}

export function assertGovernedResultBinding(binding: StructuralGovernedCalculationBinding): void {
  if (!binding.jurisdictionProfileRef || binding.jurisdictionProfileRef === "unknown") {
    throw new Error("governed calculations require an explicit jurisdiction profile");
  }
  if (!binding.structuralStandardContextRef) throw new Error("governed result requires a standard context");
  if (!binding.toolRef || !binding.toolVersion || !binding.calculationMethodRef) {
    throw new Error("governed result requires tool, version, and method");
  }
  if (!binding.provenanceRef.jurisdiction || !binding.provenanceRef.standard || !binding.provenanceRef.timestamp) {
    throw new Error("governed result requires global provenance");
  }
}

export function assertHumanStandardConfirmation(binding: StructuralGovernedCalculationBinding): void {
  if (!AI_STANDARD_SELECTION_ADVISORY_ONLY) throw new Error("AI standard selection must remain advisory");
  if (AI_STANDARD_INTERPRETATION_AUTHORITY) throw new Error("AI must not be the authority for standard interpretation");
  if (binding.aiAssistedStandardSelection && !binding.humanStandardConfirmation) {
    throw new Error("AI must not silently choose or switch the applicable standard");
  }
}

export function assertAiStandardSuggestion(suggestion: StructuralStandardAiSuggestion): void {
  if (suggestion.authoritative !== false || suggestion.advisory !== true) {
    throw new Error("AI standard interpretation is not authoritative");
  }
  if (!suggestion.humanConfirmation) {
    throw new Error("AI must not silently choose or switch the applicable standard");
  }
}

export function assertConfiguredIsNotEngine(): void {
  if (CONFIGURED_STANDARD_EQUALS_IMPLEMENTED_ENGINE) throw new Error("configured knowledge is not an implemented engine");
  if (IMPLEMENTED_ENGINE_EQUALS_CERTIFIED_ENGINE) throw new Error("implemented is not certified");
}

export function assertNoHardcodedNationalValues(): void {
  if (GENERIC_ENGINE_HARDCODES_NATIONAL_VALUES) throw new Error("generic engines must not hard-code national values");
  if (JURISDICTION_PARAMETER_SET_ARCHITECTURE.hardcodedIntoGenericEngine) {
    throw new Error("generic engines must not hard-code national values");
  }
}

export function assertLegacySupersededPolicy(lifecycle: StructuralStandardContext["lifecycle"], policy: "DENY" | "CUSTOMER_APPROVED_LEGACY"): void {
  if (lifecycle !== "SUPERSEDED" && lifecycle !== "WITHDRAWN") return;
  if (policy !== "CUSTOMER_APPROVED_LEGACY") {
    throw new Error("new governed calculations against superseded/withdrawn standards require explicit legacy policy");
  }
}

export function assertGlobalFirstBindingArchitecture(): void {
  if (PARALLEL_STRUCTURAL_JURISDICTION_FRAMEWORK) throw new Error("must reuse the global jurisdiction framework");
  if (STRUCTURAL_STANDARD_TEXT_EMBEDDED) throw new Error("copyrighted standard text must not be embedded");
  if (!PERSONAL_DATA_MINIMIZED) throw new Error("standards metadata must minimize personal data");
  if (!TENANT_ISOLATION_PRESERVED || !WORKSPACE_ISOLATION_PRESERVED) {
    throw new Error("tenant and workspace isolation must be preserved");
  }
}

export function assertMultiStandardProject(contexts: StructuralStandardContext[]): void {
  const families = new Set(contexts.map((row) => row.standardFamily));
  if (families.size < 2) throw new Error("multi-standard projects must allow more than one standard family");
}
