import { createHash } from "node:crypto";
import { isCertificationStubAdapter } from "./certification-adapter";
import {
  independentReactionSanity,
  SPACE_GASS_CERTIFICATION_MODEL,
  SPACE_GASS_RELATIVE_TOLERANCE,
  totalVerticalLoadkN,
} from "./spacegass-certification-model";
import {
  findVerifiedSection,
  parseNominalMassKgPerM,
  PILOT_BASELINE_BEAM,
  PILOT_BASELINE_COLUMN,
  PILOT_BEAM_CANDIDATES,
  PILOT_COLUMN_CANDIDATES,
  type VerifiedSteelSection,
} from "./spacegass-aust300-sections";

export const EOS_A6_STUDY_CAPABILITY = "STRUCTURAL_OPTIMIZATION_PILOT";
export const EOS_A6_DISCIPLINE = "STRUCTURAL";
export const EOS_A6_SYSTEM_NAME = "Structural Pilot Frame";
export const EOS_A6_LIFECYCLE_STAGE = "FEED";
export const EOS_A6_LOAD_SOURCE = "PILOT_DEFINED";
export const EOS_A6_SELF_WEIGHT = "OFF";
export const EOS_A6_DESIGN_CODE_COMPLIANCE = "NOT_ASSESSED";
export const EOS_A6_STRUCTURAL_DESIGN_CHECK = "NOT_CERTIFIED";
export const EOS_A6_MAX_VERTICAL_DISPLACEMENT_MM = 32;
export const EOS_A6_DISPLACEMENT_LIMIT_BASIS = "PILOT_DEFINED";

export const FORBIDDEN_OPTIMIZATION_WINNER_LABELS = [
  "BEST DESIGN",
  "WINNER",
  "AI RECOMMENDATION",
  "AI APPROVED",
  "OPTIMAL APPROVED DESIGN",
] as const;

export const FORBIDDEN_DESIGN_CLAIM_LABELS = [
  "Feasible Structural Design",
  "Compliant Design",
  "Safe Design",
  "Approved Design",
  "CODE-COMPLIANT STRUCTURAL DESIGN",
] as const;

export type SteelMassResult =
  | {
      status: "PASS";
      steelMassKg: number;
      unit: "kg";
      source: string;
      provenance: string;
    }
  | {
      status: "EVALUATION_INCOMPLETE";
      steelMassKg: null;
      unit: "kg";
      source: string;
      provenance: string;
      reason: string;
    };

export type StructuralPilotAlternative = {
  alternativeCode: string;
  columnSection: string;
  beamSection: string;
};

export const STRUCTURAL_PILOT_UNITS = {
  length: "m",
  force: "kN",
  moment: "kN.m",
  displacement: "mm",
  stress: "MPa",
  mass: "kg",
} as const;

export function buildStructuralPilotModel(input: { columnSection: string; beamSection: string }) {
  const geom = SPACE_GASS_CERTIFICATION_MODEL.geometry_m;
  return {
    analysis: "linear_elastic_static" as const,
    material: { ...SPACE_GASS_CERTIFICATION_MODEL.material, name: "Grade 300 structural steel (pilot configured)" },
    geometry_m: { ...geom },
    supports: { ...SPACE_GASS_CERTIFICATION_MODEL.supports },
    selfWeight: EOS_A6_SELF_WEIGHT,
    load: {
      source: EOS_A6_LOAD_SOURCE,
      type: "UDL" as const,
      magnitude_kN_per_m: 10,
      loadedMember: "beam" as const,
      direction: "downward global Y (SPACE GASS convention to be verified at live extraction)",
      selfWeight: EOS_A6_SELF_WEIGHT,
    },
    sections: {
      columnSection: input.columnSection,
      beamSection: input.beamSection,
    },
    nodes: SPACE_GASS_CERTIFICATION_MODEL.nodes,
    members: [
      { id: "C1", from: "N1", to: "N2", section: input.columnSection, length_m: geom.eavesHeight },
      { id: "R1", from: "N2", to: "N3", section: input.beamSection, length_m: geom.span },
      { id: "C2", from: "N4", to: "N3", section: input.columnSection, length_m: geom.eavesHeight },
    ],
  };
}

export function hashPilotModel(model: ReturnType<typeof buildStructuralPilotModel>): string {
  return createHash("sha256").update(JSON.stringify(model)).digest("hex");
}

export function engineerAuthorizedAlternatives(
  columns: readonly string[] = PILOT_COLUMN_CANDIDATES,
  beams: readonly string[] = PILOT_BEAM_CANDIDATES,
): StructuralPilotAlternative[] {
  const alternatives: StructuralPilotAlternative[] = [];
  let index = 1;
  for (const columnSection of columns) {
    for (const beamSection of beams) {
      alternatives.push({
        alternativeCode: `A6-ALT-${String(index).padStart(2, "0")}`,
        columnSection,
        beamSection,
      });
      index += 1;
    }
  }
  return alternatives;
}

export function steelMassForAlternative(input: {
  columnSection: string;
  beamSection: string;
  columnLengthM?: number;
  beamLengthM?: number;
  columnCount?: number;
}): SteelMassResult {
  const column = findVerifiedSection(input.columnSection);
  const beam = findVerifiedSection(input.beamSection);
  if (!column || column.role !== "column" || !beam || beam.role !== "beam") {
    return {
      status: "EVALUATION_INCOMPLETE",
      steelMassKg: null,
      unit: "kg",
      source: "unverified_section",
      provenance: "Section is not in the engineer-authorized verified SPACE GASS Aust300 subset.",
      reason: "unverified_or_role_mismatch",
    };
  }
  const columnMass = parseNominalMassKgPerM(column.libraryName);
  const beamMass = parseNominalMassKgPerM(beam.libraryName);
  if (columnMass == null || beamMass == null) {
    return {
      status: "EVALUATION_INCOMPLETE",
      steelMassKg: null,
      unit: "kg",
      source: column.source,
      provenance: "Nominal kg/m could not be parsed from verified library names.",
      reason: "mass_unparsed",
    };
  }
  const columnLength = input.columnLengthM ?? SPACE_GASS_CERTIFICATION_MODEL.geometry_m.eavesHeight;
  const beamLength = input.beamLengthM ?? SPACE_GASS_CERTIFICATION_MODEL.geometry_m.span;
  const columnCount = input.columnCount ?? 2;
  const steelMassKg = columnMass * columnLength * columnCount + beamMass * beamLength;
  return {
    status: "PASS",
    steelMassKg,
    unit: "kg",
    source: column.source,
    provenance: `Deterministic mass = Σ (library Name kg/m × member length). Columns ${column.libraryName}; beam ${beam.libraryName}.`,
  };
}

export function evaluatePilotDisplacementConstraint(peakVerticalDisplacementMm: number | null): {
  passed: boolean;
  label: "Pilot constraints satisfied" | "Pilot constraints not satisfied" | "Evaluation incomplete";
  basis: typeof EOS_A6_DISPLACEMENT_LIMIT_BASIS;
  limitMm: number;
} {
  if (peakVerticalDisplacementMm == null || !Number.isFinite(peakVerticalDisplacementMm)) {
    return {
      passed: false,
      label: "Evaluation incomplete",
      basis: EOS_A6_DISPLACEMENT_LIMIT_BASIS,
      limitMm: EOS_A6_MAX_VERTICAL_DISPLACEMENT_MM,
    };
  }
  const passed = peakVerticalDisplacementMm <= EOS_A6_MAX_VERTICAL_DISPLACEMENT_MM;
  return {
    passed,
    label: passed ? "Pilot constraints satisfied" : "Pilot constraints not satisfied",
    basis: EOS_A6_DISPLACEMENT_LIMIT_BASIS,
    limitMm: EOS_A6_MAX_VERTICAL_DISPLACEMENT_MM,
  };
}

export function labelPilotFeasibility(hardConstraintsPassed: boolean): {
  kind: "PILOT_CONSTRAINT_FEASIBILITY";
  label: "Pilot constraints satisfied" | "Pilot constraints not satisfied";
  designCodeCompliance: typeof EOS_A6_DESIGN_CODE_COMPLIANCE;
  structuralDesignCheck: typeof EOS_A6_STRUCTURAL_DESIGN_CHECK;
} {
  return {
    kind: "PILOT_CONSTRAINT_FEASIBILITY",
    label: hardConstraintsPassed ? "Pilot constraints satisfied" : "Pilot constraints not satisfied",
    designCodeCompliance: EOS_A6_DESIGN_CODE_COMPLIANCE,
    structuralDesignCheck: EOS_A6_STRUCTURAL_DESIGN_CHECK,
  };
}

export function containsForbiddenWinnerLanguage(text: string): boolean {
  const upper = text.toUpperCase();
  return FORBIDDEN_OPTIMIZATION_WINNER_LABELS.some((label) => upper.includes(label));
}

export function containsForbiddenDesignClaim(text: string): boolean {
  return FORBIDDEN_DESIGN_CLAIM_LABELS.some((label) => text.includes(label));
}

export function assertRealSolverAdapter(adapterId: string): void {
  if (isCertificationStubAdapter(adapterId)) {
    throw new Error("optimization.generic.test is not evidence for a real structural SPACE GASS run");
  }
}

export function baselineEquilibriumExpected() {
  return {
    expectedVerticalLoad_kN: totalVerticalLoadkN(),
    reactionToleranceRelative: SPACE_GASS_RELATIVE_TOLERANCE,
    selfWeight: EOS_A6_SELF_WEIGHT,
  };
}

export function evaluateBaselineEquilibrium(input: {
  leftVerticalReaction_kN: number;
  rightVerticalReaction_kN: number;
  leftHorizontalReaction_kN: number;
  rightHorizontalReaction_kN: number;
}) {
  return independentReactionSanity({
    ...input,
    totalAppliedVertical_kN: totalVerticalLoadkN(),
    totalAppliedHorizontal_kN: 0,
    relativeTolerance: SPACE_GASS_RELATIVE_TOLERANCE,
  });
}

export function failClosedSolverResult(code: string, detail: string) {
  return {
    status: "failed" as const,
    paretoEligible: false,
    fabricatedMetric: false,
    feasibilityClaim: null,
    code,
    detail,
  };
}

export const STRUCTURAL_PILOT_OBJECTIVES = [
  { code: "STEEL_MASS", name: "Minimize steel mass", metric_key: "steel_mass_kg", direction: "MINIMIZE", unit: "kg" },
  {
    code: "PEAK_V_DISP",
    name: "Minimize peak vertical displacement",
    metric_key: "peak_vertical_displacement_mm",
    direction: "MINIMIZE",
    unit: "mm",
  },
] as const;

export const STRUCTURAL_PILOT_HARD_CONSTRAINTS = [
  {
    code: "PILOT-R-DISP",
    name: "Maximum vertical beam displacement",
    metric_key: "peak_vertical_displacement_mm",
    operator: "<=",
    threshold_value: EOS_A6_MAX_VERTICAL_DISPLACEMENT_MM,
    unit: "mm",
    hardness: "HARD",
    basis: EOS_A6_DISPLACEMENT_LIMIT_BASIS,
  },
  {
    code: "PILOT-R-EQ",
    name: "Support vertical reaction equilibrium",
    metric_key: "reaction_residual",
    operator: "<=",
    threshold_value: SPACE_GASS_RELATIVE_TOLERANCE,
    unit: "1",
    hardness: "HARD",
    basis: "PILOT_DEFINED",
  },
] as const;

export const STRUCTURAL_PILOT_BASELINE = {
  columnSection: PILOT_BASELINE_COLUMN,
  beamSection: PILOT_BASELINE_BEAM,
  model: buildStructuralPilotModel({ columnSection: PILOT_BASELINE_COLUMN, beamSection: PILOT_BASELINE_BEAM }),
};

export type VerifiedSectionRecord = VerifiedSteelSection;
