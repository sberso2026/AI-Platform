/**
 * EOS-A5D SPACE GASS certification model.
 * Certifies execution readiness, not Structural Optimization.
 */

export const SPACE_GASS_CERTIFICATION_MODEL_ID = "eos-a5d-single-bay-portal" as const;
export const SPACE_GASS_RELATIVE_TOLERANCE = 0.005;

export const SPACE_GASS_CERTIFICATION_UNITS = {
  geometry: "m",
  force: "kN",
  moment: "kN.m",
  displacement: "mm",
  mass: "t",
} as const;

/** Single-bay steel portal, linear elastic static, pinned bases, gravity only. */
export const SPACE_GASS_CERTIFICATION_MODEL = {
  id: SPACE_GASS_CERTIFICATION_MODEL_ID,
  description: "Single-bay steel portal frame, pinned bases, uniform rafter gravity load",
  analysis: "linear_elastic_static",
  material: {
    name: "Steel Grade 300",
    E_GPa: 200,
    poisson: 0.3,
    density_kg_m3: 7850,
  },
  geometry_m: {
    span: 8,
    eavesHeight: 4,
    rafterPitchDeg: 0,
  },
  sections: {
    columns: "310UC97",
    rafter: "360UB45",
  },
  supports: {
    leftBase: "pinned",
    rightBase: "pinned",
  },
  loads: {
    rafterUdl_kN_per_m: 10,
    lateral_kN: 0,
  },
  nodes: [
    { id: "N1", x: 0, y: 0, role: "left_base" },
    { id: "N2", x: 0, y: 4, role: "left_eaves" },
    { id: "N3", x: 8, y: 4, role: "right_eaves" },
    { id: "N4", x: 8, y: 0, role: "right_base" },
  ],
  members: [
    { id: "C1", from: "N1", to: "N2", section: "310UC97" },
    { id: "R1", from: "N2", to: "N3", section: "360UB45" },
    { id: "C2", from: "N4", to: "N3", section: "310UC97" },
  ],
} as const;

export function totalVerticalLoadkN(model = SPACE_GASS_CERTIFICATION_MODEL): number {
  return model.loads.rafterUdl_kN_per_m * model.geometry_m.span;
}

/** Independent equilibrium check — not a second FEA engine. */
export type IndependentSanityInput = {
  leftVerticalReaction_kN: number;
  rightVerticalReaction_kN: number;
  leftHorizontalReaction_kN: number;
  rightHorizontalReaction_kN: number;
  totalAppliedVertical_kN: number;
  totalAppliedHorizontal_kN: number;
  relativeTolerance?: number;
};

export type IndependentSanityResult = {
  ok: boolean;
  failures: string[];
  expectedLeftVertical_kN: number;
  expectedRightVertical_kN: number;
};

export function independentReactionSanity(input: IndependentSanityInput): IndependentSanityResult {
  const tol = input.relativeTolerance ?? SPACE_GASS_RELATIVE_TOLERANCE;
  const failures: string[] = [];
  const verticalSum = input.leftVerticalReaction_kN + input.rightVerticalReaction_kN;
  const horizontalSum = input.leftHorizontalReaction_kN + input.rightHorizontalReaction_kN;
  const expectedEachVertical = input.totalAppliedVertical_kN / 2;

  if (!withinRelative(verticalSum, input.totalAppliedVertical_kN, tol)) {
    failures.push("vertical_reaction_equilibrium");
  }
  if (!withinRelative(horizontalSum, input.totalAppliedHorizontal_kN, tol) && Math.abs(input.totalAppliedHorizontal_kN) > 1e-9) {
    failures.push("horizontal_reaction_equilibrium");
  } else if (Math.abs(input.totalAppliedHorizontal_kN) <= 1e-9 && Math.abs(horizontalSum) > Math.max(0.01, tol * input.totalAppliedVertical_kN)) {
    failures.push("horizontal_reaction_should_be_near_zero");
  }
  if (!withinRelative(input.leftVerticalReaction_kN, expectedEachVertical, tol)) {
    failures.push("left_vertical_symmetry");
  }
  if (!withinRelative(input.rightVerticalReaction_kN, expectedEachVertical, tol)) {
    failures.push("right_vertical_symmetry");
  }

  return {
    ok: failures.length === 0,
    failures,
    expectedLeftVertical_kN: expectedEachVertical,
    expectedRightVertical_kN: expectedEachVertical,
  };
}

export function withinRelative(actual: number, expected: number, relativeTolerance = SPACE_GASS_RELATIVE_TOLERANCE): boolean {
  if (!Number.isFinite(actual) || !Number.isFinite(expected)) return false;
  const denom = Math.max(Math.abs(expected), 1e-9);
  return Math.abs(actual - expected) / denom <= relativeTolerance;
}

export const SPACE_GASS_EXPECTED_BENCHMARK = {
  supportReactions: {
    leftVertical_kN: totalVerticalLoadkN() / 2,
    rightVertical_kN: totalVerticalLoadkN() / 2,
    leftHorizontal_kN: 0,
    rightHorizontal_kN: 0,
  },
  notes: [
    "Vertical reactions follow global equilibrium for symmetric gravity load.",
    "Member forces and displacements require the licensed SPACE GASS extraction path; they are not fabricated here.",
    "Portal-frame moments are statically indeterminate; independent sanity is reaction equilibrium only.",
  ],
} as const;

export function isSpaceGassAdapterId(adapterId: string | null | undefined): boolean {
  const id = (adapterId ?? "").trim().toLowerCase();
  return id === "spacegass" || id === "spacegass_solver_adapter";
}
