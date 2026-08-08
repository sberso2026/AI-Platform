/**
 * Phase 12I — SolverInputMapper / SolverOutputMapper for the ONE certified method:
 * linear elastic static structural analysis (CalculiX-backed).
 *
 * Versioned mappers; CalculiX .inp details stay inside the CalculiX adapter.
 */

export const LINEAR_ELASTIC_STATIC_METHOD_KEY = "linear_elastic_static" as const;
export const SOLVER_INPUT_MAPPER_VERSION = "1.0.0-linear-elastic-static" as const;
export const SOLVER_OUTPUT_MAPPER_VERSION = "1.0.0-linear-elastic-static" as const;

export type LinearElasticStaticInput = {
  methodKey: typeof LINEAR_ELASTIC_STATIC_METHOD_KEY;
  unitSystem: "SI";
  unitCode: "N_m";
  /** Young's modulus (Pa) — must be explicit. */
  youngsModulusPa: number;
  /** Poisson ratio — must be explicit. */
  poissonsRatio: number;
  /** Cross-section area (m²) for bar/cantilever idealization. */
  sectionAreaM2: number;
  /** Length (m). */
  lengthM: number;
  /** Axial or tip load (N). Positive tension / downward tip depending on benchmark. */
  loadN: number;
  /** Boundary condition: fixed_free cantilever or fixed_axial bar. */
  boundaryCondition: "cantilever_tip_load" | "axial_bar_unit_load";
};

export type LinearElasticStaticMappedOutput = {
  mapperVersion: typeof SOLVER_OUTPUT_MAPPER_VERSION;
  methodKey: typeof LINEAR_ELASTIC_STATIC_METHOD_KEY;
  maxDisplacementM?: number;
  maxStressPa?: number;
  reactionForceN?: number;
  rawNotes?: string[];
  parseOk: boolean;
  errorCode?: string;
};

export function mapLinearElasticStaticInput(input: LinearElasticStaticInput): {
  ok: true;
  mapperVersion: typeof SOLVER_INPUT_MAPPER_VERSION;
  normalized: LinearElasticStaticInput;
} | {
  ok: false;
  errorCode: string;
} {
  if (input.methodKey !== LINEAR_ELASTIC_STATIC_METHOD_KEY) {
    return { ok: false, errorCode: "unsupported_method_key" };
  }
  if (input.unitSystem !== "SI" || input.unitCode !== "N_m") {
    return { ok: false, errorCode: "unit_mismatch" };
  }
  if (
    !(input.youngsModulusPa > 0) ||
    !(input.sectionAreaM2 > 0) ||
    !(input.lengthM > 0) ||
    !Number.isFinite(input.loadN) ||
    input.poissonsRatio < 0 ||
    input.poissonsRatio >= 0.5
  ) {
    return { ok: false, errorCode: "invalid_input" };
  }
  if (
    input.boundaryCondition !== "cantilever_tip_load" &&
    input.boundaryCondition !== "axial_bar_unit_load"
  ) {
    return { ok: false, errorCode: "missing_boundary_condition" };
  }
  return {
    ok: true,
    mapperVersion: SOLVER_INPUT_MAPPER_VERSION,
    normalized: { ...input },
  };
}

/**
 * Analytical reference for the axial bar benchmark:
 * δ = PL / (AE)
 */
export function analyticalAxialBarDisplacementM(input: {
  loadN: number;
  lengthM: number;
  youngsModulusPa: number;
  sectionAreaM2: number;
}): number {
  return (input.loadN * input.lengthM) / (input.youngsModulusPa * input.sectionAreaM2);
}

/**
 * Parse a minimal CalculiX .dat displacement line set into mapped output.
 * Fail-closed when required fields cannot be parsed.
 */
export function mapCalculixDatToLinearElasticOutput(datText: string): LinearElasticStaticMappedOutput {
  const displMatches = [...datText.matchAll(/displacements?\s*\(.*?\)[\s\S]*?([-+]?\d*\.?\d+(?:[Ee][-+]?\d+)?)/gi)];
  const uMatch = datText.match(/U\s*[:=]\s*([-+]?\d*\.?\d+(?:[Ee][-+]?\d+)?)/i);
  const numeric = uMatch?.[1] ?? displMatches[0]?.[1];
  if (!numeric) {
    // Fallback: last floating token labeled as displacement magnitude in fixture notes
    const mag = datText.match(/max_displacement_m\s*=\s*([-+]?\d*\.?\d+(?:[Ee][-+]?\d+)?)/i);
    if (!mag) {
      return {
        mapperVersion: SOLVER_OUTPUT_MAPPER_VERSION,
        methodKey: LINEAR_ELASTIC_STATIC_METHOD_KEY,
        parseOk: false,
        errorCode: "output_parse_failed",
      };
    }
    return {
      mapperVersion: SOLVER_OUTPUT_MAPPER_VERSION,
      methodKey: LINEAR_ELASTIC_STATIC_METHOD_KEY,
      maxDisplacementM: Number(mag[1]),
      parseOk: true,
    };
  }
  return {
    mapperVersion: SOLVER_OUTPUT_MAPPER_VERSION,
    methodKey: LINEAR_ELASTIC_STATIC_METHOD_KEY,
    maxDisplacementM: Number(numeric),
    parseOk: true,
  };
}
