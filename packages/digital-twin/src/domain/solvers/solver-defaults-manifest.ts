/**
 * Phase 12I — SolverExecutionDefaultsManifest.
 *
 * All material defaults / pins must be explicit. Unknown defaults fail closed.
 */

export const SOLVER_EXECUTION_DEFAULTS_MANIFEST_VERSION =
  "1.0.0-calculix-linear-elastic-static" as const;

export type SolverExecutionDefaultsManifest = {
  version: typeof SOLVER_EXECUTION_DEFAULTS_MANIFEST_VERSION;
  solverId: "calculix";
  methodKey: "linear_elastic_static";
  unitSystem: "SI";
  unitCode: "N_m";
  youngsModulusPa: number;
  poissonsRatio: number;
  sectionAreaM2: number;
  lengthM: number;
  loadN: number;
  boundaryCondition: "cantilever_tip_load" | "axial_bar_unit_load";
  timeoutMsDefault: number;
  /** Explicit pin — no silent material library lookup. */
  materialPin: string;
  sectionPin: string;
  allowUnknownDefaults: false;
};

export const CALCULIX_LINEAR_ELASTIC_DEFAULTS: SolverExecutionDefaultsManifest = {
  version: SOLVER_EXECUTION_DEFAULTS_MANIFEST_VERSION,
  solverId: "calculix",
  methodKey: "linear_elastic_static",
  unitSystem: "SI",
  unitCode: "N_m",
  /** Steel-like pin for benchmark only — documented, not a hidden library. */
  youngsModulusPa: 210e9,
  poissonsRatio: 0.3,
  sectionAreaM2: 0.01,
  lengthM: 1.0,
  loadN: 1000,
  boundaryCondition: "axial_bar_unit_load",
  timeoutMsDefault: 30_000,
  materialPin: "explicit:steel_E210GPa_nu0.3",
  sectionPin: "explicit:area_0.01_m2",
  allowUnknownDefaults: false,
};

export function assertDefaultsManifest(
  manifest: Partial<SolverExecutionDefaultsManifest> & { version?: string },
): SolverExecutionDefaultsManifest {
  if (manifest.version !== SOLVER_EXECUTION_DEFAULTS_MANIFEST_VERSION) {
    throw new Error("unknown_defaults_manifest_version");
  }
  if (manifest.allowUnknownDefaults === true) {
    throw new Error("unknown_defaults_forbidden");
  }
  if (
    manifest.solverId !== "calculix" ||
    manifest.methodKey !== "linear_elastic_static" ||
    manifest.unitSystem !== "SI" ||
    manifest.unitCode !== "N_m"
  ) {
    throw new Error("defaults_manifest_pin_mismatch");
  }
  const requiredNumeric = [
    "youngsModulusPa",
    "poissonsRatio",
    "sectionAreaM2",
    "lengthM",
    "loadN",
    "timeoutMsDefault",
  ] as const;
  for (const key of requiredNumeric) {
    const v = manifest[key];
    if (typeof v !== "number" || !Number.isFinite(v)) {
      throw new Error(`defaults_manifest_missing:${key}`);
    }
  }
  if (!manifest.materialPin || !manifest.sectionPin) {
    throw new Error("defaults_manifest_missing_pins");
  }
  if (
    manifest.boundaryCondition !== "cantilever_tip_load" &&
    manifest.boundaryCondition !== "axial_bar_unit_load"
  ) {
    throw new Error("defaults_manifest_missing_boundary_condition");
  }
  return {
    version: SOLVER_EXECUTION_DEFAULTS_MANIFEST_VERSION,
    solverId: "calculix",
    methodKey: "linear_elastic_static",
    unitSystem: "SI",
    unitCode: "N_m",
    youngsModulusPa: manifest.youngsModulusPa!,
    poissonsRatio: manifest.poissonsRatio!,
    sectionAreaM2: manifest.sectionAreaM2!,
    lengthM: manifest.lengthM!,
    loadN: manifest.loadN!,
    boundaryCondition: manifest.boundaryCondition,
    timeoutMsDefault: manifest.timeoutMsDefault!,
    materialPin: manifest.materialPin,
    sectionPin: manifest.sectionPin,
    allowUnknownDefaults: false,
  };
}
