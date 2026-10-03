export { EngineeringM365ConnectorService, createTestM365ConnectorService } from "./service";
export { createSharePointSyncHandler, registerSharePointSyncHandler } from "./job-handler";
export { MockGraphPort, LiveGraphPort, GraphPortFailure } from "./graph";
export { createMemoryM365Store } from "./memory-store";
export {
  M365_CONNECTOR_RECON,
  M365_CONNECTOR_PRIVACY,
  M365_JOB_TYPE,
  MICROSOFT_PERMISSION_MODEL,
} from "./types";
export { rejectCallerConnectorClaims, rejectArbitraryUrlFetch } from "./security";
export {
  SHAREPOINT_PILOT_MODE,
  SHAREPOINT_REQUIRED_LIVE_PERMISSIONS,
  evaluateSharePointLiveReadiness,
  liveSharePointExternalTestState,
} from "./live-readiness";
export {
  DEFAULT_M365_CONNECTION_MODE,
  M365_SETUP_STATES,
  parseSharePointSiteUrl,
  proposeSharePointDocumentHints,
  resolveRtbAppSecret,
  rtbMicrosoftAppConfig,
} from "./onboarding";
export { SETUP_AGENT_FORBIDDEN_ACTIONS, SETUP_AGENT_ID, assertSetupAgentCommand } from "./setup-agent";
export {
  EOS_M365_TOKEN_EXCHANGE_FAILURE_EVENT,
  EOS_M365_TOKEN_EXCHANGE_FAILURE_FILENAME,
  MicrosoftTokenExchangeFailure,
  buildMicrosoftAdminConsentUrl,
  buildMicrosoftAuthorizeUrl,
  classifyMicrosoftOAuthError,
  decodeMicrosoftIdToken,
  defaultM365RedirectUri,
  emitMicrosoftTokenExchangeFailure,
  identityFromAdminConsentCallback,
  exchangeMicrosoftAuthorizationCode,
  microsoftTokenExchangeFailureDiagnosticPath,
  parseMicrosoftTokenEndpointFailure,
  sanitizeMicrosoftTokenErrorDescription,
  signOAuthState,
  verifyOAuthState,
} from "./oauth";
export type { MicrosoftTokenExchangeFailureDiagnostic } from "./oauth";
