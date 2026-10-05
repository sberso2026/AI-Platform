import { createHash } from "node:crypto";
import { computeSimplySupportedUdlDemandFromEngine } from "../../structural-demand/engine";
import { STRUCTURAL_SOLVER_BOUNDARY } from "./freeze";
import type {
  CalculationManifest,
  CalculationResultStatus,
  GovernedStructuralInput,
  MemberCheckQuantities,
  PersistedStructuralCalculation,
  ProvenanceRef,
  StructuralCalculationResult,
  StructuralDesignBasis,
  StructuralDesignStandard,
  StructuralMissingCode,
  StructuralWorkKind,
} from "./types";

export function fingerprintGovernedInputs(inputs: GovernedStructuralInput[]): string {
  const material = inputs
    .filter((row) => row.status === "GOVERNED" && row.value != null && row.value !== "")
    .map((row) => ({
      key: row.key,
      value: row.value,
      unit: row.unit,
      direction: row.direction ?? null,
      loadCase: row.loadCase ?? null,
      revision: row.provenance.revision,
    }))
    .sort((a, b) => a.key.localeCompare(b.key));
  return createHash("sha256").update(JSON.stringify(material)).digest("hex");
}

export function missingFromInputs(inputs: GovernedStructuralInput[], kind: StructuralWorkKind): StructuralMissingCode[] {
  const codes = new Set<StructuralMissingCode>();
  const requiredMissing = inputs.filter((row) => row.required && row.status !== "GOVERNED");
  if (requiredMissing.length) codes.add("DESIGN_BASIS_INCOMPLETE");
  for (const row of inputs) {
    if (row.status === "GOVERNED" || !row.missingCode) continue;
    if (row.required || kind === "STRUCTURAL_DESIGN_BASIS") codes.add(row.missingCode);
  }
  if (kind === "STRUCTURAL_CONNECTION_CHECK") {
    const geometry = inputs.find((row) => row.key === "connection.geometry");
    if (!geometry || geometry.status !== "GOVERNED") {
      codes.add("CONNECTION_GEOMETRY_REQUIRED");
      codes.add("CONNECTION_INPUT_INCOMPLETE");
    }
  }
  if (kind === "STRUCTURAL_FOUNDATION_INPUT_PACKAGE") {
    const geo = inputs.find((row) => row.inputClass === "GEOTECHNICAL");
    if (!geo || geo.status !== "GOVERNED") codes.add("GEOTECHNICAL_INPUT_REQUIRED");
  }
  return [...codes];
}

export function assembleDesignBasis(input: {
  workKind: StructuralWorkKind;
  projectId: string;
  systemId?: string | null;
  assetId?: string | null;
  lifecycleStage?: string | null;
  structuralSystem?: string | null;
  standards: StructuralDesignStandard[];
  inputs: GovernedStructuralInput[];
}): StructuralDesignBasis {
  const missing = missingFromInputs(input.inputs, input.workKind);
  if (!input.standards.some((row) => row.projectApplicability === "CONFIGURED" && row.status === "GOVERNED")) {
    missing.push("GOVERNING_STANDARD_REQUIRED");
  }
  const unique = [...new Set(missing)];
  return {
    workKind: input.workKind,
    projectId: input.projectId,
    systemId: input.systemId ?? null,
    assetId: input.assetId ?? null,
    lifecycleStage: input.lifecycleStage ?? null,
    structuralSystem: input.structuralSystem ?? null,
    dataClassification: "SYNTHETIC_DEMONSTRATION_DATA",
    standards: input.standards,
    inputs: input.inputs,
    missing: unique,
    complete: unique.length === 0,
    incompleteReason: unique.length ? unique.join(", ") : null,
  };
}

function numeric(inputs: GovernedStructuralInput[], key: string): number | null {
  const row = inputs.find((item) => item.key === key && item.status === "GOVERNED");
  return typeof row?.value === "number" && Number.isFinite(row.value) ? row.value : null;
}

/**
 * Bounded simply-supported beam UDL statics.
 * V = wL/2, M = wL^2/8.
 * SYNTHETIC_DEMONSTRATION_DATA — not AS 4100 / AS 3600 capacity.
 */
export function computeSimplySupportedUdlDemand(input: { udlKNpm: number; spanM: number }): { shearKN: number; momentKNm: number } {
  return computeSimplySupportedUdlDemandFromEngine(input);
}

export function combinedUdlKNpm(inputs: GovernedStructuralInput[]): { value: number | null; caseName: string | null; missing: StructuralMissingCode[] } {
  const dead = numeric(inputs, "load.dead.udl");
  const live = numeric(inputs, "load.live.udl");
  const deadFactor = numeric(inputs, "combination.dead.factor");
  const liveFactor = numeric(inputs, "combination.live.factor");
  const caseName = inputs.find((row) => row.key === "combination.name" && row.status === "GOVERNED");
  if (dead == null && live == null) return { value: null, caseName: null, missing: ["LOAD_REQUIRED"] };
  if (deadFactor == null || liveFactor == null || !caseName) {
    return { value: null, caseName: null, missing: ["LOAD_COMBINATION_REQUIRED"] };
  }
  return {
    value: (dead ?? 0) * deadFactor + (live ?? 0) * liveFactor,
    caseName: String(caseName.value),
    missing: [],
  };
}

export function runMemberCheck(basis: StructuralDesignBasis): {
  status: CalculationResultStatus;
  quantities: MemberCheckQuantities;
  warnings: string[];
  limitations: string[];
  missing: StructuralMissingCode[];
} {
  const blocking = basis.missing.filter((code) =>
    code === "DESIGN_BASIS_INCOMPLETE"
    || code === "GEOMETRY_REQUIRED"
    || code === "MATERIAL_GRADE_REQUIRED"
    || code === "LOAD_REQUIRED"
    || code === "LOAD_COMBINATION_REQUIRED"
    || code === "GOVERNING_STANDARD_REQUIRED",
  );
  if (blocking.length) {
    return {
      status: "INPUT_REQUIRED",
      quantities: {
        demandShearKN: null,
        demandMomentKNm: null,
        capacityMomentKNm: null,
        utilization: null,
        serviceability: "NOT_EVALUATED",
        demandStatus: "DEMAND_UNAVAILABLE",
        capacityStatus: "CAPACITY_METHOD_NOT_CERTIFIED",
      },
      warnings: blocking,
      limitations: ["Calculation blocked. Missing governed inputs are not guessed."],
      missing: blocking,
    };
  }
  const span = numeric(basis.inputs, "geometry.span");
  const udl = combinedUdlKNpm(basis.inputs);
  if (span == null || span <= 0) {
    return {
      status: "INPUT_REQUIRED",
      quantities: {
        demandShearKN: null,
        demandMomentKNm: null,
        capacityMomentKNm: null,
        utilization: null,
        serviceability: "NOT_EVALUATED",
        demandStatus: "DEMAND_UNAVAILABLE",
        capacityStatus: "CAPACITY_METHOD_NOT_CERTIFIED",
      },
      warnings: ["GEOMETRY_REQUIRED"],
      limitations: ["Span must be a governed positive length."],
      missing: ["GEOMETRY_REQUIRED"],
    };
  }
  if (udl.value == null) {
    return {
      status: "INPUT_REQUIRED",
      quantities: {
        demandShearKN: null,
        demandMomentKNm: null,
        capacityMomentKNm: null,
        utilization: null,
        serviceability: "NOT_EVALUATED",
        demandStatus: "DEMAND_UNAVAILABLE",
        capacityStatus: "CAPACITY_METHOD_NOT_CERTIFIED",
      },
      warnings: udl.missing,
      limitations: ["Governed UDL and combination required. AI does not invent loads or combinations."],
      missing: udl.missing,
    };
  }
  const demand = computeSimplySupportedUdlDemand({ udlKNpm: udl.value, spanM: span });
  const suppliedCapacity = numeric(basis.inputs, "capacity.moment");
  const capacityStatus = suppliedCapacity == null ? "CAPACITY_METHOD_NOT_CERTIFIED" : "CAPACITY_SUPPLIED";
  const utilization = suppliedCapacity != null && suppliedCapacity > 0 ? demand.momentKNm / suppliedCapacity : null;
  return {
    status: suppliedCapacity == null ? "METHOD_NOT_CERTIFIED" : "CALCULATED",
    quantities: {
      demandShearKN: demand.shearKN,
      demandMomentKNm: demand.momentKNm,
      capacityMomentKNm: suppliedCapacity,
      utilization,
      serviceability: "NOT_EVALUATED",
      demandStatus: "DEMAND_AVAILABLE",
      capacityStatus,
    },
    warnings: [
      ...(suppliedCapacity == null ? ["CAPACITY_METHOD_NOT_CERTIFIED"] : []),
      ...basis.inputs.filter((row) => !row.required && row.status !== "GOVERNED" && row.missingCode).map((row) => row.missingCode as string),
    ],
    limitations: [
      "Demand uses SYNTHETIC_SS_BEAM_UDL_STATICS (V=wL/2, M=wL^2/8). Not a SPACE GASS / FEA / frame analysis result.",
      "AS 4100 / AS 3600 member capacity equations are not certified in EOS. Capacity is engineer-supplied or METHOD_NOT_CERTIFIED.",
      "Calculation success is not DESIGN_APPROVED.",
    ],
    missing: suppliedCapacity == null ? ["CAPACITY_METHOD_NOT_CERTIFIED"] : [],
  };
}

export function connectionWorkflow(basis: StructuralDesignBasis): { status: "CONNECTION_INPUT_INCOMPLETE"; missing: StructuralMissingCode[] } {
  const missing = missingFromInputs(basis.inputs, "STRUCTURAL_CONNECTION_CHECK");
  return { status: "CONNECTION_INPUT_INCOMPLETE", missing: missing.length ? missing : ["CONNECTION_INPUT_INCOMPLETE"] };
}

export function foundationInputPackage(basis: StructuralDesignBasis, demand: MemberCheckQuantities): {
  status: "INPUT_PACKAGE_ONLY" | "GEOTECHNICAL_INPUT_REQUIRED";
  reactions: { shearKN: number | null; momentKNm: number | null };
  missing: StructuralMissingCode[];
} {
  const geo = basis.inputs.find((row) => row.inputClass === "GEOTECHNICAL" && row.status === "GOVERNED");
  return {
    status: geo ? "INPUT_PACKAGE_ONLY" : "GEOTECHNICAL_INPUT_REQUIRED",
    reactions: { shearKN: demand.demandShearKN, momentKNm: demand.demandMomentKNm },
    missing: geo ? [] : ["GEOTECHNICAL_INPUT_REQUIRED"],
  };
}

export function buildManifest(input: {
  id: string;
  workPlanId: string;
  createdBy: string | null;
  basis: StructuralDesignBasis;
}): CalculationManifest {
  const fingerprint = fingerprintGovernedInputs(input.basis.inputs);
  const standard = input.basis.standards.find((row) => row.projectApplicability === "CONFIGURED" && row.status === "GOVERNED") ?? null;
  return {
    id: input.id,
    workPlanId: input.workPlanId,
    projectId: input.basis.projectId,
    systemId: input.basis.systemId,
    assetId: input.basis.assetId,
    discipline: "STRUCTURAL",
    workKind: input.basis.workKind,
    calculationType: input.basis.workKind,
    designStandard: standard,
    inputRefs: input.basis.inputs.filter((row) => row.status === "GOVERNED").map((row) => row.provenance),
    inputFingerprint: fingerprint,
    assumptions: input.basis.inputs.filter((row) => row.inputClass === "ASSUMPTION").map((row) => String(row.value ?? row.label)),
    loadCases: input.basis.inputs.filter((row) => row.inputClass === "LOAD" && row.status === "GOVERNED").map((row) => row.loadCase ?? row.key),
    loadCombinations: input.basis.inputs.filter((row) => row.inputClass === "LOAD_COMBINATION" && row.status === "GOVERNED").map((row) => String(row.value ?? row.label)),
    engineId: STRUCTURAL_SOLVER_BOUNDARY.engineId,
    engineVersion: STRUCTURAL_SOLVER_BOUNDARY.engineVersion,
    expectedOutputs: ["DEMAND", "CAPACITY", "UTILIZATION", "SERVICEABILITY", "STATUS"],
    createdAt: new Date().toISOString(),
    createdBy: input.createdBy,
    verificationStatus: "UNVERIFIED",
  };
}

export function buildResult(input: {
  id: string;
  manifest: CalculationManifest;
  basis: StructuralDesignBasis;
}): StructuralCalculationResult {
  const member = runMemberCheck(input.basis);
  const connection = connectionWorkflow(input.basis);
  const foundation = foundationInputPackage(input.basis, member.quantities);
  const status: CalculationResultStatus = member.status === "CALCULATED" ? "REVIEW_REQUIRED" : member.status;
  return {
    id: input.id,
    manifestId: input.manifest.id,
    calculationType: input.manifest.calculationType,
    toolEngine: STRUCTURAL_SOLVER_BOUNDARY.engineId,
    toolVersion: STRUCTURAL_SOLVER_BOUNDARY.engineVersion,
    status,
    reviewStatus: "UNVERIFIED",
    inputFingerprint: input.manifest.inputFingerprint,
    results: {
      ...member.quantities,
      connection: connection.status,
      foundation: foundation.status,
      units: { force: "kN", moment: "kN.m", length: "m", mass: "kg" },
    },
    warnings: [...new Set([...member.warnings, ...connection.missing, ...foundation.missing])],
    limitations: member.limitations,
    executedAt: new Date().toISOString(),
    executedBy: STRUCTURAL_SOLVER_BOUNDARY.engineId,
    reviewAction: null,
    reviewedAt: null,
    reviewedBy: null,
    engineeringApproved: false,
    dataClassification: "SYNTHETIC_DEMONSTRATION_DATA",
  };
}

/** Immutable only when status or reviewStatus is VERIFIED_BY_ENGINEER. UNVERIFIED / REVIEW_REQUIRED / STALE / INPUT_REQUIRED rows may be updated in place. */
export function isVerifiedImmutable(row: PersistedStructuralCalculation): boolean {
  return row.status === "VERIFIED_BY_ENGINEER" || row.reviewStatus === "VERIFIED_BY_ENGINEER";
}

export function fingerprintMismatch(row: PersistedStructuralCalculation, basis: StructuralDesignBasis): boolean {
  return row.inputFingerprint !== fingerprintGovernedInputs(basis.inputs);
}

export function composeStructuralThread(row: PersistedStructuralCalculation): PersistedStructuralCalculation["thread"] {
  const links: PersistedStructuralCalculation["thread"] = [];
  for (const ref of row.manifest.inputRefs) {
    links.push({
      relationship: "SOURCE_FOR",
      fromType: "engineering_information",
      fromId: ref.sourceId,
      toType: "calculation_manifest",
      toId: row.manifest.id,
    });
  }
  if (row.result) {
    links.push({
      relationship: "PRODUCED",
      fromType: "calculation_manifest",
      fromId: row.manifest.id,
      toType: "calculation_result",
      toId: row.result.id,
    });
    links.push({
      relationship: "USED_BY",
      fromType: "calculation_result",
      fromId: row.result.id,
      toType: "engineering_work_plan",
      toId: row.workPlanId,
    });
  }
  if (row.supersedesId) {
    links.push({
      relationship: "SUPERSEDED_BY",
      fromType: "calculation_result",
      fromId: row.supersedesId,
      toType: "calculation_result",
      toId: row.id,
    });
  }
  return links;
}

export function composeStructuralAttention(row: PersistedStructuralCalculation | null, basis: StructuralDesignBasis | null): Array<{ kind: string; title: string; code: string }> {
  const gaps: Array<{ kind: string; title: string; code: string }> = [];
  const missing = row?.missingCodes ?? basis?.missing ?? [];
  if (missing.includes("DESIGN_BASIS_INCOMPLETE") || missing.includes("MATERIAL_GRADE_REQUIRED") || missing.includes("GEOMETRY_REQUIRED") || missing.includes("LOAD_REQUIRED")) {
    gaps.push({ kind: "STRUCTURAL", title: "Design basis incomplete", code: missing.find((code) => code !== "DESIGN_BASIS_INCOMPLETE") ?? "DESIGN_BASIS_INCOMPLETE" });
  }
  if (row?.status === "STALE") gaps.push({ kind: "STRUCTURAL", title: "Calculation input changed — recalculation required", code: "RECALCULATION_REQUIRED" });
  if (row?.status === "REVIEW_REQUIRED") gaps.push({ kind: "STRUCTURAL", title: "Calculation requires engineer review", code: "REVIEW_REQUIRED" });
  if (missing.includes("CONNECTION_GEOMETRY_REQUIRED")) gaps.push({ kind: "STRUCTURAL", title: "Connection geometry required", code: "CONNECTION_GEOMETRY_REQUIRED" });
  if (missing.includes("GEOTECHNICAL_INPUT_REQUIRED")) gaps.push({ kind: "STRUCTURAL", title: "Interface information required (geotechnical)", code: "GEOTECHNICAL_INPUT_REQUIRED" });
  return gaps;
}

export function provenanceOf(input: Omit<ProvenanceRef, "status"> & { status?: ProvenanceRef["status"] }): ProvenanceRef {
  return { status: "GOVERNED", ...input };
}
