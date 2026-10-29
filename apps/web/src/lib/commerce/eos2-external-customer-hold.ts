/**
 * External commercial customer onboarding hold (EOS 2.20 human GA GO).
 * Technical GA may be active while this hold remains enforced.
 * Clearance requires legal review + explicit authorized release — not file edits alone.
 */

export const EOS2_EXTERNAL_CUSTOMER_HOLD_ACTIVE = true as const;

export const EOS2_EXTERNAL_COMMERCIAL_GRANT_SOURCES = [
  "COMMERCIAL_SUBSCRIPTION",
  "COMMERCIAL_TRIAL",
] as const;

export type Eos2ExternalCustomerHoldState = {
  externalCustomerOnboardingAuthorized: false;
  externalCustomerLegalReviewRequired: true;
  externalCustomerOnboardingHoldEnforced: true;
  publicSelfServiceSignupEnabled: false;
  externalCustomerOnboardingEnabled: false;
  clearanceRequires: readonly string[];
};

export function getEos2ExternalCustomerHoldState(): Eos2ExternalCustomerHoldState {
  // Env override can only keep hold ON; it cannot clear the hold without an authorized process.
  void process.env.EOS_2_EXTERNAL_CUSTOMER_ONBOARDING;
  return {
    externalCustomerOnboardingAuthorized: false,
    externalCustomerLegalReviewRequired: true,
    externalCustomerOnboardingHoldEnforced: true,
    publicSelfServiceSignupEnabled: false,
    externalCustomerOnboardingEnabled: false,
    clearanceRequires: [
      "applicable_legal_review",
      "customer_policy_package_approval",
      "explicit_authorized_release_decision_removing_hold",
    ],
  };
}

export function isEos2ExternalCommercialGrantAllowed(grantSource: string | null | undefined): boolean {
  const source = (grantSource ?? "").trim().toUpperCase();
  if (!EOS2_EXTERNAL_COMMERCIAL_GRANT_SOURCES.includes(source as (typeof EOS2_EXTERNAL_COMMERCIAL_GRANT_SOURCES)[number])) {
    return true;
  }
  // Commercial subscription/trial grants are blocked while the hold is enforced.
  return !getEos2ExternalCustomerHoldState().externalCustomerOnboardingHoldEnforced;
}

export function isEos2PublicSelfServiceGaSignupEnabled(): false {
  return false;
}
