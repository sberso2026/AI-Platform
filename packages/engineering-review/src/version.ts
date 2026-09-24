export const ENGINEERING_REVIEW_VERSION = "0.7.0-era-7" as const;
export const ENGINEERING_REVIEW_ENGINE_VERSION = "review-engine/0.7.0-era-7" as const;
export const ENGINEERING_REVIEW_PHASE = "ERA-7" as const;

export const AI_ASSISTED_FIRST_PASS_DISCLAIMER =
  "Engineering Review AI provides AI-assisted first-pass review. It does not replace professional engineering judgment. Findings require engineer review. Absence of findings is not certification of compliance, safety, adequacy, or completeness." as const;

export const CONFIGURED_REVIEW_COMPLETED_MESSAGE = "Configured review completed." as const;
export const ZERO_FINDING_SCOPE_MESSAGE =
  "No findings were identified within the selected review scope." as const;
export const ZERO_FINDING_MESSAGE =
  `${CONFIGURED_REVIEW_COMPLETED_MESSAGE} ${ZERO_FINDING_SCOPE_MESSAGE}` as const;

/** Copy that must never be used for a zero-finding Review result. */
export const FORBIDDEN_ZERO_FINDING_ASSURANCE = [
  "PASS",
  "SAFE",
  "APPROVED",
  "COMPLIANT",
  "READY FOR IFC",
  "ENGINEERING COMPLETE",
] as const;
