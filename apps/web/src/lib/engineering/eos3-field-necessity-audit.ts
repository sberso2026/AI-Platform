/**
 * EOS UX-2 field necessity audit.
 * REQUIRED_HUMAN_INPUT only where EOS cannot safely derive/default.
 */

export type FieldNecessityClass =
  | "REQUIRED_HUMAN_INPUT"
  | "DERIVED"
  | "DEFAULTED"
  | "SYSTEM_MANAGED"
  | "OPTIONAL"
  | "ADVANCED_ONLY";

export type FieldNecessityRow = {
  field: string;
  surface: string;
  classification: FieldNecessityClass;
  justification: string;
};

export const EOS_FIELD_NECESSITY_AUDIT: FieldNecessityRow[] = [
  {
    field: "objective",
    surface: "Guided project start",
    classification: "REQUIRED_HUMAN_INPUT",
    justification: "Requires human engineering intent; cannot be invented.",
  },
  {
    field: "whyNeeded",
    surface: "Guided project start",
    classification: "OPTIONAL",
    justification: "Ask only when objective is not self-explanatory.",
  },
  {
    field: "owner",
    surface: "Guided project start",
    classification: "DEFAULTED",
    justification: "Defaults from authenticated user / project context.",
  },
  {
    field: "supportingDocuments",
    surface: "Guided project start",
    classification: "OPTIONAL",
    justification: "Document-first enrichment; never blocking for start.",
  },
  {
    field: "projectType",
    surface: "Project profile",
    classification: "DERIVED",
    justification: "Inferred from objective keywords.",
  },
  {
    field: "industry",
    surface: "Project profile",
    classification: "DERIVED",
    justification: "Inferred from objective keywords.",
  },
  {
    field: "disciplines",
    surface: "Project profile",
    classification: "DEFAULTED",
    justification: "Smart default from project type; editable in advanced.",
  },
  {
    field: "confidentiality",
    surface: "Project profile",
    classification: "DEFAULTED",
    justification: "Low-materiality administrative default (Internal).",
  },
  {
    field: "lifecycleTemplate",
    surface: "Project profile",
    classification: "DEFAULTED",
    justification: "Pilot default P0–G6 template.",
  },
  {
    field: "governanceProfile",
    surface: "Project profile",
    classification: "SYSTEM_MANAGED",
    justification: "eos-controlled-pilot system metadata.",
  },
  {
    field: "qualificationContext",
    surface: "Project profile",
    classification: "SYSTEM_MANAGED",
    justification: "D1 QUALIFIED_BOUNDED / non-D1 NOT_QUALIFIED — not user-authored.",
  },
  {
    field: "jurisdiction",
    surface: "Material confirmation",
    classification: "REQUIRED_HUMAN_INPUT",
    justification: "Material regulatory applicability; EOS proposes then confirms.",
  },
  {
    field: "standardsApplicability",
    surface: "Material confirmation",
    classification: "REQUIRED_HUMAN_INPUT",
    justification: "Uncertain standards applicability requires human confirmation.",
  },
  {
    field: "equipmentMass",
    surface: "Material assumption",
    classification: "REQUIRED_HUMAN_INPUT",
    justification: "Material load; may be proposed from text but needs human/vendor confirmation.",
  },
  {
    field: "eosGeneration",
    surface: "System metadata",
    classification: "SYSTEM_MANAGED",
    justification: "Never an engineering field.",
  },
  {
    field: "requirementRegisterManualCreate",
    surface: "Advanced workspace",
    classification: "ADVANCED_ONLY",
    justification: "Guided mode autodrafts; manual create remains available at Level 2.",
  },
  {
    field: "assumptionRegisterManualCreate",
    surface: "Advanced workspace",
    classification: "ADVANCED_ONLY",
    justification: "Contextual capture preferred; register available in Level 2.",
  },
  {
    field: "gateEvidenceManualEntry",
    surface: "Governance workspace",
    classification: "ADVANCED_ONLY",
    justification: "Evidence assembled automatically; manual only for exceptions.",
  },
  {
    field: "digitalThreadManualEdges",
    surface: "Governance workspace",
    classification: "ADVANCED_ONLY",
    justification: "Relationships auto-maintained; human correction available.",
  },
  {
    field: "mcdaWeights",
    surface: "Decision advanced",
    classification: "ADVANCED_ONLY",
    justification: "Simple Comparison is default; MCDA only when warranted.",
  },
];

export function unjustifiedRequiredFieldCount(): number {
  return EOS_FIELD_NECESSITY_AUDIT.filter(
    (r) =>
      r.classification === "REQUIRED_HUMAN_INPUT" &&
      (!r.justification || r.justification.trim().length < 8),
  ).length;
}

export function requiredHumanInputFields(): FieldNecessityRow[] {
  return EOS_FIELD_NECESSITY_AUDIT.filter((r) => r.classification === "REQUIRED_HUMAN_INPUT");
}
