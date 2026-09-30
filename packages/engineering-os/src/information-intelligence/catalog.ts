import type { InformationType } from "./types";

export type InformationTypeCatalogEntry = {
  code: InformationType;
  name: string;
  description: string;
  typicalSourceKinds: readonly string[];
};

export const INFORMATION_TYPE_CATALOG: readonly InformationTypeCatalogEntry[] = [
  { code: "DESIGN_BASIS", name: "Design basis", description: "Governed design-basis information referenced for a purpose.", typicalSourceKinds: ["DOCUMENT"] },
  { code: "DESIGN_CRITERIA", name: "Design criteria", description: "Design criteria documents or datasets used as engineering input.", typicalSourceKinds: ["DOCUMENT"] },
  { code: "LOAD_DATA", name: "Load data", description: "Operating or design load information. Discipline ownership stays with the source discipline.", typicalSourceKinds: ["DOCUMENT", "DATASET", "INTERFACE_INFORMATION"] },
  { code: "EQUIPMENT_DATA", name: "Equipment data", description: "Equipment datasheet or vendor dataset references.", typicalSourceKinds: ["DOCUMENT", "DATASET", "EXTERNAL_REFERENCE"] },
  { code: "PROCESS_DATA", name: "Process data", description: "Process information used as an engineering input.", typicalSourceKinds: ["DOCUMENT", "DATASET"] },
  { code: "MATERIAL_PROPERTY", name: "Material property", description: "Material property references for analysis or design.", typicalSourceKinds: ["DOCUMENT", "DATASET"] },
  { code: "CALCULATION", name: "Calculation", description: "Calculation artifacts owned by Document or Analysis domains.", typicalSourceKinds: ["DOCUMENT", "ANALYSIS_RESULT"] },
  { code: "ANALYSIS_OUTPUT", name: "Analysis output", description: "Analysis Result identity remains Analysis-owned.", typicalSourceKinds: ["ANALYSIS_RESULT"] },
  { code: "DRAWING", name: "Drawing", description: "Drawing documents. Document domain remains source of truth.", typicalSourceKinds: ["DOCUMENT"] },
  { code: "MODEL", name: "Model", description: "Model references without copying a model store.", typicalSourceKinds: ["MODEL", "DOCUMENT"] },
  { code: "SPECIFICATION", name: "Specification", description: "Specification documents.", typicalSourceKinds: ["DOCUMENT"] },
  { code: "DATASHEET", name: "Datasheet", description: "Datasheet documents or vendor references.", typicalSourceKinds: ["DOCUMENT", "EXTERNAL_REFERENCE"] },
  { code: "INTERFACE_DATA", name: "Interface data", description: "Interface Information Requirements remain Interface-owned.", typicalSourceKinds: ["INTERFACE_INFORMATION", "DATASET"] },
  { code: "SURVEY_DATA", name: "Survey data", description: "External survey references. Authority requires policy.", typicalSourceKinds: ["EXTERNAL_REFERENCE", "DATASET"] },
  { code: "INSPECTION_DATA", name: "Inspection data", description: "Inspection information references.", typicalSourceKinds: ["DOCUMENT", "DATASET"] },
  { code: "TEST_DATA", name: "Test data", description: "Test information references.", typicalSourceKinds: ["DOCUMENT", "DATASET"] },
  { code: "REQUIREMENT_INFORMATION", name: "Requirement information", description: "Requirement identity remains Requirements-owned.", typicalSourceKinds: ["REQUIREMENT"] },
  { code: "DECISION_INFORMATION", name: "Decision information", description: "Decision identity remains Decision-owned.", typicalSourceKinds: ["DECISION"] },
  { code: "REFERENCE_INFORMATION", name: "Reference information", description: "General governed reference that is not automatically authoritative.", typicalSourceKinds: ["DOCUMENT", "EXTERNAL_REFERENCE"] },
];

export function informationTypeByCode(code: string): InformationTypeCatalogEntry | undefined {
  return INFORMATION_TYPE_CATALOG.find((row) => row.code === code);
}
