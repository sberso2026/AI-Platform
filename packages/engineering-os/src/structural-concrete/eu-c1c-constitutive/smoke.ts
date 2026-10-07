import type { ConcreteMaterial, ReinforcementLayout, ReinforcementMaterial } from "@rtb/types";
import {
  EU_C1C_CONSTITUTIVE_MODEL_ID,
  EU_C1C_CONSTITUTIVE_REO_MODEL_ID,
  EU_C1C_CONSTITUTIVE_TEST_ONLY_NON_CONFORMANCE,
} from "@rtb/types";
import {
  createStrainState,
  integrateSectionWithMaterialResponse,
  rectangleSection,
} from "../section-mechanics";
import {
  assertTestOnlyNdpNeverDefault,
  bindEuC1ConcreteFiberResponse,
  bindEuC1ReinforcementPointResponse,
  type EuC1cConstitutiveContext,
} from "./evaluate";

export function runEuC2PreintegrationSmokeTest(input: {
  concrete: ConcreteMaterial;
  reinforcement: ReinforcementMaterial;
  layout: ReinforcementLayout;
  context: EuC1cConstitutiveContext;
}): {
  ok: true;
  labelledCodeCapacity: false;
  memberResistanceClaimed: false;
  N_N: number;
  Mx_Nm: number;
  concreteModelId: string;
  reinforcementModelId: string;
  testOnlyNonConformance: typeof EU_C1C_CONSTITUTIVE_TEST_ONLY_NON_CONFORMANCE;
} {
  assertTestOnlyNdpNeverDefault(input.context);
  if (!input.context.testOnlyNonConformance) {
    throw new Error("C2 pre-integration smoke test requires TEST_ONLY_NON_CONFORMANCE marked NDP context");
  }
  const geometry = rectangleSection("eu-c2-smoke", 300, 500, "eu-c2-smoke");
  const strain = createStrainState(-0.001, 0.00001, 0, { xMm: 150, yMm: 250 });
  const result = integrateSectionWithMaterialResponse({
    geometry,
    layout: input.layout,
    concrete: input.concrete,
    reinforcement: input.reinforcement,
    strain,
    displacementTreatment: "CONCRETE_GROSS_SEPARATE",
    crackState: "CRACK_STATE_NOT_EVALUATED",
    tensionTreatment: "NO_TENSION",
    resolutionX: 20,
    resolutionY: 20,
    provenanceRef: "eu-c2-preintegration-smoke",
    concreteResponse: bindEuC1ConcreteFiberResponse(input.context),
    reinforcementResponse: bindEuC1ReinforcementPointResponse(input.context),
    concreteModelId: EU_C1C_CONSTITUTIVE_MODEL_ID,
    reinforcementModelId: EU_C1C_CONSTITUTIVE_REO_MODEL_ID,
    resultAuthority: "MECHANICS_REFERENCE",
  });
  if (result.labelledCodeCapacity) throw new Error("smoke test must not label code capacity");
  if (!Number.isFinite(result.N_N) || !Number.isFinite(result.Mx_Nm)) {
    throw new Error("smoke test resultants are not finite");
  }
  return {
    ok: true,
    labelledCodeCapacity: false,
    memberResistanceClaimed: false,
    N_N: result.N_N,
    Mx_Nm: result.Mx_Nm,
    concreteModelId: result.concreteModelId,
    reinforcementModelId: result.reinforcementModelId ?? EU_C1C_CONSTITUTIVE_REO_MODEL_ID,
    testOnlyNonConformance: EU_C1C_CONSTITUTIVE_TEST_ONLY_NON_CONFORMANCE,
  };
}
