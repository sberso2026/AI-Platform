import {
  D1E1_EQUILIBRIUM_SOLVER_REUSED_FOR_US_CONCRETE,
  D1E1_GEOMETRY_REUSED_FOR_US_CONCRETE,
  D1E1_KINEMATICS_REUSED_FOR_US_CONCRETE,
  D1E1_SECTION_INTEGRATOR_REUSED_FOR_US_CONCRETE,
  PARALLEL_US_CONCRETE_NEUTRAL_AXIS_SOLVER_CREATED,
  PARALLEL_US_CONCRETE_SECTION_INTEGRATOR_CREATED,
  PARALLEL_US_RC_SECTION_KERNEL_CREATED,
} from "@rtb/types";
import { solveElasticEquilibrium } from "../section-mechanics/equilibrium";
import { computeGrossSectionProperties, rectangleSection } from "../section-mechanics/geometry";
import { integrateElasticSection } from "../section-mechanics/integration";
import { createStrainState } from "../section-mechanics/kinematics";

export function assertUsConcreteReusesD1e1Kernel(): void {
  if (PARALLEL_US_RC_SECTION_KERNEL_CREATED) throw new Error("parallel US RC section kernel is forbidden");
  if (PARALLEL_US_CONCRETE_SECTION_INTEGRATOR_CREATED) throw new Error("parallel US concrete section integrator is forbidden");
  if (PARALLEL_US_CONCRETE_NEUTRAL_AXIS_SOLVER_CREATED) throw new Error("parallel US concrete neutral-axis solver is forbidden");
  if (!D1E1_GEOMETRY_REUSED_FOR_US_CONCRETE || !D1E1_KINEMATICS_REUSED_FOR_US_CONCRETE) {
    throw new Error("US concrete must reuse D1E-1 geometry and kinematics");
  }
  if (!D1E1_SECTION_INTEGRATOR_REUSED_FOR_US_CONCRETE || !D1E1_EQUILIBRIUM_SOLVER_REUSED_FOR_US_CONCRETE) {
    throw new Error("US concrete must reuse D1E-1 integrator and equilibrium solver");
  }
  void rectangleSection;
  void computeGrossSectionProperties;
  void createStrainState;
  void integrateElasticSection;
  void solveElasticEquilibrium;
}
