export { assertEuC2AiBoundary, assertEuC2ArchitectureFreeze } from "./authority";
export {
  bindEuC2MaterialIntegrator,
  euC2RectangularBounds,
  euC2UlsStrainFromNa,
  evaluateEuC2UniaxialFlexureResistance,
  euC2MomentSignFromDemand,
  solveEuProfileUlsAxialTarget,
  type EuC2FlexureSolveInput,
  type EuC2FlexureSolveResult,
} from "./evaluate";
export {
  EU_C2_GOLDEN_CASES,
  EU_C2_INDEPENDENT_BENCHMARK_ASSUMPTION,
  EU_C2_INDEPENDENT_HAND_EPS_CU2,
  EU_C2_INDEPENDENT_HAND_ETA,
  EU_C2_INDEPENDENT_HAND_LAMBDA,
  independentEquivalentRectangularResistance,
} from "./golden";
export { assertStaleEuC2NotReused, euC2InvalidationTags, euC2ResultFingerprint } from "./invalidation";
