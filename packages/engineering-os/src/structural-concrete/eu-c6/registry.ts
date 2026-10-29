import {
  EU_C6_R1_REFERENCE_PROFILE_GENERATION,
  EU_C6_R1_REFERENCE_PROFILE_ID,
  EU_C6_R2_IMPLEMENTATION_VERSION,
  EU_C6_R2_METHOD_ID,
} from "@rtb/types";
import { EU_C6_R1_PARAMETERS, EU_C6_R1_RULES } from "./profile-binding";

export const EU_C6_R2_METHOD_REGISTRY = [
  {
    methodId: EU_C6_R2_METHOD_ID,
    family: "NOMINAL_CURVATURE" as const,
    profileId: EU_C6_R1_REFERENCE_PROFILE_ID,
    generation: EU_C6_R1_REFERENCE_PROFILE_GENERATION,
    applicability: "isolated prismatic rectangular uniaxial compression with explicit effective length, end moments, creep, reinforcement, Es, and effective depth",
    exclusions: "circular, flanged, non-prismatic, biaxial, tension, frame sway, global stability, nominal stiffness, slenderness-limit neglect",
    ruleIds: EU_C6_R1_RULES.map((rule) => rule.ruleId),
    parameterIds: EU_C6_R1_PARAMETERS.map((parameter) => parameter.parameterId),
    upstreamMaterialDependencies: ["EU_C1_CONCRETE_DESIGN_PROPERTIES", "EU_C1_REINFORCEMENT_DESIGN_PROPERTIES"] as const,
    c3Dependency: "EU_C3 uniaxial N-M demand check",
    implementationVersion: EU_C6_R2_IMPLEMENTATION_VERSION,
    validationState: "NUMERICALLY_VALIDATED" as const,
    engineerValidationState: "PENDING_HUMAN_ENGINEERING_REVIEW" as const,
    conformanceState: "INTENDED_PROFILE" as const,
    benchmarkReference: "independent closed-form reconstruction in eos-d1e-eu-c6-r2.test.ts",
  },
] as const;

export const EU_C6_R2_METHOD_REGISTRY_UPDATED = "YES" as const;
