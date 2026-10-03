/**
 * Constrained Microsoft Integration Setup Agent.
 * Orchestrates onboarding steps. Cannot grant Microsoft consent or expand permissions.
 */

import type { M365SetupState } from "./onboarding";
import { userFacingSetupMessage } from "./onboarding";

export const SETUP_AGENT_ID = "eos-m365-integration-setup" as const;

export const SETUP_AGENT_FORBIDDEN_ACTIONS = [
  "grant_microsoft_permissions",
  "approve_consent",
  "change_tenant_policy",
  "expand_sites_selected",
  "invent_credentials",
  "enable_write",
  "simulate_admin_consent",
] as const;
export type SetupAgentForbiddenAction = (typeof SETUP_AGENT_FORBIDDEN_ACTIONS)[number];

export const SETUP_AGENT_COMMANDS = [
  "detect_tenant",
  "check_consent",
  "resolve_site",
  "list_libraries",
  "select_library",
  "validate_read",
  "register_repository",
  "health_check",
  "explain_operator_action",
  "disconnect",
] as const;
export type SetupAgentCommand = (typeof SETUP_AGENT_COMMANDS)[number];

export function assertSetupAgentCommand(command: string): asserts command is SetupAgentCommand {
  if ((SETUP_AGENT_FORBIDDEN_ACTIONS as readonly string[]).includes(command)) {
    throw new Error("SETUP_AGENT_AUTHORITY_DENIED");
  }
  if (!(SETUP_AGENT_COMMANDS as readonly string[]).includes(command)) {
    throw new Error("SETUP_AGENT_COMMAND_UNKNOWN");
  }
}

export function setupAgentNextAction(state: M365SetupState): { command: SetupAgentCommand; message: string } {
  switch (state) {
    case "NOT_CONNECTED":
    case "MICROSOFT_SIGN_IN_REQUIRED":
      return { command: "detect_tenant", message: userFacingSetupMessage(state) };
    case "ADMIN_CONSENT_REQUIRED":
      return { command: "check_consent", message: userFacingSetupMessage(state) };
    case "CONNECTED_NO_SITE":
    case "SITE_PERMISSION_REQUIRED":
      return { command: "resolve_site", message: userFacingSetupMessage(state) };
    case "SITE_CONNECTED":
    case "LIBRARY_SELECTION_REQUIRED":
      return { command: "list_libraries", message: userFacingSetupMessage(state) };
    case "VALIDATING":
      return { command: "validate_read", message: userFacingSetupMessage(state) };
    case "AUTH_EXPIRED":
    case "PERMISSION_REVOKED":
    case "CONNECTION_ERROR":
      return { command: "explain_operator_action", message: userFacingSetupMessage(state) };
    default:
      return { command: "health_check", message: userFacingSetupMessage(state) };
  }
}
