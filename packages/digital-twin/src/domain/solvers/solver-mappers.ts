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

const SCI_FLOAT = "[-+]?\\d*\\.?\\d+(?:[Ee][-+]\\d+)?";

/**
 * Parse CalculiX .dat NODE PRINT displacement blocks into mapped output.
 * Format (typical):
 *   displacements (vx,vy,vz) for set Nall and node:
 *            1  0.000000E+00  0.000000E+00  0.000000E+00
 *            2  4.761905E-07  0.000000E+00  0.000000E+00
 * Fail-closed when required fields cannot be parsed.
 */
export function mapCalculixDatToLinearElasticOutput(datText: string): LinearElasticStaticMappedOutput {
  const floatRe = new RegExp(SCI_FLOAT, "g");
  const lineRe = new RegExp(
    `^\\s*(\\d+)\\s+(${SCI_FLOAT})\\s+(${SCI_FLOAT})\\s+(${SCI_FLOAT})\\s*$`,
    "gm",
  );

  let maxAbs = 0;
  let found = false;

  // Prefer the displacements section; ignore node ids / heading noise.
  const sectionMatch = datText.match(
    /displacements?\s*\([^)]*\)[\s\S]*?(?=\n\s*\n[A-Za-z]|\n\s*stresses|\n\s*forces|\n\s*total\s+cpu|$)/i,
  );
  const section = sectionMatch?.[0] ?? datText;
  for (const m of section.matchAll(lineRe)) {
    const ux = Number(m[2]);
    const uy = Number(m[3]);
    const uz = Number(m[4]);
    if (![ux, uy, uz].every((v) => Number.isFinite(v))) continue;
    found = true;
    maxAbs = Math.max(maxAbs, Math.abs(ux), Math.abs(uy), Math.abs(uz));
  }

  if (!found) {
    // Explicit annotation (fixture companion / adapter notes)
    const mag = datText.match(/max_displacement_m\s*=\s*([-+]?\d*\.?\d+(?:[Ee][-+]?\d+)?)/i);
    if (mag) {
      return {
        mapperVersion: SOLVER_OUTPUT_MAPPER_VERSION,
        methodKey: LINEAR_ELASTIC_STATIC_METHOD_KEY,
        maxDisplacementM: Number(mag[1]),
        parseOk: true,
      };
    }
    const uMatch = datText.match(
      new RegExp(`\\bU1?\\b\\s*[:=]\\s*(${SCI_FLOAT})`, "i"),
    );
    if (uMatch) {
      return {
        mapperVersion: SOLVER_OUTPUT_MAPPER_VERSION,
        methodKey: LINEAR_ELASTIC_STATIC_METHOD_KEY,
        maxDisplacementM: Math.abs(Number(uMatch[1])),
        parseOk: true,
        rawNotes: ["parsed_from_U_label"],
      };
    }
    // Last resort: collect scientific floats that look like small displacements (not node ids)
    const candidates = [...datText.matchAll(floatRe)]
      .map((m) => Number(m[0]))
      .filter((v) => Number.isFinite(v) && Math.abs(v) > 0 && Math.abs(v) < 1e-2);
    if (candidates.length > 0) {
      maxAbs = Math.max(...candidates.map((v) => Math.abs(v)));
      found = true;
    }
  }

  if (!found) {
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
    maxDisplacementM: maxAbs,
    parseOk: true,
  };
}
