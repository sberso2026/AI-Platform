import type { ExternalToolIntegrationMode } from "./catalog";
import type { ExternalToolLastValidation, ExternalToolProfile, ExternalToolValidationAction, ExternalToolValidationCheck } from "./types";

export function validationActionsForModes(modes: ExternalToolIntegrationMode[]): ExternalToolValidationAction[] {
  const actions = new Set<ExternalToolValidationAction>();
  if (modes.includes("EXECUTION_ADAPTER")) {
    for (const action of [
      "DETECT_INSTALLATION",
      "VALIDATE_EXECUTABLE",
      "DETECT_VERSION",
      "CHECK_LICENCE_STATUS",
      "VALIDATE_ADAPTER_COMPATIBILITY",
      "TEST_CONNECTION_HOST",
      "TEST_EXECUTION",
      "VALIDATE_RESULT_PARSER",
      "VALIDATE_UNITS",
    ] as const) {
      actions.add(action);
    }
  }
  if (modes.includes("API_CONNECTOR")) {
    for (const action of [
      "TEST_CONNECTION",
      "VALIDATE_AUTHENTICATION",
      "VALIDATE_PERMISSIONS",
      "TEST_READ",
      "TEST_WRITE",
      "VALIDATE_WEBHOOK",
    ] as const) {
      actions.add(action);
    }
  }
  if (modes.includes("MODEL_FILE_INTEROP") || modes.includes("DATA_CONNECTOR")) {
    actions.add("VALIDATE_FORMAT_VERSION");
    actions.add("VALIDATE_MAPPING_RULES");
    actions.add("TEST_CONNECTION");
  }
  return [...actions];
}

function check(action: ExternalToolValidationAction, status: ExternalToolValidationCheck["status"], detail: string): ExternalToolValidationCheck {
  return { action, status, detail };
}

/**
 * Mode-aware validation. Does not fabricate SPACE GASS install/licence/execution success.
 */
export function runValidation(profile: ExternalToolProfile, now = new Date().toISOString()): ExternalToolLastValidation {
  const checks: ExternalToolValidationCheck[] = [];
  const modes = profile.integrationModes;

  if (modes.includes("EXECUTION_ADAPTER")) {
    checks.push(
      check(
        "DETECT_INSTALLATION",
        profile.installationStatus === "INSTALLED" ? "PASS" : "FAIL",
        profile.installationStatus === "INSTALLED" ? "installation recorded" : "installation not present",
      ),
      check(
        "VALIDATE_EXECUTABLE",
        profile.executablePath ? "PASS" : "FAIL",
        profile.executablePath ? "executable path configured" : "executable path not configured",
      ),
      check(
        "DETECT_VERSION",
        profile.installedVersion ? "PASS" : "FAIL",
        profile.installedVersion ? `version=${profile.installedVersion}` : "installed version unknown",
      ),
      check(
        "CHECK_LICENCE_STATUS",
        profile.licenceStatus === "AVAILABLE" || profile.licenceStatus === "NOT_REQUIRED" ? "PASS" : "FAIL",
        `licence=${profile.licenceStatus}`,
      ),
      check(
        "VALIDATE_ADAPTER_COMPATIBILITY",
        profile.adapterCompatibilityStatus === "CERTIFIED" ? "PASS" : "FAIL",
        `compatibility=${profile.adapterCompatibilityStatus}`,
      ),
      check(
        "TEST_CONNECTION_HOST",
        profile.executionHostId ? "PASS" : "FAIL",
        profile.executionHostId ? "execution host referenced" : "execution host not configured",
      ),
      check("TEST_EXECUTION", "NOT_RUN", "Live solver execution is not performed by this governance validation."),
      check("VALIDATE_RESULT_PARSER", "NOT_RUN", "Parser certification requires a real solver run."),
      check("VALIDATE_UNITS", "NOT_RUN", "Unit certification requires extracted solver results."),
    );
  }

  if (modes.includes("API_CONNECTOR")) {
    checks.push(
      check("TEST_CONNECTION", profile.endpoint ? "PASS" : "FAIL", profile.endpoint ? "endpoint configured" : "endpoint missing"),
      check(
        "VALIDATE_AUTHENTICATION",
        profile.credentialSecretId ? "PASS" : "FAIL",
        profile.credentialSecretId ? "secret reference present" : "secret reference missing",
      ),
      check("VALIDATE_PERMISSIONS", profile.authScopes.length > 0 ? "PASS" : "NOT_RUN", "scope list is configuration only"),
      check("TEST_READ", "NOT_RUN", "Live read test is connector-specific and not implied."),
      check("TEST_WRITE", "NOT_RUN", "Live write test requires authorized connector execution."),
      check("VALIDATE_WEBHOOK", "NOT_RUN", "Webhook validation is optional and not implied."),
    );
  }

  if (modes.includes("MODEL_FILE_INTEROP") || modes.includes("DATA_CONNECTOR")) {
    checks.push(
      check("VALIDATE_FORMAT_VERSION", profile.compatibleToolVersions.length > 0 ? "PASS" : "NOT_RUN", "format versions from catalog"),
      check("VALIDATE_MAPPING_RULES", profile.adapterId ? "PASS" : "FAIL", profile.adapterId ? "adapter referenced" : "adapter missing"),
      check("TEST_CONNECTION", "NOT_RUN", "File/data connection test is adapter-specific."),
    );
  }

  const blocking = checks.filter((row) => row.status === "FAIL");
  return {
    ranAt: now,
    overall: blocking.length > 0 ? "FAIL" : checks.some((row) => row.status === "PASS") ? "FAIL" : "FAIL",
    checks,
  };
}

/**
 * Execution-tool overall PASS only when install, version, licence, compatibility, host, and live checks pass.
 * Missing live execution/parser/units keeps overall FAIL — never a false certification.
 */
export function summarizeExecutionValidation(result: ExternalToolLastValidation): ExternalToolLastValidation {
  const livePending = result.checks.some(
    (row) =>
      (row.action === "TEST_EXECUTION" || row.action === "VALIDATE_RESULT_PARSER" || row.action === "VALIDATE_UNITS") &&
      row.status !== "PASS",
  );
  const failed = result.checks.some((row) => row.status === "FAIL") || livePending;
  return { ...result, overall: failed ? "FAIL" : "PASS" };
}

export function validateProfile(profile: ExternalToolProfile): ExternalToolLastValidation {
  const raw = runValidation(profile);
  if (profile.integrationModes.includes("EXECUTION_ADAPTER")) {
    return summarizeExecutionValidation(raw);
  }
  const failed = raw.checks.some((row) => row.status === "FAIL");
  return { ...raw, overall: failed ? "FAIL" : "PASS" };
}
