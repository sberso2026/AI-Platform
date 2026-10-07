export { screenGenerativeRcCandidate } from "./candidate";
export { discretizeSection, assertDiscretizationConservation } from "./discretization";
export { solveElasticEquilibrium, sectionEquilibriumResidual, assertNonconvergenceFailsClosed } from "./equilibrium";
export { fingerprintRcSectionConfiguration, geometryInvalidationTags } from "./fingerprint";
export {
  computeGrossSectionProperties,
  rectangleSection,
  circularSection,
  flangedTSection,
  lSection,
  polygonalSection,
  expandSectionOutlines,
  geometricClearanceToSurfaceMm,
} from "./geometry";
export { consumeD1cSectionActions, rcSectionOptimizationHandoff, rcSectionMtoHandoff } from "./handoff";
export {
  integrateElasticSection,
  integrateSectionWithMaterialResponse,
  uncrackedElasticSectionReference,
  RC_ELASTIC_REFERENCE_EXCLUSIONS,
  type RcConcreteFiberResponse,
  type RcReinforcementPointResponse,
  type RcSectionIntegrationInput,
} from "./integration";
export {
  createStrainState,
  evaluateStrainField,
  strainAtPoint,
  barStrainFromSectionKinematics,
  neutralAxisFromStrainState,
} from "./kinematics";
export {
  evaluateLinearElasticConcrete,
  evaluateLinearElasticReinforcement,
  linearElasticConcreteModel,
  linearElasticReinforcementModel,
  modularRatio,
} from "./material-response";
export { evaluateBarGeometry, geometricClearances } from "./bars";
export { assertAiCannotOverrideSectionKernel } from "./authority";
