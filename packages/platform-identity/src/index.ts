export * from "./version";
export * from "./discovery-flags";
export * from "./runtime-flags";
export * from "./pen-test-readiness-flags";
export * from "./contracts";
export * from "./architecture-decisions";
export * from "./footprint";
export * from "./domain/engine";
export * from "./domain/events";
export * from "./domain/oidc/validate";
export * from "./domain/oidc/entra";
export * from "./domain/pen-test-readiness";

/** 16A draft alias — contracts advanced to 0.2.0-enterprise-sso. */
export {
  PLATFORM_ENTERPRISE_IDENTITY_CONTRACTS_0_2_0 as PLATFORM_ENTERPRISE_IDENTITY_DRAFT_CONTRACTS,
} from "./contracts";
