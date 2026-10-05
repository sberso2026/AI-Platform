import type {
  StructuralBoundCombinationFactor,
  StructuralBoundaryCondition,
  StructuralDemandHandoff,
  StructuralDemandResult,
  StructuralEvidenceBinding,
  StructuralLoadApplication,
  StructuralStandardContext,
} from "@rtb/types";
import {
  AI_DEMAND_ASSISTANCE_ADVISORY_ONLY,
  D1C_CAPACITY_ENGINE_PRESENT,
  D1C_DESIGN_PASS_FAIL_PRESENT,
  ENGINEERING_NUMERICAL_TOLERANCE,
  HUMAN_REVIEW_REQUIRED_FOR_GOVERNED_DEMAND,
  LLM_DEMAND_RESULT_AUTHORITY,
  TORSION_DEMAND_SCOPE,
} from "@rtb/types";
import { assertGovernedStandardContext, createSyntheticStaticsContext } from "../structural-domain/binding";
import { governedProvenance } from "../structural-domain/catalog";
import { STRUCTURAL_SOLVER_BOUNDARY } from "../work-generator/structural/freeze";
import { scaleByFactor } from "./combine";
import { evaluateLoadPrimitive, superposePrimitives, type StiffnessSI } from "./statics";
import { toEPa, toIm4, toLengthM } from "./units";

export type DemandAnalysisInput = {
  resultId: string;
  memberId: string;
  spanM: number;
  spanUnit: "m";
  boundaryCondition: StructuralBoundaryCondition;
  applications: StructuralLoadApplication[];
  factors: StructuralBoundCombinationFactor[];
  combinationId: string | null;
  standardContext: StructuralStandardContext | "JURISDICTION_NEUTRAL_STATICS";
  stiffness?: { E: { value: number; unit: string }; I: { value: number; unit: string } } | null;
  evidenceRefs: StructuralEvidenceBinding[];
};

function resolveContext(context: DemandAnalysisInput["standardContext"]): StructuralStandardContext {
  if (context === "JURISDICTION_NEUTRAL_STATICS") return createSyntheticStaticsContext();
  assertGovernedStandardContext(context);
  return context;
}

function scaledApplication(app: StructuralLoadApplication, factor: number): StructuralLoadApplication {
  return {
    ...app,
    magnitude: { ...app.magnitude, value: scaleByFactor(app.magnitude.value, factor) },
    endMagnitude: app.endMagnitude ? { ...app.endMagnitude, value: scaleByFactor(app.endMagnitude.value, factor) } : null,
  };
}

function envelope(stations: { xM: number; shearN: number; momentNm: number; deflectionM: number | null }[], field: "shearN" | "momentNm" | "deflectionM") {
  let best = stations[0]!;
  for (const row of stations) {
    const value = field === "deflectionM" ? row.deflectionM : row[field];
    const current = field === "deflectionM" ? best.deflectionM : best[field];
    if (value == null || current == null) continue;
    if (Math.abs(value) > Math.abs(current)) best = row;
  }
  const signed = field === "deflectionM" ? best.deflectionM ?? 0 : best[field];
  return {
    value: Math.abs(signed),
    unit: field === "momentNm" ? "N.m" : field === "deflectionM" ? "m" : "N",
    locationM: best.xM,
    signed,
  };
}

export function runDeterministicDemand(input: DemandAnalysisInput): StructuralDemandResult {
  if (LLM_DEMAND_RESULT_AUTHORITY) throw new Error("LLM must not have demand result authority");
  if (!AI_DEMAND_ASSISTANCE_ADVISORY_ONLY) throw new Error("AI demand assistance must remain advisory");
  if (D1C_CAPACITY_ENGINE_PRESENT || D1C_DESIGN_PASS_FAIL_PRESENT) {
    throw new Error("D1C must not emit capacity or design pass/fail");
  }
  if (TORSION_DEMAND_SCOPE !== "NOT_IMPLEMENTED") throw new Error("torsion demand is not implemented");
  if (!HUMAN_REVIEW_REQUIRED_FOR_GOVERNED_DEMAND) throw new Error("governed demand requires human review");
  if (input.spanUnit !== "m") throw new Error("unsupported unit; span must be explicit metres");
  const L = toLengthM(input.spanM, input.spanUnit);
  if (!(L > 0)) throw new Error("governed load input is malformed: span must be positive");
  const context = resolveContext(input.standardContext);
  const stiffness: StiffnessSI | null = input.stiffness
    ? { EPa: toEPa(input.stiffness.E), I_m4: toIm4(input.stiffness.I) }
    : null;
  const extras = input.applications.flatMap((app) => [app.positionM ?? 0, app.startM ?? 0, app.endM ?? L]);
  const factored = input.applications.map((app) => {
    const factor = input.factors.find((row) => row.loadCaseId === app.loadCaseId);
    if (!factor) throw new Error("governed combination is malformed: every load case must have a bound factor");
    return scaledApplication(app, factor.factor);
  });
  const parts = factored.map((app) => evaluateLoadPrimitive(input.boundaryCondition, L, app, stiffness, extras));
  const combined = superposePrimitives(parts);
  const totalDown = factored.reduce((sum, app) => {
    if (app.direction === "AXIAL") return sum;
    if (app.kind === "UNIFORM_DISTRIBUTED_LOAD") {
      return sum + (app.magnitude.unit === "kN/m" ? app.magnitude.value * 1000 : app.magnitude.value) * L;
    }
    if (app.kind === "LINEARLY_VARYING_DISTRIBUTED_LOAD" && app.endMagnitude) {
      const w1 = app.magnitude.unit === "kN/m" ? app.magnitude.value * 1000 : app.magnitude.value;
      const w2 = app.endMagnitude.unit === "kN/m" ? app.endMagnitude.value * 1000 : app.endMagnitude.value;
      return sum + (w1 + w2) * L / 2;
    }
    if (app.kind === "POINT_FORCE" || app.kind === "NODAL_FORCE") {
      return sum + (app.magnitude.unit === "kN" ? app.magnitude.value * 1000 : app.magnitude.value);
    }
    return sum;
  }, 0);
  const forceResidual = combined.startFyN + combined.endFyN - totalDown;
  const momentResidual = combined.startMzNm + combined.endMzNm - combined.endFyN * L + factored.reduce((sum, app) => {
    if (app.direction === "AXIAL") return sum;
    if (app.kind === "POINT_FORCE" || app.kind === "NODAL_FORCE") {
      const P = app.magnitude.unit === "kN" ? app.magnitude.value * 1000 : app.magnitude.value;
      return sum + P * (app.positionM ?? 0);
    }
    if (app.kind === "POINT_MOMENT" || app.kind === "NODAL_MOMENT") {
      return sum + (app.magnitude.unit === "kN.m" ? app.magnitude.value * 1000 : app.magnitude.value);
    }
    if (app.kind === "UNIFORM_DISTRIBUTED_LOAD") {
      const w = app.magnitude.unit === "kN/m" ? app.magnitude.value * 1000 : app.magnitude.value;
      return sum + w * L * L / 2;
    }
    if (app.kind === "LINEARLY_VARYING_DISTRIBUTED_LOAD" && app.endMagnitude) {
      const w1 = app.magnitude.unit === "kN/m" ? app.magnitude.value * 1000 : app.magnitude.value;
      const w2 = app.endMagnitude.unit === "kN/m" ? app.endMagnitude.value * 1000 : app.endMagnitude.value;
      return sum + L * L * (w1 + 2 * w2) / 6;
    }
    return sum;
  }, 0);
  if (Math.abs(forceResidual) > ENGINEERING_NUMERICAL_TOLERANCE.forceN) {
    throw new Error("demand equilibrium residual exceeds tolerance");
  }
  if (Math.abs(momentResidual) > ENGINEERING_NUMERICAL_TOLERANCE.momentNm) {
    throw new Error("demand equilibrium residual exceeds tolerance");
  }
  const deflection = combined.deflectionSupported && combined.stations.some((row) => row.deflectionM != null)
    ? envelope(combined.stations, "deflectionM")
    : { status: "NOT_IMPLEMENTED" as const, reason: stiffness ? "deflection formula is not validated for this load primitive set" : "missing stiffness deflection fail closed" };
  if (!stiffness && input.stiffness) {
    throw new Error("UNSUPPORTED_CASE: missing stiffness deflection fail closed");
  }
  return {
    resultId: input.resultId,
    memberId: input.memberId,
    boundaryCondition: input.boundaryCondition,
    spanM: L,
    combinationId: input.combinationId,
    loadCaseIds: [...new Set(input.applications.map((row) => row.loadCaseId))],
    methods: parts.length > 1
      ? ["LINEAR_SUPERPOSITION", ...new Set(parts.map((part) => part.methodId))]
      : [...new Set(parts.map((part) => part.methodId))],
    reactions: {
      startFyN: combined.startFyN,
      endFyN: combined.endFyN,
      startMzNm: combined.startMzNm,
      endMzNm: combined.endMzNm,
      unitForce: "N",
      unitMoment: "N.m",
    },
    shear: envelope(combined.stations, "shearN"),
    moment: envelope(combined.stations, "momentNm"),
    axial: combined.axialN === 0
      ? { status: "NO_AXIAL_COMPONENTS", valueN: 0 }
      : { valueN: combined.axialN, unit: "N", method: "AXIAL_DIRECT" },
    deflection,
    torsion: { status: "NOT_IMPLEMENTED" },
    stiffness,
    equilibriumResidual: { forceN: forceResidual, momentNm: momentResidual },
    outputClass: "DETERMINISTIC_DEMAND",
    capacityPresent: false,
    designPassFailPresent: false,
    humanReviewRequired: true,
    approvalState: "not_approved",
    llmOriginated: false,
    standardContext: context,
    toolRef: STRUCTURAL_SOLVER_BOUNDARY.engineId,
    toolVersion: STRUCTURAL_SOLVER_BOUNDARY.engineVersion,
    provenanceRef: governedProvenance({
      jurisdiction: context.jurisdictionProfileRef,
      standard: context.standardCode,
      calculationMethod: combined.methodId,
      tool: STRUCTURAL_SOLVER_BOUNDARY.engineId,
      version: STRUCTURAL_SOLVER_BOUNDARY.engineVersion,
      timestamp: "2026-10-05T00:00:00.000Z",
      validationState: "unvalidated",
      approvalState: "not_approved",
      sourceEvidence: input.evidenceRefs.map((row) => row.evidenceId).join(",") || "human_input",
    }),
    inputEvidenceRefs: input.evidenceRefs,
    foundationReactionHandoff: {
      startFyN: combined.startFyN,
      endFyN: combined.endFyN,
      startMzNm: combined.startMzNm,
      endMzNm: combined.endMzNm,
      geotechnicalCapacityCalculated: false,
    },
  };
}

export function toDemandHandoff(result: StructuralDemandResult): StructuralDemandHandoff {
  return {
    demandResultId: result.resultId,
    futureCapacityResultRef: null,
    futureUtilizationResultRef: null,
    analysisResult: {
      resultType: "DETERMINISTIC_DEMAND",
      outputClass: "DETERMINISTIC_RESULT",
      solverSuccessImpliesApproval: false,
      memberActions: [
        { objectRef: result.memberId, quantity: "shear", value: result.shear.signed, units: result.shear.unit },
        { objectRef: result.memberId, quantity: "moment", value: result.moment.signed, units: result.moment.unit },
        { objectRef: result.memberId, quantity: "axial", value: "valueN" in result.axial ? result.axial.valueN : 0, units: "N" },
      ],
      reactions: [
        { objectRef: `${result.memberId}:start`, quantity: "Fy", value: result.reactions.startFyN, units: "N" },
        { objectRef: `${result.memberId}:end`, quantity: "Fy", value: result.reactions.endFyN, units: "N" },
        { objectRef: `${result.memberId}:start`, quantity: "Mz", value: result.reactions.startMzNm, units: "N.m" },
        { objectRef: `${result.memberId}:end`, quantity: "Mz", value: result.reactions.endMzNm, units: "N.m" },
      ],
      deflections: "status" in result.deflection
        ? []
        : [{ objectRef: result.memberId, quantity: "v", value: result.deflection.signed, units: result.deflection.unit }],
    },
  };
}

export function computeSimplySupportedUdlDemandFromEngine(input: { udlKNpm: number; spanM: number }): { shearKN: number; momentKNm: number } {
  const result = runDeterministicDemand({
    resultId: "legacy-udl",
    memberId: "legacy-member",
    spanM: input.spanM,
    spanUnit: "m",
    boundaryCondition: "SIMPLE_SIMPLE",
    applications: [{
      applicationId: "legacy-udl",
      loadCaseId: "legacy-case",
      actionCategory: "OTHER",
      kind: "UNIFORM_DISTRIBUTED_LOAD",
      coordinateSystem: "LOCAL_MEMBER",
      memberLocalResolved: true,
      targetMemberId: "legacy-member",
      targetNodeId: null,
      positionM: null,
      startM: 0,
      endM: input.spanM,
      magnitude: { value: input.udlKNpm, unit: "kN/m" },
      endMagnitude: null,
      direction: "TRANSVERSE",
      evidenceRef: null,
      externalSource: null,
    }],
    factors: [{ loadCaseId: "legacy-case", factor: 1, provenanceRef: "legacy", source: "HUMAN_ENTERED" }],
    combinationId: null,
    standardContext: "JURISDICTION_NEUTRAL_STATICS",
    evidenceRefs: [],
  });
  return {
    shearKN: result.reactions.startFyN / 1000,
    momentKNm: result.moment.value / 1000,
  };
}

export const D1C_D0_RISK_DISPOSITION = {
  CLOSED: [] as const,
  REDUCED: ["D0-R07", "D0-R08"] as const,
  REMAINING: ["D0-R01", "D0-R02", "D0-R03", "D0-R04", "D0-R05", "D0-R09", "D0-R10", "D0-R11", "D0-R12"] as const,
} as const;

export const D1C_RISK_ALLOCATION = {
  D1D: "Steel capacity/utilization consume D1C demand results; D1C must not be treated as a design check.",
  D1E: "Concrete capacity/utilization consume the same demand handoff.",
  D1G: "External solvers remain uncertified; mismatch versus D1C demand is evidence, not silent merge.",
} as const;
