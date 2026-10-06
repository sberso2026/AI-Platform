import type {
  ConcreteMaterial,
  RcReinforcementDisplacementTreatment,
  RcSectionGeometryInput,
  ReinforcementLayout,
  ReinforcementMaterial,
  StructuralDemandResult,
} from "@rtb/types";
import {
  D1C_EQUALS_GENERAL_CONCRETE_ANALYSIS,
  DEFAULT_CONCRETE_CARBON_FACTOR,
  DEFAULT_REINFORCEMENT_CARBON_FACTOR,
  PARALLEL_RC_STRUCTURAL_ANALYSIS_ENGINE_CREATED,
} from "@rtb/types";
import { consumeConcreteDemandHandoff } from "../orchestration";
import { evaluateBarGeometry, geometricClearances } from "./bars";
import { computeGrossSectionProperties } from "./geometry";
import { fingerprintRcSectionConfiguration } from "./fingerprint";
import { failClosed } from "./units";

export function consumeD1cSectionActions(demand: StructuralDemandResult): { N_N: number; Mx_Nm: number; My_Nm: number; demandResultId: string } {
  if (PARALLEL_RC_STRUCTURAL_ANALYSIS_ENGINE_CREATED) failClosed("parallel RC structural analysis engine is forbidden");
  if (D1C_EQUALS_GENERAL_CONCRETE_ANALYSIS) failClosed("D1C is not general concrete analysis");
  const demandResultId = consumeConcreteDemandHandoff(demand);
  const N_N = demand.axial.valueN;
  const Mx_Nm = demand.moment.unit === "N.m" ? demand.moment.signed : failClosed("D1C moment unit must be N.m");
  return { N_N, Mx_Nm, My_Nm: 0, demandResultId };
}

export function rcSectionOptimizationHandoff(input: {
  geometry: RcSectionGeometryInput;
  layout: ReinforcementLayout;
  concrete: ConcreteMaterial;
  reinforcement: ReinforcementMaterial;
  displacementTreatment: RcReinforcementDisplacementTreatment;
  memberLengthM?: number;
}): {
  areaMm2: number;
  centroid: { xMm: number; yMm: number };
  IxMm4: number;
  IyMm4: number;
  IxyMm4: number;
  reinforcementAreaMm2: number;
  reinforcementCentroid: { xMm: number; yMm: number } | null;
  geometricClearanceMm: number | null;
  materialRefs: { concreteRef: string; reinforcementRef: string };
  massVolumeHooks: { concreteAreaMm2: number; concreteVolumeM3: number | null };
  fingerprint: string;
  mechanicsValidationState: "GEOMETRY_AND_MECHANICS_REFERENCE";
} {
  const props = computeGrossSectionProperties(input.geometry);
  const bars = evaluateBarGeometry(input.layout, input.geometry);
  const clearance = geometricClearances(input.layout, input.geometry);
  return {
    areaMm2: props.grossConcreteAreaMm2,
    centroid: { xMm: props.centroidXMm, yMm: props.centroidYMm },
    IxMm4: props.IxMm4,
    IyMm4: props.IyMm4,
    IxyMm4: props.IxyMm4,
    reinforcementAreaMm2: bars.totalAreaMm2,
    reinforcementCentroid: bars.centroid,
    geometricClearanceMm: clearance.length ? Math.min(...clearance.map((row) => row.geometricClearanceMm)) : null,
    materialRefs: { concreteRef: input.concrete.materialRef, reinforcementRef: input.reinforcement.materialRef },
    massVolumeHooks: {
      concreteAreaMm2: props.grossConcreteAreaMm2,
      concreteVolumeM3: input.memberLengthM != null ? (props.grossConcreteAreaMm2 * 1e-6) * input.memberLengthM : null,
    },
    fingerprint: fingerprintRcSectionConfiguration({
      geometry: input.geometry,
      layout: input.layout,
      concreteRef: input.concrete.materialRef,
      reinforcementRef: input.reinforcement.materialRef,
      unitContext: "mm",
      displacementTreatment: input.displacementTreatment,
    }),
    mechanicsValidationState: "GEOMETRY_AND_MECHANICS_REFERENCE",
  };
}

export function rcSectionMtoHandoff(input: {
  geometry: RcSectionGeometryInput;
  layout: ReinforcementLayout;
  memberLengthM?: number;
}): {
  concreteCrossSectionAreaMm2: number;
  reinforcementAreaMm2: number;
  barCount: number;
  barLengthM: number | null;
  concreteVolumeM3: number | null;
  emissionFactorEmbedded: false;
} {
  if (DEFAULT_CONCRETE_CARBON_FACTOR || DEFAULT_REINFORCEMENT_CARBON_FACTOR) failClosed("default carbon factors are forbidden");
  const props = computeGrossSectionProperties(input.geometry);
  const bars = evaluateBarGeometry(input.layout, input.geometry);
  const barCount = bars.bars.reduce((sum, bar) => sum + bar.count, 0);
  return {
    concreteCrossSectionAreaMm2: props.grossConcreteAreaMm2,
    reinforcementAreaMm2: bars.totalAreaMm2,
    barCount,
    barLengthM: input.memberLengthM != null ? barCount * input.memberLengthM : null,
    concreteVolumeM3: input.memberLengthM != null ? (props.grossConcreteAreaMm2 * 1e-6) * input.memberLengthM : null,
    emissionFactorEmbedded: false,
  };
}
