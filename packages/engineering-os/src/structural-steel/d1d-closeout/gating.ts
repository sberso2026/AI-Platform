import type { D1dCapabilityGatingLevel } from "@rtb/types";
import {
  AU_MEMBER_PILOT_EXPOSURE,
  AU_VALIDATION_PILOT_EXPOSURE,
  D1D_CAPABILITY_GATING_LEVELS,
  D1D_GLOBAL_RELEASE_CLASSIFICATION,
  D1D_PRODUCT_CAPABILITY_GATING,
  EU_MEMBER_PILOT_EXPOSURE,
  EU_STEEL_DESIGN_AVAILABLE,
  EU_VALIDATION_PILOT_EXPOSURE,
  US_MEMBER_PILOT_EXPOSURE,
  US_STEEL_DESIGN_AVAILABLE,
  US_VALIDATION_PILOT_EXPOSURE,
} from "@rtb/types";

export const D1D_PRODUCT_GATING_POLICY: Record<D1dCapabilityGatingLevel, {
  discoveryAllowed: boolean;
  productDesignClaimAllowed: boolean;
  certifiedClaimAllowed: boolean;
  uiPilotExpose: boolean;
  releaseState: string;
}> = {
  MECHANICS_REFERENCE: {
    discoveryAllowed: true,
    productDesignClaimAllowed: false,
    certifiedClaimAllowed: false,
    uiPilotExpose: false,
    releaseState: D1D_GLOBAL_RELEASE_CLASSIFICATION,
  },
  FRAMEWORK_ONLY: {
    discoveryAllowed: true,
    productDesignClaimAllowed: false,
    certifiedClaimAllowed: false,
    uiPilotExpose: false,
    releaseState: D1D_GLOBAL_RELEASE_CLASSIFICATION,
  },
  VALIDATED_DESIGN_METHOD: {
    discoveryAllowed: false,
    productDesignClaimAllowed: false,
    certifiedClaimAllowed: false,
    uiPilotExpose: false,
    releaseState: "HIDDEN",
  },
  CONFORMANCE_VALIDATED: {
    discoveryAllowed: false,
    productDesignClaimAllowed: false,
    certifiedClaimAllowed: false,
    uiPilotExpose: false,
    releaseState: "HIDDEN",
  },
  CERTIFIED: {
    discoveryAllowed: false,
    productDesignClaimAllowed: false,
    certifiedClaimAllowed: false,
    uiPilotExpose: false,
    releaseState: "HIDDEN",
  },
};

export function d1dProductCapabilityVisible(level: D1dCapabilityGatingLevel): boolean {
  return D1D_PRODUCT_GATING_POLICY[level].discoveryAllowed;
}

export function assertD1dProductCapabilityGating(): void {
  if (!D1D_PRODUCT_CAPABILITY_GATING) throw new Error("D1D product capability gating must remain in force");
  if (D1D_CAPABILITY_GATING_LEVELS.length !== 5) throw new Error("D1D gating levels must remain five-valued");
  if (EU_STEEL_DESIGN_AVAILABLE || US_STEEL_DESIGN_AVAILABLE) {
    throw new Error("EU/US steel design must not be product-available");
  }
  if (AU_MEMBER_PILOT_EXPOSURE || EU_MEMBER_PILOT_EXPOSURE || US_MEMBER_PILOT_EXPOSURE) {
    throw new Error("steel member orchestration must not be Profile A exposed");
  }
  if (AU_VALIDATION_PILOT_EXPOSURE || EU_VALIDATION_PILOT_EXPOSURE || US_VALIDATION_PILOT_EXPOSURE) {
    throw new Error("steel validation gates must not be Profile A exposed");
  }
  for (const level of D1D_CAPABILITY_GATING_LEVELS) {
    if (D1D_PRODUCT_GATING_POLICY[level].productDesignClaimAllowed || D1D_PRODUCT_GATING_POLICY[level].certifiedClaimAllowed) {
      throw new Error("D1D must not expose unsupported design or certification claims");
    }
    if (D1D_PRODUCT_GATING_POLICY[level].uiPilotExpose) {
      throw new Error("D1D closeout must not enable steel design UI");
    }
  }
}
