import { describe, expect, it } from "vitest";
import {
  getEos2ExternalCustomerHoldState,
  isEos2ExternalCommercialGrantAllowed,
  isEos2PublicSelfServiceGaSignupEnabled,
} from "../lib/commerce/eos2-external-customer-hold";

describe("EOS 2 external customer hold", () => {
  it("keeps external commercial onboarding held and blocks commercial grants", () => {
    const hold = getEos2ExternalCustomerHoldState();
    expect(hold.externalCustomerOnboardingAuthorized).toBe(false);
    expect(hold.externalCustomerLegalReviewRequired).toBe(true);
    expect(hold.externalCustomerOnboardingHoldEnforced).toBe(true);
    expect(hold.publicSelfServiceSignupEnabled).toBe(false);
    expect(hold.externalCustomerOnboardingEnabled).toBe(false);
    expect(isEos2ExternalCommercialGrantAllowed("COMMERCIAL_SUBSCRIPTION")).toBe(false);
    expect(isEos2ExternalCommercialGrantAllowed("COMMERCIAL_TRIAL")).toBe(false);
    expect(isEos2ExternalCommercialGrantAllowed("INTERNAL_VALIDATION")).toBe(true);
    expect(isEos2ExternalCommercialGrantAllowed("COMPLIMENTARY")).toBe(true);
    expect(isEos2PublicSelfServiceGaSignupEnabled()).toBe(false);
  });
});
