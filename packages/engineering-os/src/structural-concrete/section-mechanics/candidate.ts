import type { ConcreteMaterial, RcSectionGeometryInput, ReinforcementLayout, ReinforcementMaterial } from "@rtb/types";
import {
  AI_CAN_OVERRIDE_DETERMINISTIC_SECTION_KERNEL,
  GENERATIVE_GEOMETRY_BYPASSES_VALIDATION,
  LLM_RC_SECTION_NUMERICAL_AUTHORITY,
} from "@rtb/types";
import { evaluateBarGeometry } from "./bars";
import { computeGrossSectionProperties } from "./geometry";
import { failClosed } from "./units";

export function screenGenerativeRcCandidate(input: {
  geometry: RcSectionGeometryInput;
  layout: ReinforcementLayout;
  concrete: ConcreteMaterial;
  reinforcement: ReinforcementMaterial;
}): { accepted: true; fingerprintReady: true } {
  if (GENERATIVE_GEOMETRY_BYPASSES_VALIDATION) failClosed("generative geometry cannot bypass validation");
  if (AI_CAN_OVERRIDE_DETERMINISTIC_SECTION_KERNEL) failClosed("AI cannot override the deterministic section kernel");
  if (LLM_RC_SECTION_NUMERICAL_AUTHORITY) failClosed("LLM has no RC section numerical authority");
  if (!input.concrete.elasticModulus) failClosed("missing material");
  if (!input.reinforcement.elasticModulus) failClosed("missing material");
  computeGrossSectionProperties(input.geometry);
  evaluateBarGeometry(input.layout, input.geometry);
  return { accepted: true, fingerprintReady: true };
}
