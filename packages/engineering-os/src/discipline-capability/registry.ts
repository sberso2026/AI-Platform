import type {
  EosCalculationDefinition,
  EosCrossDisciplineInterface,
  EosDisciplineDefinition,
  EosDisciplineId,
  EosDisciplineMaturity,
  EosEvidenceRule,
} from "@rtb/types";
import {
  EOS_D0_GOVERNANCE_PROFILES,
  EOS_D0_OWNER_PACKAGE,
  EOS_DISCIPLINE_CLASSIFIABLE_DATA,
  EOS_DISCIPLINE_IDS,
  EOS_EVIDENCE_SOURCE_KINDS,
  EOS_GLOBAL_POLICY_INHERITANCE,
  EOS_INSPECTION_FINDING_CLASSES,
} from "@rtb/types";
import { SPACE_GASS_CATALOG_ENTRY } from "../external-tools/catalog";
import { STRUCTURAL_SOLVER_BOUNDARY } from "../work-generator/structural/freeze";

const SHARED_JURISDICTIONS = [
  "global-baseline",
  "australia",
  "eu-eea",
  "united-kingdom",
  "united-states",
  "canada",
  "middle-east",
  "apac-other",
  "other",
];

const DEFAULT_EVIDENCE: EosEvidenceRule = {
  ruleId: "evidence-not-ai-approved",
  sourceKinds: [...EOS_EVIDENCE_SOURCE_KINDS],
  aiOutputIsApprovedEvidence: false,
};

const DEFAULT_REVIEW = {
  ruleId: "human-review",
  actor: "reviewer" as const,
  aiRecommendationIsReview: false as const,
};

const DEFAULT_APPROVAL = {
  ruleId: "human-approval",
  actor: "approver" as const,
  aiRecommendationIsApproval: false as const,
  humanAuthorityRequired: true as const,
};

function plannedObjects(ids: Array<{ objectTypeId: string; name: string }>) {
  return ids.map((row) => ({ ...row, implemented: false }));
}

function declaredInterface(
  row: Pick<EosCrossDisciplineInterface, "interfaceId" | "relation" | "sourceDiscipline" | "targetDiscipline" | "description"> &
    Partial<EosCrossDisciplineInterface>,
): EosCrossDisciplineInterface {
  return {
    sourceObject: row.sourceObject ?? null,
    targetObject: row.targetObject ?? null,
    evidence: row.evidence ?? null,
    status: row.status ?? "declared",
    provenance: row.provenance ?? "eos-eu-0-global-provenance",
    humanReviewRequired: row.humanReviewRequired ?? true,
    interfaceId: row.interfaceId,
    relation: row.relation,
    sourceDiscipline: row.sourceDiscipline,
    targetDiscipline: row.targetDiscipline,
    description: row.description,
  };
}

function plannedPack(input: {
  disciplineId: Exclude<EosDisciplineId, "structural">;
  name: string;
  shortName: string;
  description: string;
  standardsApplicability: string[];
  engineeringObjectTypes: Array<{ objectTypeId: string; name: string }>;
  deliverableTypes: Array<{ deliverableTypeId: string; name: string }>;
  externalTools: Array<{ toolCode: string; name: string }>;
  inspectionModels: Array<{ modelId: string; name: string }>;
  digitalTwinModels: Array<{ extensionId: string; name: string }>;
  riskModels: string[];
  crossDisciplineInterfaces: EosCrossDisciplineInterface[];
}): EosDisciplineDefinition {
  return {
    disciplineId: input.disciplineId,
    name: input.name,
    shortName: input.shortName,
    description: input.description,
    version: "0.0.0-d0",
    maturity: "PLANNED",
    status: "not_entitled",
    ownerPackage: EOS_D0_OWNER_PACKAGE,
    jurisdictionApplicability: SHARED_JURISDICTIONS,
    standardsApplicability: input.standardsApplicability,
    capabilities: [],
    engineeringObjectTypes: plannedObjects(input.engineeringObjectTypes),
    deliverableTypes: input.deliverableTypes.map((row) => ({ ...row, implemented: false })),
    calculationDefinitions: [],
    deterministicTools: [],
    externalTools: input.externalTools.map((row) => ({
      ...row,
      certified: false,
      silentFallbackAllowed: false,
    })),
    aiCapabilities: [],
    evidenceRules: [DEFAULT_EVIDENCE],
    reviewRules: [DEFAULT_REVIEW],
    approvalRules: [DEFAULT_APPROVAL],
    inspectionModels: input.inspectionModels.map((row) => ({
      ...row,
      implemented: false,
      findingClasses: [...EOS_INSPECTION_FINDING_CLASSES],
      aiFindingEqualsEngineeringApproval: false,
    })),
    digitalTwinModels: input.digitalTwinModels.map((row) => ({
      ...row,
      measuredStateDistinctFromInferred: true,
      digitalTwinDistinctFromThreadAndAiMemory: true,
      humanPersonTwinAllowed: false,
      implemented: false,
    })),
    riskModels: input.riskModels,
    crossDisciplineInterfaces: input.crossDisciplineInterfaces,
    dataClassifications: [...EOS_DISCIPLINE_CLASSIFIABLE_DATA],
    provenanceRequirements: ["eos-eu-0-global-provenance"],
    inheritedProfiles: EOS_D0_GOVERNANCE_PROFILES,
    inheritedPolicies: EOS_GLOBAL_POLICY_INHERITANCE,
    euOnlyAssumption: false,
  };
}

const STRUCTURAL_UDL_CALCULATION: EosCalculationDefinition = {
  calculationId: "structural-synthetic-ss-beam-udl",
  disciplineId: "structural",
  name: "Synthetic simply-supported UDL demand",
  purpose: "Deterministic demonstration demand (V=wL/2, M=wL^2/8). Not a design-code capacity engine.",
  inputSchema: "span,udl",
  outputSchema: "shear,moment",
  deterministic: true,
  toolId: STRUCTURAL_SOLVER_BOUNDARY.engineId,
  standardRefs: [],
  jurisdictionApplicability: SHARED_JURISDICTIONS,
  evidenceRequirements: ["human_input", "calculation"],
  provenanceRequirements: ["eos-eu-0-global-provenance"],
  humanReviewRequired: true,
  approvalRequired: true,
  validationState: STRUCTURAL_SOLVER_BOUNDARY.methodClassification,
  llmOriginatesGovernedNumericResult: false,
};

export const STRUCTURAL_DISCIPLINE_PACK: EosDisciplineDefinition = {
  disciplineId: "structural",
  name: "Structural",
  shortName: "STR",
  description: "Reference / partially implemented structural pack mapped from existing EOS work-generator and external-tool governance. Not a rebuild.",
  version: "0.1.0-d0-reference",
  maturity: "REFERENCE_PARTIALLY_IMPLEMENTED",
  status: "installed",
  ownerPackage: EOS_D0_OWNER_PACKAGE,
  jurisdictionApplicability: SHARED_JURISDICTIONS,
  standardsApplicability: ["AS 4100", "AS 3600", "EN 1992", "EN 1993", "AISC", "ACI"],
  capabilities: [
    "CONTEXT_INTERPRETATION",
    "CALCULATION",
    "LINEAR_STRUCTURAL_ANALYSIS",
    "OPTIMIZATION",
    "ENGINEERING_REVIEW",
    "EVIDENCE_GENERATION",
  ],
  engineeringObjectTypes: [
    { objectTypeId: "STRUCTURAL_SYSTEM", name: "Structural system", implemented: true },
    { objectTypeId: "FRAME", name: "Frame", implemented: true },
    { objectTypeId: "MEMBER", name: "Member", implemented: true },
    { objectTypeId: "BEAM", name: "Beam", implemented: true },
    { objectTypeId: "COLUMN", name: "Column", implemented: true },
    { objectTypeId: "BRACE", name: "Brace", implemented: true },
    { objectTypeId: "PLATE", name: "Plate", implemented: true },
    { objectTypeId: "CONNECTION", name: "Connection", implemented: true },
    { objectTypeId: "NODE", name: "Node", implemented: true },
    { objectTypeId: "SUPPORT", name: "Support", implemented: true },
    { objectTypeId: "SECTION", name: "Section", implemented: true },
    { objectTypeId: "MATERIAL", name: "Material", implemented: true },
    { objectTypeId: "LOAD_CASE", name: "Load case", implemented: true },
    { objectTypeId: "LOAD_COMBINATION", name: "Load combination", implemented: true },
    { objectTypeId: "ANALYSIS_MODEL", name: "Analysis model", implemented: true },
    { objectTypeId: "ANALYSIS_RESULT", name: "Analysis result", implemented: true },
    { objectTypeId: "DESIGN_CHECK", name: "Design check", implemented: true },
    { objectTypeId: "CAPACITY_RESULT", name: "Capacity result", implemented: true },
    { objectTypeId: "UTILIZATION_RESULT", name: "Utilization result", implemented: true },
    { objectTypeId: "FOUNDATION_INTERFACE", name: "Foundation interface", implemented: true },
  ],
  deliverableTypes: [
    { deliverableTypeId: "calculation", name: "Calculation", implemented: true },
    { deliverableTypeId: "report", name: "Report", implemented: true },
    { deliverableTypeId: "drawing", name: "Drawing", implemented: false },
  ],
  calculationDefinitions: [STRUCTURAL_UDL_CALCULATION],
  deterministicTools: [
    {
      toolId: STRUCTURAL_SOLVER_BOUNDARY.engineId,
      version: STRUCTURAL_SOLVER_BOUNDARY.engineVersion,
      method: STRUCTURAL_SOLVER_BOUNDARY.method,
      inputs: ["span", "udl"],
      outputs: ["shear", "moment"],
      standard: null,
      jurisdiction: null,
      provenance: "work-generator/structural",
      validationState: STRUCTURAL_SOLVER_BOUNDARY.methodClassification,
      kind: "internal",
      certified: false,
    },
  ],
  externalTools: [
    {
      toolCode: SPACE_GASS_CATALOG_ENTRY.toolCode,
      name: SPACE_GASS_CATALOG_ENTRY.name,
      certified: false,
      silentFallbackAllowed: false,
    },
  ],
  aiCapabilities: [
    {
      capabilityId: "structural-ask-advisory",
      intendedPurpose: "Assemble governed structural inputs and explain results; not design approval",
      humanOversightRequired: true,
      autonomousActionAllowed: false,
      governedNumericalOutputAllowed: false,
      engineeringImpact: "advisory",
      jurisdictionApplicability: SHARED_JURISDICTIONS,
      evidenceRequired: true,
      provenanceRequired: true,
      riskClassification: "requires-assessment",
      dataCategories: ["engineeringData"],
    },
  ],
  evidenceRules: [DEFAULT_EVIDENCE],
  reviewRules: [DEFAULT_REVIEW],
  approvalRules: [DEFAULT_APPROVAL],
  inspectionModels: [
    { modelId: "cracking", name: "Cracking", implemented: false, findingClasses: [...EOS_INSPECTION_FINDING_CLASSES], aiFindingEqualsEngineeringApproval: false },
    { modelId: "corrosion", name: "Corrosion", implemented: false, findingClasses: [...EOS_INSPECTION_FINDING_CLASSES], aiFindingEqualsEngineeringApproval: false },
    { modelId: "fatigue", name: "Fatigue", implemented: false, findingClasses: [...EOS_INSPECTION_FINDING_CLASSES], aiFindingEqualsEngineeringApproval: false },
    { modelId: "deflection", name: "Deflection", implemented: false, findingClasses: [...EOS_INSPECTION_FINDING_CLASSES], aiFindingEqualsEngineeringApproval: false },
  ],
  digitalTwinModels: [
    {
      extensionId: "structural-member-state",
      name: "Structural member state",
      measuredStateDistinctFromInferred: true,
      digitalTwinDistinctFromThreadAndAiMemory: true,
      humanPersonTwinAllowed: false,
      implemented: false,
    },
  ],
  riskModels: ["structural-stability-advisory"],
  crossDisciplineInterfaces: [
    declaredInterface({
      interfaceId: "piping-to-structural-loads",
      relation: "LOAD_TRANSFER",
      sourceDiscipline: "piping",
      targetDiscipline: "structural",
      sourceObject: "support",
      targetObject: "member",
      description: "Piping loads may transfer to structural supports.",
    }),
    declaredInterface({
      interfaceId: "structural-to-geotechnical",
      relation: "REQUIRES_INPUT_FROM",
      sourceDiscipline: "structural",
      targetDiscipline: "geotechnical",
      sourceObject: "foundation_interface",
      targetObject: "soil_profile",
      description: "Foundations require geotechnical input.",
    }),
  ],
  dataClassifications: [...EOS_DISCIPLINE_CLASSIFIABLE_DATA],
  provenanceRequirements: ["eos-eu-0-global-provenance"],
  inheritedProfiles: EOS_D0_GOVERNANCE_PROFILES,
  inheritedPolicies: EOS_GLOBAL_POLICY_INHERITANCE,
  euOnlyAssumption: false,
};

export const STRUCTURAL_D1_GAPS = [
  "SPACE_GASS_LIVE_EXECUTION_NOT_CERTIFIED",
  "NO_AS4100_CAPACITY_ENGINE",
  "NO_AS3600_ENGINE",
  "NO_EUROCODE_NATIONAL_ANNEX_ENGINE",
  "NO_AISC_ACI_ENGINE",
  "SYNTHETIC_UDL_DEMAND_ONLY",
  "MEMBER_CONNECTION_FRAME_OBJECTS_NOT_IMPLEMENTED",
  "INSPECTION_MODELS_NOT_IMPLEMENTED",
  "DIGITAL_TWIN_EXTENSION_NOT_IMPLEMENTED",
  "DESIGN_CHECK_NOT_CERTIFIED",
  "NO_STANDARD_EDITION_ANNEX_BINDING_ON_CALCULATIONS",
  "OPTIMIZATION_NOT_CERTIFIED",
  "DETERMINISTIC_TOOL_JURISDICTION_UNBOUND",
] as const;

export const EOS_DISCIPLINE_REGISTRY: readonly EosDisciplineDefinition[] = [
  STRUCTURAL_DISCIPLINE_PACK,
  plannedPack({
    disciplineId: "civil",
    name: "Civil",
    shortName: "CIV",
    description: "Planned civil pack. Generic EOS features are not a completed civil module.",
    standardsApplicability: ["AS", "EN", "AASHTO"],
    engineeringObjectTypes: [
      { objectTypeId: "road", name: "Road" },
      { objectTypeId: "drain", name: "Drain" },
      { objectTypeId: "culvert", name: "Culvert" },
      { objectTypeId: "earthworks_zone", name: "Earthworks zone" },
    ],
    deliverableTypes: [{ deliverableTypeId: "drawing", name: "Drawing" }],
    externalTools: [],
    inspectionModels: [],
    digitalTwinModels: [],
    riskModels: [],
    crossDisciplineInterfaces: [
      declaredInterface({
        interfaceId: "civil-to-geotechnical",
        relation: "REQUIRES_INPUT_FROM",
        sourceDiscipline: "civil",
        targetDiscipline: "geotechnical",
        sourceObject: "earthworks_zone",
        targetObject: "soil_profile",
        description: "Earthworks and foundations depend on geotechnical input.",
      }),
    ],
  }),
  plannedPack({
    disciplineId: "geotechnical",
    name: "Geotechnical",
    shortName: "GEO",
    description: "Planned geotechnical pack. Generic EOS features are not a completed geotechnical module.",
    standardsApplicability: ["AS", "EN", "CONFIGURABLE"],
    engineeringObjectTypes: [{ objectTypeId: "soil_profile", name: "Soil profile" }],
    deliverableTypes: [{ deliverableTypeId: "report", name: "Report" }],
    externalTools: [],
    inspectionModels: [],
    digitalTwinModels: [],
    riskModels: [],
    crossDisciplineInterfaces: [],
  }),
  plannedPack({
    disciplineId: "mechanical",
    name: "Mechanical",
    shortName: "MEC",
    description: "Planned mechanical pack. Generic EOS features are not a completed mechanical module.",
    standardsApplicability: ["AS", "API", "CONFIGURABLE"],
    engineeringObjectTypes: [
      { objectTypeId: "pump", name: "Pump" },
      { objectTypeId: "compressor", name: "Compressor" },
      { objectTypeId: "vessel", name: "Vessel" },
      { objectTypeId: "conveyor", name: "Conveyor" },
    ],
    deliverableTypes: [{ deliverableTypeId: "datasheet", name: "Datasheet" }],
    externalTools: [],
    inspectionModels: [
      { modelId: "vibration", name: "Vibration" },
      { modelId: "bearing_condition", name: "Bearing condition" },
      { modelId: "leakage", name: "Leakage" },
    ],
    digitalTwinModels: [{ extensionId: "mechanical-asset-state", name: "Mechanical asset state" }],
    riskModels: [],
    crossDisciplineInterfaces: [
      declaredInterface({
        interfaceId: "process-to-mechanical",
        relation: "PROVIDES_INPUT_TO",
        sourceDiscipline: "process",
        targetDiscipline: "mechanical",
        sourceObject: "stream",
        targetObject: "pump",
        description: "Process duty informs mechanical equipment.",
      }),
    ],
  }),
  plannedPack({
    disciplineId: "piping",
    name: "Piping",
    shortName: "PIP",
    description: "Planned piping pack. Generic EOS features are not a completed piping module.",
    standardsApplicability: ["AS", "ASME", "EN"],
    engineeringObjectTypes: [
      { objectTypeId: "line", name: "Line" },
      { objectTypeId: "valve", name: "Valve" },
      { objectTypeId: "support", name: "Support" },
    ],
    deliverableTypes: [{ deliverableTypeId: "register", name: "Register" }],
    externalTools: [
      { toolCode: "caesar-ii", name: "CAESAR II" },
      { toolCode: "autopipe", name: "AutoPIPE" },
    ],
    inspectionModels: [
      { modelId: "corrosion", name: "Corrosion" },
      { modelId: "wall_loss", name: "Wall loss" },
      { modelId: "support_condition", name: "Support condition" },
    ],
    digitalTwinModels: [],
    riskModels: [],
    crossDisciplineInterfaces: [
      declaredInterface({
        interfaceId: "mechanical-to-piping",
        relation: "PROVIDES_INPUT_TO",
        sourceDiscipline: "mechanical",
        targetDiscipline: "piping",
        sourceObject: "pump",
        targetObject: "line",
        description: "Equipment nozzles connect to piping.",
      }),
    ],
  }),
  plannedPack({
    disciplineId: "process",
    name: "Process",
    shortName: "PRO",
    description: "Planned process pack. Generic EOS features are not a completed process module.",
    standardsApplicability: ["API", "CONFIGURABLE"],
    engineeringObjectTypes: [{ objectTypeId: "stream", name: "Stream" }],
    deliverableTypes: [{ deliverableTypeId: "specification", name: "Specification" }],
    externalTools: [
      { toolCode: "hysys", name: "HYSYS" },
      { toolCode: "aspen-plus", name: "Aspen Plus" },
    ],
    inspectionModels: [],
    digitalTwinModels: [],
    riskModels: [],
    crossDisciplineInterfaces: [],
  }),
  plannedPack({
    disciplineId: "electrical",
    name: "Electrical",
    shortName: "ELE",
    description: "Planned electrical pack. Generic EOS features are not a completed electrical module.",
    standardsApplicability: ["AS", "IEEE", "IEC", "NFPA"],
    engineeringObjectTypes: [
      { objectTypeId: "load", name: "Load" },
      { objectTypeId: "cable", name: "Cable" },
      { objectTypeId: "transformer", name: "Transformer" },
      { objectTypeId: "switchboard", name: "Switchboard" },
    ],
    deliverableTypes: [{ deliverableTypeId: "schedule", name: "Schedule" }],
    externalTools: [
      { toolCode: "etap", name: "ETAP" },
      { toolCode: "powerfactory", name: "PowerFactory" },
    ],
    inspectionModels: [],
    digitalTwinModels: [],
    riskModels: [],
    crossDisciplineInterfaces: [],
  }),
  plannedPack({
    disciplineId: "instrumentation_control",
    name: "Instrumentation & Control",
    shortName: "I&C",
    description: "Planned instrumentation and control pack. Generic EOS features are not a completed I&C module.",
    standardsApplicability: ["IEC", "ISA", "CONFIGURABLE"],
    engineeringObjectTypes: [{ objectTypeId: "loop", name: "Loop" }],
    deliverableTypes: [{ deliverableTypeId: "datasheet", name: "Datasheet" }],
    externalTools: [],
    inspectionModels: [],
    digitalTwinModels: [],
    riskModels: [],
    crossDisciplineInterfaces: [
      declaredInterface({
        interfaceId: "electrical-to-instrumentation",
        relation: "DATA_DEPENDENCY",
        sourceDiscipline: "electrical",
        targetDiscipline: "instrumentation_control",
        sourceObject: "switchboard",
        targetObject: "loop",
        description: "Power and control interfaces.",
      }),
    ],
  }),
];

export function getDisciplinePack(disciplineId: EosDisciplineId): EosDisciplineDefinition {
  const found = EOS_DISCIPLINE_REGISTRY.find((row) => row.disciplineId === disciplineId);
  if (!found) throw new Error(`discipline ${disciplineId} is not registered`);
  return found;
}

export function listRegisteredDisciplineIds(): EosDisciplineId[] {
  return EOS_DISCIPLINE_REGISTRY.map((row) => row.disciplineId);
}

export function disciplineMaturity(disciplineId: EosDisciplineId): EosDisciplineMaturity {
  return getDisciplinePack(disciplineId).maturity;
}

export const EOS_D0_CANONICAL_IDS = EOS_DISCIPLINE_IDS;
