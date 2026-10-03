/** Bounded server-only M365 env copy for Review staging. Does not log values. */

export const RTB_M365_SERVER_ENV_KEYS = Object.freeze([
  "RTB_M365_APPLICATION_ID",
  "RTB_M365_CREDENTIAL_SECRET_ID",
  "RTB_M365_CLIENT_SECRET",
]);

export function applyRtbM365ServerEnv(childEnv, processEnv = {}, fileEnv = {}) {
  for (const key of RTB_M365_SERVER_ENV_KEYS) {
    const fromProcess = String(processEnv[key] ?? "").trim();
    const fromFile = String(fileEnv[key] ?? "").trim();
    const value = fromProcess || fromFile;
    if (value) childEnv[key] = value;
    else delete childEnv[key];
  }
  return childEnv;
}
